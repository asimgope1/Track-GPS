import {StyleSheet} from 'react-native';
import {HEIGHT, WIDTH} from '../../constants/config';
import {RFValue} from 'react-native-responsive-fontsize';

export const styles = StyleSheet.create({
  safeareacontainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    marginLeft: '5%',
  },
  summaryCard: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    marginBottom: 15,
    marginTop: 20,
    width: WIDTH * 0.9,
  },
  pieRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pieContainer: {
    width: '50%',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  legendContainer: {
    width: '45%',
    bottom: 50,
    backgroundColor: '#FFE',
    // width: '100%',
    right: 10,
    padding: 10,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  cardContainer: {
    height: HEIGHT * 0.35,
    borderRadius: 12,
    overflow: 'scroll',
    marginBottom: 20,
    backgroundColor: '#fff',
    elevation: 3,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
  },
  imageStyle: {
    resizeMode: 'center',
    opacity: 0.3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  dateButtons: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  dateButton: {
    width: '100%',
    backgroundColor: '#e9ecef',
    padding: 6,
    borderRadius: 6,
    marginBottom: 4,
  },
  dateButtonText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  calendarContainer: {
    marginTop: 10,
  },
  calendar: {
    // bottom: -200,
    // position: 'absolute',
    marginTop: -100,
    // borderRadius: 10,
    // padding: 5,
  },
  watermarkIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    opacity: 0.2,
  },
  overSpeedDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: HEIGHT * 0.2,
    paddingTop: 50,
    // marginTop: 20,
    backgroundColor: 'rgba(220,53,69,0.05)', // subtle light red
    borderRadius: 10,
    width: '100%',
  },

  detailBox: {
    // flex: 1,
    // height: HEIGHT * 0.15,
    // marginTop: 50,

    marginHorizontal: 5,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3, // shadow for Android
    shadowColor: '#000', // shadow for iOS
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    alignItems: 'center',
  },

  detailLabel: {
    fontSize: RFValue(12),
    color: '#6c757d', // muted gray
    marginBottom: 4,
    fontWeight: '500',
  },

  detailValue: {
    fontSize: RFValue(16),
    color: '#dc3545',
    fontWeight: '700',
  },
  idleDetails: {
    height: HEIGHT * 0.2,
    paddingTop: 50,
    // marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    backgroundColor: 'rgba(23,162,184,0.05)', // light info background
    borderRadius: 10,
    width: '100%',
  },

  idleBox: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    alignItems: 'center',
  },

  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  idleLabel: {
    fontSize: RFValue(13),
    color: '#6c757d',
    fontWeight: '500',
    marginLeft: 6,
  },

  idleValue: {
    fontSize: RFValue(16),
    color: '#17a2b8',
    fontWeight: '700',
  },
  fuelDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: HEIGHT * 0.2,
    paddingTop: 50,
    // marginTop: 20,
    backgroundColor: 'rgba(40,167,69,0.05)', // light green background
    borderRadius: 10,
    width: '100%',
  },

  fuelBox: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    alignItems: 'center',
  },

  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  fuelLabel: {
    fontSize: RFValue(13),
    color: '#6c757d',
    fontWeight: '500',
    marginLeft: 6,
  },

  fuelValue: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#28a745',
  },
  zoneDetails: {
    height: HEIGHT * 0.2,
    paddingTop: 50,
    // marginTop: 20,
    backgroundColor: 'rgba(0,123,255,0.05)', // light blue background
    borderRadius: 10,
    padding: 12,
    width: '100%',
    alignItems: 'flex-start',
  },

  zoneContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  zoneTextBox: {
    marginLeft: 10,
  },

  zoneLabel: {
    fontSize: RFValue(13),
    color: '#6c757d',
    fontWeight: '500',
  },

  zoneValue: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#007bff',
  },
  timelineDeviation: {
    height: HEIGHT * 0.2,
    width: '100%',
    backgroundColor: 'rgba(255, 193, 7, 0.1)', // light amber
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-around',
    marginBottom: 100,
  },

  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  timelineTextBox: {
    marginLeft: 12,
  },

  timelineLabel: {
    fontSize: RFValue(15),
    color: '#343a40',
    fontWeight: '600',
  },

  timelineValue: {
    fontSize: RFValue(14),
    color: '#fd7e14',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
    alignItems: 'center',
  },
  dateButtonText: {
    color: 'white',
    fontSize: 14,
  },
});
