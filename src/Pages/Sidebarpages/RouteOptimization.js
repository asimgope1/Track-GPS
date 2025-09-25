import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Modal,
  Switch,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Header from '../../components/Header';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Toast from 'react-native-toast-message';

const RouteOptimization = ({ navigation }) => {
  // API Configuration - Store these securely in environment variables
  const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImRhZmY2MTE0ZmNhYzRhZjViYTUyZjY0ZWMyMTRlYTI5IiwiaCI6Im11cm11cjY0In0=';
  const GOOGLE_PLACES_API_KEY = 'AIzaSyDjCX0hCACCUVwfOsI5uWVouJv7rJtGgn0';

  // Dynamic vehicle types with different parameters
  const VEHICLE_TYPES = {
    TRUCK: {
      name: 'Heavy Truck',
      mileage: 4, // km per litre
      avgSpeed: 40, // km/h
      color: '#dc2626',
      icon: 'local-shipping'
    },
    LORRY: {
      name: 'Medium Lorry',
      mileage: 6,
      avgSpeed: 50,
      color: '#ea580c',
      icon: 'fire-truck'
    },
    VAN: {
      name: 'Delivery Van',
      mileage: 8,
      avgSpeed: 60,
      color: '#0284c7',
      icon: 'local-shipping'
    },
    CAR: {
      name: 'Car',
      mileage: 12,
      avgSpeed: 70,
      color: '#16a34a',
      icon: 'directions-car'
    }
  };

  // State for dynamic data
  const [stops, setStops] = useState([]);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [routeDetails, setRouteDetails] = useState({
    distance: 'N/A',
    time: 'N/A',
    fuelCost: 'N/A',
    efficiency: 'N/A',
    co2Emission: 'N/A',
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [settings, setSettings] = useState({
    avoidTolls: false,
    avoidHighways: false,
    prioritizeTime: true,
    trafficAware: true,
    optimizationLevel: 5,
    vehicleType: 'TRUCK',
    dieselPrice: 100, // ₹ per litre
    workingHours: 8, // hours per day
  });
  const [showSettings, setShowSettings] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [errors, setErrors] = useState({ stops: '', general: '' });
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [routeName, setRouteName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isPlacesFocused, setIsPlacesFocused] = useState(false);

  const mapRef = useRef(null);
  const placesRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Initialize with current location or default
  useEffect(() => {
    initializeCurrentLocation();
    loadSavedRoutes();
  }, []);

  const initializeCurrentLocation = async () => {
    // In a real app, you'd use geolocation here
    const defaultStops = [
      {
        id: 1,
        name: 'Warehouse Mumbai',
        coordinates: { latitude: 19.0760, longitude: 72.8777 },
        address: 'Mumbai, Maharashtra',
      },
      {
        id: 2,
        name: 'Delivery Point Pune',
        coordinates: { latitude: 18.5204, longitude: 73.8567 },
        address: 'Pune, Maharashtra',
      },
    ];
    setStops(defaultStops);
  };

  const loadSavedRoutes = async () => {
    // Load from AsyncStorage or API
    const routes = []; // Placeholder
    setSavedRoutes(routes);
  };

  // Enhanced validation
  const validateStops = () => {
    const newErrors = { stops: '', general: '' };
    let isValid = true;

    if (stops.length < 2) {
      newErrors.stops = 'At least 2 stops are required';
      isValid = false;
    }

    // Check distance between stops
    if (stops.length >= 2) {
      const maxDistance = 1000; // km
      for (let i = 0; i < stops.length - 1; i++) {
        const distance = calculateDistance(stops[i].coordinates, stops[i + 1].coordinates);
        if (distance > maxDistance) {
          newErrors.stops = `Distance between ${stops[i].name} and ${stops[i + 1].name} is too large (${distance.toFixed(1)}km)`;
          isValid = false;
          break;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Enhanced route optimization with multiple algorithms
  const handleOptimize = async () => {
    if (!validateStops()) {
      showToast('error', 'Validation Error', errors.stops);
      return;
    }

    setIsOptimizing(true);
    setErrors({ ...errors, general: '' });

    try {
      const vehicle = VEHICLE_TYPES[settings.vehicleType];
      
      // Get actual route data from ORS API
      const routeData = await getRouteFromAPI(stops, settings);
      
      if (!routeData || !routeData.coordinates) {
        throw new Error('Failed to get route data from API');
      }

      const totalDistance = routeData.distance / 1000; // Convert meters to km
      const totalTime = routeData.duration / 3600; // Convert seconds to hours
      const fuelCost = ((totalDistance / vehicle.mileage) * settings.dieselPrice).toFixed(2);
      const co2Emission = (totalDistance * 0.21).toFixed(2); // kg CO2 per km for diesel

      const hours = Math.floor(totalTime);
      const minutes = Math.floor((totalTime % 1) * 60);
      const days = Math.floor(totalTime / settings.workingHours);

      setRouteDetails({
        distance: `${totalDistance.toFixed(2)} km`,
        time: formatTime(totalTime, days, hours, minutes),
        fuelCost: `₹${fuelCost}`,
        efficiency: `${Math.min(100, Math.floor((vehicle.avgSpeed / 80) * 100))}%`,
        co2Emission: `${co2Emission} kg`,
        estimatedDays: days,
      });

      setOptimizedRoute({
        coordinates: routeData.coordinates,
        strokeColor: vehicle.color,
        strokeWidth: 4,
      });

      showToast('success', 'Route Optimized', `Optimized for ${vehicle.name}`);
      
    } catch (error) {
      console.error('Optimization error:', error);
      setErrors({ ...errors, general: error.message });
      showToast('error', 'Optimization Failed', error.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Get actual route data from OpenRouteService API
  const getRouteFromAPI = async (stops, settings) => {
    if (stops.length < 2) return null;

    try {
      const coordinates = stops.map(stop => 
        [stop.coordinates.longitude, stop.coordinates.latitude]
      );

      const profile = settings.vehicleType === 'TRUCK' ? 'driving-hgv' : 
                      settings.vehicleType === 'LORRY' ? 'driving-hgv' : 
                      settings.vehicleType === 'VAN' ? 'driving-van' : 'driving-car';
      
      const options = {
        coordinates: coordinates,
        profile: profile,
        format: 'geojson',
        preference: settings.prioritizeTime ? 'fastest' : 'shortest',
        instructions: false,
        units: 'm',
      };

      if (settings.avoidTolls) {
        options.avoid_features = [...(options.avoid_features || []), 'toll'];
      }
      if (settings.avoidHighways) {
        options.avoid_features = [...(options.avoid_features || []), 'highway'];
      }

      // Add optimize_waypoints for route optimization
      if (stops.length > 2) {
        options.optimize_waypoints = true;
      }

      const body = JSON.stringify(options);
      const response = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}`, {
        method: 'POST',
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: body,
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.features && data.features[0]) {
        const route = data.features[0];
        const geometry = route.geometry.coordinates;
        const coordinates = geometry.map(coord => ({
          latitude: coord[1],
          longitude: coord[0]
        }));

        return {
          coordinates,
          distance: route.properties.segments[0].distance,
          duration: route.properties.segments[0].duration
        };
      }
      
      return null;
    } catch (error) {
      console.error('ORS API Error:', error);
      // Fallback to simulated data if API fails
      return getSimulatedRouteData(stops);
    }
  };

  // Fallback simulated route data
  const getSimulatedRouteData = (stops) => {
    const coordinates = [];
    stops.forEach((stop, index) => {
      coordinates.push(stop.coordinates);
      if (index < stops.length - 1) {
        const nextStop = stops[index + 1];
        const steps = 10;
        for (let i = 1; i < steps; i++) {
          const ratio = i / steps;
          coordinates.push({
            latitude: stop.coordinates.latitude + (nextStop.coordinates.latitude - stop.coordinates.latitude) * ratio,
            longitude: stop.coordinates.longitude + (nextStop.coordinates.longitude - stop.coordinates.longitude) * ratio,
          });
        }
      }
    });

    const totalDistance = calculateTotalDistance(stops) * 1000; // Convert to meters
    const vehicle = VEHICLE_TYPES[settings.vehicleType];
    const totalTime = (totalDistance / 1000) / vehicle.avgSpeed * 3600; // Convert to seconds

    return {
      coordinates,
      distance: totalDistance,
      duration: totalTime
    };
  };

  const calculateTotalDistance = (stops) => {
    let total = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      total += calculateDistance(stops[i].coordinates, stops[i + 1].coordinates);
    }
    return total;
  };

  const formatTime = (totalHours, days, hours, minutes) => {
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
  };

  // Enhanced place selection with better error handling
  const addStopFromPlace = (data, details = null) => {
    try {
      if (!data || !details) {
        showToast('error', 'Invalid Data', 'Please select a valid location from the list');
        return;
      }

      const location = details.geometry?.location;
      if (!location || !location.lat || !location.lng) {
        showToast('error', 'Invalid Location', 'Could not get coordinates for this location');
        return;
      }

      const placeName = data.structured_formatting?.main_text || 
                       data.structured_formatting?.secondary_text || 
                       data.description || 
                       'Unknown Location';

      const address = data.description || 'Address not available';

      const newStop = {
        id: Date.now(),
        name: placeName,
        address: address,
        coordinates: {
          latitude: location.lat,
          longitude: location.lng,
        },
      };

      setStops(prev => [...prev, newStop]);
      showToast('success', 'Stop Added', `${placeName} added to route`);

      // Clear the input field
      if (placesRef.current) {
        placesRef.current.setAddressText('');
      }

      // Auto-focus map to new stop after a short delay
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            ...newStop.coordinates,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 1000);
        }
      }, 500);

      // Scroll to bottom to show new stop
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }

    } catch (error) {
      console.error('Error adding stop:', error);
      showToast('error', 'Error', 'Failed to add location to route');
    }
  };

  // Fit map to show all stops
  const fitMapToStops = () => {
    if (mapRef.current && stops.length > 0) {
      mapRef.current.fitToCoordinates(
        stops.map(stop => stop.coordinates),
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  };

  // Update stop coordinates
  const updateStopCoordinates = (id, newCoordinates) => {
    setStops(prev => prev.map(stop => 
      stop.id === id ? { ...stop, coordinates: newCoordinates } : stop
    ));
  };

  // Save and load routes
  const saveCurrentRoute = () => {
    if (!routeName.trim()) {
      showToast('error', 'Validation Error', 'Please enter a route name');
      return;
    }

    if (stops.length < 2) {
      showToast('error', 'Validation Error', 'At least 2 stops are required to save a route');
      return;
    }

    const routeToSave = {
      id: Date.now(),
      name: routeName,
      stops: [...stops],
      optimizedRoute,
      routeDetails,
      settings: { ...settings },
      createdAt: new Date().toISOString(),
    };

    setSavedRoutes(prev => [...prev, routeToSave]);
    setShowSaveModal(false);
    setRouteName('');
    showToast('success', 'Route Saved', `${routeName} has been saved`);
  };

  const loadSavedRoute = (route) => {
    setStops(route.stops);
    setOptimizedRoute(route.optimizedRoute);
    setRouteDetails(route.routeDetails);
    setSettings(route.settings);
    setShowSettings(false);
    showToast('info', 'Route Loaded', `${route.name} has been loaded`);

    // Auto-fit map to show all stops
    setTimeout(() => {
      fitMapToStops();
    }, 500);
  };

  // Toast utility
  const showToast = (type, text1, text2) => {
    Toast.show({ type, text1, text2, position: 'top' });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar backgroundColor="#0284c7" barStyle="light-content" />
      <Header
        title="Route Optimization"
        onMenuPress={() => navigation.openDrawer()}
        rightIcon="save"
        onRightPress={() => setShowSaveModal(true)}
      />

      <ScrollView 
        ref={scrollViewRef}
        style={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Vehicle Selection Quick Bar */}
        <View style={styles.vehicleBar}>
          {Object.entries(VEHICLE_TYPES).map(([key, vehicle]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.vehicleOption,
                settings.vehicleType === key && styles.vehicleOptionSelected
              ]}
              onPress={() => setSettings(prev => ({ ...prev, vehicleType: key }))}
            >
              <Icon 
                name={vehicle.icon} 
                size={20} 
                color={settings.vehicleType === key ? '#fff' : vehicle.color} 
              />
              <Text style={[
                styles.vehicleText,
                settings.vehicleType === key && styles.vehicleTextSelected
              ]}>
                {vehicle.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Interactive Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            showsTraffic={settings.trafficAware}
            showsUserLocation={true}
            initialRegion={{
              latitude: 19.0760,
              longitude: 72.8777,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}
            onLayout={fitMapToStops}
          >
            {stops.map((stop, index) => (
              <Marker
                key={stop.id}
                coordinate={stop.coordinates}
                title={`${index + 1}. ${stop.name}`}
                description={stop.address}
                pinColor={index === 0 ? '#16a34a' : index === stops.length - 1 ? '#dc2626' : '#0284c7'}
                onPress={() => setSelectedStop(stop)}
              >
                <View style={styles.markerContainer}>
                  <Text style={styles.markerText}>{index + 1}</Text>
                </View>
              </Marker>
            ))}
            {optimizedRoute && (
              <Polyline
                coordinates={optimizedRoute.coordinates}
                strokeColor={optimizedRoute.strokeColor}
                strokeWidth={optimizedRoute.strokeWidth}
              />
            )}
          </MapView>
          
          {/* Map Controls */}
          <TouchableOpacity 
            style={styles.mapControl}
            onPress={fitMapToStops}
          >
            <Icon name="my-location" size={20} color="#0284c7" />
          </TouchableOpacity>
        </View>

        {/* Dynamic Route Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="speed" size={20} color="#0284c7" />
            <Text style={styles.statValue}>{routeDetails.distance}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="schedule" size={20} color="#0284c7" />
            <Text style={styles.statValue}>{routeDetails.time}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="local-gas-station" size={20} color="#0284c7" />
            <Text style={styles.statValue}>{routeDetails.fuelCost}</Text>
            <Text style={styles.statLabel}>Fuel Cost</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="eco" size={20} color="#0284c7" />
            <Text style={styles.statValue}>{routeDetails.co2Emission}</Text>
            <Text style={styles.statLabel}>CO₂</Text>
          </View>
        </View>

        {/* Google Places Autocomplete - Moved to top for better visibility */}
        <View style={styles.placesContainer}>
          <GooglePlacesAutocomplete
            ref={placesRef}
            placeholder="Search for a location..."
            onPress={addStopFromPlace}
            fetchDetails={true}
            query={{
              key: GOOGLE_PLACES_API_KEY,
              language: 'en',
              types: 'geocode',
              components: 'country:in',
            }}
            enablePoweredByContainer={false}
            styles={placesStyles}
            debounce={400}
            minLength={2}
            onFail={error => {
              console.error('Google Places Error:', error);
              showToast('error', 'Search Failed', 'Unable to fetch location data');
            }}
            onNotFound={() => {
              showToast('info', 'No Results', 'No locations found for your search');
            }}
            textInputProps={{
              onFocus: () => setIsPlacesFocused(true),
              onBlur: () => setIsPlacesFocused(false),
            }}
            predefinedPlaces={[
              {
                description: 'Mumbai, Maharashtra',
                geometry: { location: { lat: 19.0760, lng: 72.8777 } },
              },
              {
                description: 'Pune, Maharashtra',
                geometry: { location: { lat: 18.5204, lng: 73.8567 } },
              },
              {
                description: 'Delhi, India',
                geometry: { location: { lat: 28.6139, lng: 77.2090 } },
              },
              {
                description: 'Bangalore, Karnataka',
                geometry: { location: { lat: 12.9716, lng: 77.5946 } },
              },
            ]}
          />
        </View>

        {/* Stops Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Route Stops ({stops.length})</Text>
            <View style={styles.sectionHeaderActions}>
              <TouchableOpacity onPress={fitMapToStops} style={styles.iconButton}>
                <Icon name="my-location" size={18} color="#0284c7" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStops([])} style={styles.iconButton}>
                <Icon name="clear" size={18} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stopsScrollView}>
            <View style={styles.stopsContainer}>
              {stops.map((stop, index) => (
                <View key={stop.id} style={styles.stopCard}>
                  <View style={styles.stopHeader}>
                    <Text style={styles.stopNumber}>{index + 1}</Text>
                    <TouchableOpacity 
                      onPress={() => setStops(prev => prev.filter(s => s.id !== stop.id))}
                      style={styles.deleteButton}
                    >
                      <Icon name="close" size={16} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.stopName} numberOfLines={1}>{stop.name}</Text>
                  <Text style={styles.stopAddress} numberOfLines={2}>{stop.address}</Text>
                </View>
              ))}
              <TouchableOpacity 
                style={styles.addStopCard} 
                onPress={() => {
                  if (placesRef.current) {
                    placesRef.current.focus();
                  }
                }}
              >
                <Icon name="add" size={24} color="#0284c7" />
                <Text style={styles.addStopText}>Add Stop</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setShowSettings(true)}
          >
            <Icon name="tune" size={20} color="#0284c7" />
            <Text style={styles.secondaryButtonText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton, (isOptimizing || stops.length < 2) && styles.disabledButton]}
            onPress={handleOptimize}
            disabled={isOptimizing || stops.length < 2}
          >
            {isOptimizing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="route" size={20} color="#fff" /> 
                <Text style={styles.primaryButtonText}>
                  {stops.length < 2 ? 'Add More Stops' : 'Optimize Route'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Saved Routes */}
        {savedRoutes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Routes</Text>
            {savedRoutes.map(route => (
              <TouchableOpacity key={route.id} style={styles.savedRoute} onPress={() => loadSavedRoute(route)}>
                <Icon name="route" size={20} color="#0284c7" />
                <View style={styles.routeInfo}>
                  <Text style={styles.routeName}>{route.name}</Text>
                  <Text style={styles.routeDetails}>{route.stops.length} stops • {route.routeDetails.distance}</Text>
                </View>
                <Text style={styles.routeDate}>{new Date(route.createdAt).toLocaleDateString()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Enhanced Settings Modal */}
      <Modal visible={showSettings} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Optimization Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Icon name="close" size={24} color="#0284c7" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {/* Vehicle Settings */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingGroupTitle}>Vehicle Settings</Text>
              <Text style={styles.settingLabel}>Diesel Price (₹/liter)</Text>
              <TextInput
                style={styles.input}
                value={settings.dieselPrice.toString()}
                onChangeText={(text) => setSettings(prev => ({ ...prev, dieselPrice: parseFloat(text) || 0 }))}
                keyboardType="numeric"
              />
              
              <Text style={styles.settingLabel}>Working Hours per Day</Text>
              <Slider
                value={settings.workingHours}
                onValueChange={(value) => setSettings(prev => ({ ...prev, workingHours: value }))}
                minimumValue={1}
                maximumValue={24}
                step={1}
              />
              <Text style={styles.sliderValue}>{settings.workingHours} hours</Text>
            </View>

            {/* Route Preferences */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingGroupTitle}>Route Preferences</Text>
              {['avoidTolls', 'avoidHighways', 'trafficAware'].map(setting => (
                <View key={setting} style={styles.switchSetting}>
                  <Text style={styles.switchLabel}>
                    {setting === 'avoidTolls' && 'Avoid Toll Roads'}
                    {setting === 'avoidHighways' && 'Avoid Highways'}
                    {setting === 'trafficAware' && 'Use Traffic Data'}
                  </Text>
                  <Switch
                    value={settings[setting]}
                    onValueChange={() => setSettings(prev => ({ ...prev, [setting]: !prev[setting] }))}
                  />
                </View>
              ))}
            </View>

            {/* Optimization Level */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingGroupTitle}>Optimization Level</Text>
              <Slider
                value={settings.optimizationLevel}
                onValueChange={(value) => setSettings(prev => ({ ...prev, optimizationLevel: value }))}
                minimumValue={1}
                maximumValue={10}
                step={1}
              />
              <Text style={styles.sliderValue}>Level {settings.optimizationLevel}</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Save Route Modal */}
      <Modal visible={showSaveModal} transparent animationType="fade">
        <View style={styles.centerModal}>
          <View style={styles.saveModalContent}>
            <Text style={styles.modalTitle}>Save Route</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter route name"
              value={routeName}
              onChangeText={setRouteName}
              maxLength={50}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSaveModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={saveCurrentRoute}
              >
                <Text style={styles.saveModalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  vehicleBar: { flexDirection: 'row', padding: 10, backgroundColor: '#fff' },
  vehicleOption: { 
    flex: 1, alignItems: 'center', padding: 8, borderRadius: 8, marginHorizontal: 2,
    borderWidth: 1, borderColor: '#e2e8f0'
  },
  vehicleOptionSelected: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  vehicleText: { fontSize: 12, marginTop: 4, color: '#64748b' },
  vehicleTextSelected: { color: '#fff' },
  mapContainer: { height: 300, margin: 10, borderRadius: 12, overflow: 'hidden' },
  map: { flex: 1 },
  mapControl: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statsContainer: { 
    flexDirection: 'row', backgroundColor: '#fff', margin: 10, padding: 16, borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginTop: 4 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  section: { margin: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b' },
  sectionHeaderActions: { flexDirection: 'row' },
  iconButton: { padding: 5, marginLeft: 5 },
  stopsScrollView: { maxHeight: 120 },
  stopsContainer: { flexDirection: 'row' },
  stopCard: { 
    width: 150, backgroundColor: '#fff', padding: 12, marginRight: 10, borderRadius: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2
  },
  stopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stopNumber: { 
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#0284c7', 
    color: '#fff', textAlign: 'center', fontSize: 12, lineHeight: 20 
  },
  stopName: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginTop: 4 },
  stopAddress: { fontSize: 12, color: '#64748b', marginTop: 2 },
  ratingContainer: { 
    flexDirection: 'row', alignItems: 'center', marginTop: 4 
  },
  ratingText: { fontSize: 10, color: '#f59e0b', marginLeft: 4 },
  addStopCard: { 
    width: 150, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', 
    borderStyle: 'dashed', borderRadius: 8, justifyContent: 'center', alignItems: 'center'
  },
  addStopText: { color: '#0284c7', marginTop: 4, fontSize: 12 },
  placesContainer: { margin: 10, backgroundColor: '#fff', borderRadius: 12, padding: 10 },
  searchHeader: { 
    flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingHorizontal: 5 
  },
  searchTitle: { 
    fontSize: 16, fontWeight: '600', color: '#1e293b', marginLeft: 8 
  },
  actionButtons: { flexDirection: 'row', margin: 10, gap: 10 },
  button: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, gap: 8 },
  primaryButton: { backgroundColor: '#0284c7' },
  secondaryButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1' },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  secondaryButtonText: { color: '#0284c7', fontWeight: '600' },
  savedRoute: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, 
    borderRadius: 8, marginBottom: 8 
  },
  routeInfo: { flex: 1, marginLeft: 12 },
  routeName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  routeDetails: { fontSize: 12, color: '#64748b' },
  routeDate: { fontSize: 12, color: '#94a3b8' },
  modalContainer: { flex: 1, backgroundColor: '#f8fafc' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalTitle: { fontSize: 20, fontWeight: '600', color: '#1e293b' },
  settingGroup: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  settingGroupTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 12 },
  settingLabel: { fontSize: 14, color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 16 },
  switchSetting: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  switchLabel: { fontSize: 16, color: '#1e293b' },
  sliderValue: { textAlign: 'center', color: '#64748b', marginTop: 8 },
  centerModal: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  saveModalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '80%' },
  textInput: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginVertical: 10 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f1f5f9' },
  saveModalButton: { backgroundColor: '#0284c7' },
  cancelButtonText: { color: '#64748b', fontWeight: '600' },
  saveModalButtonText: { color: '#fff', fontWeight: '600' },
  markerContainer: { 
    backgroundColor: '#0284c7', width: 24, height: 24, borderRadius: 12, 
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff'
  },
  markerText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  deleteButton: { padding: 2 },
  // New styles for enhanced search
  emptyResults: { 
    padding: 20, alignItems: 'center' 
  },
  emptyText: { 
    color: '#64748b', fontSize: 14 
  },
  resultRow: { 
    flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  resultIcon: { 
    marginRight: 12 
  },
  resultInfo: { 
    flex: 1 
  },
  resultPrimary: { 
    fontSize: 16, fontWeight: '500', color: '#1e293b' 
  },
  resultSecondary: { 
    fontSize: 14, color: '#64748b', marginTop: 2 
  },
  searchingIndicator: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    padding: 10, backgroundColor: '#f8fafc', borderRadius: 8, marginTop: 5 
  },
  searchingText: { 
    marginLeft: 8, color: '#64748b', fontSize: 14 
  }
});

const placesStyles = {
  container: { flex: 0 },
  textInputContainer: { 
    backgroundColor: 'transparent', 
    borderBottomWidth: 0 
  },
  textInput: { 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    paddingHorizontal: 16, 
    fontSize: 16,
    borderWidth: 1, 
    borderColor: '#cbd5e1',
    height: 50,
    color: '#000', // 👈 ensures typed text is visible
  },
  description: {
    fontSize: 16,
    color: '#000', // 👈 ensures search results text is visible
  },
  listView: { 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    maxHeight: 200,
    zIndex: 999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    padding: 10,
  }
};


export default RouteOptimization;