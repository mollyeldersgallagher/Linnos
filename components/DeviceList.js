import React from 'react';
import {
  ScrollView,
  Text,
  TouchableHighlight,
  View,
  RefreshControl,
  Button,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../styles';

class DeviceList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  onDevicePressed = (device) => () => {
    if (typeof this.props.onDevicePressed === 'function') {
      this.props.onDevicePressed(device);
    }
  };

  onRefresh = async () => {
    if (typeof this.props.onRefresh === 'function') {
      this.setState({refreshing: true});
      await this.props.onRefresh();
      this.setState({refreshing: false});
    }
  };

  render() {
    const {devices} = this.props;
    const {refreshing} = this.state;

    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={this.onRefresh} />
        }>
        <View style={styles.listContainer}>
          <Text
            style={{
              fontFamily: 'Roboto-Regular',
              fontSize: 16,
              marginLeft: 10,
              marginTop: 10,
              marginBottom: 10,
              paddingBottom: 10,
              borderColor: '#ccc',
              borderBottomWidth: 0.5,
            }}>
            Available Bluetooth Devices
          </Text>

          {devices.map((device) => (
            <TouchableHighlight
              underlayColor="#cee8f0"
              key={device.id}
              style={styles.listItem}
              onPress={this.onDevicePressed(device)}>
              <View
                style={{
                  flexDirection: 'column',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                  }}>
                  <Icon name="bluetooth-outline" size={28} color="#38a4c0" />
                  <Text
                    style={{
                      fontFamily: 'Roboto-Medium',
                      fontSize: 18,
                      marginLeft: 10,
                    }}>
                    {device.name}
                  </Text>

                  <Text
                    style={{
                      fontFamily: 'Roboto-Regular',
                      fontSize: 14,
                      marginTop: 4,
                      marginLeft: 10,
                    }}>{`<${device.id}>`}</Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                  }}>
                  <TouchableOpacity></TouchableOpacity>
                  <Text
                    style={[
                      styles.listItemStatus,
                      {
                        backgroundColor: device.paired ? '#35cd63' : 'gray',
                        marginLeft: 40,
                        marginTop: 10,
                      },
                    ]}>
                    {device.paired ? 'PAIRED' : 'UNPAIRED'}
                  </Text>
                  <Text
                    style={[
                      styles.listItemStatus,
                      {
                        backgroundColor: device.connected ? '#38a4c0' : 'gray',
                        marginLeft: 5,
                        marginTop: 10,
                      },
                    ]}>
                    {device.connected ? 'CONNECTED' : 'DISCONNECTED'}
                  </Text>
                  <Text
                    style={[
                      styles.listItemStatus,
                      {
                        backgroundColor:
                          device.name === 'Serial Adapter' ? '#38a4c0' : 'gray',
                        marginLeft: 5,
                        marginTop: 10,
                      },
                    ]}>
                    {device.name === 'Serial Adapter' ? 'LINNOS SIGN' : ''}
                  </Text>
                </View>
              </View>
            </TouchableHighlight>
          ))}
        </View>
      </ScrollView>
    );
  }
}

export default DeviceList;
