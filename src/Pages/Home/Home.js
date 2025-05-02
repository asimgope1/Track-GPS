import React, {Fragment, useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  RefreshControl,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Icon} from '@rneui/themed';
import {HEIGHT, MyStatusBar, WIDTH} from '../../constants/config';
import {GETNETWORK} from '../../utils/Network';
import {BASE_URL} from '../../constants/url';
import {
  BarChart,
  LineChart,
  PieChart,
  PopulationPyramid,
  RadarChart,
} from 'react-native-gifted-charts';
import {Calendar} from 'react-native-calendars';
import {
  FUEL,
  IDLE,
  OVERSPEED,
  TIMELINE,
  USAGE,
  ZONE,
} from '../../constants/imagepath';
import {RFValue} from 'react-native-responsive-fontsize';
import Header from '../../components/Header';
import {BRAND} from '../../constants/color';
import {styles} from './HomeStyles';

const WHITE = '#FFFFFF';
const data1 = [
  {value: 70},
  {value: 36},
  {value: 50},
  {value: 40},
  {value: 18},
  {value: 38},
];

const FleetCard = ({
  title,
  icon,
  color,
  fromDate,
  toDate,
  selectedDateType,
  handleDateSelect,
  openCalendarFor,
  isFilterVisible,
  toggleFilterModal,
  isFromModalVisible,
  isToModalVisible,
  setFromModalVisible,
  setToModalVisible,
}) => (
  <View style={styles.cardContainer}>
    <ImageBackground
      source={icon}
      style={styles.backgroundImage}
      imageStyle={styles.imageStyle}>
      <View style={styles.overlay} />

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>

          <TouchableOpacity onPress={() => toggleFilterModal(title)}>
            <Text style={{color: 'black', fontWeight: 'bold'}}>Filter</Text>
          </TouchableOpacity>
        </View>
        {isFilterVisible && (
          <Modal
            visible={isFilterVisible}
            transparent
            animationType="slide"
            onRequestClose={() => {}}>
            {/* Removed outside TouchableWithoutFeedback */}
            <View style={styles.modalOverlay}>
              {/* Keep this inner TouchableWithoutFeedback to prevent dismiss on press inside */}
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Select Date Range</Text>

                  {/* From Date Button */}
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => openCalendarFor('start', title)}>
                    <Text style={styles.dateButtonText}>
                      {fromDate ? `From: ${fromDate}` : 'From'}
                    </Text>
                  </TouchableOpacity>

                  {/* To Date Button */}
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => openCalendarFor('end', title)}>
                    <Text style={styles.dateButtonText}>
                      {toDate ? `To: ${toDate}` : 'To'}
                    </Text>
                  </TouchableOpacity>

                  {/* Close Button */}
                  <TouchableOpacity
                    style={[styles.dateButton, {backgroundColor: 'gray'}]}
                    onPress={() => toggleFilterModal(title)}>
                    <Text style={styles.dateButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </Modal>
        )}

        {/* Calendar Modal for From */}
        {isFromModalVisible && (
          <Modal
            visible={isFromModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setFromModalVisible(false)}>
            <TouchableWithoutFeedback
              onPress={() => setFromModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Select Start Date</Text>
                    <Calendar
                      onDayPress={day => handleDateSelect(day, title)}
                      markedDates={{
                        [fromDate]: {selected: true, selectedColor: '#28a745'},
                        [toDate]: {selected: true, selectedColor: '#dc3545'},
                      }}
                    />
                    <TouchableOpacity
                      style={[styles.dateButton, {backgroundColor: 'gray'}]}
                      onPress={() => setFromModalVisible(false)}>
                      <Text style={styles.dateButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}

        {/* Calendar Modal for To */}
        {isToModalVisible && (
          <Modal
            visible={isToModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setToModalVisible(false)}>
            <TouchableWithoutFeedback onPress={() => setToModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Select End Date</Text>
                    <Calendar
                      onDayPress={day => handleDateSelect(day, title)}
                      markedDates={{
                        [fromDate]: {selected: true, selectedColor: '#28a745'},
                        [toDate]: {selected: true, selectedColor: '#dc3545'},
                      }}
                    />
                    <TouchableOpacity
                      style={[styles.dateButton, {backgroundColor: 'gray'}]}
                      onPress={() => setToModalVisible(false)}>
                      <Text style={styles.dateButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}

        {title === 'Total Distance' && (
          <View style={{height: HEIGHT * 0.5, width: '100%'}}>
            <LineChart
              height={HEIGHT * 0.19}
              areaChart
              curved
              data={data1}
              hideDataPoints
              spacing={68}
              color1="#8a56ce"
              color2="#56acce"
              startFillColor1="#8a56ce"
              startFillColor2="#56acce"
              endFillColor1="#8a56ce"
              endFillColor2="#56acce"
              startOpacity={0.9}
              endOpacity={0.2}
              initialSpacing={0}
              noOfSections={4}
              yAxisColor="white"
              yAxisThickness={0}
              rulesType="solid"
              rulesColor="gray"
              yAxisTextStyle={{color: 'gray'}}
              yAxisLabelSuffix="%"
              xAxisColor="lightgray"
              pointerConfig={{
                pointerStripUptoDataPoint: true,
                pointerStripColor: 'lightgray',
                pointerStripWidth: 2,
                strokeDashArray: [2, 5],
                pointerColor: 'lightgray',
                radius: 4,
                pointerLabelWidth: 100,
                pointerLabelHeight: 120,
                pointerLabelComponent: items => {
                  return (
                    <View
                      style={{
                        height: 100,
                        width: 100,
                        backgroundColor: '#282C3E',
                        borderRadius: 4,
                        justifyContent: 'center',
                        paddingLeft: 16,
                      }}>
                      <Text style={{color: 'lightgray', fontSize: 12}}>
                        {2018}
                      </Text>
                      <Text style={{color: 'white', fontWeight: 'bold'}}>
                        {items[0].value}
                      </Text>
                      <Text
                        style={{
                          color: 'lightgray',
                          fontSize: 12,
                          marginTop: 12,
                        }}>
                        {2019}
                      </Text>
                      <Text style={{color: 'white', fontWeight: 'bold'}}>
                        {/* {items[1].value} */}
                      </Text>
                    </View>
                  );
                },
              }}
            />
          </View>
        )}
        {title === 'OverSpeed' && (
          <View style={styles.overSpeedDetails}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Max Speed</Text>
              <Text style={styles.detailValue}>120 km/h</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Alerts</Text>
              <Text style={styles.detailValue}>5</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Last Alert</Text>
              <Text style={styles.detailValue}>2 days ago</Text>
            </View>
          </View>
        )}
        {title === 'Idle' && (
          <View style={styles.idleDetails}>
            <View style={styles.idleBox}>
              <View style={styles.iconTextRow}>
                <Icon
                  name="clock-o"
                  type="font-awesome"
                  size={20}
                  color="#17a2b8"
                />
                <Text style={styles.idleLabel}> Idle Time</Text>
              </View>
              <Text style={styles.idleValue}>35 hrs</Text>
            </View>

            <View style={styles.idleBox}>
              <View style={styles.iconTextRow}>
                <Icon
                  name="tint"
                  type="font-awesome"
                  size={20}
                  color="#28a745"
                />
                <Text style={styles.idleLabel}> Fuel Wasted</Text>
              </View>
              <Text style={styles.idleValue}>48 L</Text>
            </View>
          </View>
        )}
        {title === 'Fuel' && (
          <View style={styles.fuelDetails}>
            <View style={styles.fuelBox}>
              <View style={styles.iconTextRow}>
                <Icon
                  name="plus-circle"
                  type="font-awesome"
                  size={20}
                  color="#28a745"
                />
                <Text style={styles.fuelLabel}> Fuel Refilled</Text>
              </View>
              <Text style={styles.fuelValue}>320 L</Text>
            </View>

            <View style={styles.fuelBox}>
              <View style={styles.iconTextRow}>
                <Icon
                  name="minus-circle"
                  type="font-awesome"
                  size={20}
                  color="#dc3545"
                />
                <Text style={styles.fuelLabel}> Fuel Drained</Text>
              </View>
              <Text style={styles.fuelValue}>45 L</Text>
            </View>
          </View>
        )}
        {title === 'Stay in Zone' && (
          <View style={styles.zoneDetails}>
            <View style={styles.zoneContent}>
              <Icon
                name="radar"
                type="material-community"
                size={28}
                color="#007bff"
              />
              <View style={styles.zoneTextBox}>
                <Text style={styles.zoneValue}>7 Alerts</Text>
              </View>
            </View>
          </View>
        )}
        {title === 'Timeline Deviation' && (
          <View style={styles.timelineDeviation}>
            <View style={styles.timelineItem}>
              <Icon
                name="clock-alert"
                type="material-community"
                size={28}
                color="#fd7e14"
              />
              <View style={styles.timelineTextBox}>
                <Text style={styles.timelineLabel}>Delayed Trips</Text>
                <Text style={styles.timelineValue}>3 Trips</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <Icon
                name="calendar-clock"
                type="material-community"
                size={28}
                color="#6c757d"
              />
              <View style={styles.timelineTextBox}>
                <Text style={styles.timelineLabel}>Avg Deviation</Text>
                <Text style={styles.timelineValue}>22 mins</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ImageBackground>
  </View>
);

const FleetSummaryCard = ({statusMap, total}) => {
  const pieData = [
    {
      value: statusMap.Running || 0,
      color: '#28a745',
      text: `${statusMap.Running || 0}`,
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
  ];

  const items = [
    {label: 'Running', value: statusMap.Running || 0, color: '#28a745'},
    {label: 'Stopped', value: statusMap.Stopped || 0, color: '#ffc107'},
    {label: 'Unreachable', value: statusMap.Unreachable || 0, color: '#dc3545'},
  ];

  return (
    <>
      <View style={styles.summaryCard}>
        <Text style={styles.headerText}>Status</Text>
        <View style={styles.pieRowContainer}>
          <View style={styles.pieContainer}>
            <PieChart
              data={pieData}
              donut
              showText
              textColor="white"
              textSize={12}
              radius={70}
              innerRadius={40}
              centerLabelComponent={() => (
                <View style={{alignItems: 'center'}}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#007bff',
                    }}>
                    {total}
                  </Text>
                  <Text style={{fontSize: 12, color: '#555'}}>Total</Text>
                </View>
              )}
            />
          </View>
          <View style={styles.legendContainer}>
            {items.map(item => (
              <View key={item.label} style={styles.summaryItem}>
                <View
                  style={[styles.statusDot, {backgroundColor: item.color}]}
                />
                <Text style={styles.summaryLabel}>{item.label}</Text>
                <Text style={styles.summaryValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </>
  );
};

const FleetDashboard = () => {
  const [statusMap, setStatusMap] = useState({});
  const [fleetData, setFleetData] = useState([]);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRanges, setDateRanges] = useState({});

  const onDateSelect = (type, date, title) => {
    setDateRanges(prev => ({
      ...prev,
      [title]: {
        ...prev[title],
        [type === 'start' ? 'from' : 'to']: date,
      },
    }));
  };

  const [filterStates, setFilterStates] = useState({
    fromDate: '',
    toDate: '',
    isFilterVisible: '',
    openModalFor: '',
  });

  const toggleFilterModal = title => {
    setFilterStates(prev => ({
      ...prev,
      isFilterVisible: prev.isFilterVisible === title ? '' : title,
    }));
  };

  const handleDateSelect = (day, title) => {
    const type = filterStates.openModalFor;
    onDateSelect(type, day.dateString, title);

    // Close the modal
    setFilterStates(prev => ({
      ...prev,
      // isFilterVisible: '',
      openModalFor: '',
    }));
  };

  const openCalendarFor = (type, title) => {
    setFilterStates(prev => ({
      ...prev,
      openModalFor: type,
      // isFilterVisible: title,
    }));
  };

  const fetchDerivedData = useCallback(async () => {
    const url = `${BASE_URL}projects/117/things/?page=1&search=&type=gps`;
    try {
      const response = await GETNETWORK(url, true);
      if (response.data && response.data.things) {
        const fetchedData = response.data.things.map(item => ({
          thing_id: item.thing_id,
          updated_on: new Date(item.updated_on),
        }));
        const currentTime = new Date();
        const statusCounts = {
          Running: 0,
          Stopped: 0,
          Unreachable: 0,
        };

        fetchedData.forEach(item => {
          const timeDiff = (currentTime - item.updated_on) / (1000 * 60);
          if (timeDiff <= 2) statusCounts.Running += 1;
          else if (timeDiff <= 5) statusCounts.Stopped += 1;
          else statusCounts.Unreachable += 1;
        });

        setStatusMap(statusCounts);
        setTotal(fetchedData.length);

        const transformedData = [
          {title: 'Total Distance', color: '#28a745', icon: USAGE},
          {title: 'OverSpeed', color: '#ffc107', icon: OVERSPEED},
          {title: 'Idle', color: '#dc3545', icon: IDLE},
          {title: 'Fuel', color: '#007bff', icon: FUEL},
          {title: 'Stay in Zone', color: '#007bff', icon: ZONE},
          {title: 'Timeline Deviation', color: '#007bff', icon: TIMELINE},
        ];

        setFleetData(transformedData);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }, []);

  useEffect(() => {
    fetchDerivedData();
    const intervalId = setInterval(fetchDerivedData, 30000);
    return () => clearInterval(intervalId);
  }, [fetchDerivedData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDerivedData();
    setRefreshing(false);
  };

  return (
    <Fragment>
      <StatusBar backgroundColor={BRAND} barStyle="dark-content" />
      <SafeAreaView style={styles.safeareacontainer}>
        <Header title="Dashboard" />

        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <FlatList
            ListHeaderComponent={
              <FleetSummaryCard statusMap={statusMap} total={total} />
            }
            data={fleetData}
            renderItem={({item}) => (
              <FleetCard
                title={item.title}
                icon={item.icon}
                fromDate={dateRanges[item.title]?.from}
                toDate={dateRanges[item.title]?.to}
                selectedDateType={filterStates.openModalFor}
                isFilterVisible={filterStates.isFilterVisible === item.title}
                openCalendarFor={openCalendarFor}
                toggleFilterModal={toggleFilterModal}
                handleDateSelect={day => handleDateSelect(day, item.title)}
                isFromModalVisible={
                  filterStates.openModalFor === 'start' &&
                  filterStates.isFilterVisible === item.title
                }
                isToModalVisible={
                  filterStates.openModalFor === 'end' &&
                  filterStates.isFilterVisible === item.title
                }
                setFromModalVisible={val =>
                  openCalendarFor(val ? 'start' : '', item.title)
                }
                setToModalVisible={val =>
                  openCalendarFor(val ? 'end' : '', item.title)
                }
              />
            )}
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

export default FleetDashboard;
