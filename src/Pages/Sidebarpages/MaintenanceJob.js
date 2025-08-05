import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {Calendar} from 'react-native-calendars';
import Header from '../../components/Header';

const MaintenanceJobScreen = ({navigation}) => {
  const [projectOpen, setProjectOpen] = useState(false);
  const [projectValue, setProjectValue] = useState(null);
  const [projectItems, setProjectItems] = useState([
    {label: 'Project A', value: 'project_a'},
    {label: 'Project B', value: 'project_b'},
    {label: 'Project C', value: 'project_c'},
  ]);

  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vehicleValue, setVehicleValue] = useState(null);
  const [vehicleItems, setVehicleItems] = useState([
    {label: 'TRK-001', value: 'TRK-001'},
    {label: 'TRK-002', value: 'TRK-002'},
  ]);

  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [maintenanceValue, setMaintenanceValue] = useState(null);
  const [maintenanceItems, setMaintenanceItems] = useState([
    {label: 'Oil Change', value: 'oil_change'},
    {label: 'Brake Check', value: 'brake_check'},
  ]);

  const [issues, setIssues] = useState('');
  const [work, setWork] = useState('');
  const [parts, setParts] = useState('');
  const [cost, setCost] = useState('');

  const [jobStart, setJobStart] = useState('');
  const [jobEnd, setJobEnd] = useState('');
  const [calendarVisible, setCalendarVisible] = useState({
    start: false,
    end: false,
  });

  const [jobList, setJobList] = useState([]);

  const handleDateSelect = (date, type) => {
    if (type === 'start') setJobStart(date.dateString);
    else setJobEnd(date.dateString);
    setCalendarVisible(prev => ({...prev, [type]: false}));
  };

  const handleCreateJob = () => {
    const job = {
      id: jobList.length + 1,
      project: projectValue,
      vehicle: vehicleValue,
      type: maintenanceValue,
      issues,
      work,
      parts,
      cost,
      jobStart,
      jobEnd,
    };
    setJobList([...jobList, job]);
    // Reset form
    setIssues('');
    setWork('');
    setParts('');
    setCost('');
    setJobStart('');
    setJobEnd('');
  };

  return (
    <>
      <StatusBar backgroundColor="#0284c7" barStyle="light-content" />
      <Header
        title="Maintenance Job"
        onMenuPress={() => navigation.openDrawer()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Project & Vehicle Row */}
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Project</Text>
              <DropDownPicker
                open={projectOpen}
                value={projectValue}
                items={projectItems}
                setOpen={setProjectOpen}
                setValue={setProjectValue}
                setItems={setProjectItems}
                placeholder="Select Project"
                zIndex={5000}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Vehicle</Text>
              <DropDownPicker
                open={vehicleOpen}
                value={vehicleValue}
                items={vehicleItems}
                setOpen={setVehicleOpen}
                setValue={setVehicleValue}
                setItems={setVehicleItems}
                placeholder="Select Vehicle"
                zIndex={4000}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
            </View>
          </View>

          {/* Maintenance Type */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Maintenance Type</Text>
            <DropDownPicker
              open={maintenanceOpen}
              value={maintenanceValue}
              items={maintenanceItems}
              setOpen={setMaintenanceOpen}
              setValue={setMaintenanceValue}
              setItems={setMaintenanceItems}
              placeholder="Select Type"
              zIndex={3000}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>

          {/* Reported Issues */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Reported Issues</Text>
            <TextInput
              placeholderTextColor={'gray'}
              style={styles.input}
              placeholder="Reported Issues"
              value={issues}
              multiline
              onChangeText={setIssues}
            />
          </View>

          {/* Work Performed */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Work Performed</Text>
            <TextInput
              placeholderTextColor={'gray'}
              style={styles.input}
              placeholder="Work Performed"
              multiline
              value={work}
              onChangeText={setWork}
            />
          </View>

          {/* Parts Replaced */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Parts Replaced</Text>
            <TextInput
              placeholderTextColor={'gray'}
              style={styles.input}
              placeholder="Parts Replaced"
              value={parts}
              onChangeText={setParts}
            />
          </View>

          {/* Cost */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Cost</Text>
            <TextInput
              placeholderTextColor={'gray'}
              style={styles.input}
              placeholder="Cost"
              value={cost}
              onChangeText={setCost}
              keyboardType="numeric"
            />
          </View>

          {/* Dates */}
          <View style={styles.row}>
            {/* Job Start Date */}
            <View style={{flex: 1, marginRight: 5}}>
              <Text style={styles.label}>Job Start Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setCalendarVisible({start: true})}>
                <Text style={styles.dateButtonText}>
                  {jobStart || 'Job Start Date'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Job End Date */}
            <View style={{flex: 1, marginLeft: 5}}>
              <Text style={styles.label}>Job End Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setCalendarVisible({end: true})}>
                <Text style={styles.dateButtonText}>
                  {jobEnd || 'Job End Date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleCreateJob}>
            <Text style={styles.submitText}>Create Maintenance Job</Text>
          </TouchableOpacity>

          {/* Table List */}
          <Text style={styles.tableTitle}>Maintenance Job List</Text>
          <ScrollView horizontal>
            <View>
              <View style={styles.tableHeader}>
                {[
                  'Sl. No',
                  'Vehicle',
                  'Type',
                  'Issues',
                  'Work',
                  'Parts',
                  'Cost',
                  'Start',
                  'End',
                ].map(h => (
                  <Text key={h} style={styles.tableCell}>
                    {h}
                  </Text>
                ))}
              </View>
              {jobList.map((job, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{index + 1}</Text>
                  <Text style={styles.tableCell}>{job.vehicle}</Text>
                  <Text style={styles.tableCell}>{job.type}</Text>
                  <Text style={styles.tableCell}>{job.issues}</Text>
                  <Text style={styles.tableCell}>{job.work}</Text>
                  <Text style={styles.tableCell}>{job.parts}</Text>
                  <Text style={styles.tableCell}>{job.cost}</Text>
                  <Text style={styles.tableCell}>{job.jobStart}</Text>
                  <Text style={styles.tableCell}>{job.jobEnd}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Calendar Modals */}
      <Modal
        visible={calendarVisible.start || calendarVisible.end}
        transparent
        animationType="slide">
        <View style={styles.calendarModal}>
          <Calendar
            onDayPress={day =>
              handleDateSelect(day, calendarVisible.start ? 'start' : 'end')
            }
            markedDates={{
              [calendarVisible.start ? jobStart : jobEnd]: {
                selected: true,
                selectedColor: '#0284c7',
              },
            }}
          />
          <TouchableOpacity
            onPress={() => setCalendarVisible({start: false, end: false})}
            style={styles.closeButton}>
            <Text style={styles.submitText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

export default MaintenanceJobScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  column: {
    flex: 1,
    zIndex: 1000,
  },
  inputBlock: {
    marginBottom: 10,
    zIndex: 900,
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    color:'black',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    height: 48,
  },
  dropdownContainer: {
    borderColor: '#d1d5db',
  },
  dateButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  tableTitle: {
    marginTop: 30,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    padding: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableCell: {
    color:'black',
    width: 100,
    paddingHorizontal: 6,
    fontSize: 13,
  },
  calendarModal: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 8,
    padding: 16,
  },
  closeButton: {
    backgroundColor: '#0284c7',
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
