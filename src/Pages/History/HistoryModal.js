import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import {Calendar} from 'react-native-calendars';
import {BLACK, WHITE} from '../../constants/color';
import {BASE_URL} from '../../constants/url';
import {POSTNETWORK} from '../../utils/Network';
import moment from 'moment';
import MapView, {Marker, Polyline} from 'react-native-maps';
import {HEIGHT, WIDTH} from '../../constants/config';
import {Icon} from '@rneui/themed';

const HistoryModal = ({visible, onClose, onDateSelect, log}) => {
  console.log('props:', visible, '-----------', onClose, onDateSelect, log);
  const [selectedDateType, setSelectedDateType] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedValue, setSelectedValue] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Flag to control modal content display
  const [showModalContent, setShowModalContent] = useState(true);

  const handleDateSelect = day => {
    const date = day.dateString;

    if (selectedDateType === 'start') {
      setFromDate(date);
      onDateSelect('start', date);
    } else if (selectedDateType === 'end') {
      setToDate(date);
      onDateSelect('end', date);
    }
    setSelectedDateType(null); // Close calendar
  };

  const openCalendar = type => {
    setSelectedDateType(type);
  };

  const fetchVehicleData = async id => {
    if (!fromDate || !toDate) {
      setSelectedValue({error: 'Please select both from and to dates.'});
      return;
    }

    const currentDate = moment().startOf('day'); // Get current date without time
    const selectedFromDate = moment(fromDate);
    const selectedToDate = moment(toDate);

    // Check if 'toDate' is greater than the current date
    if (selectedToDate.isAfter(currentDate)) {
      alert('The "To Date" cannot be more than the Today date.');
      return;
    }

    // Check if 'toDate' is less than 'fromDate'
    if (selectedToDate.isBefore(selectedFromDate)) {
      alert('The "To Date" cannot be earlier than the "From Date".');
      return;
    }

    setIsLoading(true); // Start loading
    const url = `${BASE_URL}things/datalog/`;
    const payload = {
      from_date: fromDate,
      project: '117',
      thing_id: id,
      to_date: toDate,
    };

    try {
      const response = await POSTNETWORK(url, payload, true);
      if (response?.data?.length > 0) {
        const latestData = response.data[response.data.length - 1];
        const {
          location,
          speed,
          status,
          today_distance,
          total_distance,
          acceleration,
          generated_datetime: timestamp,
        } = latestData.derived_data;

        const vehicleDetails = {
          location: {latitude: location[0], longitude: location[1]}, // Ensure location is parsed correctly
          speed,
          status,
          current_distance: today_distance,
          total_distance,
          acceleration,
          timestamp,
          locations: response.data
            .map(item => ({
              latitude: item.derived_data?.location?.[0],
              longitude: item.derived_data?.location?.[1],
            }))
            .filter(
              coord =>
                coord.latitude !== undefined && coord.longitude !== undefined,
            ),
        };

        setSelectedValue(vehicleDetails); // Set selected value with vehicle details

        // If polyline data exists, hide modal content
        if (vehicleDetails.locations && vehicleDetails.locations.length > 1) {
          setShowModalContent(false);
        }
      } else {
        setSelectedValue({error: 'No data found for the selected range.'});
      }
    } catch (error) {
      setSelectedValue({error: 'Error fetching data. Please try again later.'});
    } finally {
      setIsLoading(false); // End loading
    }
  };

  console.log('selectedVal', selectedValue);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* Map View as Background */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            // bottom: HEIGHT * 0.1, // Position the button a little above the bottom
            left: WIDTH * 0.85, // Center horizontally
            height: HEIGHT * 0.05,
            width: WIDTH * 0.11,
            marginTop: 25,
            backgroundColor: '#1E90FF',
            borderRadius: WIDTH * 0.1,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 5,
            zIndex: 2, // Ensure the button is on top of the map
          }}
          onPress={() => {
            setShowModalContent(!showModalContent);
          }}>
          <Icon
            name="calendar-view-week"
            type="MaterialCommunityIcons"
            color={WHITE}
            size={24}
          />

          {/* You can place an icon or text inside the red dot here */}
        </TouchableOpacity>
        <MapView
          style={styles.map}
          mapType="hybrid"
          initialRegion={{
            latitude: 20.3480968, // Default center lat
            longitude: 85.8439865, // Default center long
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          {/* want a cirlcle view of the map */}

          {/* Place a marker if vehicle location is available */}
          {selectedValue.location && selectedValue.location.latitude && (
            <Marker
              coordinate={selectedValue.location}
              title="Vehicle Location"
            />
          )}

          {/* Add Polyline if locations are available */}
          {selectedValue.locations && selectedValue.locations.length > 1 && (
            <Polyline
              coordinates={selectedValue.locations}
              strokeColor="blue"
              strokeWidth={5}
            />
          )}
        </MapView>

        {/* Conditionally render Modal Content */}
        {showModalContent && (
          <View style={styles.modalContent}>
            <Text style={styles.title}>Select Date Range</Text>

            <View style={styles.dateSelectionContainer}>
              <Pressable
                style={styles.dateButton}
                onPress={() => openCalendar('start')}>
                <Text style={styles.dateButtonText}>
                  {fromDate ? `From: ${fromDate}` : 'Select From Date'}
                </Text>
              </Pressable>
              <Pressable
                style={styles.dateButton}
                onPress={() => openCalendar('end')}>
                <Text style={styles.dateButtonText}>
                  {toDate ? `To: ${toDate}` : 'Select To Date'}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.getButton}
              onPress={() => fetchVehicleData(log)}>
              <Text
                style={{...styles.dateButtonText, color: WHITE, fontSize: 16}}>
                Get History
              </Text>
            </Pressable>

            {selectedDateType && (
              <Calendar style={styles.calendar} onDayPress={handleDateSelect} />
            )}

            <View style={styles.divider} />

            {isLoading ? (
              <ActivityIndicator size="large" color="blue" />
            ) : (
              <ScrollView contentContainerStyle={{padding: 10}}>
                <Text style={styles.infoTitle}>Vehicle Information</Text>
                <View style={styles.infoContainer}>
                  {selectedValue.error ? (
                    <Text style={styles.noDataText}>{selectedValue.error}</Text>
                  ) : Object.keys(selectedValue).length > 0 ? (
                    Object.entries(selectedValue).map(([key, value]) => {
                      // Skip 'location' key
                      if (key === 'locations' || key === 'location')
                        return null;

                      if (key === 'acceleration') {
                        value = value < 0 ? 0 : value; // Set negative acceleration to 0
                        value = `${value.toFixed(4)} m/s²`; // Add unit for acceleration
                      }

                      // Convert Distance: Meters → Kilometers
                      if (
                        key === 'current_distance' ||
                        key === 'total_distance'
                      ) {
                        value = (value / 1000).toFixed(2) + ' km';
                      }

                      // Convert Speed: m/s → km/h
                      if (key === 'speed') {
                        value = (value * 3.6).toFixed(2) + ' km/h';
                      }

                      // Handle Timestamp
                      if (key === 'timestamp') {
                        value = value
                          ? moment(value).format('DD/MM/YYYY h:mm a')
                          : 'Not Available';
                      }

                      return (
                        <View style={styles.labelContainer} key={key}>
                          <Text
                            style={[
                              styles.label,
                              {flexWrap: 'wrap', width: '45%'},
                            ]}>
                            {key.replace(/_/g, ' ').toUpperCase()}:
                          </Text>
                          <Text
                            style={[
                              styles.value,
                              {flexWrap: 'wrap', width: '55%'},
                            ]}>
                            {String(value)}
                          </Text>
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.noDataText}>
                      No data found for the selected range.
                    </Text>
                  )}
                </View>
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={() => {
                onClose();
                setFromDate(null);
                setToDate(null);
                setSelectedValue({});
                setIsLoading(false);
                setShowModalContent(true); // Reset content visibility when closed
              }}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject, // This will make the map take up the entire screen
  },
  modalOverlay: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',

    backgroundColor: WHITE,
  },
  modalContent: {
    backgroundColor: WHITE,
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: '30%',
  },
  title: {
    color: BLACK,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  dateSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateButton: {
    backgroundColor: '#d3d3d3',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    margin: 5,
  },
  dateButtonText: {
    textAlign: 'center',
    color: BLACK,
  },
  getButton: {
    backgroundColor: '#1E90FF',
    marginBottom: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: HEIGHT * 0.05,
    width: '90%',
    alignSelf: 'center',
    elevation: 3,
    borderRadius: 5,
  },
  calendar: {
    marginBottom: 20,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#d3d3d3',
    marginVertical: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: BLACK,
  },
  infoContainer: {
    // width: WIDTH * 0.8,
    padding: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    color: '#000',
  },
  noDataText: {
    textAlign: 'center',
    color: '#888',
  },
  closeButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    textAlign: 'center',
    color: WHITE,
    fontWeight: 'bold',
  },
});

export default HistoryModal;
