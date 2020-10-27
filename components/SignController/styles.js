import {StyleSheet, Platform} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,

    padding: 10,
    paddingTop: 35,
    backgroundColor: '#ffffff',
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
  switch: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#64aabd',
    backgroundColor: '#fff',
  },
  enableInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default styles;
