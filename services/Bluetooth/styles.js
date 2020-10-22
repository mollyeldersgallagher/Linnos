import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    backgroundColor: '#f5fcff',
  },
  topBar: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#64aabd',
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
    // borderTopWidth: 1,
    // borderTopColor: '#999',
    // justifyContent: 'center',
    // alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderTopColor: '#fff',
  },
  fixedFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderTopColor: '#fff',
  },
  footerButton: {
    // alignItems: 'center',
    backgroundColor: '#38a4c0',
    fontSize: 18,
    alignSelf: 'center',
    fontFamily: 'Roboto-Medium',
    padding: 10,
    color: '#fff',
  },
});

export default styles;
