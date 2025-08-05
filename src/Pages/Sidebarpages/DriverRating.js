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

const DriverRating = ({navigation}) => {
  const handleRateDriver = () => {
    console.log('Rate Driver button pressed');
    // Navigate to driver rating form or open modal
  };

  return (
    <>
      <StatusBar backgroundColor={'#0284c7'} barStyle="light-content" />
      <Header
        title="Driver Rating"
        onMenuPress={() => navigation.openDrawer()}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Recent Driver Ratings</Text>

        {/* Placeholder Ratings */}
        <View style={styles.ratingCard}>
          <Text style={styles.driverName}>Rajesh Kumar</Text>
          <Text style={styles.rating}>⭐️⭐️⭐️⭐️☆</Text>
        </View>

        <View style={styles.ratingCard}>
          <Text style={styles.driverName}>Anil Sharma</Text>
          <Text style={styles.rating}>⭐️⭐️⭐️☆☆</Text>
        </View>

        <View style={styles.ratingCard}>
          <Text style={styles.driverName}>Suresh Mehta</Text>
          <Text style={styles.rating}>⭐️⭐️⭐️⭐️⭐️</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRateDriver}>
          <Text style={styles.buttonText}>Rate a Driver</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

export default DriverRating;

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
  ratingCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  driverName: {
    fontSize: 16,
    color: '#374151',
  },
  rating: {
    fontSize: 18,
    color: '#facc15', // yellow stars
  },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
