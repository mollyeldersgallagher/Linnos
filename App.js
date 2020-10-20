import {Text, View, StyleSheet, Image} from 'react-native';
//import PinCode from './components/PinCode';
import HomeScreen from './screens/Home';
import Settings from './screens/Settings';
import BluetoothScreen from './services/Bluetooth';
import SignController from './components/SignController';
import Admin from './components/AdminController';


import React, {useEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {
  commandHandler,
  verifyPin,
  priceCommandHandler,
  asciiToHex,
  saveState,
  writePackets,
  getConfiguration,
  getPrices,
  splitCRC,
  unpack
} from './services/Bluetooth/readWrite';
import crc from 'crc';
import logo from './assets/splash_icon.png';

import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';


function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
     
      <DrawerItem
        label="Close drawer"
        icon={() =>  <Image style={styles.logo} source={logo} />}
        onPress={() => props.navigation.dispatch(DrawerActions.closeDrawer())}
      />
       <DrawerItemList {...props} />
      <DrawerItem
        label="Toggle drawer"
        onPress={() => props.navigation.dispatch(DrawerActions.toggleDrawer())}
      />
    </DrawerContentScrollView>
  );
}

const Drawer = createDrawerNavigator();

function MyDrawer() {
  return (
    <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Settings" component={Settings} />
      <Drawer.Screen name="Bluetooth" component={BluetoothScreen} />
      <Drawer.Screen name="SignController" component={SignController} />
      <Drawer.Screen name="Admin" component={Admin} />
    </Drawer.Navigator>
  );
}

export default function App() {
  useEffect(() => {

  });
  return (
    <>
      {Platform.OS === 'ios' && <StatusBar barStyle="light-content" />}
      <NavigationContainer>
      <MyDrawer />
    </NavigationContainer>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,
    height: 100,
    alignContent: 'center',
  }
});
