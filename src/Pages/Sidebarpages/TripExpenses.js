import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import Header from '../../components/Header';

const TripExpenses = ({navigation}) => {
  const handleAddExpense = () => {
    console.log('Add Expense triggered');
    // Navigate to add expense form or open modal
  };

  return (
    <>
      <StatusBar backgroundColor={'#0284c7'} barStyle="light-content" />
      <Header
        title="Trip Expenses"
        onMenuPress={() => navigation.openDrawer()}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Expenses Summary</Text>

        {/* Sample Expense Item */}
        <View style={styles.expenseItem}>
          <Text style={styles.label}>Fuel</Text>
          <Text style={styles.amount}>₹ 2,500</Text>
        </View>

        <View style={styles.expenseItem}>
          <Text style={styles.label}>Toll Charges</Text>
          <Text style={styles.amount}>₹ 600</Text>
        </View>

        <View style={styles.expenseItem}>
          <Text style={styles.label}>Food & Lodging</Text>
          <Text style={styles.amount}>₹ 1,200</Text>
        </View>

        {/* Add Expense Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
          <Text style={styles.addButtonText}>Add New Expense</Text>
        </TouchableOpacity>
      </ScrollView>
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
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  expenseItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  addButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
