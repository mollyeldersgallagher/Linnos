import React from 'react';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StatusBar,
  Switch,
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {Buffer} from 'buffer';
import BluetoothSerial from 'react-native-bluetooth-serial-next';
global.Buffer = Buffer;
const iconv = require('iconv-lite');
import crc from 'crc';
import {Container} from 'native-base';

import Slider from '@react-native-community/slider';
import styles from './styles';
import {StyleSheet, Platform} from 'react-native';
import {
  commandHandler,
  verifyPin,
  priceCommandHandler,
  asciiToHex,
  saveState,
  writePackets,
  getConfiguration,
  getLightingStatus,
  getPrices,
} from '../../services/Bluetooth/readWrite';

export default class SignController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isVerified: false,
      text: undefined,
      scannedData: [],
      display: false,
      priceOne: '1234',
      priceTwo: '1234',
      auto: false,
      extLight: false,
      brightness: 45,
      config: {},
      prices: [],
      newPrices: [],
      deviceId: this.props.route.params.deviceId,
      // events: this.props.route.params.events,
    };
  }

  async componentDidMount() {
    this.events = this.props.events;
    console.log(this.state.deviceId);
    // console.log(this.events);

    let isVerified = await verifyPin(3000, this.state.deviceId);
    await this.setState({isVerified: isVerified});
    await console.log(this.state.isVerified);

    if (isVerified) {
      let config = await getConfiguration(this.state.deviceId);
      this.setState({
        auto: config.auto,
        brightness: config.brightness,
        lines: parseInt(config.lines),
        digits: parseInt(config.digits),
        config: config,
      });
      let signPrices = await getPrices(
        this.state.deviceId,
        this.state.lines,
        this.state.digits,
      );
      await this.setState({
        prices: signPrices,
        newPrices: signPrices,
      });
      let lightStatus = await getLightingStatus(this.state.deviceId);
      await this.setState({
        extLight: lightStatus.extLight,
        display: lightStatus.display,
      });
      console.log(this.state.auto, this.state.extLight, this.state.display);
    }
  }

  updatePrices() {
    let prices = [...this.state.newPrices];

    let priceDigits;
    let hexDigits;
    let dataLengthBuffer;

    priceDigits = prices.join('');
    console.log(prices);
    priceDigits = Array.from(prices.join('')).map(Number);

    dataLengthBuffer = Buffer.from([priceDigits.length]);

    hexDigits = priceDigits.map((d) => asciiToHex(d));

    let priceBuffer = Buffer.from(hexDigits);

    console.log(dataLengthBuffer);
    console.log(priceBuffer);
    priceCommandHandler(dataLengthBuffer, priceBuffer, this.state.deviceId);
  }
  handlePrices(price, index) {
    console.log(index - 1, price);
    // let newArray = new Array(this.state.lines - 1);
    let newArray = [...this.state.newPrices];
    newArray[index - 1] = parseInt(price);
    this.setState({newPrices: newArray});
    console.log(newArray);
  }
  handlePriceOne(priceOne) {
    this.setState({priceOne: priceOne});
  }
  handlePriceTwo(priceTwo) {
    this.setState({priceTwo: priceTwo});
  }
  handleDisplay() {
    let data;
    if (this.state.display) {
      data = [0];
      console.log('Display : OFF');
    } else {
      data = [1];
      console.log('Display: ON');
    }
    console.log(data);
    commandHandler(10, data, this.state.deviceId);
  }
  handleExternalLight() {
    let data;
    if (this.state.extLight) {
      data = [0];
      console.log('Ext : OFF');
    } else {
      data = [1];
      console.log('Ext : ON');
    }
    console.log(data);
    commandHandler(21, data, this.state.deviceId);
  }
  handleBrightness(brightness) {
    let data;
    if (brightness === 75) {
      data = [15];
      console.log('Brightness : HIGH');
    } else if (brightness === 45) {
      data = [45];
      console.log('Brightness : MID');
    } else if (brightness === 15) {
      data = [75];
      console.log('Brightness : LOW');
    }
    console.log(data);
    commandHandler(11, data, this.state.deviceId);
  }
  saveAll() {
    saveState(this.state.deviceId);
  }
  adminSettings() {
    this.props.navigation.navigate('Admin', {
      deviceId: this.state.deviceId,
    });
  }
  handleAuto() {
    let data;
    if (this.state.auto) {
      data = [2];
      console.log('Auto : OFF');
    } else {
      data = [1];
      console.log('Auto : ON');
    }
    console.log(data);
    commandHandler(12, data, this.state.deviceId);
  }

  render() {
    let priceInputs = [];
    console.log(this.state.lines);
    for (let i = 1; i <= this.state.lines; i++) {
      // let index = i - 1;
      priceInputs.push(
        <View
          style={{
            flex: 2,
            flexDirection: 'column',
            margin: 10,
          }}>
          <Text style={styles.header}>Price {i}</Text>

          <TextInput
            style={styles.input}
            // name={index}
            onChangeText={(text) => this.handlePrices(text, i)}
            keyboardType={'numeric'}
            placeholder="Price one in format 1234 for 123.4"
            maxLength={this.state.digits}
            defaultValue={this.state.prices[i - 1]}
          />
        </View>,
      );
    }
    return (
      <Container>
        <ScrollView>
          {this.state.isVerified ? (
            <View style={{flex: 1}}>
              <Text style={{fontSize: 20, marginTop: 10}}> Update Sign </Text>
              {priceInputs}
              {/* <View
                style={{
                  flex: 2,
                  flexDirection: 'column',
                  margin: 10,
                }}>
                {this.state.prices.map(price =>())}
                <Text style={styles.header}>Price 1</Text>

                <TextInput
                  style={styles.input}
                  onChangeText={(text) => this.handlePriceOne(text)}
                  keyboardType={'numeric'}
                  placeholder="Price one in format 1234 for 123.4"
                  maxLength={4}
                  value={this.state.priceOne}
                />
              </View>
              <View style={{flex: 2, flexDirection: 'column', margin: 10}}>
                <Text style={styles.header}>Price 2</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => this.handlePriceTwo(text)}
                  keyboardType={'numeric'}
                  maxLength={4}
                  value={this.state.priceTwo}
                  placeholder="Price two in format 1234 for 123.4"
                />
              </View> */}

              <View style={{flex: 1, flexDirection: 'column', margin: 10}}>
                <TouchableOpacity
                  style={styles.button}
                  activeOpacity={0.5}
                  onPress={() => {
                    this.updatePrices();
                  }}>
                  <Text style={styles.buttonText}>Update Prices</Text>
                </TouchableOpacity>
              </View>
              <View style={{flex: 2, flexDirection: 'row', margin: 10}}>
                <Text style={styles.header}>Display </Text>

                <Switch
                  trackColor={{false: '#767577', true: '#38a4c0'}}
                  thumbColor={this.state.display ? '#f5dd4b' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => {
                    this.setState({display: !this.state.display});
                    this.handleDisplay();
                  }}
                  value={this.state.display}
                />
              </View>

              <View style={{flex: 2, flexDirection: 'row', margin: 10}}>
                <Text style={styles.header}>Auto Mode</Text>

                <Switch
                  trackColor={{false: '#767577', true: '#38a4c0'}}
                  thumbColor={this.state.auto ? '#f5dd4b' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => {
                    this.setState({auto: !this.state.auto});
                    this.handleAuto();
                  }}
                  value={this.state.auto}
                />
              </View>

              {!this.state.auto ? (
                <>
                  <View style={{flex: 2, flexDirection: 'column', margin: 10}}>
                    <Text
                      style={
                        styles.header
                      }>{`Brightness: ${this.state.brightness}`}</Text>

                    <Slider
                      maximumValue={75}
                      minimumValue={15}
                      minimumTrackTintColor="#38a4c0"
                      maximumTrackTintColor="#000000"
                      step={30}
                      value={this.state.brightness}
                      onValueChange={(brightness) => {
                        this.setState({brightness: brightness});
                        this.handleBrightness(brightness);
                      }}
                    />
                  </View>
                  <View style={{flex: 2, flexDirection: 'row', margin: 10}}>
                    <Text style={styles.header}>External Light </Text>

                    <Switch
                      trackColor={{false: '#767577', true: '#38a4c0'}}
                      thumbColor={this.state.extLight ? '#f5dd4b' : '#f4f3f4'}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => {
                        this.setState({extLight: !this.state.extLight});
                        this.handleExternalLight();
                      }}
                      value={this.state.extLight}
                    />
                  </View>
                </>
              ) : (
                <Text> Auto Mode is on </Text>
              )}

              <View style={{flex: 1, flexDirection: 'column', margin: 10}}>
                <TouchableOpacity
                  style={styles.button}
                  activeOpacity={0.5}
                  onPress={() => {
                    this.saveAll();
                  }}>
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  activeOpacity={0.5}
                  onPress={() => {
                    this.props.navigation.navigate('Admin', {
                      deviceId: this.state.deviceId,
                      config: this.state.config,
                    });
                  }}>
                  <Text style={styles.buttonText}>Admin Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  activeOpacity={0.5}
                  onPress={() => {
                    getConfiguration(this.state.deviceId);
                  }}>
                  <Text style={styles.buttonText}>Config</Text>
                </TouchableOpacity>
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
