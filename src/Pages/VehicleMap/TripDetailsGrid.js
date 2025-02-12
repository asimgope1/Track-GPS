import React, {useState, useEffect} from 'react';
import {View, StyleSheet, FlatList, Text} from 'react-native';
import {WIDTH} from '../../constants/config';
import {BOLD, SEMIBOLD} from '../../constants/fontfamily';
import {RFValue} from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';

const TripDetailsGrid = ({data}) => {
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    let runningCount = 0;
    let idleCount = 0;
    let stoppedCount = 0;
    let overspeedCount = 0;
    let unreachableCount = 0;

    Object.keys(data)?.forEach(key => {
      const status = data[key];
      switch (status) {
        case 'Running':
          runningCount += 1;
          break;
        case 'Idle':
          idleCount += 1;
          break;
        case 'Stopped':
          stoppedCount += 1;
          break;
        case 'Overspeed':
          overspeedCount += 1;
          break;
        case 'Unreachable':
          unreachableCount += 1;
          break;
        default:
          break;
      }
    });

    const updatedStatusData = [
      {
        id: '6',
        status: 'Total',
        data:
          runningCount +
          idleCount +
          stoppedCount +
          overspeedCount +
          unreachableCount,
      },
      {id: '1', status: 'Running', data: runningCount},
      {id: '2', status: 'Idle', data: idleCount},
      {id: '3', status: 'Stopped', data: stoppedCount},
      {id: '4', status: 'Overspeed', data: overspeedCount},
      {id: '5', status: 'Unreachable', data: unreachableCount},
    ];

    setStatusData(updatedStatusData);
  }, [data]);

  const renderGridItem = ({item}) => (
    <View style={styles.itemContainer}>
      <LinearGradient
        colors={['#87CEEB', '#1E90FF']} // Uniform color for all items
        style={styles.circle}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <Text style={styles.itemData}>{item.data}</Text>
      </LinearGradient>
      <Text style={styles.itemLabel}>{item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={statusData}
        renderItem={renderGridItem}
        keyExtractor={item => item.id}
        numColumns={3} // 2 rows, 3 columns for a 2x3 grid
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    paddingHorizontal: 10,
    width: WIDTH * 0.98,
    alignSelf: 'center',
    elevation: 10,
  },
  gridContainer: {
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  itemContainer: {
    alignItems: 'center',
    width: WIDTH * 0.29,
    backgroundColor: 'white',
  },
  circle: {
    width: WIDTH * 0.18,
    height: WIDTH * 0.18,
    backgroundColor: 'white',
    // borderRadius: WIDTH * 0.09,
    borderTopLeftRadius: WIDTH * 0.09,
    borderBottomRightRadius: WIDTH * 0.09,
    justifyContent: 'center',
    alignItems: 'center',
    // elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  itemData: {
    fontSize: RFValue(20),
    fontFamily: BOLD,
    color: 'white',
  },
  itemLabel: {
    fontSize: RFValue(10),
    fontFamily: SEMIBOLD,
    color: '#2C3E50', // Dark slate blue for better contrast
    marginTop: 8,
    // textAlign: 'center',
  },
});

export default TripDetailsGrid;
