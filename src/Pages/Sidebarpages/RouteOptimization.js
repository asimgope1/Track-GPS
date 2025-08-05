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

const RouteOptimization = ({navigation}) => {
  const handleOptimize = () => {
    console.log('Route optimization triggered');
    // Trigger route optimization logic
  };

  return (
    <>
      <StatusBar backgroundColor={'#0284c7'} barStyle="light-content" />
      <Header
        title="Route Optimization"
        onMenuPress={() => navigation.openDrawer()}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Optimized Route Overview</Text>

        {/* Example Info Blocks */}
        <View style={styles.infoBox}>
          <Text style={styles.label}>Starting Point:</Text>
          <Text style={styles.value}>Warehouse A</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Destination:</Text>
          <Text style={styles.value}>Retail Store B</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Estimated Time:</Text>
          <Text style={styles.value}>2 hrs 15 mins</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Optimized Distance:</Text>
          <Text style={styles.value}>120 km</Text>
        </View>

        {/* Optimization Button */}
        <TouchableOpacity
          style={styles.optimizeButton}
          onPress={handleOptimize}>
          <Text style={styles.optimizeButtonText}>Optimize Route</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

export default RouteOptimization;

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
  infoBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  optimizeButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  optimizeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
