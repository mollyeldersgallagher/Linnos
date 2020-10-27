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
  TouchableOpacity,
  Button,
  Dimensions,
  PermissionsAndroid,
} from 'react-native';
import BluetoothFunctions from './Bluetooth';
import {StyleSheet} from 'react-native';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import {showMessage, hideMessage} from 'react-native-flash-message';

import Toast from '@remobile/react-native-toast';
import BluetoothSerial from 'react-native-bluetooth-serial-next';
import {Buffer} from 'buffer';
import Bluetooth from './Bluetooth';

global.Buffer = Buffer;

const iconv = require('iconv-lite');

class ConnectedDevice extends React.Component {
  constructor(props) {
    super(props);
    this.events = null;
    this.params = this.props.route.params;
    this.state = {
      processing: this.params.processing,
      device: this.params.device,
      //connected: false,
    };
  }

  async componentDidMount() {
    PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ).then((result) => {
      if (!result) {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        );
      }
    });
    if (this.state.device.connected) {
      this.toggleDeviceConnection(this.state.device);
    }
    if (this.state.paired) {
      this.toggleDevicePairing(this.state.device);
    }
    // this.toggleDeviceConnection(this.state.device);
    // this.toggleDevicePairing(this.state.device);
  }
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
        // Toast.showShortBottom(
        //   `Connected to device ${connected.name}<${connected.id}>. Verifying PIN..`,
        // );
        showMessage({
          message: 'Connected ',
          description: `Connection to device ${connected.name} successful`,
          type: 'success',
        });
        this.setState(({device}) => ({
          processing: false,
          device: {
            ...device,
            ...connected,
            connected: true,
          },
        }));
      } else {
        showMessage({
          message: 'Connection Failed ',
          description: `Failed to connect to device ${connected.name} <${id}>`,
          type: 'warning',
        });
        // Toast.showShortBottom(`Failed to connect to device <${id}>`);
        this.setState({processing: false});
      }
    } catch (e) {
      // Toast.showShortBottom(e.message);
      showMessage({
        message: 'Error',
        description: `An error has occured trying to connect to  ${connected.name} <${id}> please try again`,
        type: 'error',
      });
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
      }));
    } catch (e) {
      Toast.showShortBottom(e.message);
      this.setState({processing: false});
    }
  };
  callSignController = (device) => {
    if (device) {
      this.props.navigation.navigate('SignController', {
        deviceId: this.state.device.id,
      });
    } else {
      console.log('error no device found');
    }
  };
  callAdminController = (device) => {
    if (device) {
      this.props.navigation.navigate('PinCode', {
        pinLength: 5,
        pinValue: 16888,
        type: 'Admin',
        deviceId: this.state.device.id,
      });
    } else {
      console.log('error no device found');
    }
  };
  render() {
    return (
      <>
        {this.state.device ? (
          <>
            <View style={styles.topBar}>
              <Text style={styles.heading}>{this.state.device.name}</Text>
              <View style={styles.enableInfoWrapper}>
                <Text>{this.state.device.id}</Text>
              </View>
            </View>

            <View
              style={{
                flex: 1,
              }}>
              {this.state.processing && (
                <ActivityIndicator
                  style={{marginTop: 15}}
                  size={Platform.OS === 'ios' ? 1 : 60}
                  animating={this.state.processing}
                  color="#64aabd"
                />
              )}

              {!this.state.processing && (
                <>
                  <View style={styles.topBarButtons}>
                    {Platform.OS !== 'ios' && (
                      <TouchableOpacity
                        onPress={() =>
                          this.toggleDevicePairing(this.state.device)
                        }
                        style={styles.buttons}>
                        <Text style={styles.buttonText}>
                          {this.state.device.paired ? 'UNPAIR' : 'PAIR'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.buttons}
                      onPress={() =>
                        this.toggleDeviceConnection(this.state.device)
                      }>
                      <Text style={styles.buttonText}>
                        {this.state.device.connected ? 'DISCONNECT' : 'CONNECT'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View>
                    {this.state.device.connected && (
                      <React.Fragment>
                        <TouchableOpacity
                          style={styles.buttons}
                          onPress={() => {
                            this.callSignController(this.state.device);
                          }}>
                          <Text style={styles.buttonText}>Sign Controller</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.buttons}
                          onPress={() => {
                            this.callAdminController(this.state.device);
                          }}>
                          <Text style={styles.buttonText}>
                            Admin Controller
                          </Text>
                        </TouchableOpacity>
                      </React.Fragment>
                    )}
                    {/* <Button
                      title="Close"
                      onPress={() => this.setState({device: null})}
                    /> */}
                  </View>
                </>
              )}
            </View>
          </>
        ) : null}
        <View></View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    backgroundColor: '#f5fcff',
  },
  topBar: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#64aabd',
    backgroundColor: '#fff',
  },
  topBarButtons: {
    height: 56,
    width: windowWidth,
    // paddingHorizontal: 16,
    margin: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#64aabd',
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 18,
    alignSelf: 'center',
    fontFamily: 'Roboto-Regular',
    marginBottom: 5,
    marginTop: 5,
    color: '#0C0D34',
  },
  buttons: {
    width: windowWidth / 2,
    height: 56,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#38a4c0',
    color: '#fff',
  },
  buttonText: {
    margin: 5,
    color: '#38a4c0',
    fontSize: 15,
  },
});

export default ConnectedDevice;
