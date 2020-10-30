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
  loading: {
    marginTop: 50,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingHeading: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    fontFamily: 'Roboto-Medium',
    fontSize: 20,
    marginBottom: 10,
  },
  loadingDes: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    fontFamily: 'Roboto-Regular',
  },
  logo: {
    width: 200,
    height: 100,
    alignContent: 'center',
  },
  navHeader: {
    // marginTop: 26,
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-around',
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

export default styles;
