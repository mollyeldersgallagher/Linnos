import {Text, View, StyleSheet, TouchableOpacity, Image} from 'react-native';
//import PinCode from './components/PinCode';

import HomeScreen from './screens/Home';
import Contact from './screens/Contact';
import BluetoothScreen from './services/Bluetooth';
import ConnectedDevice from './services/ConnectedDevice';
import SignController from './components/SignController';
import Admin from './components/AdminController';

import React, {useEffect} from 'react';
import {NavigationContainer, DrawerActions} from '@react-navigation/native';
import logo from './assets/splash_icon.png';
import {createStackNavigator} from '@react-navigation/stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import SplashScreen from 'react-native-splash-screen';
import Icon from 'react-native-vector-icons/Ionicons';

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="Close drawer"
        icon={() => <Image style={styles.logo} source={logo} />}
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
function Header({navigation, title}) {
  return (
    <View style={styles.header}>
      {/* icon for the menu */}
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        style={styles.icons}>
        <Icon name="menu-outline" size={28} color="white" />
      </TouchableOpacity>
      <View style={styles.headerTitle}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
    </View>
  );
}

const Stack = createStackNavigator();
function HomeStack({navigation}) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          header: () => <Header title="Home" navigation={navigation} />,
        }}
      />
      <Stack.Screen
        name="Admin"
        component={Admin}
        options={{
          header: () => (
            <Header title="Admin Controller" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="SignController"
        component={SignController}
        options={{
          header: () => (
            <Header title="Sign Controller" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="ConnectedDevice"
        component={ConnectedDevice}
        options={{
          header: () => (
            <Header title="Connected Device" navigation={navigation} />
          ),
        }}
      />
    </Stack.Navigator>
  );
}
function BluetoothStack({navigation}) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Bluetooth"
        component={BluetoothScreen}
        options={{
          header: () => (
            <Header title="Bluetooth Devices" navigation={navigation} />
          ),
        }}
      />
    </Stack.Navigator>
  );
}
function ContactStack({navigation}) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Info"
        component={Contact}
        options={{
          header: () => <Header title="Contact" navigation={navigation} />,
        }}
      />
    </Stack.Navigator>
  );
}

const Drawer = createDrawerNavigator();

function MyDrawer({navigation}) {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="Home" component={HomeStack} />
      <Drawer.Screen name="Contact" component={ContactStack} />
      <Drawer.Screen name="Bluetooth" component={BluetoothStack} />
      <Drawer.Screen name="ConnectedDevice" component={ConnectedDevice} />
    </Drawer.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
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
  },
  header: {
    // marginTop: 26,
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#38a4c0',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
  },
  headerText: {
    // fontWeight: "bold",
    fontFamily: 'Roboto-Regular',

    fontSize: 18,
    color: '#333',
    letterSpacing: 1,
    color: '#fff',
  },
  icons: {
    position: 'absolute',
    left: 16,
    top: 15,
  },
});
