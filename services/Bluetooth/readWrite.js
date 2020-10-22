import {Buffer} from 'buffer';
import BluetoothSerial from 'react-native-bluetooth-serial-next';
global.Buffer = Buffer;
const iconv = require('iconv-lite');
import crc from 'crc';

export const saveState = async (id) => {
  const device = await BluetoothSerial.device(id);
  buffer = Buffer.from([0x02, 14, 0]);
  packet = Buffer.concat([
    buffer,
    Buffer.from(splitCRC(crc.crc16xmodem(buffer))),
  ]);

  let writePromise = await device.write(packet);

  await Promise.all(writePromise).then(
    console.log('Packets Written ' + message),
  );
  // await wait(1000);
  const response = await BluetoothSerial.readFromDevice(id);
  await Promise.all(response).then(
    console.log('Response Recieved ' + response),
  );
};
async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
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
  } catch (e) {
    console.log(e.message);
  }
  return response;
  // readresponse();
};
export const write = async (id, message) => {
  try {
    await BluetoothSerial.device(id).write(message);
    Toast.showShortBottom('Successfuly wrote to device');
  } catch (e) {
    Toast.showShortBottom(e.message);
  }
};

const readresponse = async (id) => {
  // const okRes = Buffer.from(['\x00']);
  try {
    const response = await BluetoothSerial.readFromDevice(id);
    await Promise.all(response).then(
      console.log('response Recieved ' + response),
    );
  } catch (e) {
    console.log(e.message);
  }
};

export const getConfiguration = async (id) => {
  let timeout = 5000;
  let config = {};

  try {
    let newBuffer;
    let buffer = Buffer.from([0x02, 15, 0]);
    newBuffer = Buffer.concat([
      buffer,
      Buffer.from(splitCRC(crc.crc16xmodem(buffer))),
    ]);
    // let config = writePackets(id, newBuffer);
    console.log('configuration ');
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

    console.log(response.length);
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
  const hextoascci = (hex) => {
    var output = new Buffer(hex, 'hex');
    let result = output.toString();
    return result;
  };
  return config;
};

export const getLightingStatus = async (id) => {
  let timeout = 5000;
  let lightStatus = {
    display: 1,
    extLight: 0,
    // brightness: 45,
  };

  try {
    let newBuffer;
    let buffer = Buffer.from([0x02, 22, 0]);
    newBuffer = Buffer.concat([
      buffer,
      Buffer.from(splitCRC(crc.crc16xmodem(buffer))),
    ]);
    // let config = writePackets(id, newBuffer);
    console.log('configuration ');
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

    console.log(response.length);
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
  console.log(lightStatus);
  return lightStatus;
};
export const getPrices = async (id, lines, digits) => {
  let priceArray = [];
  // let timeout = 5000;
  try {
    let newBuffer;
    let buffer = Buffer.from([0x02, 16, 0]);
    newBuffer = Buffer.concat([
      buffer,
      Buffer.from(splitCRC(crc.crc16xmodem(buffer))),
    ]);

    const device = await BluetoothSerial.device(id);

    let writePromise = await device.write(newBuffer);

    await Promise.all(writePromise).then(console.log('Packets Written'));
    await wait(3000);
    const response = await BluetoothSerial.readFromDevice(id);
    await Promise.all(response).then(
      console.log('Response Recieved ' + response),
    );

    var res = response.substring(0, 2);
    if (response.length > 5 && response.substring(0, 3) === '208') {
      let prices = response.substring(3, digits * 2 * lines + 3);
      console.log(prices);
      var output = new Buffer(prices, 'hex');
      for (let i = 0; i <= output.length; i = i + digits) {
        //times 2 is to account for the two digits of hex values
        console.log(i);
        priceArray.push(output.toString().substring(i, i + digits));
      }
    }
  } catch (e) {
    console.log(e.message);
  }
  return priceArray;
};

export const getFirmware = async (id) => {
  let firmware;
  let firmwareStr;
  // let timeout = 5000;
  try {
    let newBuffer;
    let buffer = Buffer.from([0x02, 23, 0]);
    newBuffer = Buffer.concat([
      buffer,
      Buffer.from(splitCRC(crc.crc16xmodem(buffer))),
    ]);

    const device = await BluetoothSerial.device(id);

    let writePromise = await device.write(newBuffer);

    await Promise.all(writePromise).then(console.log('Packets Written'));
    await wait(3000);
    const response = await BluetoothSerial.readFromDevice(id);
    await Promise.all(response).then(
      console.log('Response Recieved ' + response),
    );

    var res = response.substring(0, 2);
    if (response.length > 5 && response.substring(0, 3) === '204') {
      firmware = response.substring(3, 11);
      var output = new Buffer(firmware, 'hex');
      firmwareStr = output.toString();
      console.log(firmwareStr);
    }
  } catch (e) {
    console.log(e.message);
  }
  return firmwareStr;
};

/**
 * verify pin command
 * this needs to be sent before changing any values
 * component did mount after connecting to blue tooth
 * @param timeout timeout in milliseconds and deviceId
 */
export const verifyPin = (timeout, deviceId) => {
  // Buffer that holds the command to send the pin "3683" to the pole, to allow config to be modified.
  // 0x02 - Start of text byte
  let pin = 3683;

  let pinDigits = Array.from(pin.toString()).map(Number);

  let dataLengthBuffer = Buffer.from([pinDigits.length]);

  let hexDigits = pinDigits.map((d) => asciiToHex(d));
  let pinBuffer = Buffer.from(hexDigits);

  let buffer = Buffer.from([0x02, 0x14, 0x04, 0x33, 0x36, 0x38, 0x33]);
  //console.log(crc.crc16xmodem(buffer));
  let finalBuffer = Buffer.concat([
    buffer,
    Buffer.from(splitCRC(crc.crc16xmodem(buffer))),
  ]);
  console.log('pin buffer' + finalBuffer);
  try {
    writePackets(deviceId, finalBuffer);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const commandHandler = (command, data, id) => {
  console.log(command, data, id);
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
  console.log(parseInt(hb, 16), parseInt(lb, 16));
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
export const hexToAscii = (hexNumber) => {
  switch (hexNumber) {
    case 0x31:
    case 31:
      return 1;
    case 0x32:
    case 32:
      return 2;
    case 0x33:
    case 33:
      return 3;
    case 0x34:
    case 34:
      return 4;
    case 0x35:
    case 35:
      return 5;
    case 0x36:
    case 36:
      return 6;
    case 0x37:
    case 37:
      return 7;
    case 0x38:
    case 38:
      return 8;
    case 0x39:
    case 39:
      return 9;
    default:
      return 0;
  }
};
// function unpack(str) {

//   var bytes = [];
//   for (var i = 0; i < str.length; i++) {
//     var char = str.charCodeAt(i);
//     bytes.push(char >>> 8);
//     bytes.push(char & 0xff);
//   }
//   return bytes;
//}
