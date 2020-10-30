import React from 'react';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {Buffer} from 'buffer';
global.Buffer = Buffer;
const iconv = require('iconv-lite');
import {Container} from 'native-base';

import styles from './styles';
import {
  setConfig,
  verifyPin,
  getConfiguration,
  getFirmware,
} from '../../services/Bluetooth/readWrite';

export default class AdminController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lines: null,
      digits: null,
      auto: true,
      serial: null,
      configured: null,
      readingData: true,
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
        lines: config.lines,
        digits: config.digits,
        config: config,
        serial: config.serial,
        configured: config.configured,
      });
    }
    if (this.state.config !== []) {
      let firmware = await getFirmware(this.state.deviceId);

      await this.setState({
        firmware: firmware,
        readingData: false,
      });
    }
  }
  handleLines(lines) {
    this.setState({lines: lines});
  }
  handleDigits(digits) {
    this.setState({digits: digits});
  }

  async configSetup() {
    this.setState({saving: true});
    this.handleAutoBrightness();
    let dataBuffer = Buffer.from([
      this.state.lines,
      this.state.digits,
      this.state.serial,
      this.state.autoValue,
    ]);
    let set = await setConfig(17, dataBuffer, this.state.deviceId);
    if (set) {
      this.props.navigation.navigate('Bluetooth');
    }
    this.setState({saving: false});
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

  render() {
    const {auto} = this.state;

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
                      <View
                        style={{flex: 2, flexDirection: 'column', margin: 10}}>
                        <Text style={styles.header}>
                          Number of digits per line
                        </Text>
                        <TextInput
                          style={styles.input}
                          onChangeText={(text) => this.handleDigits(text)}
                          keyboardType={'numeric'}
                          maxLength={4}
                          placeholder="Enter Digits"
                          value={this.state.digits}
                        />
                      </View>
                      <View
                        style={{flex: 2, flexDirection: 'column', margin: 10}}>
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

                      <View style={styles.switch}>
                        <Text style={styles.header}>Auto Brightness</Text>

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
                              this.handleAutoBrightness();
                              this.setState({auto: !this.state.auto});
                            }}
                            value={Boolean(auto)}
                          />
                        </View>
                      </View>
                      <View
                        style={{flex: 1, flexDirection: 'column', margin: 10}}>
                        <TouchableOpacity
                          style={styles.button}
                          activeOpacity={0.5}
                          onPress={() => {
                            this.configSetup();
                          }}>
                          <Text style={styles.buttonText}>
                            Set Configuration
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={{flex: 2, flexDirection: 'column', margin: 10}}>
                        <Text style={styles.header}>
                          Configured: {this.state.configured}
                        </Text>
                      </View>
                      <View
                        style={{flex: 2, flexDirection: 'column', margin: 10}}>
                        <Text style={styles.header}>
                          Firmware: {this.state.firmware}
                        </Text>
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
