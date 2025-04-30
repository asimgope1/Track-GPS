import React, {Fragment, useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Icon} from '@rneui/themed';
import {RFValue} from 'react-native-responsive-fontsize';
import {MyStatusBar} from '../../constants/config';
import {GETNETWORK} from '../../utils/Network';
import {BASE_URL} from '../../constants/url';
import {PieChart} from 'react-native-gifted-charts';
import {LineChart} from 'react-native-gifted-charts';


const WHITE = '#FFFFFF';

const FleetCard = ({title, value, color, icon}) => (
  <View style={[styles.card, {backgroundColor: color}]}>
    <Icon name={icon} size={RFValue(28)} color="white" />
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const FleetSummaryCard = ({statusMap, total}) => {
  const pieData = [
    {
      value: statusMap.Running || 0,
      color: '#28a745',
      text: `${statusMap.Running || 0}`,  // show value inside
    },
    {
      value: statusMap.Stopped || 0,
      color: '#ffc107',
      text: `${statusMap.Stopped || 0}`,
    },
    {
      value: statusMap.Unreachable || 0,
      color: '#dc3545',
      text: `${statusMap.Unreachable || 0}`,
    },
    {
      value: total,
      color: '#007bff',
      text: `${total}`,
    },
  ];
  

  const items = [
    {label: 'Running', value: statusMap.Running || 0, color: '#28a745'},
    {label: 'Stopped', value: statusMap.Stopped || 0, color: '#ffc107'},
    {label: 'Unreachable', value: statusMap.Unreachable || 0, color: '#dc3545'},
    {label: 'Total', value: total, color: '#007bff'},
  ];
  

  return (
    <View style={styles.summaryCard}>
        <Text style={styles.headerText}>Status</Text>

      <View style={styles.pieRowContainer}>
        <View style={styles.pieContainer}>

        <PieChart
  data={pieData}
  donut
  showText
  textColor="white"
  radius={70}
  innerRadius={40}
/>

        </View>

        <View style={styles.legendContainer}>
          {items.map(item => (
            <View key={item.label} style={styles.summaryItem}>
              <View style={[styles.statusDot, {backgroundColor: item.color}]} />
              <Text style={styles.summaryLabel}>{item.label}</Text>
              <Text style={styles.summaryValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};


const FleetDashboard = () => {
  const [statusMap, setStatusMap] = useState({});
  const [fleetData, setFleetData] = useState([]);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDerivedData = useCallback(async () => {
    const url = `${BASE_URL}projects/117/things/?page=1&search=&type=gps`;
    try {
      const response = await GETNETWORK(url, true);
      console.log(' ======================================= response:', response);

      if (response.data && response.data.things) {
        console.log('thingssssssssssssssssssssssssssssssssssss', response.data.things);
        const fetchedData = response.data.things.map(item => ({
          thing_id: item.thing_id,
          updated_on: new Date(item.updated_on),
        }));
        console.log('data=================================', fetchedData);
        const currentTime = new Date();
        const statusCounts = {
          Running: 0,
          Stopped: 0,
          Unreachable: 0,
        };

        fetchedData.forEach(item => {
          const timeDiff = (currentTime - item.updated_on) / (1000 * 60); // in minutes
          if (timeDiff <= 2) statusCounts.Running += 1;
          else if (timeDiff <= 5) statusCounts.Stopped += 1;
          else statusCounts.Unreachable += 1;
        });

        setStatusMap(statusCounts);
        setTotal(fetchedData.length);

        const transformedData = [
          {
            title: 'Running',
            value: `${statusCounts.Running}`,
            color: '#28a745',
            icon: 'play-circle',
          },
          {
            title: 'Stopped',
            value: `${statusCounts.Stopped}`,
            color: '#ffc107',
            icon: 'pause-circle',
          },
          {
            title: 'Unreachable',
            value: `${statusCounts.Unreachable}`,
            color: '#dc3545',
            icon: 'times-circle',
          },
          {
            title: 'Total',
            value: `${fetchedData.length}`,
            color: '#007bff',
            icon: 'list',
          },
        ];
        console.log('TRAnSFormed***************************************:', transformedData)
        setFleetData(transformedData);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }, []);

  useEffect(() => {
    fetchDerivedData();
    const intervalId = setInterval(fetchDerivedData, 30000); // Refresh every 30 sec
    return () => clearInterval(intervalId);
  }, [fetchDerivedData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDerivedData();
    setRefreshing(false);
  };

  return (
    <Fragment>
      <MyStatusBar backgroundColor={WHITE} barStyle="dark-content" />
      <SafeAreaView style={styles.safeareacontainer}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <FlatList
            ListHeaderComponent={
              <FleetSummaryCard statusMap={statusMap} total={total} />
            }
            data={fleetData}
            renderItem={({item}) => <FleetCard {...item} />}
            keyExtractor={item => item.title}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  safeareacontainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    borderRadius: 18,
    paddingVertical: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    // textAlign: 'center',
    color: '#333',
    marginLeft:'5%'
  },
  cardTitle: {
    fontSize: RFValue(14),
    color: '#fff',
    marginTop: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardValue: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 6,
  },
  summaryCard: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    margin: 5,
  },
  
  pieRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // aligns everything from left
    paddingHorizontal: 20,
    // backgroundColor:'green'
    
  },
  
  pieContainer: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'center',
    marginRight: 5,
  },
  
  legendContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 10,
    marginLeft:30

  },
  
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  
  summaryLabel: {
    fontSize: 12,
    flex: 1,
    color: '#333',
    fontWeight: 'bold',

  },
  
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',

  },
  
});

export default FleetDashboard;
