import React, { Fragment, useEffect, useState, useCallback } from 'react';
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
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@rneui/themed';
import { HEIGHT, MyStatusBar, WIDTH, useStatusBarHeight } from '../../constants/config';
import { colors as themeColors } from '../../theme';
import { GETNETWORK } from '../../utils/Network';
import { BASE_URL } from '../../constants/url';
import {
  BarChart,
  LineChart,
  PieChart,
  PopulationPyramid,
  RadarChart,
} from 'react-native-gifted-charts';
import { Calendar } from 'react-native-calendars';
import {
  FILTER,
  FUEL,
  IDLE,
  OVERSPEED,
  STAYAWAY,
  STAYZONE,
  TIMELINE,
  USAGE,
  ZONE,
} from '../../constants/imagepath';
import { Image } from 'react-native';
import HistoryModal from '../History/HistoryModal';
import Track from '../Track/Track';
import { Loader } from '../../components/Loader';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getObjByKey } from '../../utils/Storage';
import Dashboard from './DriverDash';
import Toast from 'react-native-toast-message';
import { styles } from './HomeStyles';
import Header from '../../components/Header';

const WHITE = '#FFFFFF';
const data1 = [
  { value: 70 },
  { value: 36 },
  { value: 50 },
  { value: 40 },
  { value: 18 },
  { value: 38 },
];
const driverData = [
  { name: 'Ashima', alertCount: 12, lastAlert: '2025-05-05 10:30 AM' },
  { name: 'Rihana', alertCount: 9, lastAlert: '2025-05-04 3:45 PM' },
  { name: 'Dibya', alertCount: 6, lastAlert: '2025-05-03 6:20 AM' },
];

// ... (FleetCard component remains the same)


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
            <Image
              source={FILTER}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
              tintColor={'#CCCCCC'} // Change the color to white
            />
          </TouchableOpacity>
        </View>
        {isFilterVisible && (
          <Modal
            visible={isFilterVisible}
            transparent
            animationType="slide"
            onRequestClose={() => { }}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Filter Options</Text>

                  {/* Date Range */}
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => openCalendarFor('start', title)}>
                    <Text style={styles.dateButtonText}>
                      {fromDate ? `From: ${fromDate}` : 'From'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => openCalendarFor('end', title)}>
                    <Text style={styles.dateButtonText}>
                      {toDate ? `To: ${toDate}` : 'To'}
                    </Text>
                  </TouchableOpacity>

                  {/* Status Filter */}
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.optionRow}>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        true && styles.optionButtonSelected,
                      ]}>
                      <Text>Active</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        false && styles.optionButtonSelected,
                      ]}>
                      <Text>Inactive</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Vehicle Type Filter */}
                  <Text style={styles.label}>Vehicle Type</Text>
                  <View style={styles.optionRow}>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        true && styles.optionButtonSelected,
                      ]}
                      onPress={() => console.log(objectType, 'Car')}>
                      <Text>Car</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        true && styles.optionButtonSelected,
                      ]}
                      onPress={() => console.log(objectType, 'Truck')}>
                      <Text>Truck</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Apply and Close Buttons */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <TouchableOpacity
                      style={[styles.dateButton, { backgroundColor: '#007bff' }]}
                      onPress={applyFilters}>
                      <Text style={styles.dateButtonText}>Apply</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.dateButton, { backgroundColor: 'gray' }]}
                      onPress={() => toggleFilterModal(title)}>
                      <Text style={styles.dateButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
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
                    <Calendar theme={{
                      backgroundColor: 'transparent',
                      calendarBackground: 'transparent',
                      textSectionTitleColor: '#E2E8F0',
                      selectedDayBackgroundColor: '#4F46E5',
                      selectedDayTextColor: '#FFFFFF',
                      todayTextColor: '#818CF8',
                      dayTextColor: '#FFFFFF',
                      textDisabledColor: '#94A3B8',
                      dotColor: '#4F46E5',
                      selectedDotColor: '#FFFFFF',
                      arrowColor: '#4F46E5',
                      monthTextColor: '#FFFFFF',
                      textDayFontWeight: '500',
                      textMonthFontWeight: 'bold',
                      textDayHeaderFontWeight: '600',
                    }}
                      onDayPress={day => handleDateSelect(day, title)}
                      markedDates={{
                        [fromDate]: { selected: true, selectedColor: '#28a745' },
                        [toDate]: { selected: true, selectedColor: '#dc3545' },
                      }}
                    />
                    <TouchableOpacity
                      style={[styles.dateButton, { backgroundColor: 'gray' }]}
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
                    <Calendar theme={{
                      backgroundColor: 'transparent',
                      calendarBackground: 'transparent',
                      textSectionTitleColor: '#E2E8F0',
                      selectedDayBackgroundColor: '#4F46E5',
                      selectedDayTextColor: '#FFFFFF',
                      todayTextColor: '#818CF8',
                      dayTextColor: '#FFFFFF',
                      textDisabledColor: '#94A3B8',
                      dotColor: '#4F46E5',
                      selectedDotColor: '#FFFFFF',
                      arrowColor: '#4F46E5',
                      monthTextColor: '#FFFFFF',
                      textDayFontWeight: '500',
                      textMonthFontWeight: 'bold',
                      textDayHeaderFontWeight: '600',
                    }}
                      onDayPress={day => handleDateSelect(day, title)}
                      markedDates={{
                        [fromDate]: { selected: true, selectedColor: '#28a745' },
                        [toDate]: { selected: true, selectedColor: '#dc3545' },
                      }}
                    />
                    <TouchableOpacity
                      style={[styles.dateButton, { backgroundColor: 'gray' }]}
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
          <View style={{ height: HEIGHT * 0.5, width: '100%' }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                height={HEIGHT * 0.19}
                width={WIDTH * 1.5}
                areaChart
                curved
                data={data1}
                hideDataPoints
                spacing={56}
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
                yAxisTextStyle={{ color: 'gray' }}
                yAxisLabelSuffix="%"
                xAxisColor="lightgray"
                pointerConfig={{
                  pointerStripUptoDataPoint: true,
                  pointerStripColor: 'lightgray',
                  pointerStripWidth: 2,
                  strokeDashArray: [2, 5],
                  pointerColor: 'lightgray',
                  radius: 4,
                  pointerLabelWidth: 80,
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
                        <Text style={{ color: 'lightgray', fontSize: 12 }}>
                          {2018}
                        </Text>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>
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
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>
                          {/* {items[1].value} */}
                        </Text>
                      </View>
                    );
                  },
                }}
              />
            </ScrollView>
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
        {title === 'Maintainance' && (
          <View style={styles.zoneDetails}>
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
        {title === 'Stay In Zone' && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              paddingHorizontal: 10,
              paddingVertical: 20,
              backgroundColor: 'rgba(195, 227, 240, 0.2)', // light greenish backdrop
            }}>
            {/* Total Trips - Circle Card */}
            <View
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                backgroundColor: 'rgba(224, 247, 250, 0.9)',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
              }}>
              <View
                style={{
                  backgroundColor: '#a5d6a7', // inner icon circle - medium green
                  borderRadius: 40,
                  padding: 10,
                  marginBottom: 8,
                }}>
                <Icon
                  name="car-multiple"
                  type="material-community"
                  size={26}
                  color="#1b5e20"
                />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#2e7d32' }}>
                Total Trips
              </Text>
              <Text style={{ fontSize: 12, color: '#388e3c' }}>3</Text>
            </View>

            {/* Avg Deviation - Circle Card */}
            <View
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                backgroundColor: 'rgba(232, 234, 246, 0.9)', // soft lavender-blue
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
              }}>
              <View
                style={{
                  backgroundColor: '#c5cae9', // inner icon circle - lavender
                  borderRadius: 40,
                  padding: 10,
                  marginBottom: 8,
                }}>
                <Icon
                  name="timer-sand"
                  type="material-community"
                  size={26}
                  color="#303f9f"
                />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#3f51b5' }}>
                Deviation
              </Text>
              <Text style={{ fontSize: 12, color: '#5c6bc0' }}>22 mins</Text>
            </View>
          </View>
        )}

        {title === 'Stay Away From Zone' && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              // marginTop: 20,
              paddingHorizontal: 10,
              paddingVertical: 20,
              backgroundColor: 'rgba(250, 224, 224, 0.29)',
            }}>
            {/* Delayed Trips - Circle Card */}
            <View
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                backgroundColor: 'rgba(255, 243, 224, 0.9)',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
              }}>
              <View
                style={{
                  backgroundColor: '#ffe0b2',
                  borderRadius: 40,
                  padding: 10,
                  marginBottom: 8,
                }}>
                <Icon
                  name="warning"
                  type="material"
                  size={26}
                  color="#e65100"
                />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>
                Delayed
              </Text>
              <Text style={{ fontSize: 12, color: '#777' }}>3 Trips</Text>
            </View>

            {/* Avg Deviation - Circle Card */}
            <View
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                backgroundColor: 'rgba(224, 247, 250, 0.9)',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
              }}>
              <View
                style={{
                  backgroundColor: '#b2ebf2',
                  borderRadius: 40,
                  padding: 10,
                  marginBottom: 8,
                }}>
                <Icon
                  name="access-time"
                  type="material"
                  size={26}
                  color="#006064"
                />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>
                Deviation
              </Text>
              <Text style={{ fontSize: 12, color: '#777' }}>22 mins</Text>
            </View>
          </View>
        )}

        {title === 'Object With Most Alerts' && (
          <View style={{ marginTop: 10, paddingHorizontal: 10 }}>
            {/* Table Header */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#1e3a8a',
                paddingVertical: 5,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
              }}>
              <Text
                style={{
                  flex: 1,
                  color: '#fff',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                Object
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: '#fff',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                Alerts
              </Text>
            </View>

            {/* Table Body */}
            <ScrollView
              style={{
                maxHeight: 200,
                backgroundColor: 'transparent',
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
              }}>
              {[
                { name: 'Object A', alerts: 5 },
                { name: 'Object B', alerts: 3 },
                { name: 'Object C', alerts: 1 },
              ].map((obj, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    paddingVertical: 5,
                    borderBottomWidth: 1,
                    borderBottomColor: '#e2e8f0',
                    backgroundColor:
                      index % 2 === 0
                        ? 'hsla(225, 94.70%, 55.50%, 0.08)'
                        : 'rgba(34, 87, 249, 0.17)',
                  }}>
                  <Text
                    style={{ flex: 1, textAlign: 'center', color: '#1e293b' }}>
                    {obj.name}
                  </Text>
                  <Text
                    style={{ flex: 1, textAlign: 'center', color: '#1e293b' }}>
                    {obj.alerts}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {title === 'Driver With Most Alerts' && (
          <View style={{ marginTop: 10, paddingHorizontal: 10 }}>
            {/* Table Header */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#1e3a8a',
                paddingVertical: 5,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
              }}>
              <Text
                style={{
                  flex: 1,
                  color: '#fff',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                Driver
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: '#fff',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                Alerts
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: '#fff',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                Last Alert
              </Text>
            </View>

            {/* Table Body */}
            <ScrollView
              style={{
                maxHeight: 200,
                backgroundColor: 'transparent',
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
              }}>
              {driverData.map((driver, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    paddingVertical: 5,
                    borderBottomWidth: 1,
                    borderBottomColor: '#e2e8f0',
                    backgroundColor:
                      index % 2 === 0
                        ? 'hsla(225, 94.70%, 55.50%, 0.08)'
                        : 'rgba(34, 87, 249, 0.17)',
                  }}>
                  <Text
                    style={{ flex: 1, textAlign: 'center', color: '#1e293b' }}>
                    {driver.name}
                  </Text>
                  <Text
                    style={{ flex: 1, textAlign: 'center', color: '#1e293b' }}>
                    {driver.alertCount}
                  </Text>
                  <Text
                    style={{ flex: 1, textAlign: 'center', color: '#1e293b' }}>
                    {driver.lastAlert}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        {title === 'Fleet WorkLoad' && (
          <View
            style={{
              padding: 16,
              backgroundColor: 'rgba(143, 134, 214, 0.1)',
              borderRadius: 12,
            }}>
            <View style={{ height: 140 }}>
              <BarChart
                barWidth={30}
                noOfSections={5}
                barBorderRadius={8}
                frontColor="rgba(8, 0, 255, 0.35)"
                data={[
                  { value: 60, label: 'Unit A' },
                  { value: 90, label: 'Unit B' },
                  { value: 45, label: 'Unit C' },
                  { value: 75, label: 'Unit D' },
                  { value: 30, label: 'Unit E' },
                ]}
                maxValue={100}
                yAxisLabelSuffix="%"
                yAxisTextStyle={{ color: '#E2E8F0', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: '#334155', fontSize: 12 }}
                isAnimated
                animationDuration={1000}
                hideRules
                spacing={20}
                height={150} // Adjust height as needed
              />
            </View>
          </View>
        )}
        {title === 'Renewal Reminder' && (
          <View style={styles.zoneDetails}>
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
      </View>
    </ImageBackground>
  </View>
);

const FleetSummaryCard = ({
  statusMap,
  total,
  thingData,
  fetchCardData,
  selectedValue,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [Location, setLocation] = useState([]);
  const [projectedTrackData, setProjectedTrackData] = useState(null);
  const [parked, setParked] = useState(false);

  const handlePress = label => {
    setSelectedStatus(label);
    if (label === 'Total') {
      setLocation([]);
      setModalVisible(true);
    } else {
      setModalVisible(true);
    }
  };

  const getFilteredItems = () => {
    const now = new Date();
    if (selectedStatus === 'Total') {
      return thingData;
    } else {
      return thingData.filter(item => {
        const diffMinutes = (now - item.updated_on) / (1000 * 60);
        if (selectedStatus === 'Running') return diffMinutes <= 2;
        if (selectedStatus === 'Stopped')
          return diffMinutes > 2 && diffMinutes <= 5;
        if (selectedStatus === 'Unreachable') return diffMinutes > 5;
        return false;
      });
    }
  };

  const filteredItems = getFilteredItems();

  const handleCardClick = item => {
    console.log('itrmee', item);
    if (selectedStatus !== 'Total') {
      fetchCardData(item.thing_id);
      setLocation(item?.derived_live_config?.location || []);
      setModalVisible(false);
      setShowModal(true);

      // Show success toast when card is clicked
      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Vehicle Selected',
        text2: `${item.thing_name} details loaded successfully`,
        visibilityTime: 3000,
      });
    }
  };

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
    { label: 'Running', value: statusMap.Running || 0, color: '#28a745' },
    { label: 'Stopped', value: statusMap.Stopped || 0, color: '#ffc107' },
    { label: 'Unreachable', value: statusMap.Unreachable || 0, color: '#dc3545' },
    {
      label: 'Total',
      value:
        (statusMap.Running || 0) +
        (statusMap.Stopped || 0) +
        (statusMap.Unreachable || 0),
      color: '#007bff',
    },
  ];

  const handleDateSelect = (startDate, endDate) => {
    console.log('Date range selected:', startDate, endDate);
  };

  const handleTrackPress = () => {
    if (Array.isArray(Location) && Location[0] !== undefined && Location[1] !== undefined) {
      setShowMap(true);
      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Tracking Started',
        text2: 'Vehicle tracking initialized',
        visibilityTime: 3000,
      });
    } else {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Tracking Failed',
        text2: 'Location data is not available',
        visibilityTime: 4000,
      });
    }
  };

  return (
    <>
      <View style={styles.summaryCard}>
        <View
          style={{
            backgroundColor: 'transparent',
            paddingVertical: 8,
            textAlign: 'center',
            borderRadius: 8,
            overflow: 'hidden',
          }}>
          <Text style={styles.headerText}>Status</Text>
        </View>
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
                <View style={{ alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: themeColors.white,
                    }}>
                    {total}
                  </Text>
                  <Text style={{ fontSize: 12, color: themeColors.textMuted }}>Total</Text>
                </View>
              )}
            />
          </View>

          <View style={styles.statusCardsContainer}>
            {items.map(item => (
              <TouchableOpacity
                key={item.label}
                style={[styles.statusCard, { borderLeftColor: item.color }]}
                onPress={() => handlePress(item.label)}>
                <Text style={styles.statusTitle}>{item.label}</Text>
                <Text style={styles.statusCount}>{item.value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Summary Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: '90%',
              maxHeight: '80%',
              backgroundColor: '#fff',
              borderRadius: 10,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 10,
              backgroundcolor: 'white',
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 8,
                color: 'black',
              }}>
              {selectedStatus === 'Total'
                ? 'All Devices'
                : `${selectedStatus} Details`}
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 15, color: 'black' }}>
              Showing {filteredItems.length} out of {thingData.length} devices
            </Text>

            <ScrollView style={{ maxHeight: 300 }}>
              {filteredItems.map((item, index) => (
                <TouchableOpacity
                  key={item.thing_id || index}
                  style={{
                    backgroundColor: '#f9f9f9',
                    padding: 15,
                    marginBottom: 12,
                    borderRadius: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                  onPress={() => handleCardClick(item)}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      marginBottom: 4,
                      color: 'black',
                    }}>
                    {item.thing_name}
                  </Text>
                  <Text style={{ fontSize: 14, marginBottom: 2, color: 'black' }}>
                    <Text style={{ fontWeight: '600', color: 'black' }}>
                      Thing ID:
                    </Text>{' '}
                    {item.thing_id}
                  </Text>
                  <Text style={{ fontSize: 14, marginBottom: 2, color: 'black' }}>
                    <Text style={{ fontWeight: '600', color: 'black' }}>
                      Description:
                    </Text>{' '}
                    {item.desc || 'No description'}
                  </Text>
                  <Text style={{ fontSize: 14, marginBottom: 6, color: 'black' }}>
                    <Text style={{ fontWeight: '600', color: 'black' }}>
                      Last Updated:
                    </Text>{' '}
                    {item.updated_on.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Pressable
              style={{
                marginTop: 15,
                backgroundColor: '#1E90FF',
                borderRadius: 6,
                paddingVertical: 10,
                alignItems: 'center',
              }}
              onPress={() => setModalVisible(false)}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Location Track or Alert */}
      {showMap &&
        Array.isArray(Location) &&
        Location.length >= 2 &&
        Location[0] !== undefined &&
        Location[1] !== undefined ? (
        <View style={{ flex: 1 }}>
          <Track
            showTrack={
              Array.isArray(Location[0])
                ? Location.map(coord => ({
                  latitude: parseFloat(coord[0]),
                  longitude: parseFloat(coord[1]),
                }))
                : [{ latitude: parseFloat(Location[0]), longitude: parseFloat(Location[1]) }]
            }
            projectedTrack={projectedTrackData || { data: [] }}
            latitude={parseFloat(Location[0])}
            longitude={parseFloat(Location[1])}
            visible={showMap}
            onClose={() => {
              setShowMap(false);
              Toast.show({
                type: 'info',
                position: 'top',
                text1: 'Tracking Stopped',
                text2: 'Vehicle tracking has been closed',
                visibilityTime: 3000,
              });
            }}
          />
        </View>
      ) : null}

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={showModal}
        onRequestClose={() => setShowModal(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: '90%',
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
              backgroundColor: 'black',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
                Vehicle Details
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => {
                  setViewHistory(true);
                  Toast.show({
                    type: 'success',
                    position: 'top',
                    text1: 'History View',
                    text2: 'Opening vehicle history',
                    visibilityTime: 3000,
                  });
                }}>
                  <Text
                    style={{
                      marginHorizontal: 5,
                      color: '#1E90FF',
                      fontWeight: 'bold',
                    }}>
                    History
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleTrackPress}>
                  <Text
                    style={{
                      marginHorizontal: 5,
                      color: '#1E90FF',
                      fontWeight: 'bold',
                    }}>
                    Track
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  setShowModal(false);
                  Toast.show({
                    type: 'info',
                    position: 'top',
                    text1: 'Modal Closed',
                    text2: 'Vehicle details closed',
                    visibilityTime: 2000,
                  });
                }}>
                  <Text
                    style={{
                      marginHorizontal: 5,
                      color: '#FF6347',
                      fontWeight: 'bold',
                    }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{ height: 1, backgroundColor: '#ccc', marginBottom: 10 }}
            />

            <View style={{ gap: 12 }}>
              {/* Speed */}
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="speed" size={30} color="#1E90FF" />
                <Text style={{ fontWeight: '600', color: 'white' }}>Speed:</Text>
                <Text style={{ flex: 1, color: 'white' }}>
                  {selectedValue?.derived_live_config?.speed?.toFixed(2) ??
                    'N/A'}{' '}
                  km/h
                </Text>
              </View>

              {/* Acceleration */}
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="trending-up" size={30} color="#1E90FF" />
                <Text style={{ fontWeight: '600', color: 'white' }}>Acc:</Text>
                <Text style={{ flex: 1, color: 'white' }}>
                  {selectedValue?.derived_live_config?.acceleration != null
                    ? `${selectedValue.derived_live_config?.acceleration.toFixed(
                      2,
                    )} m/s²`
                    : 'N/A'}
                </Text>
              </View>

              {/* Total Distance */}
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="straighten" size={30} color="#1E90FF" />
                <Text style={{ fontWeight: '600', color: 'white' }}>
                  Total Dist:
                </Text>
                <Text style={{ flex: 1, color: 'white' }}>
                  {(
                    selectedValue?.derived_live_config?.total_distance / 1000
                  ).toFixed(2) ?? 'N/A'}{' '}
                  km
                </Text>
              </View>

              {/* Current Distance */}
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="place" size={30} color="#1E90FF" />
                <Text style={{ fontWeight: '600', color: 'white' }}>
                  Current Dist:
                </Text>
                <Text style={{ flex: 1, color: 'white' }}>
                  {(
                    selectedValue?.derived_live_config?.current_distance / 1000
                  ).toFixed(2) ?? 'N/A'}{' '}
                  km
                </Text>
              </View>

              {/* Last Updated */}
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="update" size={30} color="#1E90FF" />
                <Text style={{ fontWeight: '600', color: 'white' }}>
                  Last Updated:
                </Text>
                <Text style={{ flex: 1, color: 'white' }}>
                  {selectedValue?.derived_live_config?.generated_datetime
                    ? moment(
                      selectedValue.derived_live_config?.generated_datetime,
                    ).format('DD/MM/YYYY h:mm a')
                    : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <HistoryModal
        visible={viewHistory}
        onClose={() => {
          setViewHistory(false);
          Toast.show({
            type: 'info',
            position: 'top',
            text1: 'History Closed',
            text2: 'Vehicle history view closed',
            visibilityTime: 2000,
          });
        }}
        onDateSelect={handleDateSelect}
        vehicleData={thingData}
        log={[selectedValue]}
      />
    </>
  );
};

const FleetDashboard = navigation => {
  const statusBarHeight = useStatusBarHeight();
  const [statusMap, setStatusMap] = useState({});
  const [fleetData, setFleetData] = useState([]);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRanges, setDateRanges] = useState({});
  const [thingData, setThingData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pageLoad, setPageLoad] = useState(false);
  const [userType, setUserType] = useState(null);
  const [tripNameItems, setTripNameItems] = useState([]);

  const showToast = (type, title, message) => {
    Toast.show({
      type: type,
      position: 'top',
      text1: title,
      text2: message,
      visibilityTime: type === 'error' ? 5000 : 3000,
      autoHide: true,
      topOffset: statusBarHeight,
    });
  };

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

    setFilterStates(prev => ({
      ...prev,
      openModalFor: '',
    }));
  };

  const openCalendarFor = (type, title) => {
    setFilterStates(prev => ({
      ...prev,
      openModalFor: type,
    }));
  };

  const fetchDerivedData = useCallback(async () => {
    try {
      // Get project_sl from AsyncStorage
      const projectSl = await getObjByKey('project_sl');

      if (!projectSl) {
        showToast('error', 'Data Error', 'Project information not found. Please login again.');
        return;
      }

      const url = `${BASE_URL}projects/${projectSl}/things/?page=1&search=&type=gps`;
      setPageLoad(true);

      const response = await GETNETWORK(url, true);

      if (response.data && response.data.things) {

        const fullThingData = response.data.things.map(item => ({
          ...item,
          updated_on: new Date(item.updated_on),
        }));

        const currentTime = new Date();
        const statusCounts = {
          Running: 0,
          Stopped: 0,
          Unreachable: 0,
        };

        fullThingData.forEach(item => {
          const timeDiff = (currentTime - item.updated_on) / (1000 * 60);
          if (timeDiff <= 2) statusCounts.Running += 1;
          else if (timeDiff <= 5) statusCounts.Stopped += 1;
          else statusCounts.Unreachable += 1;
        });

        setStatusMap(statusCounts);
        setTotal(fullThingData.length);

        const transformedData = [
          { title: 'Total Distance', color: '#28a745', icon: USAGE },
          { title: 'OverSpeed', color: '#ffc107', icon: OVERSPEED },
          { title: 'Idle', color: '#dc3545', icon: IDLE },
          { title: 'Fuel', color: '#007bff', icon: FUEL },
          { title: 'Maintainance', color: '#007bff', icon: ZONE },
          { title: 'Timeline Deviation', color: '#007bff', icon: TIMELINE },
          { title: 'Stay In Zone', color: '#007bff', icon: STAYZONE },
          { title: 'Stay Away From Zone', color: '#007bff', icon: STAYAWAY },
          { title: 'Object With Most Alerts', color: '#007bff', icon: ZONE },
          { title: 'Driver With Most Alerts', color: '#007bff', icon: ZONE },
          { title: 'Fleet WorkLoad', color: '#007bff', icon: ZONE },
          { title: 'Renewal Reminder', color: '#007bff', icon: ZONE },
        ];

        setFleetData(transformedData);
        setThingData(fullThingData);

        showToast('success', 'Data Loaded', 'Fleet data updated successfully');
      } else {
        showToast('error', 'Data Error', 'No vehicle data found');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('error', 'Network Error', 'Failed to load fleet data');
    } finally {
      setPageLoad(false);
    }
  }, []);

  const fetchCardData = useCallback(
    async thingId => {
      try {
        // Get project_sl from AsyncStorage
        const projectSl = await getObjByKey('project_sl');

        if (!projectSl) {
          showToast('error', 'Project Error', 'Project information not found. Please login again.');
          return;
        }

        const Url = `${BASE_URL}things/?thing_id=${thingId}&project_id=${projectSl}`;
        setPageLoad(true);

        const response = await GETNETWORK(Url, true);
        console.log('API Response (GPS list):', response);

        if (response.data && response.data.things) {
          const gpsList = response.data.things;
          setFleetData(gpsList);
        }

        const data = thingData.find(item => item.thing_id === thingId);
        if (data) {
          setSelectedValue(data);
          setShowModal(true);
          console.log('Selected Data:?????????????????????????', data);
          showToast('success', 'Vehicle Loaded', `${data.thing_name} details loaded`);
        } else {
          showToast('error', 'Vehicle Error', 'Vehicle data not found');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        showToast('error', 'Load Error', 'Failed to load vehicle details');
      } finally {
        setPageLoad(false);
      }
    },
    [thingData],
  );

  useEffect(() => {
    fetchDerivedData();
    const intervalId = setInterval(fetchDerivedData, 30000);
    return () => clearInterval(intervalId);
  }, [fetchDerivedData]);

  const onRefresh = async () => {
    setRefreshing(true);
    showToast('info', 'Refreshing', 'Updating fleet data...');
    await fetchDerivedData();
    setRefreshing(false);
    showToast('success', 'Refreshed', 'Fleet data updated');
  };

  const GetUserType = async () => {
    try {
      const loginRes = await getObjByKey('loginResponse');
      setUserType(loginRes?.data?.user_type);
      showToast('success', 'Session Loaded', 'User session initialized');
    } catch (error) {
      console.error('User type error:', error);
      showToast('error', 'Session Error', 'Failed to load user session');
    }
  };

  useEffect(() => {
    GetUserType();
  }, []);

  return (
    <Fragment>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['left', 'right', 'bottom']}>
        <Header
          onMenuPress={() => {
            console.log('here i want drawer navigation open', navigation);
            navigation.navigation.openDrawer();
          }}
          title="Dashboard"
        />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {userType === 'admin' || userType === 'manager' ? (
            <FlatList
              ListHeaderComponent={
                <FleetSummaryCard
                  statusMap={statusMap}
                  total={total}
                  thingData={thingData}
                  selectedValue={selectedValue}
                  fetchCardData={fetchCardData}
                />
              }
              data={fleetData}
              keyExtractor={item => item.title}
              initialNumToRender={6}
              maxToRenderPerBatch={4}
              windowSize={5}
              removeClippedSubviews={Platform.OS === 'android'}
              renderItem={({ item }) => (
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
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          ) : (
            <Dashboard />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Loader visible={pageLoad} />
      <Toast />
    </Fragment>
  );
};

export default FleetDashboard;