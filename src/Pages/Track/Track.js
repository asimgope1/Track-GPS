import React, {useRef, useEffect} from 'react';
import {View, Modal, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Track = ({
  showTrack,
  latitude,
  longitude,
  visible,
  onClose,
  projectedTrack,
}) => {
  const mapRef = useRef(null);

  // Filter out undefined coordinates from showTrack
  const filteredShowTrack =
    showTrack?.filter(
      item => item?.latitude !== undefined && item?.longitude !== undefined,
    ) || [];

  // Ensure projectedTrack has valid source & destination
  const source = projectedTrack?.source;
  const destination = projectedTrack?.destination;

  useEffect(() => {
    if (visible && (!source || !destination)) {
      Alert.alert('Error', 'No projected route found.');
    }

    // Fit map to both paths
    if (visible && mapRef.current) {
      const coordinates = [];

      if (source) coordinates.push(source);
      if (destination) coordinates.push(destination);
      if (filteredShowTrack.length > 0) coordinates.push(...filteredShowTrack);

      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
          animated: true,
        });
      }
    }
  }, [visible, source, destination, filteredShowTrack]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Map */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: latitude || 28.6139, // Default to New Delhi
            longitude: longitude || 77.209,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          mapType="hybrid">
          {/* Expected Route (Projected Track) */}
          {source && destination && (
            <MapViewDirections
              origin={source}
              destination={destination}
              apikey="AIzaSyChAFxD34j5ryAcBSmWtDlCGOg3AQ6Vu8w"
              strokeColor="yellow" // Projected route in Yellow
              strokeWidth={5.5}
              optimizeWaypoints={true}
            />
          )}

          {/* Actual Covered Route (Overlay on Projected Route) */}
          {filteredShowTrack.length > 1 && (
            <MapViewDirections
              origin={filteredShowTrack[0]}
              destination={filteredShowTrack[filteredShowTrack.length - 1]}
              waypoints={filteredShowTrack.slice(1, -1)}
              apikey="AIzaSyChAFxD34j5ryAcBSmWtDlCGOg3AQ6Vu8w"
              strokeColor="blue" // Actual route in Blue
              strokeWidth={5}
              optimizeWaypoints={true}
            />
          )}

          {/* Markers */}
          {filteredShowTrack.length > 0 && (
            <Marker
              coordinate={filteredShowTrack[filteredShowTrack.length - 1]}
              title="Current Location"
              description="Your Current Location"
            />
          )}

          {source && (
            <Marker coordinate={source} title="Source" pinColor="green" />
          )}

          {destination && (
            <Marker
              coordinate={destination}
              title="Destination"
              pinColor="blue"
            />
          )}
        </MapView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  map: {
    flex: 1,
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
});

export default Track;
