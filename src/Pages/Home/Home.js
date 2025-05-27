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
  Pressable,
  ScrollView,
  Alert,
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
// import {RFValue} from 'react-native-responsive-fontsize';
import Header from '../../components/Header';
import {BRAND} from '../../constants/color';
import {styles} from './HomeStyles';
import {Image} from 'react-native';
import HistoryModal from '../History/HistoryModal';
import Track from '../Track/Track';
import {Loader} from '../../components/Loader';
import moment from 'moment';

const WHITE = '#FFFFFF';
const data1 = [
  {value: 70},
  {value: 36},
  {value: 50},
  {value: 40},
  {value: 18},
  {value: 38},
];
const driverData = [
  {name: 'Ashima', alertCount: 12, lastAlert: '2025-05-05 10:30 AM'},
  {name: 'Rihana', alertCount: 9, lastAlert: '2025-05-04 3:45 PM'},
  {name: 'Dibya', alertCount: 6, lastAlert: '2025-05-03 6:20 AM'},
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
            <Image
              source={FILTER}
              style={{width: 20, height: 20}}
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
            onRequestClose={() => {}}>
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
                      style={[styles.dateButton, {backgroundColor: '#007bff'}]}
                      onPress={applyFilters}>
                      <Text style={styles.dateButtonText}>Apply</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.dateButton, {backgroundColor: 'gray'}]}
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
            </ScrollView>
          </View>
        )}
        {/* 
{title === 'Total Distance' && (
  <View style={{ height: HEIGHT * 0.5, width: '100%', flexDirection: 'column' }}>
    <View style={{ flexDirection: 'row', flex: 1 }}>
      <View
        style={{
          width: 40,
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          paddingVertical: 10,
        }}>
        {[100, 75, 50, 25, 0].map((label, index) => (
          <Text key={index} style={{ color: 'gray', fontSize: 10 }}>
            {label}%
          </Text>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          height={HEIGHT * 0.25}
          width={WIDTH * 1.0}
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
          yAxisColor="transparent"
          yAxisThickness={0}
          rulesType="solid"
          rulesColor="gray"
          yAxisTextStyle={{ color: 'transparent' }}
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
            pointerLabelComponent: items => (
              <View
                style={{
                  height: 100,
                  width: 100,
                  backgroundColor: '#282C3E',
                  borderRadius: 4,
                  justifyContent: 'center',
                  paddingLeft: 16,
                }}>
                <Text style={{ color: 'lightgray', fontSize: 12 }}>{2018}</Text>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{items[0].value}</Text>
                <Text style={{ color: 'lightgray', fontSize: 12, marginTop: 12 }}>{2019}</Text>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                </Text>
              </View>
            ),
          }}
        />
      </ScrollView>
    </View>

    <View style={{ flexDirection: 'row', marginLeft: 40 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {data1.map((_, index) => (
          <Text
            key={index}
            style={{
              width: 56,
              textAlign: 'center',
              fontSize: 10,
              color: 'gray',
            }}>
            {`T${index + 1}`}
          </Text>
        ))}
      </ScrollView>
    </View>
  </View>
)} */}
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
                shadowOffset: {width: 0, height: 3},
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
              <Text style={{fontSize: 14, fontWeight: '600', color: '#2e7d32'}}>
                Total Trips
              </Text>
              <Text style={{fontSize: 12, color: '#388e3c'}}>3</Text>
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
                shadowOffset: {width: 0, height: 3},
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
              <Text style={{fontSize: 14, fontWeight: '600', color: '#3f51b5'}}>
                Deviation
              </Text>
              <Text style={{fontSize: 12, color: '#5c6bc0'}}>22 mins</Text>
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
                shadowOffset: {width: 0, height: 3},
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
              <Text style={{fontSize: 14, fontWeight: '600', color: '#333'}}>
                Delayed
              </Text>
              <Text style={{fontSize: 12, color: '#777'}}>3 Trips</Text>
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
                shadowOffset: {width: 0, height: 3},
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
              <Text style={{fontSize: 14, fontWeight: '600', color: '#333'}}>
                Deviation
              </Text>
              <Text style={{fontSize: 12, color: '#777'}}>22 mins</Text>
            </View>
          </View>
        )}

        {title === 'Object With Most Alerts' && (
          <View style={{marginTop: 10, paddingHorizontal: 10}}>
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
                {name: 'Object A', alerts: 5},
                {name: 'Object B', alerts: 3},
                {name: 'Object C', alerts: 1},
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
                    style={{flex: 1, textAlign: 'center', color: '#1e293b'}}>
                    {obj.name}
                  </Text>
                  <Text
                    style={{flex: 1, textAlign: 'center', color: '#1e293b'}}>
                    {obj.alerts}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {title === 'Driver With Most Alerts' && (
          <View style={{marginTop: 10, paddingHorizontal: 10}}>
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
                    style={{flex: 1, textAlign: 'center', color: '#1e293b'}}>
                    {driver.name}
                  </Text>
                  <Text
                    style={{flex: 1, textAlign: 'center', color: '#1e293b'}}>
                    {driver.alertCount}
                  </Text>
                  <Text
                    style={{flex: 1, textAlign: 'center', color: '#1e293b'}}>
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
            <View style={{height: 140}}>
              <BarChart
                barWidth={30}
                noOfSections={5}
                barBorderRadius={8}
                frontColor="rgba(8, 0, 255, 0.35)"
                data={[
                  {value: 60, label: 'Unit A'},
                  {value: 90, label: 'Unit B'},
                  {value: 45, label: 'Unit C'},
                  {value: 75, label: 'Unit D'},
                  {value: 30, label: 'Unit E'},
                ]}
                maxValue={100}
                yAxisLabelSuffix="%"
                yAxisTextStyle={{color: '#475569', fontSize: 10}}
                xAxisLabelTextStyle={{color: '#334155', fontSize: 12}}
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
  // const [selectedValue, setSelectedValue] = useState(null);
  const [viewHistory, setViewHistory] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [Location, setLocation] = useState([]);
  const [projectedTrackData, setProjectedTrackData] = useState(null);
  const [parked, setParked] = useState(false);

  //  const projectedTrack = async id => {
  //     try {
  //       const url = `${BASE_URL}route/assign-route/${id}/`; // Construct the API URL
  //       const result = await GETNETWORK(url, true); // Use GETNETWORK with token authentication
  //       console.log(
  //         result,
  //         'hhhhhhhhhhhhhhhhhhhhhhhhhhhhwwwwwwwwwwwwwwwwwwwwwlllllllllllllllllllllllllooooooooooooo-----------------------------',
  //       );

  //       setProjectedTrackData(result); // Update state with the fetched data
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };

  const handlePress = label => {
    setSelectedStatus(label);
    if (label === 'Total') {
      // Show all data when 'Total' is clicked
      // setSelectedValue(null); // Clear selected item if any
      setLocation([]); // Clear location if any
      setModalVisible(true); // Open the modal
    } else {
      setModalVisible(true);
    }
  };

  // Modify `getFilteredItems` function to show all data for "Total"
  const getFilteredItems = () => {
    const now = new Date();
    if (selectedStatus === 'Total') {
      // Return all items when Total is selected
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

  // const handleCardClick = item => {
  //   fetchCardData(item.thing_id);
  //   setSelectedValue(item);
  //   setLocation(item.Location || []); // assumes item.Location = [lat, long]
  //   setModalVisible(false);
  //   setShowModal(true);
  // };

  const handleCardClick = item => {
    console.log('itrmee', item);
    if (selectedStatus !== 'Total') {
      fetchCardData(item.thing_id);
      // setSelectedValue(selectedValue);
      setLocation(item.Location || []); // assumes item.Location = [lat, long]
      setModalVisible(false);
      setShowModal(true);
    } else {
      // Do nothing if 'Total' is clicked, because we want to show all items in the modal
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
    {label: 'Running', value: statusMap.Running || 0, color: '#28a745'},
    {label: 'Stopped', value: statusMap.Stopped || 0, color: '#ffc107'},
    {label: 'Unreachable', value: statusMap.Unreachable || 0, color: '#dc3545'},
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

  console.log('selectedValueselectedValue', selectedValue);

  return (
    <>
      <View style={styles.summaryCard}>
        <View
          style={{
            backgroundColor: '#F5F5F5', // Light background
            color: '#ffffff', // White text
            fontWeight: 'bold',
            paddingVertical: 8,
            textAlign: 'center',
            borderRadius: 8,
            fontSize: 16,
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

          <View style={styles.statusCardsContainer}>
            {items.map(item => (
              <TouchableOpacity
                key={item.label}
                style={[styles.statusCard, {borderLeftColor: item.color}]}
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
              shadowOffset: {width: 0, height: 4},
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
            <Text style={{fontSize: 16, marginBottom: 15, color: 'black'}}>
              Showing {filteredItems.length} out of {thingData.length} devices
            </Text>

            <ScrollView style={{maxHeight: 300}}>
              {filteredItems.map((item, index) => (
                <TouchableOpacity
                  key={item.thing_id || index}
                  style={{
                    backgroundColor: '#f9f9f9',
                    padding: 15,
                    marginBottom: 12,
                    borderRadius: 10,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
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
                  <Text style={{fontSize: 14, marginBottom: 2, color: 'black'}}>
                    <Text style={{fontWeight: '600', color: 'black'}}>
                      Thing ID:
                    </Text>{' '}
                    {item.thing_id}
                  </Text>
                  <Text style={{fontSize: 14, marginBottom: 2, color: 'black'}}>
                    <Text style={{fontWeight: '600', color: 'black'}}>
                      Description:
                    </Text>{' '}
                    {item.desc || 'No description'}
                  </Text>
                  <Text style={{fontSize: 14, marginBottom: 6, color: 'black'}}>
                    <Text style={{fontWeight: '600', color: 'black'}}>
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
              <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Location Track or Alert */}
      {showMap &&
      Array.isArray(Location) &&
      Location[0] !== undefined &&
      Location[1] !== undefined ? (
        <View style={{flex: 1}}>
          <Track
            showTrack={showMap}
            projectedTrack={[projectedTrackData]} // if needed
            latitude={Location[0]}
            longitude={Location[1]}
            onClose={() => setShowMap(false)}
          />
        </View>
      ) : (
        showMap &&
        Alert.alert(
          'Invalid Location',
          'Location data is not available. Cannot track.',
          [{text: 'OK'}],
        )
      )}

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
              shadowOffset: {width: 0, height: 2},
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
              <Text style={{fontSize: 18, fontWeight: 'bold', color: 'white'}}>
                Vehicle Details
              </Text>
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity onPress={() => setViewHistory(true)}>
                  <Text
                    style={{
                      marginHorizontal: 5,
                      color: '#1E90FF',
                      fontWeight: 'bold',
                    }}>
                    History
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowMap(true)}>
                  <Text
                    style={{
                      marginHorizontal: 5,
                      color: '#1E90FF',
                      fontWeight: 'bold',
                    }}>
                    Track
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowModal(false)}>
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
              style={{height: 1, backgroundColor: '#ccc', marginBottom: 10}}
            />

            <View style={{gap: 12}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  alignContent: 'space-between',
                  justifyContent: 'space-between',
                }}>
                <View
                  style={[
                    styles.parkingIcon,
                    {borderColor: parked ? 'green' : 'red'},
                  ]}>
                  <Text
                    style={styles.parkingText}
                    onPress={() => {
                      setParked(!parked);
                      console.log('Parking status toggled');
                    }}>
                    P
                  </Text>
                </View>
                <Text
                  style={{fontWeight: '600', color: 'white'}}
                  onPress={() => {
                    console.log('genfencing clicked');
                  }}>
                  Geofencing{' '}
                </Text>
              </View>
              {/* Speed */}
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Icon name="speed" size={30} color="#1E90FF" />
                <Text style={{fontWeight: '600', color: 'white'}}>Speed:</Text>
                <Text style={{flex: 1, color: 'white'}}>
                  {selectedValue?.derived_live_config?.speed?.toFixed(2) ??
                    'N/A'}{' '}
                  km/h
                </Text>
              </View>

              {/* Acceleration */}
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Icon name="trending-up" size={30} color="#1E90FF" />
                <Text style={{fontWeight: '600', color: 'white'}}>Acc:</Text>
                <Text style={{flex: 1, color: 'white'}}>
                  {selectedValue?.derived_live_config?.acceleration != null
                    ? `${selectedValue.derived_live_config?.acceleration.toFixed(
                        2,
                      )} m/s²`
                    : 'N/A'}
                </Text>
              </View>

              {/* Total Distance */}
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Icon name="straighten" size={30} color="#1E90FF" />
                <Text style={{fontWeight: '600', color: 'white'}}>
                  Total Dist:
                </Text>
                <Text style={{flex: 1, color: 'white'}}>
                  {(
                    selectedValue?.derived_live_config?.total_distance / 1000
                  ).toFixed(2) ?? 'N/A'}{' '}
                  km
                </Text>
              </View>

              {/* Current Distance */}
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Icon name="place" size={30} color="#1E90FF" />
                <Text style={{fontWeight: '600', color: 'white'}}>
                  Current Dist:
                </Text>
                <Text style={{flex: 1, color: 'white'}}>
                  {(
                    selectedValue?.derived_live_config?.current_distance / 1000
                  ).toFixed(2) ?? 'N/A'}{' '}
                  km
                </Text>
              </View>

              {/* Last Updated */}
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Icon name="update" size={30} color="#1E90FF" />
                <Text style={{fontWeight: '600', color: 'white'}}>
                  Last Updated:
                </Text>
                <Text style={{flex: 1, color: 'white'}}>
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

      {/* <View style={{flex: 1}}>
          <Track
            showTrack={showTrack}
            projectedTrack={projectedTrackData}
            latitude={Location[0]} // Pass the latitude value
            longitude={Location[1]} // Pass the longitude value
            onClose={handleClose} // Handle close functionality
          />
        </View> */}
      <HistoryModal
        visible={viewHistory}
        onClose={() => setViewHistory(false)}
        onDateSelect={handleDateSelect}
        vehicleData={thingData}
        log={[selectedValue]} // Replace with actual log data if needed
      />
    </>
  );
};

const FleetDashboard = () => {
  const [statusMap, setStatusMap] = useState({});
  const [fleetData, setFleetData] = useState([]);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRanges, setDateRanges] = useState({});
  const [thingData, setThingData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pageLoad, setPageLoad] = useState(false);

  // const [showMap, setShowMap] = useState(false);
  // const [viewHistory, setViewHistory] = useState(false);

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
    setPageLoad(true);
    try {
      const response = await GETNETWORK(url, true);
      console.log('API Response:------------', response);

      if (response.data && response.data.things) {
        console.log('Things from API:--------------', response.data?.things);

        const fullThingData = response.data.things.map(item => ({
          ...item,
          updated_on: new Date(item.updated_on), // parse for comparison
        }));
        console.log('Full Things Data:-------', fullThingData);

        const currentTime = new Date();
        const statusCounts = {
          Running: 0,
          Stopped: 0,
          Unreachable: 0,
        };

        fullThingData.forEach(item => {
          const timeDiff = (currentTime - item.updated_on) / (1000 * 60); // in minutes
          if (timeDiff <= 2) statusCounts.Running += 1;
          else if (timeDiff <= 5) statusCounts.Stopped += 1;
          else statusCounts.Unreachable += 1;
        });
        console.log('Status Counts:-------', statusCounts);

        setStatusMap(statusCounts);
        setTotal(fullThingData.length);

        const transformedData = [
          {title: 'Total Distance', color: '#28a745', icon: USAGE},
          {title: 'OverSpeed', color: '#ffc107', icon: OVERSPEED},
          {title: 'Idle', color: '#dc3545', icon: IDLE},
          {title: 'Fuel', color: '#007bff', icon: FUEL},
          {title: 'Maintainance', color: '#007bff', icon: ZONE},
          {title: 'Timeline Deviation', color: '#007bff', icon: TIMELINE},
          {title: 'Stay In Zone', color: '#007bff', icon: STAYZONE},
          {title: 'Stay Away From Zone', color: '#007bff', icon: STAYAWAY},
          {title: 'Object With Most Alerts', color: '#007bff', icon: ZONE},
          {title: 'Driver With Most Alerts', color: '#007bff', icon: ZONE},
          {title: 'Fleet WorkLoad', color: '#007bff', icon: ZONE},
          {title: 'Renewal Reminder', color: '#007bff', icon: ZONE},
        ];

        setFleetData(transformedData);
        setThingData(fullThingData); // 🔁 Save full object here
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setPageLoad(false); // Hide loader at the end
    }
  }, []);

  const fetchCardData = useCallback(
    async thingId => {
      const Url = `${BASE_URL}things/?thing_id=${thingId}&project_id=117`;
      setPageLoad(true);

      try {
        const response = await GETNETWORK(Url, true);
        console.log('API Response (GPS list):', response);

        if (response.data && response.data.things) {
          const gpsList = response.data.things;
          setFleetData(gpsList);
        }

        // Find the selected data from thingData
        const data = thingData.find(item => item.thing_id === thingId);
        if (data) {
          setSelectedValue(data);
          setShowModal(true); // Show vehicle modal
          console.log('Selected Data:?????????????????????????', data);
        }
      } catch (error) {
        console.error('Fetch error:', error);
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
    await fetchDerivedData();
    setRefreshing(false);
  };

  return (
    <Fragment>
      <StatusBar backgroundColor={'#0284c7'} barStyle="dark-content" />
      <SafeAreaView style={styles.safeareacontainer}>
        <Header title="Dashboard" />

        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <FlatList
            ListHeaderComponent={
              <FleetSummaryCard
                statusMap={statusMap}
                total={total}
                thingData={thingData}
                selectedValue={selectedValue}
                // fetchCardData={(thingId) => {
                //   const data = thingData.find(item => item.thing_id === thingId);
                //   setSelectedValue(data);
                //   setShowModal(true); // show vehicle modal
                // }}
                fetchCardData={fetchCardData}
              />
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
      <Loader visible={pageLoad} />
    </Fragment>
  );
};

export default FleetDashboard;
