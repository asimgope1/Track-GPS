import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import Header from '../../components/Header';
import {GETNETWORK, POSTNETWORK} from '../../utils/Network';
import {BASE_URL} from '../../constants/url';
import DropDownPicker from 'react-native-dropdown-picker';
import StarRating from 'react-native-star-rating-widget';
import { useFocusEffect } from '@react-navigation/native';
import { Loader } from '../../components/Loader';

const DriverRating = ({navigation}) => {
  // State for dropdowns
  const [tripNameOpen, setTripNameOpen] = useState(false);
  const [tripNameValue, setTripNameValue] = useState(null);
  const [tripNameItems, setTripNameItems] = useState([]);

  const [driverOpen, setDriverOpen] = useState(false);
  const [driverValue, setDriverValue] = useState(null);
  const [driverItems, setDriverItems] = useState([]);

  // State for checklist items
  const [checklistItems, setChecklistItems] = useState([]);
  const [ratings, setRatings] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});
  const zIndexCounter = useRef(1000);

  // State for rating modal
  const [modalVisible, setModalVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Rating options
  const ratingOptions = [

    // want total 10 stars

    {label: '1 Star', value: 1, color: '#ef4444'}, // red
    {label: '2 Stars', value: 2, color: '#f97316'}, // orange
    {label: '3 Stars', value: 3, color: '#eab308'}, // yellow
    {label: '4 Stars', value: 4, color: '#84cc16'}, // lime
    {label: '5 Stars', value: 5, color: '#22c55e'}, // green


  ];

  // Fetch data on focus
  useFocusEffect(
    React.useCallback(() => {
      GetTrip();
      GetDrivers();
      GetChecklist();
      resetForm()
      return () => {
        // Cleanup if needed
      };
    }, []),
  );

  const GetTrip = async () => {
    setLoading(true)
    const Url = `${BASE_URL}trips/trip_master/`;
    try {
      const response = await GETNETWORK(Url, true);
      const trips = response.data || [];
      const mappedItems = trips.map(item => ({
        label: item.trip_name,
        value: item.trip_id,
      }));
      setTripNameItems(mappedItems);
      setLoading(false)
    } catch (error) {
      console.error('Error fetching trips:', error);
      setLoading(false)
      Alert.alert('Error', 'Failed to fetch trip data. Please try again.');
    }
  };

  const GetDrivers = async () => {
    setLoading(true)
    const Url = `${BASE_URL}trips/driver_master/`;
    try {
      const response = await GETNETWORK(Url, true);
      const drivers = response.data || [];
      const mappedItems = drivers.map(item => ({
        label: item.driver_name,
        value: item.driver_master_id,
      }));
      setDriverItems(mappedItems);
      setLoading(false)
    } catch (error) {
      console.error('Error fetching drivers:', error);
      Alert.alert('Error', 'Failed to fetch driver data. Please try again.');
      setLoading(false);

    }
  };

  const GetChecklist = async () => {
      setLoading(true);

    const Url = `${BASE_URL}trips/driver_checklist_master/`;
    try {
      const response = await GETNETWORK(Url, true);
      console.log('Fetching checklist from:', response);
      console.log('Checklist response:', response);
      const checklist = response.data || [];
      console.log('chek;list',checklist)
      setChecklistItems(checklist);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching checklist:', error);
      Alert.alert('Error', 'Failed to fetch checklist data. Please try again.');
      setLoading(false);

    }
  };

  // const handleRateDriver = () => {
  //   if (!tripNameValue || !driverValue) {
  //     Alert.alert('Required', 'Please select both trip and driver');
  //     return;
  //   }
  //   setModalVisible(true);
  // };

  const handleRatingSelect = (checklistId, rating) => {
    setRatings(prev => ({
      ...prev,
      [checklistId]: rating,
    }));
  };

const submitRating = async () => {
  if (Object.keys(ratings).length === 0) {
    Alert.alert(
      'Required',
      'Please provide ratings for at least one checklist item',
    );
    return;
  }

  setLoading(true);
  try {
    // Prepare checklist values array
    const checklistValues = checklistItems.map(item => {
      const ratingValue = ratings[item.driver_checklist_master_id];

      return {
        checklist_master_id: item.driver_checklist_master_id,
        value:
          item.checklist_type === 'rate'
            ? ratingValue
              ? ratingValue * 2
              : null // For star ratings (convert to 10-point scale)
            : ratingValue, // For Yes/No (send as string)
      };
    });

    const ratingData = {
      driver_id: driverValue,
      trip_id: tripNameValue,
      checklist_values: checklistValues.filter(
        item => item.value !== null && item.value !== undefined,
      ),
      remarks: comment,
      // accident: accident, drop down selction checkbox to be added
    };

    console.log('Final payload to be sent:', ratingData);

    const Url = `${BASE_URL}trips/driver_rating/`;
    const response = await POSTNETWORK(Url, ratingData, true);

    if (response.status === 'success') {
      Alert.alert(
        'Success',
        `Rating submitted for ${
          driverItems.find(item => item.value === driverValue)?.label
        }`,
      );
      resetForm();
    } else {
      throw new Error(response.message || 'Failed to submit rating');
    }
  } catch (error) {
    Alert.alert('Error', error.message || 'Failed to submit rating');
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setRatings({});
    setOpenDropdowns({});
    setModalVisible(false);
    setTripNameValue(null);
    setDriverValue(null);
    setComment('');
  };
  const yesNoOptions = [
    {label: 'Yes', value: 'yes', color: '#22c55e'}, // green
    {label: 'No', value: 'no', color: '#ef4444'}, // red
  ];

  const renderChecklistItem = ({item}) => {
    console.log('items here rate', item);
    const selectedValue = ratings[item.driver_checklist_master_id];
    const isRateType = item.checklist_type === 'rate';

    // Determine which options to use based on checklist type
    const options = isRateType ? ratingOptions : yesNoOptions;
    const selectedOption = options.find(opt =>
      isRateType ? opt.value === selectedValue : opt.value === selectedValue,
    );

    const isOpen = openDropdowns[item.driver_checklist_master_id] || false;
    const zIndex = isOpen ? zIndexCounter.current : 1;

    return (
      <View style={[styles.tableRow, {zIndex}]}>
        <View style={styles.itemNameContainer}>
          <Text style={styles.itemName}>{item.checklist_name}</Text>
          {selectedValue && !isRateType && (
            <Text
              style={[
                styles.selectedStatusText,
                {color: selectedOption?.color},
              ]}>
              {selectedOption?.label}
            </Text>
          )}
        </View>

        {isRateType ? (
          <View style={styles.starRatingContainer}>
            <Text>
            <StarRating
              rating={selectedValue || 0}
              onChange={rating =>
                handleRatingSelect(item.driver_checklist_master_id, rating)
              }
              maxStars={5}
              starSize={30}
              color="#facc15"
              emptyColor="#e5e7eb"
            />
            </Text>
            {selectedValue && (
              <Text style={styles.starRatingText}>
                {selectedValue} {selectedValue === 1 ? 'Star' : 'Stars'}
              </Text>
            )}
          </View>
        ) : (
          <View
            style={[
              styles.statusDropdownContainer,
              {zIndex: isOpen ? zIndex + 1 : 1},
            ]}>
            <DropDownPicker
              open={isOpen}
              value={selectedValue}
              items={yesNoOptions}
              setOpen={callback => {
                const value =
                  typeof callback === 'function'
                    ? callback(openDropdowns[item.driver_checklist_master_id])
                    : callback;
                setOpenDropdowns(prev => ({
                  ...prev,
                  [item.driver_checklist_master_id]: value,
                }));
              }}
              setValue={callback => {
                const selectedValue =
                  typeof callback === 'function'
                    ? callback(selectedValue)
                    : callback;
                handleRatingSelect(
                  item.driver_checklist_master_id,
                  selectedValue,
                );
              }}
              setItems={() => {}}
              placeholder="Select Option"
              style={[
                styles.statusDropdown,
                selectedOption && {
                  backgroundColor: selectedOption.color + '20',
                },
              ]}
              textStyle={styles.statusDropdownText}
              placeholderStyle={styles.statusDropdownPlaceholder}
              labelStyle={selectedOption && {color: selectedOption.color}}
              listItemLabelStyle={item => ({
                color: item.color,
                fontWeight: '600',
              })}
              searchable={false}
              showTickIcon={false}
              listMode="MODAL"
              modalProps={{
                animationType: 'fade',
              }}
              ArrowDownIconComponent={() => (
                <View
                  style={[
                    styles.statusIndicator,
                    selectedOption && {
                      backgroundColor: selectedOption.color,
                    },
                  ]}
                />
              )}
              zIndex={isOpen ? zIndex + 3 : 1}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <StatusBar backgroundColor={'#0284c7'} barStyle="light-content" />
      <Header
        title="Driver Rating"
        onMenuPress={() => navigation.openDrawer()}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.row}>
          <View style={[styles.inputItem, {zIndex: tripNameOpen ? 1000 : 1}]}>
            <Text style={styles.label}>Trip Name</Text>
            <DropDownPicker
              open={tripNameOpen}
              value={tripNameValue}
              items={tripNameItems}
              setOpen={setTripNameOpen}
              setValue={setTripNameValue}
              setItems={setTripNameItems}
              placeholder="Select Trip"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              searchable={true}
              onOpen={() => {
                setDriverOpen(false);
              }}
            />
          </View>

          <View style={[styles.inputItem, {zIndex: driverOpen ? 1000 : 1}]}>
            <Text style={styles.label}>Driver</Text>
            <DropDownPicker
              open={driverOpen}
              value={driverValue}
              items={driverItems}
              setOpen={setDriverOpen}
              setValue={setDriverValue}
              setItems={setDriverItems}
              placeholder="Select Driver"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              searchable={true}
              onOpen={() => {
                setTripNameOpen(false);
              }}
            />
          </View>
        </View>
{/* 
        <TouchableOpacity style={styles.button} onPress={handleRateDriver}>
          <Text style={styles.buttonText}>Rate a Driver</Text>
        </TouchableOpacity> */}

        {/* Rating Modal */}
        {/* <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <Header
              title="Rate Driver"
              onBackPress={() => setModalVisible(false)}
            /> */}

            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalSubtitle}>
                Rate the driver for each category:
              </Text>

              <View style={styles.tableContainer}>
                <FlatList
                  data={checklistItems}
                  renderItem={renderChecklistItem}
                  keyExtractor={item =>
                    item.driver_checklist_master_id.toString()
                  }
                  scrollEnabled={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.disabledButton]}
                onPress={submitRating}
                disabled={loading}>
                <Text style={styles.buttonText}>
                  {loading ? 'Submitting...' : 'Submit Rating'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          {/* </View> */}
        {/* </Modal> */}
        <Loader visible={loading} />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9fafb',
    flexGrow: 1,
  },
  row: {
    marginBottom: 20,
  },
  inputItem: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  dropdown: {
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    borderRadius: 6,
    minHeight: 44,
  },
  dropdownContainer: {
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: '#9ca3af',
  },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalContent: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
  },
  tableContainer: {
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
  },
  selectedStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusDropdownContainer: {
    width: 150,
  },
  statusDropdown: {
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    borderRadius: 6,
    minHeight: 36,
  },
  statusDropdownText: {
    fontSize: 14,
  },
  statusDropdownPlaceholder: {
    color: '#9ca3af',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  commentContainer: {
    marginBottom: 20,
  },
  commentInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#374151',
  },
});

export default DriverRating;
