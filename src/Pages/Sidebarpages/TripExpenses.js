import React, {useState} from 'react';
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
} from 'react-native';
import Header from '../../components/Header';
import DropDownPicker from 'react-native-dropdown-picker';

const TripExpenses = ({navigation}) => {
  const [trips, setTrips] = useState([
    {
      id: 1,
      vehicleNo: 'MH12AB1234',
      driver: 'Amit Kumar',
      status: 'Ongoing',
      expenses: {
        Fuel: 2500,
        Toll: 600,
      },
    },
    {
      id: 2,
      vehicleNo: 'MH12CD5678',
      driver: 'Rahul Verma',
      status: 'Upcoming',
      expenses: {},
    },
    {
      id: 3,
      vehicleNo: 'MH14EF9101',
      driver: 'Ravi Singh',
      status: 'Completed',
      expenses: {
        Fuel: 3000,
        Food: 1200,
      },
    },
  ]);

  const [selectedTripId, setSelectedTripId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([
    {label: 'Fuel', value: 'Fuel'},
    {label: 'Toll', value: 'Toll'},
    {label: 'Food', value: 'Food'},
    {label: 'Lodging', value: 'Lodging'},
    {label: 'Repair', value: 'Repair'},
  ]);

  const handleAddExpense = tripId => {
    setSelectedTripId(tripId);
    setCategory(null);
    setAmount('');
    setModalVisible(true);
  };

  const submitExpense = () => {
    if (!category || !amount || isNaN(amount)) {
      Alert.alert(
        'Invalid Input',
        'Please select a category and enter a valid amount.',
      );
      return;
    }

    const updatedTrips = trips.map(trip => {
      if (trip.id === selectedTripId) {
        const currentAmount = trip.expenses[category] || 0;
        return {
          ...trip,
          expenses: {
            ...trip.expenses,
            [category]: currentAmount + parseFloat(amount),
          },
        };
      }
      return trip;
    });

    setTrips(updatedTrips);
    setModalVisible(false);
  };

  return (
    <>
      <StatusBar backgroundColor={'#0284c7'} barStyle="light-content" />
      <Header
        title="Trip Expenses"
        onMenuPress={() => navigation.openDrawer()}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Trip Expenses Overview</Text>

        {trips.map(trip => (
          <View key={trip.id} style={styles.tripCard}>
            <Text style={styles.tripInfo}>
              <Text style={styles.bold}>Vehicle:</Text> {trip.vehicleNo}
            </Text>
            <Text style={styles.tripInfo}>
              <Text style={styles.bold}>Driver:</Text> {trip.driver}
            </Text>
            <Text style={[styles.tripInfo, styles.status]}>
              Status: {trip.status}
            </Text>

            <View style={styles.expenseList}>
              {Object.entries(trip.expenses).length > 0 ? (
                Object.entries(trip.expenses).map(([label, value]) => (
                  <View key={label} style={styles.expenseItem}>
                    <Text style={styles.label}>{label}</Text>
                    <Text style={styles.amount}>₹ {value}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noExpense}>No expenses added yet.</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddExpense(trip.id)}>
              <Text style={styles.addButtonText}>Add New Expense</Text>
            </TouchableOpacity>
          </View>
        ))}
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

              <View style={styles.dropdownWrapper}>
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

              <TextInput
                placeholder="Enter amount"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                style={styles.input}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={[styles.modalButton, {backgroundColor: '#9ca3af'}]}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={submitExpense}
                  style={[styles.modalButton, {backgroundColor: '#0284c7'}]}>
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

export default TripExpenses;

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
  status: {
    fontStyle: 'italic',
    color: '#2563eb',
  },
  expenseList: {
    marginTop: 12,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontSize: 15,
    color: '#374151',
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
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
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
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
    marginTop: 12,
    fontSize: 16,
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
  dropdown: {
    marginBottom: 10,
    zIndex: 1000,
  },
  modalContentWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },

  dropdownWrapper: {
    zIndex: 3000, // Ensures dropdown overlays other UI
    marginBottom: 15,
  },
});
