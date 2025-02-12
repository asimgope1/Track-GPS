import React, {useEffect, useRef} from 'react';
import {View, Modal, TouchableOpacity, StyleSheet} from 'react-native';
import MapView, {Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
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
  const mapRef = useRef();
  // useEffect(() => {
  //   console.log(
  //     'Projected Track Data:==============================================================================================',
  //     projectedTrack,
  //   );
  // }, [projectedTrack]);
  console.log(
    'Projected Track Data:==============================================================================================',
    projectedTrack,
  );

  // Filter out undefined coordinates
  const filteredShowTrack =
    showTrack?.filter(
      item => item?.latitude !== undefined && item?.longitude !== undefined,
    ) || [];

  // Ensure projectedTrack has valid source & destination
  const source = projectedTrack?.source;
  const destination = projectedTrack?.destination;

  const region = {
    latitude: latitude || 28.6139, // Default to New Delhi
    longitude: longitude || 77.209,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

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
          region={region}
          mapType="hybrid">
          {/* Expected Route (Projected Track) */}
          {source && destination && (
            <MapViewDirections
              origin={source}
              destination={destination}
              apikey="AIzaSyChAFxD34j5ryAcBSmWtDlCGOg3AQ6Vu8w"
              strokeColor="green" // Green for projected route
              strokeWidth={4}
              optimizeWaypoints={true}
            />
          )}

          {/* Actual Covered Route using Polyline */}
          {filteredShowTrack.length > 1 && (
            <Polyline
              coordinates={filteredShowTrack}
              strokeColor="blue" // Blue for the actual path
              strokeWidth={5}
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
