import {Buffer} from 'buffer';
import BluetoothSerial from 'react-native-bluetooth-serial-next';
global.Buffer = Buffer;
const iconv = require('iconv-lite');
import crc from 'crc';
import {showMessage, hideMessage} from 'react-native-flash-message';
function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const wait = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
writePackets = async (id, message, packetSize = 64) => {
  let response;
  try {
    const device = await BluetoothSerial.device(id);
    let writePromise = await device.write(message);

    await Promise.all(writePromise).then(
      console.log('Packets Written ' + message),
    );
    // await wait(1000);
    response = await BluetoothSerial.readFromDevice(id);
    await Promise.all(response).then(
      console.log('Response Recieved ' + response),
    );

    if (response.substring(0, 2) === '20') {
      console.log('RES OK');
      showMessage({
        message: 'Successful',
        description: 'Sign updated sucessfully',
        type: 'success',
      });
    } else if (response === '' || response === null || response === []) {
      console.log('RES NOT OK');
      showMessage({
        message: 'Response ',
        description:
          'It looks the sign didnt send a response. If the sign did not update please try again.',
        type: 'warning',
      });
    } else {
      showMessage({
        message: 'Error',
        description:
          'An error occured please try again and check bluetooth device is connected',
        type: 'danger',
      });
    }
  } catch (e) {
    console.log(e.message);
  }
  return response;
};
/**
 * verify pin command
 * this needs to be sent before changing any values
 * component did mount after connecting to blue tooth
 * @param timeout timeout in milliseconds and deviceId
 */
export const pinCommandHandler = async (id, pinBuffer, pinSet) => {
  // Buffer that holds the command to send the pin "3683" to the pole, to allow config to be modified.
  // 0x02 - Start of text byte
  let buffer;
  // check if the pin is entered, if not default to 3683
  if (pinBuffer === null || pinBuffer === undefined) {
    pinBuffer = Buffer.from([0x33, 0x36, 0x38, 0x33]);
  }
  // if the pin is set verify pin with command 20 or if pin is not set, set it with command 19
  if (pinSet) {
    buffer = Buffer.from([0x02, 0x20, 0x04]);
  } else {
    buffer = Buffer.from([0x02, 0x19, 0x04]);
  }
  let newBuffer = Buffer.concat([buffer, pinBuffer]);
  let finalBuffer = Buffer.concat([
    newBuffer,
    Buffer.from(splitCRC(crc.crc16xmodem(newBuffer))),
  ]);
  console.log(finalBuffer);
  console.log('pin buffer' + finalBuffer);
  let message = finalBuffer;
  try {
    const device = await BluetoothSerial.device(id);
    let writePromise = await device.write(message);

    await Promise.all(writePromise).then(
      console.log('Packets Written ' + message),
    );
    await wait(1000);
    let response = await BluetoothSerial.readFromDevice(id);
    await Promise.all(response).then(
      console.log('Response Recieved ' + response),
    );

    let resResult = {};
    console.log(typeof response);

    if (response.substring(0, 3) === '201' && response.charAt(3) === 'F') {
      console.log('RES OK AND PIN NOT SET');
      resResult = {res: 'OK', pinSet: false};
    } else if (
      response.substring(0, 3) === '201' &&
      response.substring(3, 5) === '1E'
    ) {
      console.log('RES OK AND PIN IS SET');
      resResult = {res: 'OK', pinSet: true};
    } else if (
      response.charAt(3) === 'F' &&
      response.substring(0, 3) !== '201'
    ) {
      console.log('RES NOT OK AND PIN IS NOT SET');
      resResult = {res: 'NOT OK', pinSet: false};
    } else if (
      response.substring(3, 5) === '1E' &&
      response.substring(0, 3) !== '201'
    ) {
      console.log('RES NOT OK AND PIN IS SET');
      resResult = {res: 'NOT OK', pinSet: true};
    } else {
      resResult = {res: 'NOT OK ERR', pinSet: null};
    }
    return resResult;
  } catch (e) {
    console.log(e.message);
    return false;
  }
};

// export const verifyPin = async (id, pinBuffer, pinSet) => {
//   // Buffer that holds the command to send the pin "3683" to the pole, to allow config to be modified.
//   // 0x02 - Start of text byte
//   let buffer = Buffer.from([0x02, 0x14, 0x04, 0x33, 0x36, 0x38, 0x33]);
//   //console.log(crc.crc16xmodem(buffer));
//   let finalBuffer = Buffer.concat([
//     buffer,
//     Buffer.from(splitCRC(crc.crc16xmodem(buffer))),
//   ]);
//   console.log(finalBuffer);
//   console.log('pin buffer' + finalBuffer);
//   let message = finalBuffer;
//   try {
//     const device = await BluetoothSerial.device(id);
//     let writePromise = await device.write(message);

//     await Promise.all(writePromise).then(
//       console.log('Packets Written ' + message),
//     );
//     await wait(1000);
//     let response = await BluetoothSerial.readFromDevice(id);
//     await Promise.all(response).then(
//       console.log('Response Recieved ' + response),
//     );

//     let resResult = {};
//     console.log(typeof response);

//     if (response.substring(0, 3) === '201' && response.charAt(3) === 'F') {
//       console.log('RES OK AND PIN NOT SET');
//       resResult = {res: 'OK', pinSet: false};
//     } else if (
//       response.substring(0, 3) === '201' &&
//       response.substring(3, 5) === '1E'
//     ) {
//       console.log('RES OK AND PIN IS SET');
//       resResult = {res: 'OK', pinSet: true};
//     } else if (
//       response.charAt(3) === 'F' &&
//       response.substring(0, 3) !== '201'
//     ) {
//       console.log('RES NOT OK AND PIN IS NOT SET');
//       resResult = {res: 'NOT OK', pinSet: false};
//     } else if (
//       response.substring(3, 5) === '1E' &&
//       response.substring(0, 3) !== '201'
//     ) {
//       console.log('RES NOT OK AND PIN IS SET');
//       resResult = {res: 'NOT OK', pinSet: true};
//     } else {
//       resResult = {res: 'NOT OK ERR', pinSet: null};
//     }
//     return resResult;
//   } catch (e) {
//     console.log(e.message);
//     return false;
//   }
// };
// export const setPin = async (id, pinBuffer) => {
//   // Buffer that holds the command to send the pin "3683" to the pole, to allow config to be modified.
//   // 0x02 - Start of text byte

//   let buffer = Buffer.from([0x02, 0x19, 0x04]);
//   //console.log(crc.crc16xmodem(buffer));
//   let newBuffer = Buffer.concat([buffer, pinBuffer]);
//   let finalBuffer = Buffer.concat([
//     newBuffer,
//     Buffer.from(splitCRC(crc.crc16xmodem(newBuffer))),
//   ]);
//   console.log(finalBuffer);

//   console.log('pin buffer' + finalBuffer);
//   let message = finalBuffer;
//   try {
//     const device = await BluetoothSerial.device(id);
//     let writePromise = await device.write(message);

//     await Promise.all(writePromise).then(
//       console.log('Packets Written ' + message),
//     );
//     await wait(1000);
//     let response = await BluetoothSerial.readFromDevice(id);
//     await Promise.all(response).then(
//       console.log('Response Recieved ' + response),
//     );

//     if (response.substring(0, 2) === '20') {
//       console.log('RES OK');
//     } else {
//       console.log('RES NOT OK');
//     }
//     return true;
//   } catch (e) {
//     console.log(e.message);
//     return false;
//   }
//   // return response;
// };

export const getConfiguration = async (id) => {
  let config = {};
  let result = {
    resCode: null,
    data: null,
    resMessage: null,
  };

  try {
    let newBuffer;
    let buffer = Buffer.from([0x02, 15, 0]);
    newBuffer = Buffer.concat([
      buffer,
      Buffer.from(splitCRC(crc.crc16xmodem(buffer))),
    ]);

    const device = await BluetoothSerial.device(id);
    let writePromise = await device.write(newBuffer);
    await Promise.all(writePromise).then(
      console.log('Packets Written ' + newBuffer),
    );
    await wait(1000);
    const response = await BluetoothSerial.readFromDevice(id);
    await Promise.all(response).then(
      console.log('Response Recieved ' + response),
    );

    var res = response.substring(0, 2);
    if (response.length > 5 && response.substring(0, 3) === '206') {
      switch (response.charAt(3)) {
        case '2':
          // brightness is = 45
          config.brightness = 45;
          config.auto = response.charAt(5);
          config.lines = response.charAt(6);
          config.digits = response.charAt(7);
          config.serial = response.charAt(8);
          config.configured = parseInt(response.substring(9, 11), 16);
          console.log(config);

          break;
        case 'F':
          // brightness = 15 but has to change to 75 for display purposes
          config.brightness = 75; // remember that is the highest value and is reversed on the sign.
          config.auto = response.charAt(4);
          config.lines = response.charAt(5);
          config.digits = response.charAt(6);
          config.serial = response.charAt(7);
          config.configured = parseInt(response.substring(8, 10), 16);
          console.log(config);

          break;
        case '4':
          // brightness = 75 but has to be changed to 15 for display purposes
          config.brightness = 15;
          config.auto = response.charAt(5);
          config.lines = response.charAt(6);
          config.digits = response.charAt(7);
          config.serial = response.charAt(8);
          config.configured = parseInt(response.substring(9, 11), 16);
          console.log(config);
          break;
        default:
          console.log('Switch didnt work');
      }
    } else if (response.length === 5 && response.substring(0, 2) === '23') {
      console.log('error response');
    }
  } catch (e) {
    console.log(e.message);
  }
  if (config.auto === 1) {
    config.auto = true;
  } else if (config.auto === 0) {
    config.auto = false;
  }

  return config;
};
export const getLightingStatus = async (id) => {
  let lightStatus = {
    display: 1,
    extLight: 0,
  };

  try {
    let newBuffer;
    let buffer = Buffer.from([0x02, 22, 0]);
    newBuffer = Buffer.concat([
      buffer,
      Buffer.from(splitCRC(crc.crc16xmodem(buffer))),
    ]);

    await wait(1000);
    const device = await BluetoothSerial.device(id);
    let writePromise = await device.write(newBuffer);

    await Promise.all(writePromise).then(
      console.log('Lighting Packet Written ' + newBuffer),
    );
    await wait(2000);
    const response = await BluetoothSerial.readFromDevice(id);
    await Promise.all(response).then(
      console.log('Lighting Response Recieved ' + response),
    );

    var res = response.substring(0, 2);
    if (response.length > 5 && response.substring(0, 3) === '203') {
      //display check
      if (response.charAt(3) === 1) {
        lightStatus.display = true;
      } else if (response.charAt(3) === 0) {
        lightStatus.display = false;
      }
      //extLight
      if (response.charAt(4) === 1) {
        lightStatus.extLight = true;
      } else if (response.charAt(4) === 0) {
        lightStatus.extLight = false;
      }
    }
  } catch (e) {
    console.log(e.message);
  }
  return lightStatus;
};
export const getPrices = async (id, lines, digits) => {
  let priceArray = [];
  try {
    let newBuffer;
    let buffer = Buffer.from([0x02, 16, 0]);
    newBuffer = Buffer.concat([
      buffer,
      Buffer.from(splitCRC(crc.crc16xmodem(buffer))),
    ]);

    const device = await BluetoothSerial.device(id);

    let writePromise = await device.write(newBuffer);

    await Promise.all(writePromise).then(console.log('Price Packet Written'));
    await wait(1000);
    const response = await BluetoothSerial.readFromDevice(id);
    await Promise.all(response).then(
      console.log('Price Response Recieved ' + response),
    );

    var res = response.substring(0, 2);
    if (response.substring(0, 2) === '20') {
      let prices = response.substring(3, digits * 2 * lines + 3);
      var output = new Buffer(prices, 'hex');
      for (let i = 0; i <= output.length; i = i + digits) {
        //times 2 is to account for the two digits of hex values
        priceArray.push(output.toString().substring(i, i + digits));
        console.log(output.toString().substring(i, i + digits));
      }
    } else if (
      response.substring(0, 2) === '21' ||
      response.substring(0, 2) === '22' ||
      response.substring(0, 2) === '23'
    ) {
      console.log('RES NOT OK');
    }
  } catch (e) {
    console.log(e.message);
  }
  return priceArray;
};
export const getFirmware = async (id) => {
  let firmware;
  let firmwareStr;

  try {
    let newBuffer;
    let buffer = Buffer.from([0x02, 23, 0]);
    newBuffer = Buffer.concat([
      buffer,
      Buffer.from(splitCRC(crc.crc16xmodem(buffer))),
    ]);

    const device = await BluetoothSerial.device(id);

    let writePromise = await device.write(newBuffer);

    await Promise.all(writePromise).then(
      console.log('Firmware Packet Written'),
    );
    await wait(1000);
    const response = await BluetoothSerial.readFromDevice(id);
    await Promise.all(response).then(
      console.log('Firmware Response Recieved ' + response),
    );

    var res = response.substring(0, 2);
    if (response.length > 5 && response.substring(0, 3) === '204') {
      firmware = response.substring(3, 11);
      var output = new Buffer(firmware, 'hex');
      firmwareStr = output.toString();
    }
  } catch (e) {
    console.log(e.message);
  }
  return firmwareStr;
};
export const commandHandler = (command, data, id) => {
  let buffer, finalBuffer, newBuffer;
  if (Buffer.isBuffer(data)) {
    buffer = Buffer.from([0x02, command, data.length]);
    newBuffer = Buffer.concat([buffer, data]);
    finalBuffer = Buffer.concat([
      newBuffer,
      Buffer.from(splitCRC(crc.crc16xmodem(newBuffer))),
    ]);
  } else {
    buffer = Buffer.from([0x02, command, data.length, data]);
    finalBuffer = Buffer.concat([
      buffer,
      Buffer.from(splitCRC(crc.crc16xmodem(buffer))),
    ]);
  }
  writePackets(id, finalBuffer);
};
export const priceCommandHandler = (
  dataLengthBuffer,
  priceBuffer,
  deviceId,
) => {
  let buffer = Buffer.from([0x02, 18]);
  let newBuffer = Buffer.concat([buffer, dataLengthBuffer, priceBuffer]);
  let finalBuffer = Buffer.concat([
    newBuffer,
    Buffer.from(splitCRC(crc.crc16xmodem(newBuffer))),
  ]);
  writePackets(deviceId, finalBuffer);
};
export const saveState = async (id) => {
  let saved = false;
  try {
    const device = await BluetoothSerial.device(id);
    buffer = Buffer.from([0x02, 14, 0]);
    packet = Buffer.concat([
      buffer,
      Buffer.from(splitCRC(crc.crc16xmodem(buffer))),
    ]);

    let writePromise = await device.write(packet);

    await Promise.all(writePromise).then(
      console.log(' Save Packet Written ' + packet),
    );
    await wait(2000);
    const response = await BluetoothSerial.readFromDevice(id);
    await Promise.all(response).then(
      console.log('Save Response Recieved ' + response),
    );
    if (response.substring(0, 2) === '20') {
      console.log('RES OK');
      showMessage({
        message: 'Successful',
        description: 'Sign updated sucessfully',
        type: 'success',
      });
      saved = true;
      // this.props.navigation.navigate('Bluetooth');
    } else if (response === '' || response === null || response === []) {
      console.log('RES NOT OK');
      showMessage({
        message: 'Response ',
        description:
          'It looks the sign didnt send a response. If the sign did not update please try again.',
        type: 'warning',
      });
    } else {
      saved = false;
      showMessage({
        message: 'Error',
        description:
          'An error occured please try again and check bluetooth device is connected',
        type: 'danger',
      });
    }
  } catch (e) {
    console.log(e);
  }
  return saved;
};
export const setConfig = async (command, data, id) => {
  let buffer, finalBuffer, newBuffer;

  let set = false;
  try {
    if (Buffer.isBuffer(data)) {
      buffer = Buffer.from([0x02, command, data.length]);
      newBuffer = Buffer.concat([buffer, data]);
      finalBuffer = Buffer.concat([
        newBuffer,
        Buffer.from(splitCRC(crc.crc16xmodem(newBuffer))),
      ]);
    } else {
      buffer = Buffer.from([0x02, command, data.length, data]);
      finalBuffer = Buffer.concat([
        buffer,
        Buffer.from(splitCRC(crc.crc16xmodem(buffer))),
      ]);
    }
    const device = await BluetoothSerial.device(id);
    let writePromise = await device.write(finalBuffer);

    await Promise.all(writePromise).then(
      console.log(' Save Packet Written ' + finalBuffer),
    );
    await wait(2000);
    const response = await BluetoothSerial.readFromDevice(id);
    await Promise.all(response).then(
      console.log('Save Response Recieved ' + response),
    );
    if (response.substring(0, 2) === '20') {
      console.log('RES OK');
      showMessage({
        message: 'Successful',
        description: 'Sign updated sucessfully',
        type: 'success',
      });
      set = true;
      // this.props.navigation.navigate('Bluetooth');
    } else if (response === '' || response === null || response === []) {
      console.log('RES NOT OK');
      showMessage({
        message: 'Response ',
        description:
          'It looks the sign didnt send a response. If the sign did not update please try again.',
        type: 'warning',
      });
    } else {
      set = false;
      showMessage({
        message: 'Error',
        description:
          'An error occured please try again and check bluetooth device is connected',
        type: 'danger',
      });
    }
  } catch (e) {
    console.log(e);
  }
  return set;
};
export const changeBase = (number, fromBase, toBase) => {
  if (fromBase == 10) return parseInt(number).toString(toBase);
  else if (toBase == 10) return parseInt(number, fromBase);
  else {
    var numberInDecimal = parseInt(number, fromBase);
    return parseInt(numberInDecimal).toString(toBase);
  }
};
export const splitCRC = (crc) => {
  const c = changeBase(crc, 10, 16);
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
};
export const asciiToHex = (asciiNumber) => {
  switch (asciiNumber) {
    case 1:
      return 0x31;
    case 2:
      return 0x32;
    case 3:
      return 0x33;
    case 4:
      return 0x34;
    case 5:
      return 0x35;
    case 6:
      return 0x36;
    case 7:
      return 0x37;
    case 8:
      return 0x38;
    case 9:
      return 0x39;
    default:
      return 0x30;
  }
};
