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
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Header from '../../components/Header';
import { GETNETWORK, POSTNETWORK } from '../../utils/Network';
import { useStatusBarHeight } from '../../constants/config';
import { BASE_URL } from '../../constants/url';
import DropDownPicker from 'react-native-dropdown-picker';
import StarRating from 'react-native-star-rating-widget';
import { useFocusEffect } from '@react-navigation/native';
import { Loader } from '../../components/Loader';
import Toast from 'react-native-toast-message';
import theme from '../../theme';

const DriverRating = ({ navigation }) => {
  const statusBarHeight = useStatusBarHeight();
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
    { label: '1 Star', value: 1, color: theme.colors.error },
    { label: '2 Stars', value: 2, color: '#f97316' },
    { label: '3 Stars', value: 3, color: '#eab308' },
    { label: '4 Stars', value: 4, color: '#84cc16' },
    { label: '5 Stars', value: 5, color: '#22c55e' },
  ];

  const yesNoOptions = [
    { label: 'Yes', value: 'yes', color: '#22c55e' },
    { label: 'No', value: 'no', color: theme.colors.error },
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
      topOffset: statusBarHeight,
    });
  };

  // Fetch data on focus with cleanup
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await Promise.all([GetTrip(), GetDrivers(), GetChecklist()]);
        resetForm(true);
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
      console.log('checlist', checklist)
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
            value:
              item.checklist_type === 'rate'
                ? ratingValue * 2
                : ratingValue, // keep "yes"/"no" for question
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

      const Url = `${BASE_URL}trips/driver_rating/`;
      const response = await POSTNETWORK(Url, ratingData, true);

      if (response?.status === 'success') {
        showToast('success', 'Success', response.msg || 'Driver rating updated successfully');
        resetForm(true);
      } else {
        throw new Error(response?.msg || response?.message || 'Failed to submit rating');
      }
    } catch (error) {
      if (__DEV__) console.error('Submit rating error:', error);
      showToast('error', 'Submission Failed', error?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (skipToast = false) => {
    setRatings({});
    setOpenDropdowns({});
    setTripNameValue(null);
    setDriverValue(null);
    setComment('');
    if (!skipToast) {
      showToast('info', 'Form Reset', 'Form has been reset successfully');
    }
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

  const renderChecklistItem = ({ item, index }) => {
    const selectedValue = ratings[item.driver_checklist_master_id];
    const isRateType = item.checklist_type === 'rate';
    const isQuestionType = item.checklist_type === 'question';
    const options = isRateType ? ratingOptions : isQuestionType ? yesNoOptions : [];
    const selectedOption = options.find(opt => opt.value === selectedValue);
    const isOpen = openDropdowns[item.driver_checklist_master_id] || false;
    const zIndex = isOpen ? zIndexCounter.current + index : 1;

    // Debugging log to verify state
    console.log(`Checklist Item: ${item.checklist_name}, isOpen: ${isOpen}, selectedValue: ${selectedValue}`);

    return (
      <View style={[styles.tableRow, { zIndex }]} key={item.driver_checklist_master_id}>
        <View style={styles.itemNameContainer}>
          <Text style={styles.itemName}>{item.checklist_name}</Text>
          {/* Show selectedStatusText only when dropdown is closed and a value is selected */}
          {selectedValue && isQuestionType && !isOpen && (
            <TouchableOpacity
              onPress={() => handleChecklistDropdownOpen(item.driver_checklist_master_id, true)}
              style={styles.selectedStatusContainer}
            >
              <Text style={[styles.selectedStatusText, { color: selectedOption?.color || theme.colors.text }]}>
                {selectedOption?.label || 'N/A'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isRateType ? (
          // ⭐ Star Rating for "rate"
          <View style={styles.starRatingContainer}>
            <StarRating
              rating={selectedValue || 0}
              onChange={(rating) => handleRatingSelect(item.driver_checklist_master_id, rating)}
              maxStars={5}
              starSize={28}
              color="#facc15"
              emptyColor="#e5e7eb"
              starStyle={{ marginHorizontal: 1 }}
            />
            {selectedValue && (
              <Text style={styles.starRatingText}>
                {selectedValue} {selectedValue === 1 ? 'Star' : 'Stars'}
              </Text>
            )}
          </View>
        ) : isQuestionType && (isOpen || !selectedValue) ? (
          // ✅ Yes/No dropdown for "question" (shown only when open or no selection)
          <View style={[styles.statusDropdownContainer, { zIndex: isOpen ? zIndex + 1 : 1 }]}>
            <DropDownPicker
              open={isOpen}
              value={selectedValue}
              items={yesNoOptions}
              setOpen={(open) => handleChecklistDropdownOpen(item.driver_checklist_master_id, open)}
              setValue={(callback) => {
                const newValue = callback(selectedValue);
                handleRatingSelect(item.driver_checklist_master_id, newValue);
              }}
              setItems={() => { }}
              placeholder="Select Yes/No"
              style={[styles.statusDropdown, selectedOption && !isOpen && { backgroundColor: selectedOption.color + '20' }]}
              textStyle={styles.statusDropdownText}
              placeholderStyle={styles.statusDropdownPlaceholder}
              labelStyle={selectedOption && { color: selectedOption.color }}
              listItemLabelStyle={(opt) => ({
                color: opt.color,
                fontWeight: '600',
              })}
              showTickIcon={true}
              listMode="MODAL"
              dropDownDirection="BOTTOM"
              maxHeight={200}
              autoScroll={true}
            />
          </View>
        ) : null}
      </View>
    );
  };


  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
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
            <View style={[styles.inputItem, { zIndex: tripNameOpen ? 1000 : 1 }]}>
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
                listMode="MODAL"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                maxHeight={100}
                autoScroll={true}
              />
            </View>

            <View style={[styles.inputItem, { zIndex: driverOpen ? 1000 : 1 }]}>
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
                listMode="MODAL"
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
                placeholderTextColor={theme.colors.textPlaceholder}
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
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  row: {
    marginBottom: theme.spacing.md,
  },
  inputItem: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  dropdown: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.radius.md,
    minHeight: 52,
    borderWidth: 1.5,
    ...theme.shadows.sm,
  },
  dropdownContainer: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.5,
    borderRadius: theme.radius.md,
    maxHeight: 300,
    ...theme.shadows.md,
  },
  dropdownText: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
  },
  dropdownPlaceholder: {
    color: theme.colors.textPlaceholder,
    fontSize: theme.typography.sm,
  },
  ratingSection: {
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  tableContainer: {
    marginBottom: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...theme.shadows.lg,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderLight,
  },
  itemNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
    flex: 1,
  },
  selectedStatusText: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
    marginLeft: theme.spacing.xs,
  },
  starRatingContainer: {
    alignItems: 'center',
    minWidth: 150,
  },
  starRatingText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xxs,
    fontWeight: theme.typography.medium,
  },
  statusDropdownContainer: {
    width: 120,
  },
  statusDropdown: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.radius.sm,
    minHeight: 40,
    borderWidth: 1.5,
  },
  statusDropdownText: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
  },
  statusDropdownPlaceholder: {
    color: theme.colors.textPlaceholder,
    fontSize: theme.typography.sm,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.xs,
  },
  commentContainer: {
    marginBottom: theme.spacing.xl,
  },
  commentInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: theme.typography.base,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  resetButton: {
    flex: 1,
    backgroundColor: theme.colors.borderDark,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  submitButton: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    ...theme.shadows.glow,
  },
  disabledButton: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
  },
});

export default DriverRating;