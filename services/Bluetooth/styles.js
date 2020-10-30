import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    backgroundColor: '#fff',
  },
  topBar: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#38a4c0',
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 18,
    alignSelf: 'center',
    fontFamily: 'Roboto-Regular',
    marginBottom: 5,
    marginTop: 5,
    color: '#0C0D34',
  },
  enableInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listContainer: {
    borderColor: '#ccc',
    borderTopWidth: 0.5,
  },
  listItem: {
    flex: 1,
    height: 'auto',
    paddingHorizontal: 16,
    borderColor: '#ccc',
    borderBottomWidth: 0.5,
    justifyContent: 'center',
    paddingTop: 15,
    paddingBottom: 15,
  },
  listItemStatus: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 2,
    paddingBottom: 2,
    fontWeight: 'bold',
    fontSize: 12,
    color: '#fff',
  },
  footer: {
    height: 60,
  },
  buttonText: {
    // margin: 5,
    fontFamily: 'Roboto-Medium',
    color: '#fff',
    fontSize: 18,
  },
  footerButton: {
    height: 60,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#38a4c0',
  },
  loading: {
    flex: 1,
    // marginTop: 50,
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
    paddingLeft: 30,
    paddingRight: 30,
    backgroundColor: '#fff',
    fontFamily: 'Roboto-Regular',
  },
});

export default styles;
