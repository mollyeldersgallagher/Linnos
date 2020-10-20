import React from 'react';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import {Buffer} from 'buffer';
import BluetoothSerial from 'react-native-bluetooth-serial-next';
global.Buffer = Buffer;
const iconv = require('iconv-lite');
import {Container} from 'native-base';

import styles from './styles';
import {
  commandHandler,
  verifyPin,
  priceCommandHandler,
  asciiToHex,
  writePackets,
  getConfiguration,
  getFirmware
} from '../../services/Bluetooth/readWrite';

export default class AdminController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lines: '1',
      digits: '8',
      auto: true,
      serial: '3',
      configured:null,
      config:this.props.route.params.config,
      deviceId: this.props.route.params.deviceId,
    };
  }

 async componentDidMount() {
    console.log(this.state.deviceId);

    let isVerified = await verifyPin(3000, this.state.deviceId);
    await this.setState({isVerified: isVerified});
    console.log(this.state.isVerified);
    await this.setState({
      lines: this.state.config.lines,
      digits:this.state.config.digits,
      auto:this.state.config.auto,
      serial:this.state.config.serial,
      configured:this.state.config.configured
      
    })
    let firmware = await getFirmware(this.state.deviceId);
    console.log(firmware)
   await this.setState({
     firmware: firmware
   })
  }
  handleLines(lines) {
    this.setState({lines: lines});
  }
  handleDigits(digits) {
    this.setState({digits: digits});
  }

  configSetup() {
    this.handleAutoBrightness();
    let dataBuffer = Buffer.from([
      this.state.lines,
      this.state.digits,
      this.state.serial,
      this.state.autoValue,
    ]);
    commandHandler(17, dataBuffer, this.state.deviceId);
    console.log(dataBuffer);
  }

  handleAutoBrightness() {
    let autoValue;
    if (this.state.auto) {
      autoValue = [0];
      console.log('Auto : OFF');
    } else {
      autoValue = [1];
      console.log('Auto : ON');
    }
    this.setState({autoValue: autoValue});
  }

  saveAll() {}

  render() {
    return (
      <Container>
        <ScrollView>
          {this.state.isVerified ? (
            <View style={{flex: 1}}>
              <Text style={{fontSize: 20, marginTop: 10}}>
                Admin Sign Settings
              </Text>

              <View
                style={{
                  flex: 2,
                  flexDirection: 'column',
                  margin: 10,
                }}>
                <Text style={styles.header}>Number of Lines</Text>

                <TextInput
                  style={styles.input}
                  onChangeText={(text) => this.handleLines(text)}
                  keyboardType={'numeric'}
                  placeholder="Enter Lines"
                  maxLength={4}
                  value={this.state.lines}
                />
              </View>
              <View style={{flex: 2, flexDirection: 'column', margin: 10}}>
                <Text style={styles.header}>Number of digits per line</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => this.handleDigits(text)}
                  keyboardType={'numeric'}
                  maxLength={4}
                  placeholder="Enter Digits"
                  value={this.state.digits}
                />
              </View>
              <View style={{flex: 2, flexDirection: 'column', margin: 10}}>
                <Text style={styles.header}>Serial Protocol</Text>
                <TextInput
                  style={styles.input}
                  keyboardType={'numeric'}
                  maxLength={4}
                  editable={false}
                  value={this.state.serial}
                  // placeholder="Serial Protocol"
                />
              </View>
           
              <View style={{flex: 2, flexDirection: 'row', margin: 10}}>
                <Text style={styles.header}>Auto Brightness</Text>

                <Switch
                  trackColor={{false: '#767577', true: '#38a4c0'}}
                  thumbColor={this.state.auto ? '#f5dd4b' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => {
                    this.setState({auto: !this.state.auto});
                    this.handleAutoBrightness();
                  }}
                  value={this.state.auto}
                />
              </View>
              <View style={{flex: 1, flexDirection: 'column', margin: 10}}>
                <TouchableOpacity
                  style={styles.button}
                  activeOpacity={0.5}
                  onPress={() => {
                    this.configSetup();
                  }}>
                  <Text style={styles.buttonText}>Set Configuration</Text>
                </TouchableOpacity>
              </View>
              <View style={{flex: 2, flexDirection: 'column', margin: 10}}>
                <Text style={styles.header}>Configured: {this.state.configured}</Text>
              
              </View>
              <View style={{flex: 2, flexDirection: 'column', margin: 10}}>
                <Text style={styles.header}>Firmware: {this.state.firmware}</Text>
                
              </View>
            </View>
          ) : (
            <View style={{flex: 1, flexDirection: 'column', margin: 10}}>
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.5}
                onPress={() => {
                  verifyPin(3000, this.state.deviceId);
                }}>
                <Text style={styles.buttonText}>Verify Pin</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </Container>
    );
  }
}