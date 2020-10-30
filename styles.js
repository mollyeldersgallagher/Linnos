import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    backgroundColor: '#ffffff',
  },
  topBar: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 6,
    backgroundColor: '#22509d',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
    color: '#fff',
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
    fontFamily: 'Roboto-Medium',
    // fontWeight: 'bold',
    fontSize: 12,
    color: '#fff',
  },
  footer: {
    height: 52,
    borderTopWidth: 1,
    borderTopColor: '#999',
  },
});

export default styles;
