import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Icon } from '@rneui/themed';

const VehicleCard = ({ item, setShowModal }) => {
    // Animation value
    const translateY = useRef(new Animated.Value(50)).current; // Start 50 units below

    useEffect(() => {
        // Trigger the animation when the component mounts
        Animated.timing(translateY, {
            toValue: 0, // End at its original position
            duration: 500, // Animation duration (milliseconds)
            useNativeDriver: true, // Use native driver for better performance
        }).start();
    }, [translateY]);

    return (
        <Animated.View
            style={[styles.cardContainer, { transform: [{ translateY }] }]} // Apply the animation
        >
            <TouchableOpacity
                style={styles.touchableContainer}
                onPress={() => setShowModal(true)} // Show modal on card press
            >
                <View style={styles.cardContent}>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>{item.label}</Text>
                        <Text style={styles.value}>{item.value}</Text>
                    </View>
                    <Icon name="car" type="font-awesome" size={24} color={item.color || '#000'} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
    },
    touchableContainer: {
        flex: 1,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#316163',
    },
    value: {
        fontSize: 14,
        color: '#555',
    },
});

export default VehicleCard;
