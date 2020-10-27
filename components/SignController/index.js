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
  getConfiguration,
  getLightingStatus,
  getPrices,
  wait,
} from '../../services/Bluetooth/readWrite';

export default class SignController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isVerified: false,
      display: true,
      auto: false,
      readingData: true,
      brightness: 45,
      config: {},
      prices: [],
      newPrices: [],
      deviceId: this.props.route.params.deviceId,
      // events: this.props.route.params.events,
    };
  }
  async componentDidMount() {
    let isVerified = await verifyPin(this.state.deviceId);
    await this.setState({isVerified: isVerified});
    await console.log(this.state.isVerified);
    this.setup();
    this.focusListener = navigation.addListener('didFocus', () => {
      // The screen is focused
      // Call any action
      this.setup();
    });
    // console.log(this.state.auto, this.state.extLight, this.state.display);
  }
  // componentWillUnmount() {
  //   // Remove the event listener
  //   this.focusListener.remove();
  // }

  async setup() {
    if (this.state.isVerified) {
      console.log('DEVICE ID' + this.state.deviceId);
      let config = await getConfiguration(this.state.deviceId);
      this.setState({
        auto: config.auto,
        brightness: config.brightness,
        lines: parseInt(config.lines),
        digits: parseInt(config.digits),
        config: config,
      });
    }
    if (this.state.config !== []) {
      let signPrices = await getPrices(
        this.state.deviceId,
        this.state.lines,
        this.state.digits,
      );

      this.setState({
        prices: signPrices,
        newPrices: signPrices,
      });
    }
    if (this.state.prices !== []) {
      let lightStatus = await getLightingStatus(this.state.deviceId);
      this.setState({
        extLight: lightStatus.extLight,
        display: lightStatus.display,
      });
      this.setState({
        readingData: false,
      });
    } else {
      console.log('ERROR READING DATA');
    }
  }

  updatePrices() {
    let prices = [...this.state.newPrices];

    let priceDigits;
    let hexDigits;
    let dataLengthBuffer;

    priceDigits = prices.join('');

    priceDigits = Array.from(prices.join('')).map(Number);

    dataLengthBuffer = Buffer.from([priceDigits.length]);

    hexDigits = priceDigits.map((d) => asciiToHex(d));

    let priceBuffer = Buffer.from(hexDigits);

    priceCommandHandler(dataLengthBuffer, priceBuffer, this.state.deviceId);
  }
  handlePrices(price, index) {
    let newArray = [...this.state.newPrices];
    newArray[index - 1] = parseInt(price);
    this.setState({newPrices: newArray});
  }

  handleDisplay() {
    this.setState({display: !this.state.display});
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

    commandHandler(12, data, this.state.deviceId);
  }

  render() {
    let priceInputs = [];
    console.log(this.state);

    for (let i = 1; i <= this.state.lines; i++) {
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
            key={`input${i}`}
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
          {this.state.readingData ? (
            <ActivityIndicator
              style={{marginTop: 15}}
              size={Platform.OS === 'ios' ? 1 : 60}
              animating={this.state.processing}
              color="#64aabd"
            />
          ) : (
            <>
              {this.state.isVerified ? (
                <View style={{flex: 1}}>
                  <Text style={{fontSize: 20, marginTop: 10}}>Update Sign</Text>
                  {priceInputs}
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
                  <View style={styles.switch}>
                    <Text style={styles.header}>Display </Text>
                    <View style={styles.enableInfoWrapper}>
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#0C0D34',
                          paddingRight: 10,
                        }}>
                        {this.state.display ? 'ON' : 'OFF'}
                      </Text>
                      <Switch
                        trackColor={{false: '#767577', true: '#767577'}}
                        thumbColor={this.state.display ? '#f5dd4b' : '#f4f3f4'}
                        onValueChange={() => {
                          this.handleDisplay();
                        }}
                        value={this.state.display}
                      />
                    </View>
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
                      <View
                        style={{flex: 2, flexDirection: 'column', margin: 10}}>
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
                          thumbColor={
                            this.state.extLight ? '#f5dd4b' : '#f4f3f4'
                          }
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
                  </View>
                </View>
              ) : (
                <View style={{flex: 1, flexDirection: 'column', margin: 10}}>
                  <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.5}
                    onPress={() => {
                      verifyPin(this.state.deviceId);
                    }}>
                    <Text style={styles.buttonText}>Verify Pin</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </Container>
    );
  }
}
