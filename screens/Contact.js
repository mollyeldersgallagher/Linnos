import React, {useState, useContext, useEffect} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  Linking,
  Button,
  TouchableOpacity,
} from 'react-native';

import logo from '../assets/splash_icon.png';

function Contact({navigation}) {
  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 2,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <TouchableOpacity onPress={() => Linking.openURL('http://linnos.com')}>
          <Image style={styles.logo} source={logo} />
        </TouchableOpacity>
      </View>

      <View style={{flex: 5, flexDirection: 'column', margin: 10}}>
        <Text style={styles.title}> Contact </Text>
        <View style={{flexDirection: 'row', margin: 10}}>
          <Text style={styles.lable}> Website: </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('http://linnos.com')}>
            <Text style={styles.link}>www.linnos.com</Text>
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', margin: 10}}>
          <Text style={styles.lable}> Facebook: </Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL('https://www.facebook.com/sign.illumination/')
            }>
            <Text style={styles.link}>Linnos</Text>
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', margin: 10}}>
          <Text style={styles.lable}>Phone (IRL):</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${'+ 353 1 457 3683'}`)}>
            <Text style={styles.number}> + 353 1 457 3683</Text>
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', margin: 10}}>
          <Text style={styles.lable}>Phone (UK):</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${'+ 44 1 179 114703'}`)}>
            <Text style={styles.number}> + 44 1 179 114703</Text>
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', margin: 10}}>
          <Text style={styles.lable}>Email: </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:info@linnos.com')}>
            <Text style={styles.link}>info@linnos.com</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
export default Contact;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 200,
    height: 100,
    alignContent: 'center',
  },
  title: {
    fontFamily: 'Roboto-Regular',
    fontSize: 23,
    marginBottom: 5,
    marginTop: 5,
    color: '#0C0D34',
  },
  link: {
    fontFamily: 'NotoSansJP-Regular',
    textDecorationLine: 'underline',
    color: '#38a4c0',
  },
  number: {
    fontFamily: 'NotoSansJP-Regular',
    color: '#38a4c0',
  },
  lable: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 15,
    marginLeft: 5,
    marginRight: 5,
    color: '#0C0D34',
  },
  buttonText: {
    margin: 5,
    color: '#fff',
    fontSize: 15,
  },
});
