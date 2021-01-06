import React from 'react';
import {
  Platform,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  PermissionsAndroid,
} from 'react-native';

import {StyleSheet} from 'react-native';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import {showMessage, hideMessage} from 'react-native-flash-message';
import BluetoothSerial from 'react-native-bluetooth-serial-next';
import {Buffer} from 'buffer';

import {pinCommandHandler} from '../services/Bluetooth/readWrite';

global.Buffer = Buffer;

const iconv = require('iconv-lite');

class SelectedDevice extends React.Component {
  constructor(props) {
    super(props);
    this.events = null;
    this.params = this.props.route.params;

    this.state = {
      processing: this.props.route.params.processing,
      device: this.props.route.params.device,
      connecting: false,
      pairing: false,
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
    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.setState({
        processing: this.props.route.params.processing,
        device: this.props.route.params.device,
        connecting: false,
        pairing: false,
      });
      this.isConnected();
    });
  }
  componentWillUnmount() {
    this.focusListener();
  }
  async isConnected() {
    const isConnected = await BluetoothSerial.isConnected(this.state.device.id);
    console.log(isConnected);
    if (isConnected) {
      this.setState(({device}) => ({
        device: {
          ...device,
          connected: true,
        },
      }));
    } else if (!isConnected) {
      this.setState(({device}) => ({
        device: {
          ...device,
          connected: false,
        },
      }));
    }
    return isConnected;
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
        showMessage({
          message: `Device ${paired.name}<${paired.id}> paired successfully`,
          type: 'success',
        });

        this.setState(({devices, device}) => ({
          processing: false,
          device: {
            ...device,
            ...paired,
            paired: true,
          },
        }));
      } else {
        showMessage({
          message: `Device <${id}> pairing failed`,
          type: 'danger',
        });
        this.setState({pairing: false, processing: false});
      }
    } catch (e) {
      showMessage({
        message: `Error ${e.message}`,
        type: 'danger',
      });
      this.setState({pairing: false, processing: false});
    }
  };

  unpairDevice = async (id) => {
    this.setState({pairing: true, processing: true});

    try {
      const unpaired = await BluetoothSerial.unpairDevice(id);

      if (unpaired) {
        showMessage({
          message: `Device ${unpaired.name}<${unpaired.id}> unpaired successfully`,
          type: 'success',
        });

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
        showMessage({
          message: `Device <${id}> unpairing failed`,
          type: 'danger',
        });
        this.setState({pairing: false, processing: false});
      }
    } catch (e) {
      showMessage({
        message: `Error ${e.message}`,
        type: 'danger',
      });
      this.setState({pairing: false, processing: false});
    }
  };

  toggleDeviceConnection = async ({id, connected}) => {
    console.log(id + connected);
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
      console.log(connected);

      if (connected) {
        showMessage({
          message: 'Connected',
          description: `Connection to device ${connected.name} <${connected.id}> was successful`,
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

        // this.callSignController(this.state.device);
        this.callPinPad(this.state.device);
      } else {
        showMessage({
          message: 'Connection Failed ',
          description: `Failed to connect to device ${connected.name} <${id}>`,
          type: 'warning',
        });

        this.setState({processing: false});
      }
    } catch (e) {
      showMessage({
        message: `Error ${e.message}`,
        description: `An error has occured trying to connect to  <${id}> please try again`,
        type: 'error',
      });
      this.setState({processing: false});
    }
  };

  disconnect = async (id) => {
    this.setState({connecting: true, processing: true});

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
      showMessage({
        message: 'Error',
        description: `An error has occured : ${e.message}`,
        type: 'danger',
      });
      this.props.navigation.navigate('HomeStack', {
        screen: 'SelectedDevice',
        params: {
          deviceId: this.state.device.id,
        },
      });
      this.setState({processing: false});
    }
  };
  callSignController = (device) => {
    if (device) {
      this.props.navigation.navigate('HomeStack', {
        screen: 'SignController',
        params: {
          deviceId: this.state.device.id,
        },
      });
    } else {
      console.log('error no device found');
    }
  };

  callPinPad = async () => {
    if (this.state.device) {
      // command and request handler, returns result
      let result = await pinCommandHandler(this.state.device.id, null, true);
      console.log(result);
      if (result === 'NOT OK ERR') {
      }

      console.log(result.res + ' ' + result.pinSet);
      await this.props.navigation.navigate('PinCode', {
        pinLength: 4,
        type: 'Pin',
        deviceId: this.state.device.id,
        pinResult: result,
      });

      // this.props.navigation.navigate('PinCode', {
      //   pinLength: 4,
      //   type: 'Pin',
      //   deviceId: this.state.device.id,
      //   pinResult: result,
      // });
    } else {
      console.log('error no device found');
    }
  };
  callAdminController = (device) => {
    if (device) {
      this.props.navigation.navigate('PinCode', {
        pinLength: 5,
        type: 'Admin',
        deviceId: this.state.device.id,
      });
    } else {
      console.log('error no device found');
    }
  };
  render() {
    return (
      <View style={styles.container}>
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
                <View style={styles.loading}>
                  <Text style={styles.loadingHeading}>
                    Updating Bluetooth Services
                  </Text>
                  <Text style={styles.loadingDes}>
                    Communicating with {this.state.device.name}{' '}
                    {this.state.device.id}
                  </Text>
                  <ActivityIndicator
                    style={{marginTop: 15}}
                    size={Platform.OS === 'ios' ? 1 : 60}
                    animating={this.state.processing}
                    color="#64aabd"
                  />
                </View>
              )}
              {!this.state.processing && (
                <>
                  <View style={styles.topBarButtons}>
                    {Platform.OS !== 'ios' && (
                      <TouchableOpacity
                        onPress={() => {
                          this.toggleDevicePairing(this.state.device);
                        }}
                        style={[
                          styles.buttons,
                          {
                            backgroundColor: this.state.device.paired
                              ? '#cc3833'
                              : '#35cd63',
                          },
                        ]}>
                        <Text style={styles.buttonText}>
                          {this.state.device.paired ? 'UNPAIR' : 'PAIR'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[
                        styles.buttons,
                        {
                          backgroundColor: this.state.device.connected
                            ? '#cc3833'
                            : '#35cd63',
                        },
                      ]}
                      onPress={() => {
                        this.toggleDeviceConnection(this.state.device);
                      }}>
                      <Text style={styles.buttonText}>
                        {this.state.device.connected ? 'DISCONNECT' : 'CONNECT'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {this.state.device.pinResponce && (
                    <React.Fragment>
                      <View style={styles.controller}>
                        <Text style={styles.controllerHeading}>
                          Controllers
                        </Text>
                        <TouchableOpacity
                          style={styles.buttons}
                          onPress={() => {
                            this.callSignController(this.state.device);
                          }}>
                          <Text style={styles.buttonText}>Sign Controller</Text>
                        </TouchableOpacity>

                        {/* <TouchableOpacity
                            style={styles.buttons}
                            onPress={() => {
                              this.callAdminController(this.state.device);
                            }}>
                            <Text style={styles.buttonText}>
                              Admin Controller
                            </Text>
                          </TouchableOpacity> */}
                      </View>
                    </React.Fragment>
                  )}
                </>
              )}
            </View>
          </>
        ) : null}
        <View></View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    // flex: 0.15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  topBarButtons: {
    // flex: 0.15,
    width: windowWidth,
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
    marginBottom: 6,
    marginTop: 14,
    color: '#0C0D34',
  },
  buttons: {
    width: windowWidth / 2,
    height: windowHeight / 10,
    borderWidth: 3,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#fff',
    backgroundColor: '#64aabd',
    marginBottom: 10,
    color: '#fff',
  },
  buttonText: {
    margin: 5,
    fontFamily: 'Roboto-Regular',
    color: '#fff',
    fontSize: 15,
  },
  controller: {
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 50,
    fontFamily: 'Roboto-Regular',
    fontSize: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  controllerHeading: {
    marginTop: 20,
    marginTop: 20,
    fontFamily: 'Roboto-Regular',
    fontSize: 25,
  },
  loading: {
    marginTop: 50,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingHeading: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    fontFamily: 'Roboto-Medium',
    fontSize: 20,
    marginBottom: 10,
  },
  loadingDes: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    fontFamily: 'Roboto-Regular',
  },
});

export default SelectedDevice;
