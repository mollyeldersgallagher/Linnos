import React, {useState, useContext, useEffect} from 'react';
import Sign from '../services/Sign';
import {
  Text,
  View,
  Switch,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Button,
} from 'react-native';
// import Slider from '@react-native-community/slider';
// import {Col, Row, Grid} from 'react-native-easy-grid';
// import hex2ascii from 'hex2ascii';
// import hex from 'ascii-hex';
import logo from '../assets/splash_icon.png';

// import { Card, Button, withTheme } from "react-native-paper";

function Home({navigation}) {
  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 2,
          flexDirection: 'column',
          margin: 10,
          alignContent: 'center',
        }}>
        <Image style={styles.logo} source={logo} />
      </View>

      <View style={{flex: 2, flexDirection: 'column', margin: 10}}>
        <Text> INSERT INSTRUCTIONS AND INFO </Text>
        <Text> 1 </Text>
        <Text> 2 </Text>
        <Text> 3 </Text>
        <Text> 4 </Text>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.5}
          onPress={() => navigation.navigate('Bluetooth')}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
export default Home;
const styles = StyleSheet.create({
  container: {
    flex: 1,

    padding: 10,
    paddingTop: 35,
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 200,
    height: 100,
    alignContent: 'center',
  },
  HeadStyle: {
    height: 50,
    alignContent: 'center',
    backgroundColor: '#bdbfdd',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#38a4c0',
    color: '#fff',
    padding: 10,
    marginTop: 30,
  },
  buttonText: {
    margin: 5,
    color: '#fff',
    fontSize: 15,
  },
  header: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 15,
  },
  input: {
    height: 40,
    borderColor: '#dddddd',
    borderWidth: 1,
    padding: 10,
    // placeholderTextColor: "gray",
  },
});
