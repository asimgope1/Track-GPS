import React, { useState, useEffect, Fragment, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
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
import { BASE_URL } from '../../constants/url';
import { Loader } from '../../components/Loader';
import { Icon } from 'react-native-paper';
import { GETNETWORK, POSTNETWORK } from '../../utils/Network';
import { getObjByKey } from '../../utils/Storage';
import TripStart from '../Sidebarpages/TripStart';
import TripStop from '../Sidebarpages/TripStop';
import TripExpenses from '../Sidebarpages/TripExpenses';
import theme from '../../theme';

const Dashboard = ({ navigation }) => {
  const [showTripStartModal, setShowTripStartModal] = useState(false);
  const [showTripStopModal, setShowTripStopModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [tripToStart, setTripToStart] = useState(null);
  const [tripToStop, setTripToStop] = useState(null);
  const [tripForExpense, setTripForExpense] = useState(null);
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pageLoad, setPageLoad] = useState(false);
  const [DriverId, setDriverId] = useState('');

  const GetTrip = async (id, status) => {
    let url = `${BASE_URL}trips/trip_assignment/?driver_master_id=${id}`;
    if (status !== 'all') {
      url += `&trip_status=${status}`;
    }
    setPageLoad(true);

    try {
      const response = await GETNETWORK(url, true);
      const tripsData = response.data || [];
      setTrips(tripsData);
      setFilteredTrips(tripsData);
      setPageLoad(false);
    } catch (error) {
      if (__DEV__) console.error('Error fetching trips:', error);
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
        await GetTrip(driverId, statusFilter);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (DriverId) {
      GetTrip(DriverId, statusFilter);
    }
  }, [statusFilter, DriverId]);

  useEffect(() => {
    filterTrips();
  }, [searchQuery, trips]);

  const filterTrips = () => {
    let filtered = trips;

    if (searchQuery) {
      filtered = filtered.filter(
        trip =>
          trip.trip_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (trip.thing_name &&
            trip.thing_name.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }

    setFilteredTrips(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    GetTrip(DriverId, statusFilter);
    setRefreshing(false);
  };

  const formatDateTime = useCallback(datetimeStr => {
    if (!datetimeStr) return 'N/A';
    const date = new Date(datetimeStr);
    return date.toLocaleString();
  }, []);

  const getStatusColor = useCallback(status => {
    switch (status) {
      case 'scheduled': return theme.colors.info;
      case 'in_progress': return theme.colors.warning;
      case 'completed': return theme.colors.success;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.textMuted;
    }
  }, []);

  const getStatusText = useCallback(status => {
    switch (status) {
      case 'scheduled': return 'Scheduled';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status || '';
    }
  }, []);

  const handleTripPress = useCallback(trip => {
    setSelectedTrip(trip);
    setModalVisible(true);
  }, []);

  const handleStartTrip = useCallback(trip => {
    setTripToStart(trip);
    setShowTripStartModal(true);
    setModalVisible(false);
  }, []);

  const handleStopTrip = useCallback(trip => {
    setTripToStop(trip);
    setShowTripStopModal(true);
    setModalVisible(false);
  }, []);

  const handleAddExpense = useCallback(trip => {
    setTripForExpense(trip);
    setShowAddExpenseModal(true);
    setModalVisible(false);
  }, []);

  const renderTripCard = useCallback(({ item: trip }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => handleTripPress(trip)}>
      <View style={styles.tripHeader}>
        <Text style={styles.tripName}>{trip.trip_name}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(trip.trip_status) },
          ]}>
          <Text style={styles.statusText}>{getStatusText(trip.trip_status)}</Text>
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

        <View style={styles.actionButtonsContainer}>
          {trip.trip_status === 'scheduled' && (
            <>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => handleStartTrip(trip)}>
                <Icon source="play" size={16} color="#fff" />
                <Text style={styles.buttonText}>Start</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={() => handleStopTrip(trip)}>
                <Icon source="stop" size={16} color="#fff" />
                <Text style={styles.buttonText}>Stop</Text>
              </TouchableOpacity>
            </>
          )}
          {trip.trip_status === 'in_progress' && (
            <>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={() => handleStopTrip(trip)}>
                <Icon source="stop" size={16} color="#fff" />
                <Text style={styles.buttonText}>Stop</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.expenseButton}
                onPress={() => handleAddExpense(trip)}>
                <Icon source="cash" size={16} color="#fff" />
                <Text style={styles.buttonText}>Add Expense</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  ), [handleTripPress, handleStartTrip, handleStopTrip, handleAddExpense, getStatusColor, getStatusText, formatDateTime]);

  const keyExtractor = useCallback(item => String(item.trip_assignment_id), []);

  const emptyComponent = useMemo(() => (
    <View style={styles.emptyState}>
      <Icon source="car" size={56} color={theme.colors.border} />
      <Text style={styles.emptyStateText}>No trips found</Text>
      <Text style={styles.emptyStateSubtext}>
        {searchQuery || statusFilter !== 'all'
          ? 'Try adjusting your search or filter'
          : 'No trips available at the moment'}
      </Text>
    </View>
  ), [searchQuery, statusFilter]);

  const renderFilterButtons = useCallback(() => (
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
          statusFilter === 'in_progress' && styles.activeFilter,
        ]}
        onPress={() => setStatusFilter('in_progress')}>
        <Text
          style={[
            styles.filterText,
            statusFilter === 'in_progress' && styles.activeFilterText,
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
  ), [statusFilter]);

  return (
    <Fragment>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <KeyboardAvoidingView
          style={styles.mainContent}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.topBar}>
            <View style={styles.searchContainer}>
              <Icon
                source="magnify"
                size={20}
                color={theme.colors.textPlaceholder}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by trip name or vehicle..."
                placeholderTextColor={theme.colors.textPlaceholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon source="close-circle" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>
            {renderFilterButtons()}
          </View>

          <FlatList
            style={styles.tripsContainer}
            data={filteredTrips}
            renderItem={renderTripCard}
            keyExtractor={keyExtractor}
            ListEmptyComponent={emptyComponent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            initialNumToRender={10}
            maxToRenderPerBatch={8}
            windowSize={6}
            removeClippedSubviews={Platform.OS === 'android'}
          />

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
                            <Icon source="close" size={24} color={theme.colors.text} />
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
                                    selectedTrip.trip_status,
                                  ),
                                },
                              ]}>
                              <Text style={styles.modalStatusText}>
                                {getStatusText(selectedTrip.trip_status)}
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

                          <View style={styles.modalActionButtons}>
                            {selectedTrip.trip_status === 'scheduled' && (
                              <>
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
                              </>
                            )}
                            {selectedTrip.trip_status === 'in_progress' && (
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
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <Modal
            animationType="slide"
            transparent={false}
            visible={showTripStartModal}
            onRequestClose={() => setShowTripStartModal(false)}>
            {tripToStart && (
              <TripStart
                navigation={navigation}
                route={{ params: { trip: tripToStart } }}
                onClose={() => {
                  setShowTripStartModal(false);
                  GetTrip(DriverId, statusFilter);
                }}
              />
            )}
          </Modal>

          <Modal
            animationType="slide"
            transparent={false}
            visible={showTripStopModal}
            onRequestClose={() => setShowTripStopModal(false)}>
            {tripToStop && (
              <TripStop
                navigation={navigation} // Make sure this is defined
                route={{
                  params: {
                    tripId: tripToStop.trip_assignment_id,
                    trip: tripToStop,
                  },
                }}
                onClose={() => {
                  setShowTripStopModal(false);
                  GetTrip(DriverId, statusFilter);
                }}
              />
            )}
          </Modal>

          <Modal
            animationType="slide"
            transparent={false}
            visible={showAddExpenseModal}
            onRequestClose={() => setShowAddExpenseModal(false)}>
            {tripForExpense && (
              <TripExpenses
                navigation={navigation}
                onClose={() => {
                  setShowAddExpenseModal(false);
                  GetTrip(DriverId, statusFilter); // Refresh trips data when closing
                }}
                // Pass the specific trip data if needed by TripExpenses component
                tripData={tripForExpense}
              />
            )}
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
    backgroundColor: theme.colors.background,
  },
  mainContent: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'column',
    flexGrow: 0,
    flexShrink: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    maxHeight: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.base,
    color: theme.colors.text,
  },
  filterContainer: {
    height: 36,
    marginBottom: theme.spacing.xxs,
  },
  filterContent: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xxs,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    height: 34,
    minHeight: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeFilter: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  activeFilterText: {
    fontSize: theme.typography.sm,
    color: theme.colors.white,
    fontWeight: theme.typography.semibold,
  },
  tripsContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.lg,
  },
  tripCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tripName: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: theme.typography.semibold,
  },
  tripDetails: {
    marginTop: theme.spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  detailText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sm,
  },
  metricsContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  metricText: {
    marginLeft: theme.spacing.xxs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  startButton: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xxs,
    minWidth: 76,
  },
  stopButton: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xxs,
    minWidth: 76,
  },
  expenseButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xxs,
    minWidth: 76,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.semibold,
    fontSize: theme.typography.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xxs,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  modalContent: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
  },
  modalBody: {
    marginTop: theme.spacing.xs,
  },
  modalDetail: {
    marginBottom: theme.spacing.sm,
  },
  modalLabel: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xxs,
  },
  modalValue: {
    fontSize: theme.typography.md,
    color: theme.colors.text,
  },
  modalStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.full,
  },
  modalStatusText: {
    color: theme.colors.white,
    fontWeight: theme.typography.semibold,
    fontSize: theme.typography.sm,
  },
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
});

export default Dashboard;