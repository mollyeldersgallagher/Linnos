import React from 'react';
import {
  Platform,
  ScrollView,
  Switch,
  Text,
  SafeAreaView,
  View,
  ActivityIndicator,
  Modal,
  Button,
  PermissionsAndroid,
} from 'react-native';

import Toast from '@remobile/react-native-toast';
import BluetoothSerial, {
  withSubscription,
} from 'react-native-bluetooth-serial-next';
import {Buffer} from 'buffer';

import {verifyPin, hexToAscii, asciiToHex} from './readWrite';

import DeviceList from '../../components/DeviceList';
import styles from './styles';

global.Buffer = Buffer;

const iconv = require('iconv-lite');

class Bluetooth extends React.Component {
  constructor(props) {
    super(props);
    this.events = null;
    this.state = {
      isEnabled: false,
      device: null,
      devices: [],
      scanning: false,
      processing: false,
    };
  }

  async componentDidMount() {
    // this.hello();
    console.log(this.props);

    this.events = this.props.events;
    //console.log(this.props.events);
    PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ).then((result) => {
      if (!result) {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        );
      }
    });
    try {
      const [isEnabled, devices] = await Promise.all([
        BluetoothSerial.isEnabled(),
        BluetoothSerial.list(),
      ]);

      this.setState({
        isEnabled,
        devices: devices.map((device) => ({
          ...device,
          paired: true,
          connected: false,
        })),
      });
    } catch (e) {
      Toast.showShortBottom(e.message);
    }

    this.events.on('bluetoothEnabled', () => {
      Toast.showShortBottom('Bluetooth enabled');
      this.setState({isEnabled: true});
    });

    this.events.on('bluetoothDisabled', () => {
      Toast.showShortBottom('Bluetooth disabled');
      this.setState({isEnabled: false});
    });

    this.events.on('connectionSuccess', ({device}) => {
      if (device) {
        Toast.showShortBottom(
          `Device ${device.name}<${device.id}> has been connected`,
        );
      }
    });

    this.events.on('connectionFailed', ({device}) => {
      if (device) {
        Toast.showShortBottom(
          `Failed to connect with device ${device.name}<${device.id}>`,
        );
      }
    });

    this.events.on('connectionLost', ({device}) => {
      if (device) {
        Toast.showShortBottom(
          `Device ${device.name}<${device.id}> connection has been lost`,
        );
      }
    });

    this.events.on('read', (result) => {
      if (result) {
        const {id, data} = result;
        console.log(`Data from device ${id} : ${asciiToHex(data)}`);
      }
    });

    this.events.on('error', (e) => {
      if (e) {
        console.log(`Error: ${e.message}`);
        Toast.showShortBottom(e.message);
      }
    });
  }

  requestEnable = () => async () => {
    try {
      await BluetoothSerial.requestEnable();
      this.setState({isEnabled: true});
    } catch (e) {
      Toast.showShortBottom(e.message);
    }
  };

  toggleBluetooth = async (value) => {
    try {
      if (value) {
        await BluetoothSerial.enable();
      } else {
        await BluetoothSerial.disable();
      }
    } catch (e) {
      Toast.showShortBottom(e.message);
    }
  };

  listDevices = async () => {
    try {
      const list = await BluetoothSerial.list();

      this.setState(({devices}) => ({
        devices: devices.map((device) => {
          const found = list.find((v) => v.id === device.id);

          if (found) {
            return {
              ...found,
              paired: true,
              connected: false,
            };
          }

          return device;
        }),
      }));
    } catch (e) {
      Toast.showShortBottom(e.message);
    }
  };

  discoverUnpairedDevices = async () => {
    this.setState({scanning: true});

    try {
      const unpairedDevices = await BluetoothSerial.listUnpaired();
      console.log(unpairedDevices);

      let newList = unpairedDevices.map((device) => {
        const found = this.state.devices.filter((d) => d.id === device.id); // filter devices not in list yet
        if (!found) {
          return {
            ...device,
            connected: false,
            paired: false,
          };
        }
        return device;
      });

      this.setState({
        scanning: false,
        devices: [...this.state.devices, ...newList],
      });
    } catch (e) {
      Toast.showShortBottom(e.message);

      this.setState(({devices}) => ({
        scanning: false,
        devices: devices.filter((device) => device.paired || device.connected),
      }));
    }
  };

  cancelDiscovery = () => async () => {
    try {
      await BluetoothSerial.cancelDiscovery();
      this.setState({scanning: false});
    } catch (e) {
      Toast.showShortBottom(e.message);
    }
  };

  toggleDevicePairing = async ({id, paired}) => {
    if (paired) {
      await this.unpairDevice(id);
    } else {
      await this.pairDevice(id);
    }
  };

  pairDevice = async (id) => {
    this.setState({processing: true});

    try {
      const paired = await BluetoothSerial.pairDevice(id);

      if (paired) {
        Toast.showShortBottom(
          `Device ${paired.name}<${paired.id}> paired successfully`,
        );

        this.setState(({devices, device}) => ({
          processing: false,
          device: {
            ...device,
            ...paired,
            paired: true,
          },
          devices: devices.map((v) => {
            if (v.id === paired.id) {
              return {
                ...v,
                ...paired,
                paired: true,
              };
            }

            return v;
          }),
        }));
      } else {
        Toast.showShortBottom(`Device <${id}> pairing failed`);
        this.setState({processing: false});
      }
    } catch (e) {
      Toast.showShortBottom(e.message);
      this.setState({processing: false});
    }
  };

  unpairDevice = async (id) => {
    this.setState({processing: true});

    try {
      const unpaired = await BluetoothSerial.unpairDevice(id);

      if (unpaired) {
        Toast.showShortBottom(
          `Device ${unpaired.name}<${unpaired.id}> unpaired successfully`,
        );

        this.setState(({devices, device}) => ({
          processing: false,
          device: {
            ...device,
            ...unpaired,
            connected: false,
            paired: false,
          },
          devices: devices.map((v) => {
            if (v.id === unpaired.id) {
              return {
                ...v,
                ...unpaired,
                connected: false,
                paired: false,
              };
            }

            return v;
          }),
        }));
      } else {
        Toast.showShortBottom(`Device <${id}> unpairing failed`);
        this.setState({processing: false});
      }
    } catch (e) {
      Toast.showShortBottom(e.message);
      this.setState({processing: false});
    }
  };

  toggleDeviceConnection = async ({id, connected}) => {
    if (connected) {
      await this.disconnect(id);
    } else {
      await this.connect(id);
    }
  };

  connect = async (id) => {
    this.setState({processing: true});

    try {
      const connected = await BluetoothSerial.device(id).connect();

      if (connected) {
        Toast.showShortBottom(
          `Connected to device ${connected.name}<${connected.id}>. Verifying PIN..`,
        );
        this.setState(({devices, device}) => ({
          processing: false,
          device: {
            ...device,
            ...connected,
            connected: true,
          },
          devices: devices.map((v) => {
            if (v.id === connected.id) {
              return {
                ...v,
                ...connected,
                connected: true,
              };
            }

            return v;
          }),
        }));
      } else {
        Toast.showShortBottom(`Failed to connect to device <${id}>`);
        this.setState({processing: false});
      }
    } catch (e) {
      Toast.showShortBottom(e.message);
      this.setState({processing: false});
    }
  };

  disconnect = async (id) => {
    this.setState({processing: true});

    try {
      await BluetoothSerial.device(id).disconnect();

      this.setState(({devices, device}) => ({
        processing: false,
        device: {
          ...device,
          connected: false,
        },
        devices: devices.map((v) => {
          if (v.id === id) {
            return {
              ...v,
              connected: false,
            };
          }

          return v;
        }),
      }));
    } catch (e) {
      Toast.showShortBottom(e.message);
      this.setState({processing: false});
    }
  };

  renderModal = (device, processing) => {
    // console.log('DEVICE' + device);

    if (!device) {
      return null;
    }

    const {id, name, paired, connected} = device;

    return (
      <Modal
        animationType="fade"
        transparent={false}
        visible={true}
        onRequestClose={() => {}}>
        {device ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>{name}</Text>
            <Text style={{fontSize: 14}}>{`<${id}>`}</Text>

            {processing && (
              <ActivityIndicator
                style={{marginTop: 15}}
                size={Platform.OS === 'ios' ? 1 : 60}
                animating={processing}
              />
            )}

            {!processing && (
              <View style={{marginTop: 20, width: '50%'}}>
                {Platform.OS !== 'ios' && (
                  <Button
                    title={paired ? 'Unpair' : 'Pair'}
                    style={{
                      backgroundColor: '#22509d',
                    }}
                    textStyle={{color: '#fff'}}
                    onPress={() => this.toggleDevicePairing(device)}
                  />
                )}
                <Button
                  title={connected ? 'Disconnect' : 'Connect'}
                  style={{
                    backgroundColor: '#22509d',
                  }}
                  textStyle={{color: '#fff'}}
                  onPress={() => this.toggleDeviceConnection(device)}
                />
                {connected && (
                  <React.Fragment>
                    <Button
                      title="Sign Controller"
                      style={{
                        backgroundColor: '#22509d',
                      }}
                      textStyle={{color: '#fff'}}
                      onPress={() => {
                        this.callController(device);
                      }}
                    />
                  </React.Fragment>
                )}
                <Button
                  title="Close"
                  onPress={() => this.setState({device: null})}
                />
              </View>
            )}
          </View>
        ) : null}
      </Modal>
    );
  };
  callController = (device) => {
    if (device) {
      this.props.navigation.navigate('SignController', {
        deviceId: this.state.device.id,
      });
    } else {
      console.log('error no device found');
    }
  };
  callConnectedDevice = (device) => {
    if (device) {
      this.props.navigation.navigate('ConnectedDevice', {
        deviceId: this.state.device.id,
        device: device,
      });
    } else {
      console.log('error no device found');
    }
  };

  render() {
    const {isEnabled, device, devices, scanning, processing} = this.state;

    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.topBar}>
          <Text style={styles.heading}>Bluetooth</Text>
          <View style={styles.enableInfoWrapper}>
            <Text style={{fontSize: 14, color: '#0C0D34', paddingRight: 10}}>
              {isEnabled ? 'ON' : 'OFF'}
            </Text>
            <Switch
              trackColor={{false: '#767577', true: '#767577'}}
              thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
              onValueChange={this.toggleBluetooth}
              value={isEnabled}
            />
          </View>
        </View>

        {scanning ? (
          isEnabled && (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ActivityIndicator
                size="large"
                animating={scanning}
                color="#0000ff"
              />
              <Button
                textStyle={{color: '#fff'}}
                style={styles.buttonRaised}
                title="Cancel Discovery"
                onPress={this.cancelDiscovery}
              />
            </View>
          )
        ) : (
          <React.Fragment>
            {this.renderModal(device, processing)}
            <DeviceList
              devices={devices}
              onDevicePressed={(device) => {
                this.setState({device});
                // this.selectedDevice();
              }}
              onRefresh={this.listDevices}
            />
          </React.Fragment>
        )}

        <View style={styles.footer}>
          {/* <ScrollView horizontal contentContainerStyle={styles.fixedFooter}> */}
          {isEnabled && (
            <Button
              style={styles.footerButton}
              title="Start Scan"
              onPress={this.discoverUnpairedDevices}
            />
          )}
          {!isEnabled && (
            <Button
              title="Request Enable Bluetooth"
              style={styles.footerButton}
              onPress={this.requestEnable}
            />
          )}
          {/* </ScrollView> */}
        </View>
      </SafeAreaView>
    );
  }
}

export default withSubscription({subscriptionName: 'events'})(Bluetooth);
