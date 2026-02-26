import React, { Fragment, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform,
  TouchableOpacity, StatusBar, Modal, Pressable,
  RefreshControl, Dimensions, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, LineChart, BarChart } from 'react-native-gifted-charts';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { HEIGHT, WIDTH, useStatusBarHeight } from '../../constants/config';
import { GETNETWORK } from '../../utils/Network';
import { BASE_URL } from '../../constants/url';
import { getObjByKey } from '../../utils/Storage';
import Header from '../../components/Header';
import { Loader } from '../../components/Loader';
import { useAppTheme } from '../../theme/ThemeContext';
import Dashboard from './DriverDash';
import HistoryModal from '../History/HistoryModal';
import Track from '../Track/Track';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import { spacing, radius, typography } from '../../theme';

const { width: SW } = Dimensions.get('window');
const COL = (SW - spacing.lg * 2 - spacing.sm) / 2; // half column width

// ─── Bento Card Shell ─────────────────────────────────────────────────────────
const BentoCard = ({ children, style, gradient, onPress }) => {
  const { theme } = useAppTheme();
  const c = theme.colors;

  const inner = (
    <View
      style={[
        bStyles.card,
        { borderColor: c.cardBorder },
        style,
      ]}>
      {children}
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      style={style}>
      <LinearGradient
        colors={gradient || [c.cardBg, c.cardBg]}
        style={[bStyles.card, { borderColor: c.cardBorder }, style]}>
        {children}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const bStyles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: spacing.md,
  },
});

// ─── Stat Chip ────────────────────────────────────────────────────────────────
const StatChip = ({ label, value, color, onPress }) => {
  const { theme } = useAppTheme();
  const c = theme.colors;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: `${color}22`,
        borderRadius: radius.sm,
        padding: spacing.xs,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: `${color}55`,
        marginHorizontal: 2,
      }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color }}>{value}</Text>
      <Text style={{ fontSize: 10, color: c.textSecondary, marginTop: 2 }}>{label}</Text>
    </TouchableOpacity>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const FleetDashboard = (navigation) => {
  const { theme } = useAppTheme();
  const c = theme.colors;
  const statusBarHeight = useStatusBarHeight();

  // State
  const [statusMap, setStatusMap] = useState({ Running: 0, Stopped: 0, Unreachable: 0 });
  const [thingData, setThingData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [listModal, setListModal] = useState({ visible: false, status: 'Total' });
  const [viewHistory, setViewHistory] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [pageLoad, setPageLoad] = useState(false);
  const [userType, setUserType] = useState(null);
  const [loadingUserType, setLoadingUserType] = useState(true);

  const total = useMemo(
    () => (statusMap.Running || 0) + (statusMap.Stopped || 0) + (statusMap.Unreachable || 0),
    [statusMap],
  );

  const pieData = useMemo(() => [
    { value: statusMap.Running || 0,     color: '#34D399', text: `${statusMap.Running || 0}` },
    { value: statusMap.Stopped || 0,     color: '#FBBF24', text: `${statusMap.Stopped || 0}` },
    { value: statusMap.Unreachable || 0, color: '#F87171', text: `${statusMap.Unreachable || 0}` },
  ], [statusMap]);

  const showToast = useCallback((type, text1, text2) => {
    Toast.show({ type, position: 'top', text1, text2, topOffset: statusBarHeight, visibilityTime: 3000 });
  }, [statusBarHeight]);

  // ─── Data Fetch ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const projectSl = await getObjByKey('project_sl');
      if (!projectSl) { showToast('error', 'Error', 'Project not found'); return; }
      setPageLoad(true);
      const url = `${BASE_URL}projects/${projectSl}/things/?page=1&search=&type=gps`;
      const response = await GETNETWORK(url, true);
      if (response.data?.things) {
        const things = response.data.things.map(t => ({ ...t, updated_on: new Date(t.updated_on) }));
        const now = new Date();
        const counts = { Running: 0, Stopped: 0, Unreachable: 0 };
        things.forEach(t => {
          const diff = (now - t.updated_on) / 60000;
          if (diff <= 2) counts.Running++;
          else if (diff <= 5) counts.Stopped++;
          else counts.Unreachable++;
        });
        setStatusMap(counts);
        setThingData(things);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      showToast('error', 'Network Error', 'Failed to load fleet data');
    } finally {
      setPageLoad(false);
    }
  }, [showToast]);

  const fetchCardData = useCallback(async (thingId) => {
    const data = thingData.find(t => t.thing_id === thingId);
    if (data) {
      setSelectedValue(data);
      setLocation(data?.derived_live_config?.location || []);
      setShowModal(true);
    }
  }, [thingData]);

  const getFilteredItems = useCallback((status) => {
    if (status === 'Total') return thingData;
    const now = new Date();
    return thingData.filter(t => {
      const diff = (now - t.updated_on) / 60000;
      if (status === 'Running') return diff <= 2;
      if (status === 'Stopped') return diff > 2 && diff <= 5;
      if (status === 'Unreachable') return diff > 5;
      return false;
    });
  }, [thingData]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30000);
    return () => clearInterval(id);
  }, [fetchData]);

  useEffect(() => {
    getObjByKey('loginResponse').then(r => {
      setUserType(r?.data?.user_type);
      setLoadingUserType(false);
    }).catch(() => {
      setLoadingUserType(false);
    });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // ─── Card gradient presets ────────────────────────────────────────────────
  const G = {
    indigo:   ['rgba(79,70,229,0.30)', 'rgba(99,102,241,0.12)'],
    green:    ['rgba(52,211,153,0.28)', 'rgba(16,185,129,0.10)'],
    amber:    ['rgba(251,191,36,0.28)', 'rgba(245,158,11,0.10)'],
    red:      ['rgba(248,113,113,0.28)', 'rgba(239,68,68,0.10)'],
    blue:     ['rgba(96,165,250,0.28)', 'rgba(59,130,246,0.10)'],
    purple:   ['rgba(167,139,250,0.28)', 'rgba(139,92,246,0.10)'],
    teal:     ['rgba(45,212,191,0.28)', 'rgba(20,184,166,0.10)'],
    orange:   ['rgba(251,146,60,0.28)', 'rgba(249,115,22,0.10)'],
    glass:    [c.cardBg, c.surface],
  };

  // ─── Inline data ──────────────────────────────────────────────────────────
  const lineData = [
    { value: 70 }, { value: 36 }, { value: 50 },
    { value: 40 }, { value: 18 }, { value: 38 },
  ];
  const barData = [
    { value: 60, label: 'A' }, { value: 90, label: 'B' },
    { value: 45, label: 'C' }, { value: 75, label: 'D' },
    { value: 30, label: 'E' },
  ];

  if (loadingUserType) {
    return <Loader visible={true} />;
  }

  if (userType !== 'admin' && userType !== 'manager') {
    return <Dashboard />;
  }

  return (
    <Fragment>
      <StatusBar translucent backgroundColor="transparent" barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['left', 'right', 'bottom']}>
        <Header
          title="Fleet Dashboard"
          onMenuPress={() => navigation.navigation.openDrawer()}
        />

        <ScrollView
          contentContainerStyle={ss.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />}
          showsVerticalScrollIndicator={false}>

          {/* ── ROW 1: Status Overview (full-width) ── */}
          <BentoCard gradient={G.indigo} style={ss.fullCard}>
            <View style={ss.cardHeaderRow}>
              <View>
                <Text style={[ss.cardLabel, { color: c.textMuted }]}>FLEET STATUS</Text>
                <Text style={[ss.cardValue, { color: c.text }]}>{total} Vehicles</Text>
              </View>
              <Icon name="directions-car" size={28} color={c.primaryLight} />
            </View>

            <View style={{ alignItems: 'center', marginVertical: spacing.md }}>
              <PieChart
                data={pieData.map(item => ({ ...item, textColor: c.text }))}
                donut
                radius={75}
                innerRadius={46}
                showText={false}
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 26, fontWeight: '800', color: c.text }}>{total}</Text>
                    <Text style={{ fontSize: 10, color: c.textMuted, marginTop: 2 }}>Total</Text>
                  </View>
                )}
              />
            </View>

            {/* Horizontal legend chips */}
            <View style={{ flexDirection: 'row', gap: 6, marginTop: spacing.xs }}>
              {[
                { label: 'Running',  value: statusMap.Running || 0,     color: '#34D399', icon: 'directions-car' },
                { label: 'Stopped',  value: statusMap.Stopped || 0,     color: '#FBBF24', icon: 'pause-circle-filled' },
                { label: 'Offline',  value: statusMap.Unreachable || 0, color: '#F87171', icon: 'wifi-off' },
                { label: 'All',      value: total,                       color: '#818CF8', icon: 'grid-view' },
              ].map(chip => (
                <TouchableOpacity
                  key={chip.label}
                  onPress={() => setListModal({ visible: true, status: chip.label === 'All' ? 'Total' : chip.label })}
                  style={{
                    flex: 1, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4,
                    backgroundColor: `${chip.color}22`,
                    borderRadius: 12, borderWidth: 1, borderColor: `${chip.color}44`,
                  }}>
                  <Icon name={chip.icon} size={16} color={chip.color} />
                  <Text style={{ fontSize: 17, fontWeight: '800', color: chip.color, marginTop: 2 }}>{chip.value}</Text>
                  <Text style={{ fontSize: 9, color: c.textMuted, marginTop: 1, letterSpacing: 0.4 }}>{chip.label.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </BentoCard>

          {/* ── ROW 2: Total Distance (full-width chart) ── */}
          <BentoCard gradient={G.purple} style={ss.fullCard}>
            <View style={ss.cardHeaderRow}>
              <View>
                <Text style={[ss.cardLabel, { color: c.textMuted }]}>TOTAL DISTANCE</Text>
                <Text style={[ss.cardValue, { color: c.text }]}>Weekly Trend</Text>
              </View>
              <MIcon name="map-marker-distance" size={28} color="#A78BFA" />
            </View>
            <View style={{ marginTop: spacing.sm }}>
              <LineChart
                areaChart
                curved
                data={lineData}
                height={90}
                width={SW - spacing.lg * 2 - spacing.md * 2 - 8}
                hideDataPoints
                spacing={46}
                color="#A78BFA"
                startFillColor="#A78BFA"
                endFillColor="rgba(167,139,250,0)"
                startOpacity={0.5}
                endOpacity={0}
                yAxisColor="transparent"
                xAxisColor="transparent"
                hideRules
                hideYAxisText
                noOfSections={3}
                initialSpacing={0}
              />
            </View>
          </BentoCard>

          {/* ── ROW 3: OverSpeed + Idle (half-half) ── */}
          <View style={ss.row}>
            <BentoCard gradient={G.red} style={[ss.halfCard, { marginRight: spacing.sm / 2 }]}>
              <View style={ss.cardHeaderRow}>
                <Text style={[ss.cardLabel, { color: c.textMuted }]}>OVERSPEED</Text>
                <Icon name="speed" size={22} color="#F87171" />
              </View>
              <Text style={[ss.bigNum, { color: '#F87171' }]}>5</Text>
              <Text style={[ss.subText, { color: c.textSecondary }]}>Alerts today</Text>
              <View style={[ss.pill, { backgroundColor: '#F8717122', marginTop: spacing.xs }]}>
                <Text style={{ color: '#F87171', fontSize: 11, fontWeight: '600' }}>Max: 120 km/h</Text>
              </View>
            </BentoCard>

            <BentoCard gradient={G.teal} style={[ss.halfCard, { marginLeft: spacing.sm / 2 }]}>
              <View style={ss.cardHeaderRow}>
                <Text style={[ss.cardLabel, { color: c.textMuted }]}>IDLE TIME</Text>
                <MIcon name="timer-sand" size={22} color="#2DD4BF" />
              </View>
              <Text style={[ss.bigNum, { color: '#2DD4BF' }]}>35h</Text>
              <Text style={[ss.subText, { color: c.textSecondary }]}>Fuel wasted</Text>
              <View style={[ss.pill, { backgroundColor: '#2DD4BF22', marginTop: spacing.xs }]}>
                <Text style={{ color: '#2DD4BF', fontSize: 11, fontWeight: '600' }}>48 litres</Text>
              </View>
            </BentoCard>
          </View>

          {/* ── ROW 4: Fuel + Timeline Deviation (half-half) ── */}
          <View style={ss.row}>
            <BentoCard gradient={G.green} style={[ss.halfCard, { marginRight: spacing.sm / 2 }]}>
              <View style={ss.cardHeaderRow}>
                <Text style={[ss.cardLabel, { color: c.textMuted }]}>FUEL</Text>
                <MIcon name="fuel" size={22} color="#34D399" />
              </View>
              <Text style={[ss.bigNum, { color: '#34D399' }]}>320L</Text>
              <Text style={[ss.subText, { color: c.textSecondary }]}>Refilled</Text>
              <View style={[ss.pill, { backgroundColor: '#F8717122', marginTop: spacing.xs }]}>
                <Text style={{ color: '#F87171', fontSize: 11, fontWeight: '600' }}>45L drained</Text>
              </View>
            </BentoCard>

            <BentoCard gradient={G.amber} style={[ss.halfCard, { marginLeft: spacing.sm / 2 }]}>
              <View style={ss.cardHeaderRow}>
                <Text style={[ss.cardLabel, { color: c.textMuted }]}>TIMELINE</Text>
                <MIcon name="clock-alert" size={22} color="#FBBF24" />
              </View>
              <Text style={[ss.bigNum, { color: '#FBBF24' }]}>3</Text>
              <Text style={[ss.subText, { color: c.textSecondary }]}>Delayed trips</Text>
              <View style={[ss.pill, { backgroundColor: '#FBBF2422', marginTop: spacing.xs }]}>
                <Text style={{ color: '#FBBF24', fontSize: 11, fontWeight: '600' }}>Avg: 22 min</Text>
              </View>
            </BentoCard>
          </View>

          {/* ── ROW 5: Stay In Zone + Stay Away (half-half tall) ── */}
          <View style={ss.row}>
            <BentoCard gradient={G.blue} style={[ss.halfTallCard, { marginRight: spacing.sm / 2 }]}>
              <Text style={[ss.cardLabel, { color: c.textMuted }]}>STAY IN ZONE</Text>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                <View style={ss.circleIcon}>
                  <MIcon name="car-multiple" size={30} color="#60A5FA" />
                </View>
                <Text style={[ss.bigNum, { color: '#60A5FA', marginTop: 0 }]}>3</Text>
                <Text style={[ss.subText, { color: c.textSecondary }]}>Total trips</Text>
                <View style={[ss.pill, { backgroundColor: '#60A5FA22' }]}>
                  <Text style={{ color: '#60A5FA', fontSize: 11, fontWeight: '600' }}>22 min avg</Text>
                </View>
              </View>
            </BentoCard>

            <BentoCard gradient={G.orange} style={[ss.halfTallCard, { marginLeft: spacing.sm / 2 }]}>
              <Text style={[ss.cardLabel, { color: c.textMuted }]}>STAY AWAY</Text>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                <View style={[ss.circleIcon, { backgroundColor: '#FB923C22' }]}>
                  <Icon name="warning" size={30} color="#FB923C" />
                </View>
                <Text style={[ss.bigNum, { color: '#FB923C', marginTop: 0 }]}>3</Text>
                <Text style={[ss.subText, { color: c.textSecondary }]}>Violations</Text>
                <View style={[ss.pill, { backgroundColor: '#FB923C22' }]}>
                  <Text style={{ color: '#FB923C', fontSize: 11, fontWeight: '600' }}>22 min avg</Text>
                </View>
              </View>
            </BentoCard>
          </View>

          {/* ── ROW 6: Fleet Workload Bar Chart (full-width) ── */}
          <BentoCard gradient={G.indigo} style={ss.fullCard}>
            <View style={ss.cardHeaderRow}>
              <View>
                <Text style={[ss.cardLabel, { color: c.textMuted }]}>FLEET WORKLOAD</Text>
                <Text style={[ss.cardValue, { color: c.text }]}>Unit Distribution</Text>
              </View>
              <MIcon name="chart-bar" size={28} color="#818CF8" />
            </View>
            <View style={{ marginTop: spacing.sm }}>
              <BarChart
                barWidth={28}
                noOfSections={4}
                barBorderRadius={6}
                frontColor="#818CF8"
                data={barData}
                maxValue={100}
                yAxisTextStyle={{ color: c.textMuted, fontSize: 9 }}
                xAxisLabelTextStyle={{ color: c.textMuted, fontSize: 10 }}
                yAxisColor="transparent"
                xAxisColor={c.border}
                hideRules
                spacing={22}
                height={100}
                width={SW - spacing.lg * 2 - spacing.md * 2 - 8}
                isAnimated
              />
            </View>
          </BentoCard>

          {/* ── ROW 7: Alerts tables (half-half) ── */}
          <View style={ss.row}>
            {/* Object Alerts */}
            <BentoCard gradient={G.glass} style={[ss.halfTallCard, { marginRight: spacing.sm / 2 }]}>
              <Text style={[ss.cardLabel, { color: c.textMuted }]}>OBJECT ALERTS</Text>
              <View style={[ss.tableHeader, { backgroundColor: `${c.primary}33`, marginTop: spacing.xs }]}>
                <Text style={[ss.thCell, { color: c.text }]}>Object</Text>
                <Text style={[ss.thCell, { color: c.text }]}>Alerts</Text>
              </View>
              {[{ name: 'Object A', alerts: 5 }, { name: 'Object B', alerts: 3 }, { name: 'Object C', alerts: 1 }]
                .map((o, i) => (
                  <View key={i} style={[ss.tableRow, { backgroundColor: i % 2 === 0 ? `${c.primary}11` : 'transparent', borderBottomColor: c.border }]}>
                    <Text style={[ss.tdCell, { color: c.textSecondary }]}>{o.name}</Text>
                    <Text style={[ss.tdCell, { color: c.primary, fontWeight: '700' }]}>{o.alerts}</Text>
                  </View>
                ))}
            </BentoCard>

            {/* Driver Alerts */}
            <BentoCard gradient={G.glass} style={[ss.halfTallCard, { marginLeft: spacing.sm / 2 }]}>
              <Text style={[ss.cardLabel, { color: c.textMuted }]}>DRIVER ALERTS</Text>
              <View style={[ss.tableHeader, { backgroundColor: `${c.primary}33`, marginTop: spacing.xs }]}>
                <Text style={[ss.thCell, { color: c.text }]}>Driver</Text>
                <Text style={[ss.thCell, { color: c.text }]}>Alerts</Text>
              </View>
              {[{ name: 'Ashima', alertCount: 12 }, { name: 'Rihana', alertCount: 9 }, { name: 'Dibya', alertCount: 6 }]
                .map((d, i) => (
                  <View key={i} style={[ss.tableRow, { backgroundColor: i % 2 === 0 ? `${c.primary}11` : 'transparent', borderBottomColor: c.border }]}>
                    <Text style={[ss.tdCell, { color: c.textSecondary }]}>{d.name}</Text>
                    <Text style={[ss.tdCell, { color: c.error, fontWeight: '700' }]}>{d.alertCount}</Text>
                  </View>
                ))}
            </BentoCard>
          </View>

          {/* ── ROW 8: Maintenance + Renewal (half-half) ── */}
          <View style={ss.row}>
            <BentoCard gradient={G.blue} style={[ss.halfCard, { marginRight: spacing.sm / 2 }]}>
              <View style={ss.cardHeaderRow}>
                <Text style={[ss.cardLabel, { color: c.textMuted }]}>MAINTENANCE</Text>
                <MIcon name="wrench" size={22} color="#60A5FA" />
              </View>
              <Text style={[ss.bigNum, { color: '#60A5FA' }]}>2</Text>
              <Text style={[ss.subText, { color: c.textSecondary }]}>Jobs pending</Text>
            </BentoCard>

            <BentoCard gradient={G.purple} style={[ss.halfCard, { marginLeft: spacing.sm / 2 }]}>
              <View style={ss.cardHeaderRow}>
                <Text style={[ss.cardLabel, { color: c.textMuted }]}>RENEWALS</Text>
                <MIcon name="calendar-clock" size={22} color="#A78BFA" />
              </View>
              <Text style={[ss.bigNum, { color: '#A78BFA' }]}>4</Text>
              <Text style={[ss.subText, { color: c.textSecondary }]}>Due this month</Text>
            </BentoCard>
          </View>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>

      {/* ── Vehicle List Modal ── */}
      <Modal transparent animationType="slide" visible={listModal.visible} onRequestClose={() => setListModal(p => ({ ...p, visible: false }))}>
        <View style={ss.modalOverlay}>
          <View style={[ss.modalBox, { backgroundColor: theme.colors.surfaceElevated, borderColor: c.border }]}>
            <View style={[ss.modalHead, { borderBottomColor: c.border }]}>
              <Text style={[ss.modalTitle, { color: c.text }]}>{listModal.status} Vehicles</Text>
              <TouchableOpacity onPress={() => setListModal(p => ({ ...p, visible: false }))}>
                <Icon name="close" size={22} color={c.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={[ss.subText, { color: c.textMuted, marginBottom: spacing.sm }]}>
              {getFilteredItems(listModal.status).length} of {thingData.length} vehicles
            </Text>
            <FlatList
              data={getFilteredItems(listModal.status)}
              style={{ maxHeight: '70%' }}
              keyExtractor={(item, index) => item.thing_id || index.toString()}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { fetchCardData(item.thing_id); setListModal(p => ({ ...p, visible: false })); }}
                  style={[ss.vehicleCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={[ss.vehicleIcon, { backgroundColor: `${c.primary}33` }]}>
                      <Icon name="directions-car" size={20} color={c.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.text, fontWeight: '700', fontSize: 14 }}>{item.thing_name}</Text>
                      <Text style={{ color: c.textMuted, fontSize: 12 }}>ID: {item.thing_id}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
            <Pressable style={[ss.modalBtn, { backgroundColor: c.primary }]} onPress={() => setListModal(p => ({ ...p, visible: false }))}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── Vehicle Detail Modal ── */}
      <Modal transparent animationType="slide" visible={showModal} onRequestClose={() => setShowModal(false)}>
        <View style={ss.modalOverlay}>
          <View style={[ss.modalBox, { backgroundColor: theme.colors.surfaceElevated, borderColor: c.border }]}>
            <View style={[ss.modalHead, { borderBottomColor: c.border }]}>
              <Text style={[ss.modalTitle, { color: c.text }]}>Vehicle Details</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={() => setViewHistory(true)}>
                  <Text style={{ color: c.info, fontWeight: '700', fontSize: 13 }}>History</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  if (Array.isArray(location) && location[0] !== undefined) setShowMap(true);
                  else showToast('error', 'No Location', 'Location data unavailable');
                }}>
                  <Text style={{ color: c.success, fontWeight: '700', fontSize: 13 }}>Track</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Icon name="close" size={20} color={c.error} />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView>
              {[
                { icon: 'speed',      label: 'Speed',       val: `${selectedValue?.derived_live_config?.speed?.toFixed(2) ?? 'N/A'} km/h`, color: '#60A5FA' },
                { icon: 'trending-up',label: 'Acceleration', val: `${selectedValue?.derived_live_config?.acceleration != null ? selectedValue.derived_live_config.acceleration.toFixed(2) + ' m/s²' : 'N/A'}`,  color: '#34D399' },
                { icon: 'straighten', label: 'Total Dist',  val: `${((selectedValue?.derived_live_config?.total_distance || 0) / 1000).toFixed(2)} km`, color: '#A78BFA' },
                { icon: 'place',      label: 'Current Dist',val: `${((selectedValue?.derived_live_config?.current_distance || 0) / 1000).toFixed(2)} km`, color: '#FBBF24' },
                { icon: 'update',     label: 'Last Updated',val: selectedValue?.derived_live_config?.generated_datetime ? moment(selectedValue.derived_live_config.generated_datetime).format('DD/MM/YY h:mm a') : 'N/A', color: '#FB923C' },
              ].map((row, i) => (
                <View key={i} style={[ss.detailRow, { borderBottomColor: c.border }]}>
                  <View style={[ss.detailIcon, { backgroundColor: `${row.color}22` }]}>
                    <Icon name={row.icon} size={18} color={row.color} />
                  </View>
                  <Text style={{ color: c.textSecondary, flex: 1, fontSize: 13 }}>{row.label}</Text>
                  <Text style={{ color: c.text, fontWeight: '600', fontSize: 13 }}>{row.val}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Track overlay */}
      {showMap && Array.isArray(location) && location.length >= 2 && (
        <View style={{ ...StyleSheet.absoluteFillObject }}>
          <Track
            showTrack={Array.isArray(location[0])
              ? location.map(coord => ({ latitude: parseFloat(coord[0]), longitude: parseFloat(coord[1]) }))
              : [{ latitude: parseFloat(location[0]), longitude: parseFloat(location[1]) }]}
            projectedTrack={{ data: [] }}
            latitude={parseFloat(location[0])}
            longitude={parseFloat(location[1])}
            visible={showMap}
            onClose={() => setShowMap(false)}
          />
        </View>
      )}

      <HistoryModal
        visible={viewHistory}
        onClose={() => setViewHistory(false)}
        vehicleData={thingData}
        log={[selectedValue]}
      />
      <Loader visible={pageLoad} />
      <Toast />
    </Fragment>
  );
};

// ─── Shared static styles (layout only) ──────────────────────────────────────
const ss = StyleSheet.create({
  scroll:       { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  row:          { flexDirection: 'row', marginBottom: spacing.sm },
  fullCard:     { width: '100%', marginBottom: spacing.sm, minHeight: 160 },
  halfCard:     { width: COL, minHeight: 140 },
  halfTallCard: { width: COL, minHeight: 200 },
  cardHeaderRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLabel:    { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  cardValue:    { fontSize: 15, fontWeight: '700' },
  bigNum:       { fontSize: 34, fontWeight: '800', marginTop: spacing.xs },
  subText:      { fontSize: 11, marginTop: 2 },
  statusRow:    { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  statusRow2:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chipLabel:    { flex: 1, fontSize: 12, fontWeight: '600' },
  chipVal:      { fontSize: 16, fontWeight: '800' },
  pill:         { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  circleIcon:   { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(96,165,250,0.15)', justifyContent: 'center', alignItems: 'center' },
  tableHeader:  { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 6, borderRadius: 6 },
  tableRow:     { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 6, borderBottomWidth: StyleSheet.hairlineWidth },
  thCell:       { flex: 1, fontSize: 10, fontWeight: '700', textAlign: 'center', letterSpacing: 0.5 },
  tdCell:       { flex: 1, fontSize: 11, textAlign: 'center' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBox:     { borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, padding: spacing.lg, maxHeight: '85%' },
  modalHead:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: spacing.md, marginBottom: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  modalTitle:   { fontSize: 18, fontWeight: '800' },
  modalBtn:     { paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: spacing.md },
  vehicleCard:  { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  vehicleIcon:  { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  detailRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  detailIcon:   { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});

export default FleetDashboard;