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

global.Buffer = Buffer;

const iconv = require('iconv-lite');

class ConnectedDevice extends React.Component {
  constructor(props) {
    super(props);
    this.events = null;
    this.params = this.props.route.params;

    this.state = {
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

    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.setState({
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
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.heading}>{this.state.device.name}</Text>
          <View style={styles.enableInfoWrapper}>
            <Text>Connected Device {this.state.device.id}</Text>
          </View>
        </View>
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

export default ConnectedDevice;
