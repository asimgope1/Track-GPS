import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { pick } from '@react-native-documents/picker';
import { Icon } from '@rneui/themed';
import { useStatusBarHeight } from '../../constants/config';
import { BASE_URL } from '../../constants/url';
import { GETNETWORK, POSTNETWORK } from '../../utils/Network';
import { getObjByKey } from '../../utils/Storage';
import { Calendar } from 'react-native-calendars';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import { useAppTheme } from '../../theme/ThemeContext';
import { makeFormStyles } from '../../styles/FormStyles';

const TripExpenses = ({ navigation, onClose }) => {
  const { theme, isDark } = useAppTheme();
  const formStyles = makeFormStyles(theme);
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const statusBarHeight = useStatusBarHeight();
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
      topOffset: statusBarHeight,
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
        selectedColor: theme.colors.primary,
        selectedTextColor: theme.colors.white,
      },
    });

    // Clear date error if any
    setFormErrors(prev => ({ ...prev, date: null }));
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
        selectedTextColor: theme.colors.whitefff,
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
        return { color: '#2563eb', text: 'Ongoing', bgColor: '#dbeafe' };
      case 'scheduled':
        return { color: '#d97706', text: 'Scheduled', bgColor: '#fef3c7' };
      case 'completed':
        return { color: '#059669', text: 'Completed', bgColor: '#d1fae5' };
      case 'cancelled':
        return { color: '#dc2626', text: 'Cancelled', bgColor: '#fee2e2' };
      default:
        return { color: theme.colors.textSecondary, text: status, bgColor: '#f3f4f6' };
    }
  };

  const handleRefresh = () => {
    fetchData(false);
  };

  if (loading || categoriesLoading) {
    return (
      <View style={formStyles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={formStyles.loadingText}>Loading trip expenses...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={formStyles.errorContainer}>
        <Icon name="error-outline" size={48} color={theme.colors.error} />
        <Text style={[formStyles.modalTitle, { marginTop: theme.spacing.sm }]}>Error loading data</Text>
        <Text style={formStyles.errorSubText}>{error}</Text>
        <TouchableOpacity style={formStyles.retryButton} onPress={() => fetchData()}>
          <Text style={formStyles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? 'light-content' : 'dark-content'} />
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
            <Text style={styles.pageTitle}>Trip Expenses Overview</Text>
            <Text style={styles.pageSubtitle}>
              {trips.length} trip(s) found • Total expenses: ₹{expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0).toFixed(2)}
            </Text>
          </View>

          {trips.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="receipt-long" size={64} color={theme.colors.textMuted} />
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
                      <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
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
                      <Icon name="directions-car" size={16} color={theme.colors.textMuted} />
                      <Text style={styles.detailText}>{trip.thing_name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="person" size={16} color={theme.colors.textMuted} />
                      <Text style={styles.detailText}>{trip.driver}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="schedule" size={16} color={theme.colors.textMuted} />
                      <Text style={styles.detailText}>{trip.scheduled_datetime}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="speed" size={16} color={theme.colors.textMuted} />
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
                              <Icon name="receipt" size={14} color={theme.colors.primary} />
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
                      <Icon name="add" size={20} color={theme.colors.white} />
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
        <View style={[formStyles.modalOverlay, { justifyContent: 'center' }]}>
          <View style={[formStyles.modalContainer, { margin: theme.spacing.lg, maxHeight: Dimensions.get('window').height * 0.85 }]}>
            <View style={formStyles.modalHeader}>
              <Text style={formStyles.modalTitle}>Add Expense</Text>
              <TouchableOpacity
                onPress={() => !isSubmitting && setModalVisible(false)}
                disabled={isSubmitting}
              >
                <Icon name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={formStyles.modalContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>

              {selectedTripId && (
                <View style={styles.selectedTripInfo}>
                  <Text style={styles.selectedTripText}>
                    Trip: {trips.find(t => t.trip_id === selectedTripId)?.trip_name}
                  </Text>
                </View>
              )}

              <View style={[styles.dropdownWrapper, { zIndex: categoryOpen ? zIndexCounter.current + 100 : 1 }]}>
                <Text style={formStyles.label}>Category *</Text>
                <DropDownPicker
                  open={categoryOpen}
                  value={category}
                  items={categoryItems}
                  setOpen={setCategoryOpen}
                  setValue={setCategory}
                  setItems={setCategoryItems}
                  placeholder="Select category"
                  style={[formStyles.dropdown, formErrors.category && formStyles.errorInput]}
                  dropDownContainerStyle={formStyles.dropdownContainer}
                  textStyle={formStyles.dropdownText}
                  placeholderStyle={formStyles.dropdownPlaceholder}
                  listMode="MODAL"
                  searchable={true}
                  searchablePlaceholder="Search category..."
                  onSelectItem={() => setFormErrors(prev => ({ ...prev, category: null }))}
                />
                {formErrors.category && (
                  <Text style={formStyles.errorText}>{formErrors.category}</Text>
                )}
              </View>

              <View style={formStyles.inputItem}>
                <Text style={formStyles.label}>Date *</Text>
                <Calendar
                  markedDates={markedDates}
                  onDayPress={handleDayPress}
                  theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: theme.colors.textSecondary,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: theme.colors.primary,
                dayTextColor: theme.colors.text,
                textDisabledColor: theme.colors.textMuted,
                dotColor: theme.colors.primary,
                selectedDotColor: '#FFFFFF',
                arrowColor: theme.colors.primary,
                monthTextColor: theme.colors.text,
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
              }}
                  hideExtraDays={true}
                  firstDay={1}
                  minDate={'2020-01-01'}
                  maxDate={new Date().toISOString().split('T')[0]} // No future dates
                  style={styles.calendar}
                />
                {formErrors.date && (
                  <Text style={formStyles.errorText}>{formErrors.date}</Text>
                )}
              </View>

              <View style={formStyles.inputItem}>
                <Text style={formStyles.label}>Amount *</Text>
                <TextInput
                  placeholder="Enter amount"
                  placeholderTextColor={theme.colors.textPlaceholder}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(text);
                    setFormErrors(prev => ({ ...prev, amount: null }));
                  }}
                  style={[formStyles.input, formErrors.amount && formStyles.errorInput]}
                />
                {formErrors.amount && (
                  <Text style={formStyles.errorText}>{formErrors.amount}</Text>
                )}
              </View>

              <View style={formStyles.inputItem}>
                <Text style={formStyles.label}>Remarks</Text>
                <View style={styles.commentsContainer}>
                  <TextInput
                    placeholder="Remarks (optional)"
                    placeholderTextColor={theme.colors.textPlaceholder}
                    value={remarks}
                    onChangeText={setRemarks}
                    style={[formStyles.input, formStyles.multilineInput]}
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                  />
                  <Text style={styles.charCount}>
                    {remarks.length}/200
                  </Text>
                </View>
              </View>

              <View style={formStyles.inputItem}>
                <Text style={formStyles.label}>Attachments</Text>
                {attachments?.length > 0 ? (
                  <View style={styles.attachmentPreviewContainer}>
                    {attachments[0].type?.startsWith('image/') ? (
                      <Image
                        source={{ uri: attachments[0].uri }}
                        style={styles.attachmentImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.filePreview}>
                        <Icon name="insert-drive-file" size={40} color={theme.colors.primary} />
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
                        <Icon name="close" size={20} color={theme.colors.error} />
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
                    <ActivityIndicator color={theme.colors.white} size="small" />
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

const makeStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  headerContainer: {
    marginBottom: theme.spacing.lg,
  },
  pageTitle: {
    fontSize: theme.typography.xxl,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xxs,
  },
  pageSubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
  },
  tripCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.lg,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  tripTitleContainer: {
    flex: 1,
  },
  tripName: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xxs,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.semibold,
  },
  totalExpenses: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.primary,
  },
  tripDetails: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xxs,
  },
  detailText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  expenseSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  expenseItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
  },
  expenseDate: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xxs,
  },
  amount: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.success,
  },
  remarks: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xxs,
    fontStyle: 'italic',
  },
  receiptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xxs,
  },
  receiptText: {
    fontSize: theme.typography.xs,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xxs,
  },
  noExpense: {
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: theme.spacing.md,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    marginTop: theme.spacing.sm,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    marginLeft: theme.spacing.xs,
  },
  selectedTripInfo: {
    backgroundColor: theme.colors.infoLight,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  selectedTripText: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
    color: theme.colors.primary,
  },
  dropdownWrapper: {
    marginBottom: theme.spacing.md,
  },
  commentsContainer: {
    position: 'relative',
  },
  charCount: {
    position: 'absolute',
    bottom: theme.spacing.xs,
    right: theme.spacing.sm,
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
  },
  calendar: {
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: theme.colors.textMuted,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
  },
  attachmentPreviewContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    position: 'relative',
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.radius.xs,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  fileName: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  attachmentActions: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
  },
  removeButton: {
    padding: theme.spacing.xxs,
  },
  attachmentButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: theme.typography.lg,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
    fontWeight: theme.typography.semibold,
  },
  emptyStateSubText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textPlaceholder,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
});

export default TripExpenses;