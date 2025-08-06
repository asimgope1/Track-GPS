import React, {useState, useEffect, useRef} from 'react';
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
  Alert,
} from 'react-native';
import Header from '../../components/Header';
import MapView, {Marker, Polyline} from 'react-native-maps';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

const RouteOptimization = ({navigation}) => {
  // API Configuration
  const ORS_API_KEY =
    'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImRhZmY2MTE0ZmNhYzRhZjViYTUyZjY0ZWMyMTRlYTI5IiwiaCI6Im11cm11cjY0In0=';
  const ORS_BASE_URL = 'https://api.openrouteservice.org';
  const GOOGLE_PLACES_API_KEY = 'AIzaSyChAFxD34j5ryAcBSmWtDlCGOg3AQ6Vu8w'; // Replace with your actual key

  // State for route data
  const [stops, setStops] = useState([
    {
      id: 1,
      name: 'Warehouse A',
      coordinates: {latitude: 20.296, longitude: 85.8246},
    },
    {
      id: 2,
      name: 'Retail Store B',
      coordinates: {latitude: 22.5744, longitude: 88.3629},
    },
  ]);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [routeDetails, setRouteDetails] = useState({
    distance: 'N/A',
    time: 'N/A',
    fuelCost: 'N/A',
    efficiency: 'N/A',
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [settings, setSettings] = useState({
    avoidTolls: false,
    avoidHighways: false,
    prioritizeTime: true,
    trafficAware: true,
    optimizationLevel: 5,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const placesRef = useRef(null);

  // Map region state
  const [region, setRegion] = useState({
    latitude: 20.296,
    longitude: 85.8246,
    latitudeDelta: 10,
    longitudeDelta: 10,
  });

  // Fit map to markers
  const fitToMarkers = () => {
    if (stops.length === 0 || !mapRef.current) return;

    const coordinates = stops.map(stop => stop.coordinates);
    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
      animated: true,
    });
  };

  useEffect(() => {
    fitToMarkers();
  }, [stops, optimizedRoute]);

  // Add a new stop from Google Places selection
  const addStopFromPlace = (data, details = null) => {
    if (!details) {
      setError('Could not get location details');
      return;
    }

    const newStop = {
      id: stops.length + 1,
      name: data.description.split(',')[0], // Use first part of address as name
      coordinates: {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      },
    };

    setStops([...stops, newStop]);
    setError(null);

    // Clear the input after selection
    if (placesRef.current) {
      placesRef.current.setAddressText('');
    }
  };

  // Remove a stop
  const removeStop = id => {
    if (stops.length <= 2) {
      Alert.alert(
        'Minimum Stops Required',
        'You need at least 2 stops for route optimization',
      );
      return;
    }
    setStops(stops.filter(stop => stop.id !== id));
    if (selectedStop === id) setSelectedStop(null);
  };

  // Optimize route using OpenRouteService
  const handleOptimize = async () => {
    if (stops.length < 2) {
      setError('You need at least 2 stops to optimize a route');
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      const requestBody = {
        jobs: stops.slice(1).map((stop, index) => ({
          id: stop.id,
          location: [stop.coordinates.longitude, stop.coordinates.latitude],
        })),
        vehicles: [
          {
            id: 1,
            profile: 'driving-car',
            start: [
              stops[0].coordinates.longitude,
              stops[0].coordinates.latitude,
            ],
            end: [
              stops[stops.length - 1].coordinates.longitude,
              stops[stops.length - 1].coordinates.latitude,
            ],
          },
        ],
        options: {
          avoid_tolls: settings.avoidTolls,
          avoid_highways: settings.avoidHighways,
        },
      };

      const response = await fetch(`${ORS_BASE_URL}/optimization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: ORS_API_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Optimization failed');
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];

        // Get detailed geometry for the route
        const geometryResponse = await fetch(
          `${ORS_BASE_URL}/v2/directions/driving-car/geojson`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: ORS_API_KEY,
            },
            body: JSON.stringify({
              coordinates: route.steps.map(step => step.location),
            }),
          },
        );

        const geometryData = await geometryResponse.json();

        if (geometryData.features && geometryData.features.length > 0) {
          const coordinates = geometryData.features[0].geometry.coordinates.map(
            coord => ({
              latitude: coord[1],
              longitude: coord[0],
            }),
          );

          setOptimizedRoute({
            coordinates,
            strokeColor: '#0284c7',
            strokeWidth: 4,
          });

          // Calculate route metrics
          const distanceInKm =
            geometryData.features[0].properties.segments[0].distance / 1000;
          const durationInSeconds = route.duration;
          const durationInHours = durationInSeconds / 3600;

          const hours = Math.floor(durationInHours);
          const minutes = Math.floor((durationInHours % 1) * 60);

          // Indian truck parameters
          const mileage = 5; // km per litre (typical truck efficiency)
          const dieselPrice = 100; // ₹ per litre

          const fuelCost = ((distanceInKm / mileage) * dieselPrice).toFixed(2); // ₹
          const averageSpeed = (distanceInKm / durationInHours).toFixed(2); // km/h
          const efficiency = Math.min(100, Math.floor(averageSpeed));

          setRouteDetails({
            distance: `${distanceInKm.toFixed(2)} km`,
            time: `${hours > 0 ? `${hours} hrs ` : ''}${minutes} mins`,
            fuelCost: `₹${fuelCost}`,
            efficiency: `${efficiency}%`,
          });
        }
      }
    } catch (err) {
      console.error('Optimization error:', err);
      setError('Failed to optimize route. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Toggle settings
  const toggleSetting = setting => {
    setSettings({...settings, [setting]: !settings[setting]});
  };

  // Update optimization level
  const updateOptimizationLevel = value => {
    setSettings({...settings, optimizationLevel: value});
  };

  return (
    <>
      <StatusBar backgroundColor={'#0284c7'} barStyle="light-content" />
      <Header
        title="Route Optimization"
        onMenuPress={() => navigation.openDrawer()}
        rightIcon="settings"
        onRightPress={() => setShowSettings(true)}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled" // Important for GooglePlacesAutocomplete
      >
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Icon name="error" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Interactive Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            onRegionChangeComplete={setRegion}
            showsTraffic={settings.trafficAware}
            showsUserLocation={true}>
            {/* Markers for stops */}
            {stops.map(stop => (
              <Marker
                key={stop.id}
                coordinate={stop.coordinates}
                title={stop.name}
                pinColor={selectedStop === stop.id ? '#f59e0b' : '#0284c7'}
                onPress={() => setSelectedStop(stop.id)}
              />
            ))}

            {/* Optimized route line */}
            {optimizedRoute && (
              <Polyline
                coordinates={optimizedRoute.coordinates}
                strokeColor={optimizedRoute.strokeColor}
                strokeWidth={optimizedRoute.strokeWidth}
              />
            )}
          </MapView>
        </View>

        {/* Route Details */}
        <Text style={styles.title}>Route Optimization Details</Text>

        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <Icon name="directions-car" size={24} color="#0284c7" />
            <Text style={styles.detailLabel}>Distance</Text>
            <Text style={styles.detailValue}>{routeDetails.distance}</Text>
          </View>

          <View style={styles.detailCard}>
            <Icon name="access-time" size={24} color="#0284c7" />
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{routeDetails.time}</Text>
          </View>

          <View style={styles.detailCard}>
            <Icon name="local-gas-station" size={24} color="#0284c7" />
            <Text style={styles.detailLabel}>Fuel Cost</Text>
            <Text style={styles.detailValue}>{routeDetails.fuelCost}</Text>
          </View>

          <View style={styles.detailCard}>
            <Icon name="trending-up" size={24} color="#0284c7" />
            <Text style={styles.detailLabel}>Efficiency</Text>
            <Text style={styles.detailValue}>{routeDetails.efficiency}</Text>
          </View>
        </View>

        {/* Stops List */}
        <Text style={styles.subtitle}>Route Stops ({stops.length})</Text>

        <View style={styles.stopList}>
          {stops.map(stop => (
            <View key={stop.id} style={styles.stopItem}>
              <View style={styles.stopInfo}>
                <Icon name="location-pin" size={20} color="#ef4444" />
                <Text style={styles.stopName}>{stop.name}</Text>
              </View>
              <TouchableOpacity
                onPress={() => removeStop(stop.id)}
                style={styles.removeButton}>
                <Icon name="close" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add New Stop with Google Places Autocomplete */}
        <View style={styles.addStopContainer}>
          <GooglePlacesAutocomplete
            ref={placesRef}
            
            placeholder="Add new stop address"
            minLength={2}
            autoFocus={false}
            returnKeyType={'search'}
            listViewDisplayed="auto"
            fetchDetails={true}
            onPress={addStopFromPlace}
            query={{
              key: GOOGLE_PLACES_API_KEY,
              language: 'en',
              components: 'country:in', // Restrict to India
            }}
            styles={{
              textInputContainer: {
                backgroundColor: 'transparent',
                borderTopWidth: 0,
                borderBottomWidth: 0,
                flex: 1,
              },
              textInput: {
                height: 50,
                color: '#5d5d5d',
                fontSize: 16,
                backgroundColor: '#fff',
                borderRadius: 8,
                paddingHorizontal: 12,
                elevation: 1,
              },
              predefinedPlacesDescription: {
                color: '#1faadb',
              },
              listView: {
                position: 'absolute',
                top: 50,
                backgroundColor: '#fff',
                borderRadius: 8,
                elevation: 3,
                width: '100%',
                zIndex: 999,
              },
            }}
            currentLocation={false}
            debounce={300}
            enablePoweredByContainer={false}
            renderRightButton={() => (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => placesRef.current?.focus()}>
                <Icon name="add" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Optimization Button */}
        <TouchableOpacity
          style={[
            styles.optimizeButton,
            isOptimizing && styles.optimizingButton,
          ]}
          onPress={handleOptimize}
          disabled={isOptimizing || stops.length < 2}>
          {isOptimizing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.optimizeButtonText}>Optimize Route</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Optimization Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Icon name="close" size={24} color="#0284c7" />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Icon name="money-off" size={20} color="#0284c7" />
              <Text style={styles.settingLabel}>Avoid Toll Roads</Text>
            </View>
            <Switch
              value={settings.avoidTolls}
              onValueChange={() => toggleSetting('avoidTolls')}
              trackColor={{false: '#d1d5db', true: '#0284c7'}}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Icon name="highway" size={20} color="#0284c7" />
              <Text style={styles.settingLabel}>Avoid Highways</Text>
            </View>
            <Switch
              value={settings.avoidHighways}
              onValueChange={() => toggleSetting('avoidHighways')}
              trackColor={{false: '#d1d5db', true: '#0284c7'}}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Icon name="schedule" size={20} color="#0284c7" />
              <Text style={styles.settingLabel}>
                Prioritize Time Over Distance
              </Text>
            </View>
            <Switch
              value={settings.prioritizeTime}
              onValueChange={() => toggleSetting('prioritizeTime')}
              trackColor={{false: '#d1d5db', true: '#0284c7'}}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Icon name="traffic" size={20} color="#0284c7" />
              <Text style={styles.settingLabel}>
                Use Real-time Traffic Data
              </Text>
            </View>
            <Switch
              value={settings.trafficAware}
              onValueChange={() => toggleSetting('trafficAware')}
              trackColor={{false: '#d1d5db', true: '#0284c7'}}
            />
          </View>

          <Text style={styles.sliderLabel}>
            Optimization Aggressiveness: {settings.optimizationLevel}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={settings.optimizationLevel}
            onValueChange={updateOptimizationLevel}
            minimumTrackTintColor="#0284c7"
            maximumTrackTintColor="#d1d5db"
            thumbTintColor="#0284c7"
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => setShowSettings(false)}>
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9fafb',
    flexGrow: 1,
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailCard: {
    width: width / 2 - 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginVertical: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  stopList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    elevation: 1,
  },
  stopItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  stopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopName: {
    fontSize: 14,
    color: 'black',
    marginLeft: 8,
  },
  removeButton: {
    padding: 4,
  },
  addStopContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    height: 50,
    zIndex: 1, // Ensure autocomplete dropdown appears above other elements
  },
  addButton: {
    backgroundColor: '#0284c7',
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    marginLeft: 8,
  },
  optimizeButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
  },
  optimizingButton: {
    backgroundColor: '#0ea5e9',
  },
  optimizeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  settingText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },
  sliderLabel: {
    fontSize: 16,
    color: '#111827',
    marginTop: 24,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  saveButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    marginLeft: 8,
    flex: 1,
  },
});

export default RouteOptimization;
