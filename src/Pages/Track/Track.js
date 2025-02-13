import React, {useState, useRef, useEffect} from 'react';
import {Image} from 'react-native';
import {View, Modal, TouchableOpacity, StyleSheet, Text} from 'react-native';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
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
  const [selectedMarker, setSelectedMarker] = useState(null); // State for selected marker
  const [animatedTrack, setAnimatedTrack] = useState([]);
  const [markerPosition, setMarkerPosition] = useState(null); // State for marker position

  const mapRef = useRef();

  // Log the data for debugging purposes

  // Extract source and destination coordinates from the first item of the data array
  const source =
    projectedTrack?.data && projectedTrack.data[0]
      ? {
          latitude: parseFloat(projectedTrack.data[0]?.source_lat),
          longitude: parseFloat(projectedTrack.data[0]?.source_lon),
        }
      : null;

  const destination =
    projectedTrack?.data && projectedTrack.data[0]
      ? {
          latitude: parseFloat(projectedTrack.data[0]?.destination_lat),
          longitude: parseFloat(projectedTrack.data[0]?.destination_lon),
        }
      : null;

  // Get the via points from the projected track data
  const viaPoints =
    (projectedTrack?.data && projectedTrack?.data[0]?.via_points) || [];

  // Filter out undefined coordinates from showTrack
  const filteredShowTrack =
    showTrack?.filter(
      item => item?.latitude !== undefined && item?.longitude !== undefined,
    ) || [];

  const region = {
    latitude: latitude || 28.6139, // Default to New Delhi
    longitude: longitude || 77.209,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };
  // const animatePolyline = () => {
  //   if (showTrack.length > 0) {
  //     let i = 0;
  //     const interval = setInterval(() => {
  //       setAnimatedTrack(prevState => {
  //         const newTrack = [...prevState, showTrack[i]];
  //         return newTrack;
  //       });

  //       if (i === showTrack.length - 1) {
  //         clearInterval(interval);
  //       } else {
  //         i++;
  //       }
  //     }, 100); // Adjust interval to control the speed of the animation
  //   }
  // };

  useEffect(() => {
    if (showTrack && showTrack.length > 0) {
      let i = 0;
      const interval = setInterval(() => {
        // Add a new coordinate to the animated track
        setAnimatedTrack(prevState => {
          const newTrack = [...prevState, showTrack[i]];
          return newTrack;
        });

        // Update the marker position
        setMarkerPosition(showTrack[i]);

        // Check if all coordinates have been added, and clear the interval
        if (i === showTrack.length - 1) {
          clearInterval(interval);
        } else {
          i++;
        }
      }, 100); // Adjust interval time to control the animation speed
    }
  }, [showTrack]);

  // Get the details from the first track data (can be adjusted if needed)
  const trackData = projectedTrack?.data && projectedTrack?.data[0];

  // Function to handle marker tap
  const handleMarkerPress = (title, description) => {
    setSelectedMarker({title, description}); // Update the selected marker state
  };
  console.log('filteredShowTrack', filteredShowTrack);
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
              strokeColor="lightgreen" // Green for projected route
              strokeWidth={5}
              optimizeWaypoints={true}
            />
          )}

          {/* Actual Covered Route using Polyline */}
          {animatedTrack.length > 1 && (
            <>
              <Polyline
                coordinates={animatedTrack}
                strokeColor="blue"
                strokeWidth={5}
              />

              {/* Marker at the end of the polyline */}
              <Marker
                coordinate={animatedTrack[animatedTrack.length - 1]} // Last coordinate in the animated track
                tracksViewChanges={false}
                title="End of Path"
                description="This is the end of the tracked path.">
                {/* Custom Marker for the End */}
                <Image
                  source={require('../../assets/images/vehicleMarker.png')}
                  style={{width: 40, height: 40}} // Set the desired size of the marker
                />
              </Marker>
            </>
          )}

          {/* Start Marker */}
          {source && trackData && (
            <Marker
              coordinate={source}
              tracksViewChanges={false}
              title="Start point"
              description={`Estimated Day: ${trackData.estimated_day}\nFuel Consumption: ${trackData.fuel_consumption} L`}
              onPress={() =>
                handleMarkerPress(
                  'Start point',
                  `Estimated Day: ${trackData.estimated_day}\nFuel Consumption: ${trackData.fuel_consumption} L`,
                )
              }>
              <Icon name="place" size={24} color="red" />
            </Marker>
          )}

          {/* End Marker */}
          {destination && trackData && (
            <Marker
              coordinate={destination}
              tracksViewChanges={false}
              title="End point"
              description={`Estimated Day: ${trackData.estimated_day}\nFuel Consumption: ${trackData.fuel_consumption} L`}
              onPress={() =>
                handleMarkerPress(
                  'End point',
                  `Estimated Day: ${trackData.estimated_day}\nFuel Consumption: ${trackData.fuel_consumption} L`,
                )
              }>
              <Icon name="place" size={24} color="green" />
            </Marker>
          )}

          {/* Markers for each via point */}
          {viaPoints.map((point, index) => {
            const coordinate = {
              latitude: parseFloat(point.lat),
              longitude: parseFloat(point.lon),
            };

            const routeName = trackData?.route_name;
            return (
              <Marker
                key={index}
                tracksViewChanges={false}
                coordinate={coordinate}
                title={`Via point ${index + 1}`}
                description={`Route: ${routeName}\nEstimated Day: ${trackData.estimated_day}\nFuel Consumption: ${trackData.fuel_consumption} L`}
                onPress={() =>
                  handleMarkerPress(
                    `Via point ${index + 1}`,
                    `Route: ${routeName}\nEstimated Day: ${trackData.estimated_day}\nFuel Consumption: ${trackData.fuel_consumption} L`,
                  )
                }>
                {/* Resize marker image here */}
                {/* <Image
                  source={require('../../assets/images/vehicleMarker.png')}
                  style={{width: 40, height: 40}} // Set the desired size of the marker
                /> */}
                <Icon name="place" size={24} color="blue" />
              </Marker>
            );
          })}
        </MapView>

        {/* Marker Info Modal */}
        {selectedMarker && (
          <Modal
            visible={true}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setSelectedMarker(null)}>
            <View style={styles.infoModal}>
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>{selectedMarker.title}</Text>
                <Text style={styles.infoDescription}>
                  {selectedMarker.description}
                </Text>
                <TouchableOpacity
                  style={styles.closeInfoButton}
                  onPress={() => setSelectedMarker(null)}>
                  <Text style={styles.closeInfoText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
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
  infoModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  infoDescription: {
    fontSize: 16,
    marginBottom: 20,
    color: 'black',
    textAlign: 'center',
  },
  closeInfoButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  closeInfoText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Track;
