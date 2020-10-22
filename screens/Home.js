import React, {useState, useContext, useEffect} from 'react';
import {
  Text,
  View,
  Switch,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import led from '../assets/led.jpg';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;


function Home({navigation}) {
  return (
    <View style={styles.container}>
       
      <View
        style={{
         // flex: 2,
          flexDirection: 'column',
          justifyContent: 'center',
          // alignItems: 'center',
        }}>
       <Image style={styles.led} source={led} /> 
      </View>

      <View style={{flex: 2, flexDirection: 'column', margin: 10}}>
        <Text style={styles.subtitle}> Getting Started</Text>
        <Text style={styles.description}> Step 1: Select the Linnos signs serial adapter </Text>
        <Text style={styles.description}> Step 2: Connect to the serial adapter</Text>
        <Text style={styles.description}> Step 3: Change the sign using the controller </Text>
        
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

    // padding: 10,
    paddingTop: 0,
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 200,
    height: 100,
    alignContent: 'center',
  },
  led: {
    width: windowWidth,
    height:windowHeight*0.4 ,
   // alignContent: 'center',
    borderBottomRightRadius: 60,
  },
  HeadStyle: {
    height: 50,
    alignContent: 'center',
    backgroundColor: '#bdbfdd',
  },
  subtitle:{
    fontFamily: "Roboto-Regular",
    fontSize: 23,
    marginBottom:5,
    marginTop:5,
    color:"#0C0D34"
  },
  description:{
    fontFamily: "NotoSansJP-Regular",
    fontSize: 15,
    marginLeft:5,
    marginRight:5,
    color:"#0C0D34"
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
