import {StyleSheet, Platform} from 'react-native';

export const CELL_SIZE = 55;
export const CELL_BORDER_RADIUS = 8;
export const DEFAULT_CELL_BG_COLOR = '#fff';
export const NOT_EMPTY_CELL_BG_COLOR = '#38a4c0';
export const ACTIVE_CELL_BG_COLOR = '#f7fafe';

const styles = StyleSheet.create({
  codeFiledRoot: {
    height: CELL_SIZE,
    marginTop: 0,
    // paddingHorizontal: 20,
    // marginLeft: 10,
    // marginRight: 10,
    // justifyContent: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  cell: {
    // marginHorizontal: 8,
    justifyContent: 'space-around',
    margin: 5,
    height: CELL_SIZE,
    width: CELL_SIZE,
    lineHeight: CELL_SIZE - 5,
    fontSize: 30,
    textAlign: 'center',
    borderRadius: CELL_BORDER_RADIUS,
    borderWidth: 1,
    borderColor: '#38a4c0',
    color: '#38a4c0',
    backgroundColor: '#f7fafe',

    // IOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    // Android
    elevation: 3,
  },

  // =======================

  root: {
    minHeight: 800,
    // paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
    // justifyContent: 'center',
    // alignContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    paddingTop: 20,
    color: '#38a4c0',
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
    paddingBottom: 40,
  },
  errMessage: {
    paddingTop: 20,
    color: 'red',
    fontWeight: '700',
    textAlign: 'center',
    paddingBottom: 40,
  },
  icon: {
    width: 217 / 2.4,
    height: 158 / 2.4,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  subTitle: {
    paddingBottom: 40,
    color: '#000',
    textAlign: 'center',
  },
  nextButton: {
    marginTop: 30,
    borderRadius: 60,
    height: 60,
    backgroundColor: '#38a4c0',
    justifyContent: 'center',
    minWidth: 300,
    marginBottom: 100,
  },
  nextButtonText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
  logo: {
    marginTop: 20,
    width: 200,
    height: 100,
    alignContent: 'center',
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
});

export default styles;
