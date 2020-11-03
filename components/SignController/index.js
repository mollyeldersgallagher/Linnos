import React from 'react';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  ScrollView,
  Button,
} from 'react-native';
import {Buffer} from 'buffer';
global.Buffer = Buffer;
const iconv = require('iconv-lite');
import {Container} from 'native-base';
import {NavigationContainer, DrawerActions} from '@react-navigation/native';

import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconIon from 'react-native-vector-icons/Ionicons';

import styles from './styles';
import {Platform} from 'react-native';
import {
  commandHandler,
  verifyPin,
  priceCommandHandler,
  asciiToHex,
  saveState,
  getConfiguration,
  getLightingStatus,
  getPrices,
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
      saving: false,
    };
  }

  async componentDidMount() {
    let isVerified = await verifyPin(this.state.deviceId);
    await this.setState({isVerified: isVerified});
    this.setup();
    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.setup();
    });

    this.props.navigation.setOptions({
      header: () => {
        return (
          <View style={styles.navHeader}>
            {/* icon for the menu */}
            <TouchableOpacity
              onPress={() =>
                this.props.navigation.dispatch(DrawerActions.toggleDrawer())
              }>
              <IconIon name="menu-outline" size={28} color="white" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerText}>Sign Controller</Text>
            </View>
            <TouchableOpacity
              onPress={() => this.callAdminController()}
              // style={styles.icons}
            >
              <Icon name="admin-panel-settings" size={30} color="white" />
            </TouchableOpacity>
          </View>
        );
      },
    });
  }
  componentWillUnmount() {
    this.focusListener();
  }

  async setup() {
    if (this.state.isVerified) {
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
  callAdminController = () => {
    if (this.state.deviceId) {
      this.props.navigation.navigate('PinCode', {
        pinLength: 5,
        pinValue: 16888,
        type: 'Admin',
        deviceId: this.state.deviceId,
      });
    } else {
      console.log('error no device found');
    }
  };
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
    let data;
    if (this.state.display) {
      data = [0];
      console.log('Display : OFF');
    } else {
      data = [1];
      console.log('Display: ON');
    }
    console.log(data);
    this.setState({display: !this.state.display});
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
    this.setState({
      extLight: !this.state.extLight,
    });
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
  async saveAll() {
    this.setState({saving: true});

    let saved = await saveState(this.state.deviceId);
    if (saved) {
      this.props.navigation.navigate('Bluetooth');
    }
    // this.setState({saving: false});
  }
  adminSettings() {
    this.props.navigation.navigate('Admin', {
      deviceId: this.state.deviceId,
    });
  }
  async changeFirmarePin() {
    let pin = await saveState(this.state.deviceId);
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
    this.setState({
      auto: !this.state.auto,
    });
    commandHandler(12, data, this.state.deviceId);
  }

  render() {
    let priceInputs = [];
    console.log(this.state);
    const {auto, display, extLight} = this.state;

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
          {this.state.saving ? (
            <View style={styles.loading}>
              <Text style={styles.loadingHeading}>Saving Data</Text>
              <Text style={styles.loadingDes}>
                Please wait while we save sign updates
              </Text>
              <ActivityIndicator
                style={{marginTop: 15}}
                size={Platform.OS === 'ios' ? 1 : 60}
                animating={this.state.processing}
                color="#64aabd"
              />
            </View>
          ) : (
            <>
              {this.state.readingData ? (
                <View style={styles.loading}>
                  <Text style={styles.loadingHeading}>Reading Data</Text>
                  <Text style={styles.loadingDes}>
                    Please wait while we communicate to the sign
                  </Text>
                  <ActivityIndicator
                    style={{marginTop: 15}}
                    size={Platform.OS === 'ios' ? 1 : 60}
                    animating={this.state.processing}
                    color="#64aabd"
                  />
                </View>
              ) : (
                <>
                  {this.state.isVerified ? (
                    <View style={{flex: 1}}>
                      {/* <Text style={{fontSize: 20, marginTop: 10}}>Update Sign</Text> */}
                      <View
                        style={{flex: 1, flexDirection: 'column', margin: 10}}>
                        <TouchableOpacity
                          style={styles.button}
                          activeOpacity={0.5}
                          onPress={() => {
                            this.changeFirmarePin(this.deviceId);
                          }}>
                          <Text style={styles.buttonText}>Change Pin</Text>
                        </TouchableOpacity>
                      </View>
                      {priceInputs}
                      <View
                        style={{flex: 1, flexDirection: 'column', margin: 10}}>
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
                            {display ? 'ON' : 'OFF'}
                          </Text>
                          <Switch
                            trackColor={{false: '#767577', true: '#9ae6b1'}}
                            thumbColor={display ? '#35cd63' : '#f4f3f4'}
                            onValueChange={() => {
                              this.handleDisplay();
                            }}
                            value={Boolean(display)}
                          />
                        </View>
                      </View>

                      <View style={styles.switch}>
                        <Text style={styles.header}>Auto Mode</Text>

                        <View style={styles.enableInfoWrapper}>
                          <Text
                            style={{
                              fontSize: 14,
                              color: '#0C0D34',
                              paddingRight: 10,
                            }}>
                            {auto ? 'ON' : 'OFF'}
                          </Text>
                          <Switch
                            trackColor={{true: '#9ae6b1', false: '#767577'}}
                            thumbColor={auto ? '#35cd63' : '#f4f3f4'}
                            onValueChange={() => {
                              this.handleAuto();
                            }}
                            value={Boolean(auto)}
                          />
                        </View>
                      </View>

                      {!this.state.auto ? (
                        <>
                          <View
                            style={{
                              flex: 2,
                              flexDirection: 'column',
                              margin: 10,
                            }}>
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
                              value={parseInt(this.state.brightness)}
                              onValueChange={(brightness) => {
                                this.setState({brightness: brightness});
                                this.handleBrightness(brightness);
                              }}
                            />
                          </View>
                          <View style={styles.switch}>
                            <Text style={styles.header}>External Light</Text>

                            <View style={styles.enableInfoWrapper}>
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: '#0C0D34',
                                  paddingRight: 10,
                                }}>
                                {extLight ? 'ON' : 'OFF'}
                              </Text>
                              <Switch
                                trackColor={{true: '#9ae6b1', false: '#767577'}}
                                thumbColor={extLight ? '#35cd63' : '#f4f3f4'}
                                onValueChange={() => {
                                  this.handleExternalLight();
                                }}
                                value={Boolean(extLight)}
                              />
                            </View>
                          </View>
                        </>
                      ) : null}

                      <View
                        style={{flex: 1, flexDirection: 'column', margin: 10}}>
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
                    <View
                      style={{flex: 1, flexDirection: 'column', margin: 10}}>
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
            </>
          )}
        </ScrollView>
      </Container>
    );
  }
}
