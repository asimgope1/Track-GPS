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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {useEffect, useState, useRef, useCallback} from 'react';
import Header from '../../components/Header';
import {GETNETWORK, POSTNETWORK} from '../../utils/Network';
import {BASE_URL} from '../../constants/url';
import DropDownPicker from 'react-native-dropdown-picker';
import StarRating from 'react-native-star-rating-widget';
import { useFocusEffect } from '@react-navigation/native';
import { Loader } from '../../components/Loader';
import Toast from 'react-native-toast-message';

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
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Rating options
  const ratingOptions = [
    {label: '1 Star', value: 1, color: '#ef4444'},
    {label: '2 Stars', value: 2, color: '#f97316'},
    {label: '3 Stars', value: 3, color: '#eab308'},
    {label: '4 Stars', value: 4, color: '#84cc16'},
    {label: '5 Stars', value: 5, color: '#22c55e'},
  ];

  const yesNoOptions = [
    {label: 'Yes', value: 'yes', color: '#22c55e'},
    {label: 'No', value: 'no', color: '#ef4444'},
  ];

  // Toast configuration
  const showToast = (type, title, message) => {
    Toast.show({
      type,
      position: 'top',
      text1: title,
      text2: message,
      visibilityTime: type === 'error' ? 4000 : 3000,
      autoHide: true,
      topOffset: StatusBar.currentHeight || 40,
    });
  };

  // Fetch data on focus with cleanup
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await Promise.all([GetTrip(), GetDrivers(), GetChecklist()]);
        resetForm();
      };

      fetchData();

      return () => {
        // Cleanup function
        setTripNameOpen(false);
        setDriverOpen(false);
        setOpenDropdowns({});
      };
    }, []),
  );

  const GetTrip = async () => {
    if (loading) return;
    
    setLoading(true);
    const Url = `${BASE_URL}trips/trip_master/`;
    try {
      const response = await GETNETWORK(Url, true);
      const trips = response.data || [];
      const mappedItems = trips.map(item => ({
        label: item.trip_name,
        value: item.trip_id,
      }));
      setTripNameItems(mappedItems);
      showToast('success', 'Trips Loaded', `${trips.length} trips loaded successfully`);
    } catch (error) {
      console.error('Error fetching trips:', error);
      showToast('error', 'Network Error', 'Failed to fetch trip data');
    } finally {
      setLoading(false);
    }
  };

  const GetDrivers = async () => {
    if (loading) return;
    
    setLoading(true);
    const Url = `${BASE_URL}trips/driver_master/`;
    try {
      const response = await GETNETWORK(Url, true);
      const drivers = response.data || [];
      const mappedItems = drivers.map(item => ({
        label: item.driver_name,
        value: item.driver_master_id,
      }));
      setDriverItems(mappedItems);
      showToast('success', 'Drivers Loaded', `${drivers.length} drivers loaded successfully`);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      showToast('error', 'Network Error', 'Failed to fetch driver data');
    } finally {
      setLoading(false);
    }
  };

  const GetChecklist = async () => {
    if (loading) return;
    
    setLoading(true);
    const Url = `${BASE_URL}trips/driver_checklist_master/`;
    try {
      const response = await GETNETWORK(Url, true);
      const checklist = response.data || [];
      setChecklistItems(checklist);
      showToast('success', 'Checklist Loaded', `${checklist.length} checklist items loaded`);
    } catch (error) {
      console.error('Error fetching checklist:', error);
      showToast('error', 'Network Error', 'Failed to fetch checklist data');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSelect = (checklistId, rating) => {
    setRatings(prev => ({
      ...prev,
      [checklistId]: rating,
    }));
  };

  const validateForm = () => {
    if (!tripNameValue || !driverValue) {
      showToast('error', 'Required', 'Please select both trip and driver');
      return false;
    }

    if (Object.keys(ratings).length === 0) {
      showToast('error', 'Required', 'Please provide ratings for at least one checklist item');
      return false;
    }

    const hasValidRatings = checklistItems.some(item => {
      const rating = ratings[item.driver_checklist_master_id];
      return rating !== undefined && rating !== null && rating !== '';
    });

    if (!hasValidRatings) {
      showToast('error', 'Required', 'Please provide valid ratings for checklist items');
      return false;
    }

    return true;
  };

  const submitRating = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const checklistValues = checklistItems
        .map(item => {
          const ratingValue = ratings[item.driver_checklist_master_id];
          
          if (ratingValue === undefined || ratingValue === null || ratingValue === '') {
            return null;
          }

          return {
            checklist_master_id: item.driver_checklist_master_id,
            value: item.checklist_type === 'rate' ? ratingValue * 2 : ratingValue,
          };
        })
        .filter(item => item !== null);

      if (checklistValues.length === 0) {
        showToast('error', 'Required', 'Please provide valid ratings for checklist items');
        return;
      }

      const ratingData = {
        driver_id: driverValue,
        trip_id: tripNameValue,
        checklist_values: checklistValues,
        remarks: comment,
      };

      console.log('Final payload to be sent:', ratingData);

      const Url = `${BASE_URL}trips/driver_rating/`;
      const response = await POSTNETWORK(Url, ratingData, true);

      if (response.status === 'success') {
        const driverName = driverItems.find(item => item.value === driverValue)?.label || 'Driver';
        showToast('success', 'Rating Submitted', `Rating submitted for ${driverName} successfully`);
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Submit rating error:', error);
      showToast('error', 'Submission Failed', error.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRatings({});
    setOpenDropdowns({});
    setTripNameValue(null);
    setDriverValue(null);
    setComment('');
    showToast('info', 'Form Reset', 'Form has been reset successfully');
  };

  // Optimized dropdown handlers
  const handleTripDropdownOpen = (open) => {
    setTripNameOpen(open);
    if (open) setDriverOpen(false);
  };

  const handleDriverDropdownOpen = (open) => {
    setDriverOpen(open);
    if (open) setTripNameOpen(false);
  };

  const handleChecklistDropdownOpen = (checklistId, open) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [checklistId]: open,
    }));
  };

  const renderChecklistItem = ({item, index}) => {
    const selectedValue = ratings[item.driver_checklist_master_id];
    const isRateType = item.checklist_type === 'rate';
    const options = isRateType ? ratingOptions : yesNoOptions;
    const selectedOption = options.find(opt => opt.value === selectedValue);
    const isOpen = openDropdowns[item.driver_checklist_master_id] || false;
    const zIndex = isOpen ? zIndexCounter.current + index : 1;

    return (
      <View style={[styles.tableRow, {zIndex}]} key={item.driver_checklist_master_id}>
        <View style={styles.itemNameContainer}>
          <Text style={styles.itemName}>{item.checklist_name}</Text>
          {selectedValue && !isRateType && (
            <Text style={[styles.selectedStatusText, {color: selectedOption?.color}]}>
              {selectedOption?.label}
            </Text>
          )}
        </View>

        {isRateType ? (
          <View style={styles.starRatingContainer}>
            <StarRating
              rating={selectedValue || 0}
              onChange={(rating) => handleRatingSelect(item.driver_checklist_master_id, rating)}
              maxStars={5}
              starSize={28}
              color="#facc15"
              emptyColor="#e5e7eb"
              starStyle={{marginHorizontal: 1}}
            />
            {selectedValue && (
              <Text style={styles.starRatingText}>
                {selectedValue} {selectedValue === 1 ? 'Star' : 'Stars'}
              </Text>
            )}
          </View>
        ) : (
          <View style={[styles.statusDropdownContainer, {zIndex: isOpen ? zIndex + 1 : 1}]}>
            <DropDownPicker
              open={isOpen}
              value={selectedValue}
              items={options}
              setOpen={(open) => handleChecklistDropdownOpen(item.driver_checklist_master_id, open)}
              setValue={(value) => handleRatingSelect(item.driver_checklist_master_id, value)}
              setItems={() => {}}
              placeholder="Select Option"
              style={[
                styles.statusDropdown,
                selectedOption && {backgroundColor: selectedOption.color + '20'},
              ]}
              textStyle={styles.statusDropdownText}
              placeholderStyle={styles.statusDropdownPlaceholder}
              labelStyle={selectedOption && {color: selectedOption.color}}
              listItemLabelStyle={(item) => ({
                color: item.color,
                fontWeight: '600',
              })}
              searchable={false}
              showTickIcon={true}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
              modalProps={{
                animationType: 'fade',
              }}
              dropDownDirection="BOTTOM"
              maxHeight={200}
              autoScroll={true}
              ArrowDownIconComponent={() => (
                <View style={[
                  styles.statusIndicator,
                  selectedOption && {backgroundColor: selectedOption.color},
                ]} />
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

      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          <View style={styles.row}>
            <View style={[styles.inputItem, {zIndex: tripNameOpen ? 1000 : 1}]}>
              <Text style={styles.label}>Trip Name</Text>
              <DropDownPicker
              
                open={tripNameOpen}
                value={tripNameValue}
                items={tripNameItems}
                setOpen={handleTripDropdownOpen}
                setValue={setTripNameValue}
                setItems={setTripNameItems}
                placeholder="Select Trip"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                searchable={true}
                searchPlaceholder="Search trips..."
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                maxHeight={100}
                autoScroll={true}
              />
            </View>

            <View style={[styles.inputItem, {zIndex: driverOpen ? 1000 : 1}]}>
              <Text style={styles.label}>Driver</Text>
              <DropDownPicker
                open={driverOpen}
                value={driverValue}
                items={driverItems}
                setOpen={handleDriverDropdownOpen}
                setValue={setDriverValue}
                setItems={setDriverItems}
                placeholder="Select Driver"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                searchable={true}
                searchPlaceholder="Search drivers..."
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                maxHeight={100}
                autoScroll={true}
              />
            </View>
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Driver Rating Checklist</Text>
            <Text style={styles.sectionSubtitle}>
              Rate the driver for each category:
            </Text>

            <View style={styles.tableContainer}>
              <FlatList
                data={checklistItems}
                renderItem={renderChecklistItem}
                keyExtractor={item => item.driver_checklist_master_id.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>

            <View style={styles.commentContainer}>
              <Text style={styles.label}>Additional Comments (Optional)</Text>
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Enter any additional comments or feedback..."
                placeholderTextColor="#9ca3af"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.resetButton, loading && styles.disabledButton]}
                onPress={resetForm}
                disabled={loading}
              >
                <Text style={styles.resetButtonText}>Reset Form</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={submitRating}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Submitting...' : 'Submit Rating'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Loader visible={loading} />
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  row: {
    marginBottom: 20,
  },
  inputItem: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dropdown: {
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    borderRadius: 8,
    minHeight: 48,
    borderWidth: 1.5,
  },
  dropdownContainer: {
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 8,
    maxHeight: 300,
  },
  dropdownText: {
    fontSize: 14,
    color: '#374151',
  },
  dropdownPlaceholder: {
    color: '#9ca3af',
    fontSize: 14,
  },
  ratingSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  tableContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  selectedStatusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  starRatingContainer: {
    alignItems: 'center',
    minWidth: 150,
  },
  starRatingText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '500',
  },
  statusDropdownContainer: {
    width: 120,
  },
  statusDropdown: {
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    borderRadius: 8,
    minHeight: 40,
    borderWidth: 1.5,
  },
  statusDropdownText: {
    fontSize: 14,
    color: '#374151',
  },
  statusDropdownPlaceholder: {
    color: '#9ca3af',
    fontSize: 14,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  commentContainer: {
    marginBottom: 24,
  },
  commentInput: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DriverRating;