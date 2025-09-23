import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import Header from '../../components/Header';
import DropDownPicker from 'react-native-dropdown-picker';
import {pick} from '@react-native-documents/picker';
import {Icon} from '@rneui/themed';
import {BASE_URL} from '../../constants/url';
import { GETNETWORK } from '../../utils/Network';
import { getObjByKey } from '../../utils/Storage';
import { Calendar } from 'react-native-calendars';

const TripExpenses = ({navigation,onClose}) => {
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [selectedTripId, setSelectedTripId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [token, setToken] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format
  const [markedDates, setMarkedDates] = useState({});

  const handleAttachment = async () => {
    try {
      const pickResults = await pick(); // Returns an array of results
      console.log('Attachment selected:', pickResults);

      if (pickResults && pickResults.length > 0) {
        const pickResult = pickResults[0]; // Get the first selected file
        setAttachments([
          {
            uri: pickResult.uri,
            name: pickResult.name,
            type: pickResult.type,
          },
        ]);
      }
      console.log('pickResult', pickResults);
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  
  // Safe menu press handler
  const handleMenuPress = () => {
    if (onClose) {
      // If onClose exists, we're in modal mode - close modal
      onClose();
    } else if (navigation?.openDrawer) {
      // If navigation exists and has openDrawer, we're in page mode
      navigation.openDrawer();
    } else {
      // Fallback - just close or handle appropriately
      console.warn('Navigation not available');
      if (onClose) onClose();
    }
  };



  const handleDayPress = day => {
    const dateString = day.dateString;
    setSelectedDate(day.dateString);
    setMarkedDates({
      [dateString]: {
        selected: true,
        selectedColor: '#0284c7',
      },
    });
  }

  const removeAttachment = () => {
    setAttachments([]);
  };

  useEffect(() => {
  const fetchData = async () => {
    try {
      

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
      } else {
        console.log(
          'Failed to fetch expense categories:',
          categoriesResponse?.message,
        );
      }

      // Fetch trips data
      const tripsUrl = `${BASE_URL}trips/trip_assignment/`;
      const tripsResponse = await GETNETWORK(tripsUrl, true);

      if (tripsResponse?.status === 'success') {
        setTrips(tripsResponse.data);
      } else {
        console.log('Failed to fetch trips:', tripsResponse?.message);
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
    } finally {
      setLoading(false);
      setCategoriesLoading(false);
    }
  };


    fetchData();
  }, []);

  const handleAddExpense = tripId => {
    setSelectedTripId(tripId);
    setCategory(null);
    setAmount('');
    setRemarks('');
    setAttachments([]);
    setModalVisible(true);
  };

  const submitExpense = async () => {
    if (!category || !amount || isNaN(amount)) {
      Alert.alert(
        'Invalid Input',
        'Please select a category and enter a valid amount.',
      );
      return;
    }
    if (!token) {
       const loginRes = await getObjByKey('loginResponse');
             const token = loginRes?.data?.access_token;

      setToken(token);
    }

    try {
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
          name: attachments[0].name || 'receipt',
        };
        formdata.append('receipt', file);
      }

      const response = await fetch(`${BASE_URL}trips/trip_expense_entry/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formdata,
      });

      const result = await response.json();
      console.log(result);

      if (result.status === 'success') {
        Alert.alert('Success', 'Expense added successfully');
        // Refresh expenses data
        const expensesResponse = await fetch(
          `${BASE_URL}trips/trip_expense_entry/`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const expensesResult = await expensesResponse.json();
        if (expensesResult.status === 'success') {
          setExpenses(expensesResult.data);
        }

        setModalVisible(false);
      } else {
        Alert.alert('Error', result.message || 'Failed to add expense');
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      Alert.alert('Error', 'Failed to submit expense. Please try again.');
    }
  };

  const getExpensesForTrip = tripId => {
    return expenses.filter(expense => expense.trip_id === tripId);
  };

  const getStatusStyle = status => {
    switch (status) {
      case 'in_progress':
        return {color: '#2563eb', text: 'Ongoing'};
      case 'scheduled':
        return {color: '#d97706', text: 'Scheduled'};
      case 'completed':
        return {color: '#059669', text: 'Completed'};
      case 'cancelled':
        return {color: '#dc2626', text: 'Cancelled'};
      default:
        return {color: '#6b7280', text: status};
    }
  };

  if (loading || categoriesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar backgroundColor={'#0284c7'} barStyle="light-content" />
      <Header title="Trip Expenses" onMenuPress={handleMenuPress} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Trip Expenses Overview</Text>

        {trips.length === 0 ? (
          <Text style={styles.noTripsText}>No trips available</Text>
        ) : (
          trips.map(trip => {
            const statusInfo = getStatusStyle(trip.trip_status);
            const tripExpenses = getExpensesForTrip(trip.trip_id);

            return (
              <View key={trip.trip_assignment_id} style={styles.tripCard}>
                <Text style={styles.tripInfo}>
                  <Text style={styles.bold}>Trip:</Text> {trip.trip_name}
                </Text>
                <Text style={styles.tripInfo}>
                  <Text style={styles.bold}>Vehicle:</Text> {trip.thing_name}
                </Text>
                <Text style={styles.tripInfo}>
                  <Text style={styles.bold}>Driver:</Text> {trip.driver}
                </Text>
                <Text style={styles.tripInfo}>
                  <Text style={styles.bold}>Scheduled:</Text>{' '}
                  {trip.scheduled_datetime}
                </Text>
                <Text style={styles.tripInfo}>
                  <Text style={styles.bold}>Distance:</Text>{' '}
                  {trip.estimated_distance} km
                </Text>
                <Text style={[styles.tripInfo, {color: statusInfo.color}]}>
                  <Text style={styles.bold}>Status:</Text> {statusInfo.text}
                </Text>

                <View style={styles.expenseList}>
                  {tripExpenses.length > 0 ? (
                    tripExpenses.map(expense => (
                      <View
                        key={expense.trip_expense_entry_id}
                        style={styles.expenseItem}>
                        <View style={styles.expenseRow}>
                          <Text style={styles.label}>
                            {expense.expense_name}
                          </Text>
                          <Text style={styles.amount}>₹ {expense.amount}</Text>
                        </View>
                        {expense.remarks && (
                          <Text style={styles.remarks}>{expense.remarks}</Text>
                        )}
                        {expense.receipt && (
                          <Text style={styles.receiptText}>
                            Receipt attached
                          </Text>
                        )}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noExpense}>No expenses added yet.</Text>
                  )}
                </View>

                {trip.trip_status === 'in_progress' && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddExpense(trip.trip_id)}>
                    <Text style={styles.addButtonText}>Add New Expense</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContentWrapper}>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>Add Expense</Text>

              {categoryItems.length > 0 ? (
                <View style={styles.dropdownWrapper}>
                  <Text style={styles.label}>Category</Text>
                  <DropDownPicker
                    open={categoryOpen}
                    value={category}
                    items={categoryItems}
                    setOpen={setCategoryOpen}
                    setValue={setCategory}
                    setItems={setCategoryItems}
                    placeholder="Select category"
                    zIndex={3000}
                    zIndexInverse={1000}
                  />
                </View>
              ) : (
                <Text style={styles.noCategoriesText}>
                  No expense categories available
                </Text>
              )}

              <View style={styles.inputItem}>
                <Text style={styles.label}>Date</Text>
                <Calendar
                markedDates={markedDates}
                onDayPress={handleDayPress}
                theme={{
                  selectedDayBackgroundColor: '#0284c7',
                  todayTextColor: '#0284c7',
                  arrowColor: '#0284c7',
                }}
                hideExtraDays={true}
                firstDay={1}
                style={styles.calendar}
           


                />

              </View>

              <View style={styles.inputItem}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  placeholder="Enter amount"
                  placeholderTextColor={'#9ca3af'}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputItem}>
                <Text style={styles.label}>Remarks</Text>
                <TextInput
                  placeholder="Remarks (optional)"
                  placeholderTextColor={'#9ca3af'}
                  value={remarks}
                  onChangeText={setRemarks}
                  style={styles.input}
                  multiline
                />
              </View>

              <View style={{...styles.inputItem, marginBottom: 16}}>
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
                        <Icon
                          name="insert-drive-file"
                          size={40}
                          color="#0284c7"
                        />
                        <Text style={styles.fileName} numberOfLines={1}>
                          {attachments[0].name}
                        </Text>
                      </View>
                    )}
                    <View style={styles.attachmentActions}>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={removeAttachment}>
                        <Icon name="close" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.attachmentButton}
                    onPress={handleAttachment}>
                    <Text style={styles.attachmentButtonText}>Choose File</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={[styles.modalButton, {backgroundColor: '#9ca3af'}]}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={submitExpense}
                  disabled={categoryItems.length === 0}
                  style={[
                    styles.modalButton,
                    {
                      backgroundColor:
                        categoryItems.length === 0 ? '#9ca3af' : '#0284c7',
                    },
                  ]}>
                  <Text style={styles.modalButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9fafb',
    flexGrow: 1,
  },
  
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  tripCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  tripInfo: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
  },
  expenseList: {
    marginTop: 12,
  },
  expenseItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputItem: {
    flex: 1,
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  remarks: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  receiptText: {
    fontSize: 12,
    color: '#0284c7',
    marginTop: 4,
  },
  noExpense: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
  },
  modalContentWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  modalContent: {
    padding: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  dropdownWrapper: {
    zIndex: 3000,
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
  },
  noTripsText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16,
    marginTop: 20,
  },
  noCategoriesText: {
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 15,
  },
  attachmentPreviewContainer: {
    borderWidth: 1,
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
    borderWidth: 1,
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
});

export default TripExpenses;
