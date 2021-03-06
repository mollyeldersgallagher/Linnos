import React from 'react';
import {
  Switch,
  Text,
  SafeAreaView,
  View,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';

import BluetoothSerial, {
  withSubscription,
} from 'react-native-bluetooth-serial-next';
import {Buffer} from 'buffer';
import {asciiToHex} from './readWrite';
import DeviceList from '../../components/DeviceList';
import styles from './styles';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {showMessage, hideMessage} from 'react-native-flash-message';

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
      isRefreshing: false,
    };
  }

  async componentDidMount() {
    this.events = this.props.events;

    await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      // PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ).then((result) => {
      if (!result) {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Bluetooth Access Required',
            message:
              'Linnos needs Bluetooth Access in order to connect to your device.',
          },
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
      showMessage({
        message: 'Warning',
        description: `${e.message}`,
        type: 'warning',
        duration: 3000,
      });
    }

    this.events.on('bluetoothEnabled', () => {
      showMessage({
        message: 'Bluetooth Enabled',
        type: 'success',
      });
      this.setState({isEnabled: true});
    });

    this.events.on('bluetoothDisabled', () => {
      showMessage({
        message: 'Bluetooth Disabled',
        type: 'success',
      });
      this.setState({isEnabled: false});
    });

    this.events.on('connectionSuccess', ({device}) => {
      if (device) {
        showMessage({
          message: `Device ${device.name} <${device.id}> has been connected`,
          type: 'success',
          duration: 3000,
        });
      }
    });

    this.events.on('connectionFailed', ({device}) => {
      if (device) {
        showMessage({
          message: 'Error',
          description: `Bluetooth connection failed. Please try connect again`,
          type: 'danger',
          duration: 3000,
        });
      }
    });

    this.events.on('connectionLost', ({device}) => {
      if (device) {
        showMessage({
          message: 'Error',
          description: `Bluetooth connection has been lost, please reconnect`,
          type: 'danger',
          duration: 3000,
        });
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
        showMessage({
          message: `Error: ${e.message}`,
          type: 'danger',
        });
      }
    });

    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.disconnectDevices();
      if (this.state.isEnabled) {
        this.listDevices();
      }

      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then((result) => {
        if (!result) {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
        }
      });
      console.log('bluetooth listener');
    });
    this.disconnectDevices();
    if (this.state.isEnabled) {
      this.listDevices();
    }
  }
  componentWillUnmount() {
    this.focusListener();
  }
  async disconnectDevices() {
    await BluetoothSerial.disconnectAll();
    console.log('disconnect');
  }
  timeout(ms) {
    return new Promise((reject) => setTimeout(reject, ms));
  }
  requestEnable = () => async () => {
    try {
      await BluetoothSerial.requestEnable();
      this.setState({isEnabled: true});
    } catch (e) {
      showMessage({
        message: `Error: ${e.message}`,
        type: 'danger',
        duration: 3000,
      });
    }
  };

  toggleBluetooth = async (value) => {
    try {
      if (value) {
        await BluetoothSerial.enable();
        // this.listDevices();
      } else {
        await BluetoothSerial.disable();
      }
    } catch (e) {
      showMessage({
        message: `Error: ${e.message}`,
        type: 'danger',
        duration: 3000,
      });
    }
  };

  listDevices = async () => {
    try {
      const list = await BluetoothSerial.list();

      let filteredList = [];
      let newList = list.map((device) => {
        // deviceList.push({...device, connected: false, paired: true});
        var index = this.state.devices.findIndex((x) => x.id == device.id);
        // here you can check specific property for an object whether it exist in your array or not
        if (index === -1) {
          filteredList.push({...device, connected: false, paired: true});
        } else console.log('object already exists');
      });

      this.setState({
        // scanning: false,
        devices: [...this.state.devices, ...filteredList],
      });
    } catch (e) {
      showMessage({
        message: `Error: ${e.message}`,
        type: 'danger',
        duration: 3000,
      });
    }
  };
  refreshList = async () => {
    try {
      const list = await BluetoothSerial.list();

      let filteredList = [];
      let newList = await list.map((device) => {
        // deviceList.push({...device, connected: false, paired: true});
        var index = this.state.devices.findIndex((x) => x.id == device.id);
        // here you can check specific property for an object whether it exist in your array or not
        if (index === -1) {
          filteredList.push({...device, connected: false, paired: true});
        } else console.log('object already exists');
      });

      await this.setState({
        // scanning: false,
        devices: [...filteredList],
      });
    } catch (e) {
      showMessage({
        message: `Error: ${e.message}`,
        type: 'danger',
        duration: 3000,
      });
    }
  };

  discoverUnpairedDevices = async () => {
    this.setState({scanning: true});
    console.log('PERMISSIONS CHECK');
    await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      // PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ).then((result) => {
      if (!result) {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Bluetooth Access Required',
            message:
              'Linnos needs Bluetooth Access in order to connect to your device.',
          },
        );
      }
    });
    try {
      console.log('SCANNING');
      const unpairedDevices = await BluetoothSerial.listUnpaired();
      console.log(unpairedDevices);
      let filteredList = [];
      let newList = await unpairedDevices.map((device) => {
        var index = this.state.devices.findIndex((x) => x.id == device.id);
        // here you can check specific property for an object whether it exist in your array or not
        if (index === -1) {
          filteredList.push({...device, connected: false, paired: false});
        } else console.log('object already exists');
      });

      this.setState({
        scanning: false,
        devices: [...this.state.devices, ...filteredList],
      });
    } catch (e) {
      showMessage({
        message: `Error: ${e.message}`,
        type: 'danger',
        duration: 3000,
      });

      this.setState(({devices}) => ({
        scanning: false,
        devices: devices.filter((device) => device.paired || device.connected),
      }));
    }
    console.log(this.state.devices);
  };

  cancelDiscovery = async () => {
    try {
      const cancel = await BluetoothSerial.cancelDiscovery();
      const stopScanningRequest = await BluetoothSerial.stopScanning();
      console.log(cancel, stopScanningRequest);
      if (cancel) {
        this.setState({scanning: false});
      } else if (stopScanningRequest) {
        this.setState({scanning: false});
      }
      //this.setState({scanning: false});
    } catch (e) {
      showMessage({
        message: `Error: ${e.message}`,
        type: 'danger',
        duration: 3000,
      });
    }
  };

  selectedDevice = (device, processing) => {
    if (!device) {
      return null;
    }
    const {id, name, paired, connected} = device;
    console.log(device);
    this.props.navigation.navigate('HomeStack', {
      screen: 'SelectedDevice',
      params: {
        processing: processing,
        device: device,
      },
    });
  };

  render() {
    const {isEnabled, device, devices, scanning, processing} = this.state;

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <View style={styles.topBar}>
          <Text style={styles.heading}>Bluetooth</Text>
          <View style={styles.enableInfoWrapper}>
            <Text style={{fontSize: 14, color: '#0C0D34', paddingRight: 10}}>
              {isEnabled ? 'ON' : 'OFF'}
            </Text>
            <Switch
              trackColor={{false: '#767577', true: '#9ae6b1'}}
              thumbColor={isEnabled ? '#35cd63' : '#f4f3f4'}
              onValueChange={this.toggleBluetooth}
              value={isEnabled}
            />
          </View>
        </View>
        {!isEnabled ? (
          <React.Fragment>
            <View style={styles.loading}>
              <Text style={styles.loadingHeading}>Bluetooth is off</Text>
              <Text style={styles.loadingDes}>
                This application requires bluetooth.
              </Text>
              <ActivityIndicator
                style={{marginTop: 15}}
                size={Platform.OS === 'ios' ? 1 : 60}
                animating={this.state.processing}
                color="#64aabd"
              />
            </View>
          </React.Fragment>
        ) : (
          <>
            {scanning ? (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={styles.loadingHeading}>Searching...</Text>
                <Text style={styles.loadingDes}>
                  Searching for available bluetooth devices
                </Text>
                <ActivityIndicator
                  size="large"
                  animating={scanning}
                  color="#38a4c0"
                />
              </View>
            ) : (
              <React.Fragment>
                <DeviceList
                  devices={devices}
                  onDevicePressed={(device) => {
                    this.setState({device});
                    this.selectedDevice(device, processing);
                  }}
                  onRefresh={this.refreshList}
                />
              </React.Fragment>
            )}
          </>
        )}

        <View style={styles.footer}>
          {isEnabled && (
            <>
              {!scanning ? (
                <TouchableOpacity
                  style={styles.footerButton}
                  // title="Start Scan"
                  onPress={this.discoverUnpairedDevices}>
                  <Text style={styles.buttonText}>Start Scan</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.footerButton}
                  // title="Start Scan"
                  onPress={this.cancelDiscovery}>
                  <Text style={styles.buttonText}>Cancel Scan</Text>
                </TouchableOpacity>
              )}
            </>
          )}
          {!isEnabled && (
            <TouchableOpacity
              style={styles.footerButton}
              // title="Start Scan"
              onPress={this.requestEnable}>
              <Text style={styles.buttonText}>Request Bluetooth</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }
}

export default withSubscription({subscriptionName: 'events'})(Bluetooth);
