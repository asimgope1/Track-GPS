// VehicleMap.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

const VehicleMap = ({ selectedVehicle, selectedLocation }) => {
    const [region, setRegion] = useState({
        latitude: 28.6139,
        longitude: 77.2090,
        latitudeDelta: 2.5,
        longitudeDelta: 2.5,
    });

    useEffect(() => {
        if (selectedLocation) {
            setRegion({
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
            });
        }
    }, [selectedLocation]);

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={region}
                showsUserLocation={true}
            >
                {selectedVehicle && (
                    <Marker
                        coordinate={{ latitude: selectedLocation.latitude, longitude: selectedLocation.longitude }}
                        title={selectedVehicle.title}
                        description={`Status: ${selectedVehicle.status}, Model: ${selectedVehicle.model}`}
                    />
                )}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
        width: '100%',
    },
});

export default VehicleMap;
