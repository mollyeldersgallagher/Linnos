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
      showMessage({
        message: 'Warning',
        description: `${e.message}`,
        type: 'warning',
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
        });
      }
    });

    this.events.on('connectionFailed', ({device}) => {
      if (device) {
        showMessage({
          message: 'Error',
          description: `Bluetooth connection failed. Please try connect again`,
          type: 'danger',
        });
      }
    });

    this.events.on('connectionLost', ({device}) => {
      if (device) {
        showMessage({
          message: 'Error',
          description: `Bluetooth connection has been lost, please reconnect`,
          type: 'danger',
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
    });
  }
  componentWillUnmount() {
    this.focusListener();
  }
  async disconnectDevices() {
    await BluetoothSerial.disconnectAll();
  }
  requestEnable = () => async () => {
    try {
      await BluetoothSerial.requestEnable();
      this.setState({isEnabled: true});
    } catch (e) {
      showMessage({
        message: `Error: ${e.message}`,
        type: 'danger',
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
      });
    }
  };

  listDevices = async () => {
    try {
      const list = await BluetoothSerial.list();

      let deviceList = [];
      let newList = list.map((device) => {
        deviceList.push({...device, connected: false, paired: true});
      });

      this.setState({
        scanning: false,
        devices: [...deviceList],
      });
    } catch (e) {
      showMessage({
        message: `Error: ${e.message}`,
        type: 'danger',
      });
    }
  };

  discoverUnpairedDevices = async () => {
    this.setState({scanning: true});

    try {
      const unpairedDevices = await BluetoothSerial.listUnpaired();
      let filteredList = [];
      let newList = unpairedDevices.map((device) => {
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
      });

      this.setState(({devices}) => ({
        scanning: false,
        devices: devices.filter((device) => device.paired || device.connected),
      }));
    }
    console.log(this.state.devices);
  };

  cancelDiscovery = () => async () => {
    try {
      await BluetoothSerial.cancelDiscovery();
      this.setState({scanning: false});
    } catch (e) {
      showMessage({
        message: `Error: ${e.message}`,
        type: 'danger',
      });
    }
  };

  selectedDevice = (device, processing) => {
    if (!device) {
      return null;
    }
    const {id, name, paired, connected} = device;
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
    if (isEnabled) {
      this.listDevices();
    }
    return (
      <SafeAreaView style={{flex: 1}}>
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

        {scanning ? (
          isEnabled && (
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
          )
        ) : (
          <>
            {isEnabled ? (
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
            ) : (
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
                  <Text style={styles.buttonText}>Scanning...</Text>
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
