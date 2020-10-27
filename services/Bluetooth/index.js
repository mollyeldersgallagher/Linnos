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
import ConnectedDevice from '../ConnectedDevice';
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
    this.events = this.props.events;

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

  selectedDevice = (device, processing) => {
    if (!device) {
      return null;
    }
    const {id, name, paired, connected} = device;
    this.props.navigation.navigate('ConnectedDevice', {
      processing: processing,
      device: device,
    });
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
            <DeviceList
              devices={devices}
              onDevicePressed={(device) => {
                this.setState({device});
                this.selectedDevice(device, processing);
              }}
              onRefresh={this.listDevices}
            />
          </React.Fragment>
        )}

        <View style={styles.footer}>
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
        </View>
      </SafeAreaView>
    );
  }
}

export default withSubscription({subscriptionName: 'events'})(Bluetooth);
