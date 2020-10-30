import {
  Animated,
  SafeAreaView,
  Text,
  View,
  Image,
  TouchableNativeFeedback,
} from 'react-native';
import React, {useState} from 'react';

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

import logo from '../../assets/splash_icon.png';

const {Value, Text: AnimatedText} = Animated;

// ------ PIN CODE FUNCTIONAL COMPONENT EXPORTED ------////
const PinCode = ({navigation, route}) => {
  let CELL_COUNT = route.params.pinLength;
  let PIN = route.params.pinValue.toString();
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
    return PIN, CELL_COUNT;
  };

  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const pinVerification = () => {
    console.log(typeof PIN + typeof value);
    if (PIN === value) {
      if (TYPE === 'Admin') {
        navigation.navigate('HomeStack', {
          screen: 'Admin',
          params: {
            deviceId: route.params.deviceId,
          },
        });
        TYPE = 'Initial';
        PIN = '3683';
        CELL_COUNT = 4;
      } else if (TYPE === 'Initial') {
        navigation.navigate('Home');
        TYPE = 'Admin';
        PIN = '16888';
        CELL_COUNT = 5;
      }
    } else {
      showMessage({
        message: 'Incorrect Pin',
        description: 'You have entered the wrong pin. Please try again',
        type: 'error',
      });
      navigation.navigate('PinCode');
    }
  };

  const renderCell = ({index, symbol, isFocused}) => {
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
      <Text style={styles.title}>{TYPE} Verification</Text>

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
          setValue('');
        }}>
        <View style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Verify</Text>
        </View>
      </TouchableNativeFeedback>
    </SafeAreaView>
  );
};

export default PinCode;
