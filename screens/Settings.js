import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Switch,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';


export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceList: [],
      unpairedDevices: [],
      connectedDevice: undefined,
      scannedData: [],
      isAccepting: false,
      isDiscovering: false,
    };
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    // console.log('App.render()');
    // console.log(this.state);

    return (
      <View>
        <Text>Settings</Text>
      </View>
    );
  }
}

/**
 * The statusbar height goes wonky on Huawei with a notch - not sure if its the notch or the
 * Huawei but the fact that the notch is different than the status bar makes the statusbar
 * go below the notch (even when the notch is on).
 */
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const styles = StyleSheet.create({
  statusbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#222',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    height: APPBAR_HEIGHT,
  },
  toolbarText: {
    flex: 1,
    fontSize: 20,
    color: '#fff',
  },
  toolbarButton: {
    fontSize: 20,
    color: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#fff',
  },
  listContainer: {
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
  },
  startAcceptButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 9,
    marginBottom: 9,
  },
  deviceName: {
    fontSize: 16,
  },
  connectionStatus: {
    width: 8,
    backgroundColor: '#ccc',
    marginRight: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  horizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  textInput: {
    flex: 1,
    height: 40,
  },
});
