import React, {useState, useEffect, Fragment} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  RefreshControl,
  Alert,
} from 'react-native';
import {BASE_URL} from '../../constants/url';
import {Loader} from '../../components/Loader';
import {Icon} from 'react-native-paper';
import {GETNETWORK, POSTNETWORK} from '../../utils/Network';
import {getObjByKey} from '../../utils/Storage';
import TripStart from '../Sidebarpages/TripStart';
import TripStop from '../Sidebarpages/TripStop';
// import AddExpense from './AddExpense'; // Import the AddExpense component

const Dashboard = ({navigation}) => {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pageLoad, setPageLoad] = useState(false);
  const [DriverId, setDriverId] = useState('');
  const [showTripStartModal, setShowTripStartModal] = useState(false);
  const [showTripStopModal, setShowTripStopModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [tripToStart, setTripToStart] = useState(null);
  const [tripToStop, setTripToStop] = useState(null);
  const [tripForExpense, setTripForExpense] = useState(null);

  const GetTrip = async id => {
    const Url = `${BASE_URL}trips/trip_assignment/`;
    setPageLoad(true);

    try {
      const response = await GETNETWORK(Url, true);
      console.log('Trip Data:', response.data);

      const tripsData = response.data || [];
      setTrips(tripsData);
      setFilteredTrips(tripsData);
      setPageLoad(false);
    } catch (error) {
      console.error('Error fetching trips:', error);
      alert('Failed to fetch trip data. Please try again.');
      setPageLoad(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const loginRes = await getObjByKey('loginResponse');
      const driverId = loginRes?.data?.driver_id;
      setDriverId(driverId);

      if (driverId) {
        await GetTrip(driverId);
      }
    };

    init();
  }, []);

  useEffect(() => {
    filterTrips();
  }, [searchQuery, statusFilter, trips]);

  const filterTrips = () => {
    let filtered = trips;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        trip =>
          trip.trip_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (trip.thing_name &&
            trip.thing_name.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(trip => trip.status === statusFilter);
    }

    setFilteredTrips(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    GetTrip();
    setRefreshing(false);
  };

  const formatDateTime = datetimeStr => {
    if (!datetimeStr) return 'N/A';

    const date = new Date(datetimeStr);
    return date.toLocaleString();
  };

  const getStatusColor = status => {
    switch (status) {
      case 'scheduled':
        return '#3498db';
      case 'in-progress':
        return '#f39c12';
      case 'completed':
        return '#2ecc71';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  const getStatusText = status => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleTripPress = trip => {
    setSelectedTrip(trip);
    setModalVisible(true);
  };

  // Handle start trip - show the TripStart modal
  const handleStartTrip = trip => {
    setTripToStart(trip);
    setShowTripStartModal(true);
    setModalVisible(false);
  };

  // Handle stop trip - show the TripStop modal
  const handleStopTrip = trip => {
    setTripToStop(trip);
    setShowTripStopModal(true);
    setModalVisible(false);
  };

  // Handle add expense - show the AddExpense modal
  const handleAddExpense = trip => {
    setTripForExpense(trip);
    setShowAddExpenseModal(true);
    setModalVisible(false);
  };

  const renderTripCard = trip => (
    <TouchableOpacity
      key={trip.trip_assignment_id}
      style={styles.tripCard}
      onPress={() => handleTripPress(trip)}>
      <View style={styles.tripHeader}>
        <Text style={styles.tripName}>{trip.trip_name}</Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(trip.status)},
          ]}>
          <Text style={styles.statusText}>{getStatusText(trip.status)}</Text>
        </View>
      </View>

      <View style={styles.tripDetails}>
        <View style={styles.detailRow}>
          <Icon source="calendar" size={16} color="#555" />
          <Text style={styles.detailText}>
            {formatDateTime(trip.scheduled_datetime)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon source="car" size={16} color="#555" />
          <Text style={styles.detailText}>
            {trip.thing_name || 'No vehicle assigned'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon source="account" size={16} color="#555" />
          <Text style={styles.detailText}>
            {trip.driver_name || 'No driver assigned'}
          </Text>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metric}>
            <Icon source="map-marker-distance" size={16} color="#3498db" />
            <Text style={styles.metricText}>{trip.estimated_distance} km</Text>
          </View>

          <View style={styles.metric}>
            <Icon source="fuel" size={16} color="#f39c12" />
            <Text style={styles.metricText}>{trip.estimated_fuel} L</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* {trip.status === 'scheduled' && ( */}
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => handleStartTrip(trip)}>
              <Icon source="play" size={16} color="#fff" />
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
          {/* )} */}

          {/* {trip.status === 'in-progress' && ( */}
            <>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={() => handleStopTrip(trip)}>
                <Icon source="stop" size={16} color="#fff" />
                <Text style={styles.buttonText}>Stop</Text>
              </TouchableOpacity>

           
            </>
          {/* )} */}

          {/* {trip.status === 'completed' && ( */}
            <TouchableOpacity
              style={styles.expenseButton}
              onPress={() => handleAddExpense(trip)}>
              <Icon source="cash" size={16} color="#fff" />
              <Text style={styles.buttonText}>Add Expense</Text>
            </TouchableOpacity>
          {/* )} */}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButtons = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          statusFilter === 'all' && styles.activeFilter,
        ]}
        onPress={() => setStatusFilter('all')}>
        <Text
          style={[
            styles.filterText,
            statusFilter === 'all' && styles.activeFilterText,
          ]}>
          All
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          statusFilter === 'scheduled' && styles.activeFilter,
        ]}
        onPress={() => setStatusFilter('scheduled')}>
        <Text
          style={[
            styles.filterText,
            statusFilter === 'scheduled' && styles.activeFilterText,
          ]}>
          Scheduled
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          statusFilter === 'in-progress' && styles.activeFilter,
        ]}
        onPress={() => setStatusFilter('in-progress')}>
        <Text
          style={[
            styles.filterText,
            statusFilter === 'in-progress' && styles.activeFilterText,
          ]}>
          In Progress
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          statusFilter === 'completed' && styles.activeFilter,
        ]}
        onPress={() => setStatusFilter('completed')}>
        <Text
          style={[
            styles.filterText,
            statusFilter === 'completed' && styles.activeFilterText,
          ]}>
          Completed
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          statusFilter === 'cancelled' && styles.activeFilter,
        ]}
        onPress={() => setStatusFilter('cancelled')}>
        <Text
          style={[
            styles.filterText,
            statusFilter === 'cancelled' && styles.activeFilterText,
          ]}>
          Cancelled
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <Fragment>
      <StatusBar backgroundColor={'#0284c7'} barStyle="dark-content" />
      <SafeAreaView style={styles.safeareacontainer}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.searchContainer}>
            <Icon
              source="magnify"
              size={20}
              color="#777"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by trip name or vehicle..."
              placeholderTextColor="#777"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon source="close-circle" size={20} color="#777" />
              </TouchableOpacity>
            ) : null}
          </View>

          {renderFilterButtons()}

          <ScrollView
            style={styles.tripsContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            {filteredTrips.length > 0 ? (
              filteredTrips.map(renderTripCard)
            ) : (
              <View style={styles.emptyState}>
                <Icon source="car" size={60} color="#ddd" />
                <Text style={styles.emptyStateText}>No trips found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter'
                    : 'No trips available at the moment'}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Trip Details Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}>
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    {selectedTrip && (
                      <>
                        <View style={styles.modalHeader}>
                          <Text style={styles.modalTitle}>
                            {selectedTrip.trip_name}
                          </Text>
                          <TouchableOpacity
                            onPress={() => setModalVisible(false)}>
                            <Icon source="close" size={24} color="#333" />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                          <View style={styles.modalDetail}>
                            <Text style={styles.modalLabel}>Status</Text>
                            <View
                              style={[
                                styles.modalStatus,
                                {
                                  backgroundColor: getStatusColor(
                                    selectedTrip.status,
                                  ),
                                },
                              ]}>
                              <Text style={styles.modalStatusText}>
                                {getStatusText(selectedTrip.status)}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.modalDetail}>
                            <Text style={styles.modalLabel}>
                              Scheduled Date & Time
                            </Text>
                            <Text style={styles.modalValue}>
                              {formatDateTime(selectedTrip.scheduled_datetime)}
                            </Text>
                          </View>

                          <View style={styles.modalDetail}>
                            <Text style={styles.modalLabel}>Vehicle</Text>
                            <Text style={styles.modalValue}>
                              {selectedTrip.thing_name || 'Not assigned'}
                            </Text>
                          </View>

                          <View style={styles.modalDetail}>
                            <Text style={styles.modalLabel}>Driver</Text>
                            <Text style={styles.modalValue}>
                              {selectedTrip.driver_name || 'Not assigned'}
                            </Text>
                          </View>

                          <View style={styles.modalDetail}>
                            <Text style={styles.modalLabel}>
                              Estimated Distance
                            </Text>
                            <Text style={styles.modalValue}>
                              {selectedTrip.estimated_distance} km
                            </Text>
                          </View>

                          <View style={styles.modalDetail}>
                            <Text style={styles.modalLabel}>
                              Estimated Fuel
                            </Text>
                            <Text style={styles.modalValue}>
                              {selectedTrip.estimated_fuel} L
                            </Text>
                          </View>

                          {/* Action Buttons in Modal */}
                          <View style={styles.modalActionButtons}>
                            {selectedTrip.status === 'scheduled' && (
                              <TouchableOpacity
                                style={styles.startButton}
                                onPress={() => {
                                  handleStartTrip(selectedTrip);
                                  setModalVisible(false);
                                }}>
                                <Icon source="play" size={16} color="#fff" />
                                <Text style={styles.buttonText}>
                                  Start Trip
                                </Text>
                              </TouchableOpacity>
                            )}

                            {selectedTrip.status === 'in-progress' && (
                              <>
                                <TouchableOpacity
                                  style={styles.stopButton}
                                  onPress={() => {
                                    handleStopTrip(selectedTrip);
                                    setModalVisible(false);
                                  }}>
                                  <Icon source="stop" size={16} color="#fff" />
                                  <Text style={styles.buttonText}>
                                    Stop Trip
                                  </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={styles.expenseButton}
                                  onPress={() => {
                                    handleAddExpense(selectedTrip);
                                    setModalVisible(false);
                                  }}>
                                  <Icon source="cash" size={16} color="#fff" />
                                  <Text style={styles.buttonText}>
                                    Add Expense
                                  </Text>
                                </TouchableOpacity>
                              </>
                            )}

                            {selectedTrip.status === 'completed' && (
                              <TouchableOpacity
                                style={styles.expenseButton}
                                onPress={() => {
                                  handleAddExpense(selectedTrip);
                                  setModalVisible(false);
                                }}>
                                <Icon source="cash" size={16} color="#fff" />
                                <Text style={styles.buttonText}>
                                  Add Expense
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* Trip Start Modal */}
          <Modal
            animationType="slide"
            transparent={false}
            visible={showTripStartModal}
            onRequestClose={() => setShowTripStartModal(false)}>
            {tripToStart && (
              <TripStart
                navigation={navigation}
                route={{params: {trip: tripToStart}}}
                onClose={() => {
                  setShowTripStartModal(false);
                  GetTrip(DriverId);
                }}
              />
            )}
          </Modal>

          {/* Trip Stop Modal */}
          <Modal
            animationType="slide"
            transparent={false}
            visible={showTripStopModal}
            onRequestClose={() => setShowTripStopModal(false)}>
            {tripToStop && (
              <TripStop
                navigation={navigation}
                route={{
                  params: {
                    tripId: tripToStop.trip_assignment_id,
                    trip: tripToStop,
                  },
                }}
                onClose={() => {
                  setShowTripStopModal(false);
                  GetTrip(DriverId);
                }}
              />
            )}
          </Modal>

          {/* Add Expense Modal */}
          <Modal
            animationType="slide"
            transparent={false}
            visible={showAddExpenseModal}
            onRequestClose={() => setShowAddExpenseModal(false)}>
            {/* {tripForExpense && (
              <AddExpense
                navigation={navigation}
                route={{
                  params: {
                    tripId: tripForExpense.trip_assignment_id,
                    trip: tripForExpense,
                  },
                }}
                onClose={() => {
                  setShowAddExpenseModal(false);
                  GetTrip(DriverId);
                }}
              />
            )} */}
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Loader visible={pageLoad} />
    </Fragment>
  );
};

const styles = StyleSheet.create({
  safeareacontainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
    maxHeight: 35,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#3498db',
  },
  filterText: {
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  tripsContainer: {
    flex: 1,
    padding: 16,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tripDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#555',
    fontSize: 14,
  },
  metricsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metricText: {
    marginLeft: 6,
    color: '#555',
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 16,
    gap: 10,
  },
  startButton: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    minWidth: 80,
  },
  stopButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    minWidth: 80,
  },
  expenseButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    minWidth: 80,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#bdc3c7',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalBody: {
    marginTop: 10,
  },
  modalDetail: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    color: '#2c3e50',
  },
  modalStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalStatusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 20,
    gap: 10,
  },
});

export default Dashboard;
