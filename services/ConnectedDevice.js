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

import BluetoothSerial, {
  withSubscription,
} from 'react-native-bluetooth-serial-next';
import {Buffer} from 'buffer';

global.Buffer = Buffer;

const iconv = require('iconv-lite');

class ConnectedDevice extends React.Component {
  constructor(props) {
    super(props);
    this.events = null;
    this.state = {};
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
  }

  render() {
    // console.log('DEVICE' + device);
    let device = {
      id: 123456,
      name: 'Serial Adapter',
      paired: true,
      connected: false,
    };

    if (!device) {
      return null;
    }

    return (
      //   <Modal
      //     animationType="fade"
      //     transparent={false}
      //     visible={true}
      //     onRequestClose={() => {}}>
      //     {device ? (
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
      // ) : null}
      //   </Modal>
    );
  }
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

  //   render() {
  //     const {isEnabled, device, devices, scanning, processing} = this.state;

  //     return (
  //       <SafeAreaView style={{flex: 1}}>
  //         <View style={styles.topBar}>
  //           <Text style={styles.heading}>Bluetooth</Text>
  //           <View style={styles.enableInfoWrapper}>
  //             <Text style={{fontSize: 14, color: '#fff', paddingRight: 10}}>
  //               {isEnabled ? 'ON' : 'OFF'}
  //             </Text>
  //             <Switch trackColor={{ false: "#767577", true: "#ffffff" }}
  //         thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"} onValueChange={this.toggleBluetooth} value={isEnabled} />
  //           </View>
  //         </View>

  //         {scanning ? (
  //           isEnabled && (
  //             <View
  //               style={{
  //                 flex: 1,
  //                 alignItems: 'center',
  //                 justifyContent: 'center',
  //               }}>
  //               <ActivityIndicator
  //                 style={{marginBottom: 15}}
  //                 size={Platform.OS === 'ios' ? 1 : 60}
  //               />
  //               <Button
  //                 textStyle={{color: '#fff'}}
  //                 style={styles.buttonRaised}
  //                 title="Cancel Discovery"
  //                 onPress={this.cancelDiscovery}
  //               />
  //             </View>
  //           )
  //         ) : (
  //           <React.Fragment>
  //             {this.renderModal(device, processing)}
  //             <DeviceList
  //               devices={devices}
  //               onDevicePressed={(device) => this.setState({device})}
  //               onRefresh={this.listDevices}
  //             />
  //           </React.Fragment>
  //         )}

  //         <View style={styles.footer}>
  //           <ScrollView horizontal contentContainerStyle={styles.fixedFooter}>
  //             {isEnabled && (
  //               <Button
  //                 title="Discover more"
  //                 onPress={this.discoverUnpairedDevices}
  //               />
  //             )}
  //             {!isEnabled && (
  //               <Button title="Request enable" onPress={this.requestEnable} />
  //             )}
  //           </ScrollView>
  //         </View>
  //       </SafeAreaView>
  //     );
  //   }
}

export default withSubscription({subscriptionName: 'events'})(ConnectedDevice);
