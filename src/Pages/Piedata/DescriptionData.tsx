import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const DescriptionData = ({ route }) => {
  const { item } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thing Name: {item.thing_name}</Text>
      <Text style={styles.text}>Thing ID: {item.thing_id}</Text>
      <Text style={styles.text}>Description: {item.desc || 'No description available'}</Text>
      <Text style={styles.text}>Status: {item.status}</Text>
      <Text style={styles.text}>Last Updated: {new Date(item.updated_on).toLocaleString()}</Text>

      {/* {item.live_config && Array.isArray(item.live_config) && item.live_config.length > 0 && ( */}
  <View style={styles.liveConfigContainer}>
    <Text style={styles.subTitle}>Live Config:</Text>
    <Text style={styles.coordText}>
      {`Lat: ${item.live_config[0][0]}, Lng: ${item.live_config[0][1]}`}
    </Text>
  </View>
{/* )} */}

    </View>
  );
};

export default DescriptionData;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
  coordText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 10,
  },
  liveConfigContainer: {
    marginTop: 10,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 5,
  },
 
});
