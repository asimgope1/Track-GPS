import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import Header from '../../components/Header';
import DropDownPicker from 'react-native-dropdown-picker';
import {pick} from '@react-native-documents/picker';
import {Icon} from '@rneui/themed';
import {BASE_URL} from '../../constants/url';
import { GETNETWORK, POSTNETWORK } from '../../utils/Network';
import { getObjByKey } from '../../utils/Storage';
import { Calendar } from 'react-native-calendars';
import Toast from 'react-native-toast-message';
import moment from 'moment';

const TripExpenses = ({navigation, onClose}) => {
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedTripId, setSelectedTripId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [token, setToken] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const zIndexCounter = useRef(1000);

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

  // Safe menu press handler
  const handleMenuPress = () => {
    if (onClose) {
      onClose();
    } else if (navigation?.openDrawer) {
      navigation.openDrawer();
    } else {
      console.warn('Navigation not available');
      if (onClose) onClose();
    }
  };

  const handleDayPress = day => {
    const dateString = day.dateString;
    
    // Validate date is not in future
    if (moment(dateString).isAfter(moment(), 'day')) {
      showToast('error', 'Invalid Date', 'Cannot select future dates');
      return;
    }

    setSelectedDate(dateString);
    setMarkedDates({
      [dateString]: {
        selected: true,
        selectedColor: '#0284c7',
        selectedTextColor: '#ffffff',
      },
    });
    
    // Clear date error if any
    setFormErrors(prev => ({...prev, date: null}));
    showToast('success', 'Date Selected', moment(dateString).format('DD MMM YYYY'));
  };

  const handleAttachment = async () => {
    try {
      const pickResults = await pick();
      console.log('Attachment selected:', pickResults);

      if (pickResults && pickResults.length > 0) {
        const pickResult = pickResults[0];
        
        // Validate file size (10MB limit)
        if (pickResult.size && pickResult.size > 10 * 1024 * 1024) {
          showToast('error', 'File Too Large', 'Please select a file smaller than 10MB');
          return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(pickResult.type)) {
          showToast('error', 'Invalid File Type', 'Please select JPEG, PNG, or PDF files only');
          return;
        }

        setAttachments([{
          uri: pickResult.uri,
          name: pickResult.name,
          type: pickResult.type,
        }]);
        
        showToast('success', 'File Selected', 'Attachment added successfully');
      }
    } catch (error) {
      console.error('Error picking file:', error);
      showToast('error', 'File Selection Failed', 'Failed to select file. Please try again.');
    }
  };

  const removeAttachment = () => {
    setAttachments([]);
    showToast('info', 'Attachment Removed', 'File has been removed');
  };

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
        setCategoriesLoading(true);
      } else {
        setRefreshing(true);
      }

      // Get token first
      const loginRes = await getObjByKey('loginResponse');
      const userToken = loginRes?.data?.access_token;
      setToken(userToken);

      // Fetch expense categories
      const categoriesUrl = `${BASE_URL}trips/expense_master/`;
      const categoriesResponse = await GETNETWORK(categoriesUrl, true);

      if (categoriesResponse?.status === 'success') {
        const activeCategories = categoriesResponse.data.map(cat => ({
          label: cat.expense_name,
          value: cat.expense_master_id,
        }));
        setExpenseCategories(categoriesResponse.data);
        setCategoryItems(activeCategories);
        showToast('success', 'Categories Loaded', `${activeCategories.length} categories loaded`);
      } else {
        console.log('Failed to fetch expense categories:', categoriesResponse?.message);
        showToast('error', 'Load Failed', 'Failed to fetch expense categories');
      }

      // Fetch trips data
      const tripsUrl = `${BASE_URL}trips/trip_assignment/`;
      const tripsResponse = await GETNETWORK(tripsUrl, true);

      if (tripsResponse?.status === 'success') {
        setTrips(tripsResponse.data);
        showToast('success', 'Trips Loaded', `${tripsResponse.data.length} trips loaded`);
      } else {
        console.log('Failed to fetch trips:', tripsResponse?.message);
        showToast('error', 'Load Failed', 'Failed to fetch trips data');
      }

      // Fetch expenses data
      const expensesUrl = `${BASE_URL}trips/trip_expense_entry/`;
      const expensesResponse = await GETNETWORK(expensesUrl, true);

      if (expensesResponse?.status === 'success') {
        setExpenses(expensesResponse.data);
      } else {
        console.log('Failed to fetch expenses:', expensesResponse?.message);
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err.message);
      showToast('error', 'Network Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setCategoriesLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddExpense = tripId => {
    const selectedTrip = trips.find(trip => trip.trip_id === tripId);
    setSelectedTripId(tripId);
    setCategory(null);
    setAmount('');
    setRemarks('');
    setAttachments([]);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setMarkedDates({
      [new Date().toISOString().split('T')[0]]: {
        selected: true,
        selectedColor: '#0284c7',
        selectedTextColor: '#ffffff',
      },
    });
    setFormErrors({});
    setModalVisible(true);
    
    showToast('info', 'Add Expense', `Adding expense for ${selectedTrip?.trip_name}`);
  };

  const validateForm = () => {
    const errors = {};

    if (!category) {
      errors.category = 'Please select an expense category';
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      errors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!selectedDate) {
      errors.date = 'Please select expense date';
    } else if (moment(selectedDate).isAfter(moment(), 'day')) {
      errors.date = 'Cannot select future dates';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitExpense = async () => {
    if (!validateForm()) {
      showToast('error', 'Validation Error', 'Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!token) {
        const loginRes = await getObjByKey('loginResponse');
        const userToken = loginRes?.data?.access_token;
        setToken(userToken);
        
        if (!userToken) {
          throw new Error('Authentication token not available');
        }
      }

      const formdata = new FormData();
      formdata.append('trip_id', selectedTripId.toString());
      formdata.append('expense_master_id', category.toString());
      formdata.append('amount', amount.toString());
      formdata.append('remarks', remarks || 'No remarks');
      formdata.append('expense_date', selectedDate);

      if (attachments.length > 0) {
        const file = {
          uri: attachments[0].uri,
          type: attachments[0].type || 'application/octet-stream',
          name: attachments[0].name || 'receipt.jpg',
        };
        formdata.append('receipt', file);
      }

      console.log('Submitting expense:', {
        trip_id: selectedTripId,
        expense_master_id: category,
        amount: amount,
        expense_date: selectedDate,
        hasAttachment: attachments.length > 0
      });

      const response = await fetch(`${BASE_URL}trips/trip_expense_entry/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formdata,
      });

      const result = await response.json();
      console.log('Submission response:', result);

      if (result.status === 'success') {
        // Refresh expenses data
        await fetchData(false);
        
        Alert.alert(
          'Success!', 
          'Expense added successfully!',
          [
            {
              text: 'Add Another',
              onPress: () => {
                // Reset form but keep modal open
                setCategory(null);
                setAmount('');
                setRemarks('');
                setAttachments([]);
                setFormErrors({});
                showToast('success', 'Ready', 'You can add another expense');
              },
            },
            {
              text: 'Done',
              onPress: () => {
                setModalVisible(false);
                showToast('success', 'Expense Added', 'Expense recorded successfully');
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        throw new Error(result.message || 'Failed to add expense');
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      
      let errorMessage = 'Failed to submit expense. Please try again.';
      if (error.message.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication failed. Please login again.';
      }
      
      showToast('error', 'Submission Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getExpensesForTrip = tripId => {
    return expenses.filter(expense => expense.trip_id === tripId);
  };

  const getTotalExpensesForTrip = tripId => {
    const tripExpenses = getExpensesForTrip(tripId);
    return tripExpenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  };

  const getStatusStyle = status => {
    switch (status) {
      case 'in_progress':
        return {color: '#2563eb', text: 'Ongoing', bgColor: '#dbeafe'};
      case 'scheduled':
        return {color: '#d97706', text: 'Scheduled', bgColor: '#fef3c7'};
      case 'completed':
        return {color: '#059669', text: 'Completed', bgColor: '#d1fae5'};
      case 'cancelled':
        return {color: '#dc2626', text: 'Cancelled', bgColor: '#fee2e2'};
      default:
        return {color: '#6b7280', text: status, bgColor: '#f3f4f6'};
    }
  };

  const handleRefresh = () => {
    fetchData(false);
  };

  if (loading || categoriesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Loading trip expenses...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={48} color="#dc2626" />
        <Text style={styles.errorText}>Error loading data</Text>
        <Text style={styles.errorSubText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchData()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar backgroundColor={'#0284c7'} barStyle="light-content" />
      <Header 
        title="Trip Expenses" 
        onMenuPress={handleMenuPress}
        showRefresh={true}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={null} // Custom refresh handled in header
        >
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Trip Expenses Overview</Text>
            <Text style={styles.subtitle}>
              {trips.length} trip(s) found • Total expenses: ₹{expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0).toFixed(2)}
            </Text>
          </View>

          {trips.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="receipt-long" size={64} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No trips available</Text>
              <Text style={styles.emptyStateSubText}>
                There are no trips assigned to you at the moment.
              </Text>
            </View>
          ) : (
            trips.map(trip => {
              const statusInfo = getStatusStyle(trip.trip_status);
              const tripExpenses = getExpensesForTrip(trip.trip_id);
              const totalExpenses = getTotalExpensesForTrip(trip.trip_id);

              return (
                <View key={trip.trip_assignment_id} style={styles.tripCard}>
                  <View style={styles.tripHeader}>
                    <View style={styles.tripTitleContainer}>
                      <Text style={styles.tripName}>{trip.trip_name}</Text>
                      <View style={[styles.statusBadge, {backgroundColor: statusInfo.bgColor}]}>
                        <Text style={[styles.statusText, {color: statusInfo.color}]}>
                          {statusInfo.text}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.totalExpenses}>
                      ₹{totalExpenses.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.tripDetails}>
                    <View style={styles.detailRow}>
                      <Icon name="directions-car" size={16} color="#6b7280" />
                      <Text style={styles.detailText}>{trip.thing_name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="person" size={16} color="#6b7280" />
                      <Text style={styles.detailText}>{trip.driver}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="schedule" size={16} color="#6b7280" />
                      <Text style={styles.detailText}>{trip.scheduled_datetime}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="speed" size={16} color="#6b7280" />
                      <Text style={styles.detailText}>{trip.estimated_distance} km</Text>
                    </View>
                  </View>

                  <View style={styles.expenseSection}>
                    <Text style={styles.sectionTitle}>Expenses</Text>
                    {tripExpenses.length > 0 ? (
                      tripExpenses.map(expense => (
                        <View
                          key={expense.trip_expense_entry_id}
                          style={styles.expenseItem}>
                          <View style={styles.expenseRow}>
                            <View style={styles.expenseInfo}>
                              <Text style={styles.expenseName}>{expense.expense_name}</Text>
                              <Text style={styles.expenseDate}>
                                {moment(expense.expense_date).format('DD MMM YYYY')}
                              </Text>
                            </View>
                            <Text style={styles.amount}>₹{parseFloat(expense.amount).toFixed(2)}</Text>
                          </View>
                          {expense.remarks && expense.remarks !== 'No remarks' && (
                            <Text style={styles.remarks}>{expense.remarks}</Text>
                          )}
                          {expense.receipt && (
                            <View style={styles.receiptContainer}>
                              <Icon name="receipt" size={14} color="#0284c7" />
                              <Text style={styles.receiptText}>Receipt attached</Text>
                            </View>
                          )}
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noExpense}>No expenses recorded yet</Text>
                    )}
                  </View>

                  {trip.trip_status === 'in_progress' && (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddExpense(trip.trip_id)}>
                      <Icon name="add" size={20} color="#fff" />
                      <Text style={styles.addButtonText}>Add New Expense</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add Expense Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !isSubmitting && setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Expense</Text>
              <TouchableOpacity 
                onPress={() => !isSubmitting && setModalVisible(false)}
                disabled={isSubmitting}
              >
                <Icon name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              
              {selectedTripId && (
                <View style={styles.selectedTripInfo}>
                  <Text style={styles.selectedTripText}>
                    Trip: {trips.find(t => t.trip_id === selectedTripId)?.trip_name}
                  </Text>
                </View>
              )}

              <View style={[styles.dropdownWrapper, {zIndex: categoryOpen ? zIndexCounter.current + 100 : 1}]}>
                <Text style={styles.label}>Category *</Text>
                <DropDownPicker
                  open={categoryOpen}
                  value={category}
                  items={categoryItems}
                  setOpen={setCategoryOpen}
                  setValue={setCategory}
                  setItems={setCategoryItems}
                  placeholder="Select category"
                  style={[styles.dropdown, formErrors.category && styles.errorInput]}
                  dropDownContainerStyle={styles.dropdownContainer}
                  textStyle={styles.dropdownText}
                  placeholderStyle={styles.dropdownPlaceholder}
                  listMode="MODAL"
                  searchable={true}
                  searchablePlaceholder="Search category..."
                  onSelectItem={() => setFormErrors(prev => ({...prev, category: null}))}
                />
                {formErrors.category && (
                  <Text style={styles.errorText}>{formErrors.category}</Text>
                )}
              </View>

              <View style={styles.inputItem}>
                <Text style={styles.label}>Date *</Text>
                <Calendar
                  markedDates={markedDates}
                  onDayPress={handleDayPress}
                  theme={{
                    selectedDayBackgroundColor: '#0284c7',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#0284c7',
                    arrowColor: '#0284c7',
                    textDisabledColor: '#d1d5db',
                  }}
                  hideExtraDays={true}
                  firstDay={1}
                  minDate={'2020-01-01'}
                  maxDate={new Date().toISOString().split('T')[0]} // No future dates
                  style={styles.calendar}
                />
                {formErrors.date && (
                  <Text style={styles.errorText}>{formErrors.date}</Text>
                )}
              </View>

              <View style={styles.inputItem}>
                <Text style={styles.label}>Amount *</Text>
                <TextInput
                  placeholder="Enter amount"
                  placeholderTextColor={'#9ca3af'}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(text);
                    setFormErrors(prev => ({...prev, amount: null}));
                  }}
                  style={[styles.input, formErrors.amount && styles.errorInput]}
                />
                {formErrors.amount && (
                  <Text style={styles.errorText}>{formErrors.amount}</Text>
                )}
              </View>

              <View style={styles.inputItem}>
                <Text style={styles.label}>Remarks</Text>
                <View style={styles.commentsContainer}>
                  <TextInput
                    placeholder="Remarks (optional)"
                    placeholderTextColor={'#9ca3af'}
                    value={remarks}
                    onChangeText={setRemarks}
                    style={[styles.input, styles.multilineInput]}
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                  />
                  <Text style={styles.charCount}>
                    {remarks.length}/200
                  </Text>
                </View>
              </View>

              <View style={styles.inputItem}>
                <Text style={styles.label}>Attachments</Text>
                {attachments?.length > 0 ? (
                  <View style={styles.attachmentPreviewContainer}>
                    {attachments[0].type?.startsWith('image/') ? (
                      <Image
                        source={{uri: attachments[0].uri}}
                        style={styles.attachmentImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.filePreview}>
                        <Icon name="insert-drive-file" size={40} color="#0284c7" />
                        <Text style={styles.fileName} numberOfLines={1}>
                          {attachments[0].name}
                        </Text>
                      </View>
                    )}
                    <View style={styles.attachmentActions}>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={removeAttachment}
                        disabled={isSubmitting}>
                        <Icon name="close" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.attachmentButton}
                    onPress={handleAttachment}
                    disabled={isSubmitting}>
                    <Text style={styles.attachmentButtonText}>Choose File (Max 10MB)</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  disabled={isSubmitting}
                  style={[styles.modalButton, styles.cancelButton]}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={submitExpense}
                  disabled={isSubmitting || categoryItems.length === 0}
                  style={[
                    styles.modalButton,
                    styles.submitButton,
                    (isSubmitting || categoryItems.length === 0) && styles.disabledButton
                  ]}>
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Add Expense</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  headerContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripTitleContainer: {
    flex: 1,
  },
  tripName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalExpenses: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0284c7',
  },
  tripDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  expenseSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  expenseItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  expenseDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  remarks: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  receiptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  receiptText: {
    fontSize: 12,
    color: '#0284c7',
    marginLeft: 4,
  },
  noExpense: {
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  addButton: {
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalContent: {
    padding: 16,
  },
  selectedTripInfo: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
  },
  selectedTripText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0284c7',
  },
  dropdownWrapper: {
    marginBottom: 16,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderWidth: 1.5,
    borderRadius: 6,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
  },
  dropdownText: {
    fontSize: 14,
    color: '#111827',
  },
  dropdownPlaceholder: {
    color: '#9ca3af',
  },
  inputItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  commentsContainer: {
    position: 'relative',
  },
  charCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#6b7280',
  },
  calendar: {
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#0284c7',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  attachmentPreviewContainer: {
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
    position: 'relative',
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: 4,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  fileName: {
    marginLeft: 10,
    color: '#374151',
    flex: 1,
  },
  attachmentActions: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  removeButton: {
    padding: 5,
  },
  attachmentButton: {
    height: 45,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  errorInput: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  errorSubText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
    fontWeight: '600',
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default TripExpenses;