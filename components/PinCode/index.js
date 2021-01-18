import {
  Animated,
  SafeAreaView,
  Text,
  View,
  Image,
  TouchableNativeFeedback,
  ActivityIndicator,
} from 'react-native';

import React, {useState, useEffect} from 'react';

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {showMessage, hideMessage} from 'react-native-flash-message';

import styles, {
  ACTIVE_CELL_BG_COLOR,
  CELL_BORDER_RADIUS,
  CELL_SIZE,
  DEFAULT_CELL_BG_COLOR,
  NOT_EMPTY_CELL_BG_COLOR,
} from './styles';
import {
  verifyPin,
  asciiToHex,
  setPin,
  pinCommandHandler,
} from '../../services/Bluetooth/readWrite';

import logo from '../../assets/splash_icon.png';

const {Value, Text: AnimatedText} = Animated;

// ------ PIN CODE FUNCTIONAL COMPONENT EXPORTED ------////
const PinCode = ({navigation, route}) => {
  // setting variables passed to the screen
  let CELL_COUNT = route.params.pinLength;
  let ADMIN_PIN = '16888';
  let deviceId = route.params.deviceId;
  let pinResult = route.params.pinResult;
  let TYPE = route.params.type;

  // ------ ANIMATION OF PASSCODE CELLS --------//
  const animationsColor = [...new Array(CELL_COUNT)].map(() => new Value(0));
  const animationsScale = [...new Array(CELL_COUNT)].map(() => new Value(1));
  const animateCell = ({hasValue, index, isFocused}) => {
    Animated.parallel([
      Animated.timing(animationsColor[index], {
        useNativeDriver: false,
        toValue: isFocused ? 1 : 0,
        duration: 250,
      }),
      Animated.spring(animationsScale[index], {
        useNativeDriver: false,
        toValue: hasValue ? 0 : 1,
        duration: hasValue ? 300 : 250,
      }),
    ]).start();
    return ADMIN_PIN, CELL_COUNT;
  };

  // react hooks, variables
  const [value, setValue] = useState('');
  const [checkPin, setCheckPin] = useState('');
  const [pinSet, setPinSet] = useState('');
  const [pinRes, setPinRes] = useState('');
  const [processing, setProcessing] = useState(false);

  // animation on pin cells
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  // Initial request sent to the sign to check if pin is set or not. Results are then stored in varialbles
  useEffect(() => {
    (async function pinCheck() {
      // command and request handler, returns result
      // let result = await pinCommandHandler(deviceId, null, true);
      console.log('PASSED PIN RESULT    ' + pinResult.pinSet + pinResult.res);
      // setPinResult(pinResult);
      setPinSet(pinResult.pinSet);
      setPinRes(pinResult.res);
      console.log(pinResult + ' ' + pinSet);
    })();
    console.log(pinResult);
  }, []);

  const pinVerification = () => {
    if (TYPE === 'Admin') {
      if (value === ADMIN_PIN) {
        navigation.navigate('HomeStack', {
          screen: 'Admin',
          params: {
            deviceId: route.params.deviceId,
          },
        });
      } else {
        showMessage({
          message: 'Incorrect Pin',
          description: 'You have entered the wrong pin. Please try again',
          type: 'error',
          duration: 3000,
        });
      }
    } else if (TYPE === 'Pin') {
      let pinDigit;
      let pinArray = [];

      (async function pinCheck() {
        for (let i = 0; i < value.length; i++) {
          // seperating value into array of digits

          pinDigit = value.charCodeAt(i);
          pinArray.push(pinDigit);
          console.log(pinArray);
        }
        let pinBuffer = Buffer.from(pinArray);

        console.log(
          'PIN BUFFER ' + pinBuffer + 'PIN SET ' + pinSet + 'HEX DIGITS ',
        );
        setProcessing(true);
        let response = await pinCommandHandler(deviceId, pinBuffer, pinSet);
        console.log(response);
        //await setCheckPin(response.res);
        console.log('PIN RES ' + response.res + 'PIN CHECK' + checkPin);
        if (response.res === 'OK') {
          // if (response.res === 'OK') {
          setProcessing(false);

          navigation.navigate('HomeStack', {
            screen: 'SignController',
            params: {
              deviceId: route.params.deviceId,
            },
          });
        } else {
          setProcessing(false);

          showMessage({
            message: 'Incorrect Pin',
            description: 'You have entered the wrong pin. Please try again',
            type: 'error',
            duration: 3000,
          });
          navigation.navigate('PinCode');
        }
      })();
    }
  };

  const renderCell = ({index, symbol, isFocused}) => {
    console.log(value);
    const hasValue = Boolean(symbol);
    const animatedCellStyle = {
      backgroundColor: hasValue
        ? animationsScale[index].interpolate({
            inputRange: [0, 1],
            outputRange: [NOT_EMPTY_CELL_BG_COLOR, ACTIVE_CELL_BG_COLOR],
          })
        : animationsColor[index].interpolate({
            inputRange: [0, 1],
            outputRange: [DEFAULT_CELL_BG_COLOR, ACTIVE_CELL_BG_COLOR],
          }),
      borderRadius: animationsScale[index].interpolate({
        inputRange: [0, 1],
        outputRange: [CELL_SIZE, CELL_BORDER_RADIUS],
      }),
      transform: [
        {
          scale: animationsScale[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 1],
          }),
        },
      ],
    };

    // Run animation on next event loop tik
    // Because we need first return new style prop and then animate this value
    setTimeout(() => {
      animateCell({hasValue, index, isFocused});
    }, 0);

    return (
      <AnimatedText
        key={index}
        style={[styles.cell, animatedCellStyle]}
        onLayout={getCellOnLayoutHandler(index)}>
        {symbol || (isFocused ? <Cursor /> : null)}
      </AnimatedText>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <Image style={styles.logo} source={logo} />
      {processing ? (
        <View style={styles.loading}>
          <Text style={styles.loadingHeading}>Verify Pin</Text>
          <Text style={styles.loadingDes}>
            Please wait while we verify your pin with the sign
          </Text>
          <ActivityIndicator
            style={{marginTop: 15}}
            size={Platform.OS === 'ios' ? 1 : 60}
            animating={processing}
            color="#64aabd"
          />
        </View>
      ) : (
        <>
          {TYPE === 'Pin' ? (
            pinSet ? (
              <Text style={styles.title}> {TYPE} Verification</Text>
            ) : (
              <Text style={styles.title}> Set {TYPE}</Text>
            )
          ) : (
            <Text style={styles.title}>{TYPE} Verification</Text>
          )}

          <Text style={styles.subTitle}>
            Please enter your {CELL_COUNT} digit pin below{' '}
          </Text>

          <CodeField
            ref={ref}
            {...props}
            value={value}
            onChangeText={setValue}
            cellCount={CELL_COUNT}
            rootStyle={styles.codeFiledRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={renderCell}
          />

          <TouchableNativeFeedback
            onPress={() => {
              pinVerification();
            }}>
            <View style={styles.nextButton}>
              {TYPE === 'Pin' ? (
                pinSet ? (
                  <Text style={styles.nextButtonText}> Verify </Text>
                ) : (
                  <Text style={styles.nextButtonText}> Set {TYPE} </Text>
                )
              ) : (
                <Text style={styles.nextButtonText}>Verify</Text>
              )}
            </View>
          </TouchableNativeFeedback>
          {TYPE === 'Pin' ? (
            checkPin === 'NOT OK ERR' ? (
              <Text style={styles.errMessage}>
                Please ensure you are connected to the Linnos sign bluetooth
                device
              </Text>
            ) : (
              <Text style={styles.nextButtonText}> Set {TYPE} </Text>
            )
          ) : (
            <Text style={styles.nextButtonText}></Text>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

export default PinCode;
