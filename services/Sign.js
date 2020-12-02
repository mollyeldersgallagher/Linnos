import React, {useState, useContext} from 'react';
import {Buffer} from 'buffer';
import Toast from '@remobile/react-native-toast';
import BluetoothSerial, {
  withSubscription,
} from 'react-native-bluetooth-serial-next';
global.Buffer = Buffer;
const iconv = require('iconv-lite');

//const sign = new Sign();
//console.log(sign);

export default class Sign {
  constructor(priceOne, priceTwo, auto, power, brightness) {
    this.priceOne = priceOne;
    this.priceTwo = priceTwo;
    this.auto = auto;
    this.power = power;
    this.brightness = brightness;
    this.permission = false;
  }

  getSign() {}
  setSign() {}
  changeBase(number, fromBase, toBase) {
    if (fromBase == 10) {
      return parseInt(number).toString(toBase);
    } else if (toBase == 10) {
      return parseInt(number, fromBase);
    } else {
      var numberInDecimal = parseInt(number, fromBase);
      return parseInt(numberInDecimal).toString(toBase);
    }
  }

  asciiToHex(asciiNumber) {}

  hexToAscii(hexNumber) {}



  splitCRC(crc) {
    const c = this.changeBase(crc, 10, 16);
    let hb;
    let lb;
    if (c.length == 4) {
      hb = c.slice(0, 2);
      lb = c.slice(2, 5);
    } else {
      hb = '0' + c.slice(0, 1);
      lb = c.slice(1, 4);
    }
    return [parseInt(hb, 16), parseInt(lb, 16)];
  }

  /**
   * command to change the displays (LED display)
   * @param bool the new display state (ON|OFF)
   */
  displaysOnOff(bool, timeout) {}

  /**
   * command to change the brightness
   * @param brightness the new brightness
   */
  brightnessControl(number, timeout) {}

  /**
   * command to change the auto level of the sign
   * @param bool the new auto level
   */
  autoLevelOnOff(bool, timeout) {}

  /**
   * command to get the configuration of the sign
   */
  getConfiguration(timeout) {}

  /**
   * command to get the prices of the sign
   */
  getPrices(lines, digits, timeout) {}

  /**
   * command to change the configuration of the sign
   * @param brightness the new brightness status
   * @param autoMode the new auto mode
   * @param lines the new number of lines
   * @param digits the new number of digits per line
   */
  setConfiguration(autoMode, lines, digits, timeout) {}

  /**
   * command to change the prices
   * @param prices the new prices
   */
  setPrices(prices, timeout) {}

  /**
   * command to change the external lighting status
   * @param bool the new external lighting status (ON|OFF)
   */
  setExternalLightingOnOff(bool, timeout) {}

  /**
   * command to get the lighting status
   */
  getLightingStatus(timeout) {}

  /**
   * command to get the firmware version
   */
  getFirmwareVersion(timeout) {}

  /**
   * cast a buffer, returned by the controller, to firware version
   * @param {*} buffer the buffer to cast
   */
  bufferToFwVersion(buffer) {}

  /**
   * cast a buffer, returned by the controller, to configuration
   * @param {*} buffer the buffer to cast
   */
  bufferToConfiguration(buffer) {}

  /**
   * cast the buffer, returned by the controller, to lighting status
   * @param {*} buffer the buffer to cast
   */
  bufferToLightingStatus(buffer) {
    const arr = [...buffer];
    const result = {
      displays: undefined,
      externalLighting: undefined,
      brightness: undefined,
    };
    const displays = arr[3];
    const externalLighting = arr[4];
    const brightness = arr[5];
    if (displays == 0) {
      result.displays = false;
    } else {
      result.displays = true;
    }
    if (externalLighting == 0) {
      result.externalLighting = false;
    } else {
      result.externalLighting = true;
    }
    switch (brightness) {
      case 75:
        result.brightness = 0;
        break;
      case 45:
        result.brightness = 50;
        break;
      case 15:
        result.brightness = 100;
        break;
    }
    return result;
  }

  /**
   * cast the buffer, returned by the controller, to prices
   * @param {*} lines number of lines
   * @param {*} digits number of digits
   * @param {*} buffer the buffer to cast
   */
  bufferToPrices(lines, digits, buffer) {}

  setTime(offTime, extLightsOn, displaysOn, sign) {
    this.offTime = offTime;
    this.extLightsOn = extLightsOn;
    this.displaysOn = displaysOn;
    this.clockDisplaysOn.cancel();
    this.clockExtLightsOn.cancel();
    this.clockOffTime.cancel();
    this.clockOffTime = schedule.scheduleJob(
      this.offTime[1] + ' ' + this.offTime[0] + ' * * *',
      () => {
        console.log('clock off time');
        this.displaysOnOff(false, 0);
        sign.displays = false;
      },
    );
    this.clockExtLightsOn = schedule.scheduleJob(
      this.extLightsOn[1] + ' ' + this.extLightsOn[0] + ' * * *',
      () => {
        this.setExternalLightingOnOff(true, 0);
        sign.poleLights = true;
      },
    );
    this.clockDisplaysOn = schedule.scheduleJob(
      this.displaysOn[1] + ' ' + this.displaysOn[0] + ' * * *',
      () => {
        console.log('clock on time');
        this.displaysOnOff(true, 0);
        sign.displays = true;
      },
    );
  }
  /**
   * command to save all changes
   */
  saveAll(timeout) {}
}
