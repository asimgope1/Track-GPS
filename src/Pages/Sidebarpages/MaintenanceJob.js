import React, {useCallback, useEffect, useState} from 'react';
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
import { BASE_URL } from '../../constants/url';
import { GETNETWORK, POSTNETWORK } from '../../utils/Network';
import { useFocusEffect } from '@react-navigation/native';

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
    
  ]);

  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [maintenanceValue, setMaintenanceValue] = useState(null);
  const [maintenanceItems, setMaintenanceItems] = useState([
   
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

  useEffect(() => {
    GetVehicle()
    GetMaintenance();
    GetJobList()
  }, []);

  useFocusEffect(
    useCallback(() => {
      GetVehicle();
      GetMaintenance();
      GetJobList();
      // Cleanup function to reset state if needed
      // This is optional, depending on your use case
      // setVehicleItems([]);
      // setMaintenanceItems([]);
      // setJobList([]);
      // clear all the states
      setProjectItems([]);
      setProjectValue(null);

      setIssues('');
      setWork('');
      setParts('');
      setCost('');
      setJobStart('');
      setJobEnd('');
      setProjectOpen(false);
      setVehicleOpen(false);
      setMaintenanceOpen(false);
      setCalendarVisible({start: false, end: false});
      setJobList([]);
      setProjectValue(null);
      
      return () => {
        setVehicleItems([]);
        setMaintenanceItems([]);
        setJobList([]);
      };
    }, []),
  );



  const GetVehicle = async () => {
    const Url = `${BASE_URL}projects/117/things/?page=1&search=`;
  
    try {
      const response = await GETNETWORK(Url, true);
      console.log('Vehicle Data:', response.data);
  
      const vehicles = response.data?.things || [];
  
      const mappedItems = vehicles.map(item => ({
        label: item.thing_name,
        value: item.thing_id,
      }));
  
      setVehicleItems(mappedItems);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      alert('Failed to fetch vehicle data. Please try again.');
    }
  };



  const GetMaintenance = () => {
    const Url = `${BASE_URL}maintenance/maintenance_master/`;
  
    // setLoading(true); // Optional: show a loading indicator
  
    GETNETWORK(Url, true)
      .then(response => {
        console.log('Maintenance Data:', response.data);
        const mappedItems = response.data.map(item => ({
          label: item.maintenance_name,
          value: item.maintenance_id,
        }));
        setMaintenanceItems(mappedItems);
        // setMaintenanceList(response.data); // Or handle it according to your stater
        // setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching maintenance:', error);
        // setLoading(false);
        alert('Failed to fetch maintenance data. Please try again.');
      });
  };




const GetJobList = () => {
  console.log('Fetching job list...');
  const Url = `${BASE_URL}maintenance/maintenance_job_card/`;

  GETNETWORK(Url, true)
    .then(response => {
      console.log('Job List Response:', response);

      if (!response || !response.data) {
        throw new Error('No data returned from server');
      }

      const jobs = response.data.map(job => ({
        id: job.id,
        vehicle: job.thing_id,
        type: job.maintenance_id,
        issues: job.reported_issue,
        work: job.work_performed,
        parts: job.parts_replaced,
        cost: job.estimated_cost,
        jobStart: job.job_start_datetime,
        jobEnd: job.job_end_datetime,
      }));

      setJobList(jobs);
    })
    .catch(error => {
      console.error('Error fetching job list:', error);
      alert('Failed to fetch job list. Please try again.');
    });
};



const handleCreateJob = async () => {
  if (!vehicleValue || !maintenanceValue) return;

  const payload = {
    thing_id: vehicleValue,
    maintenance_id: maintenanceValue,
    reported_issue: issues,
    work_performed: work,
    parts_replaced: parts,
    estimated_cost: parseFloat(cost),
    job_start_datetime: jobStart,
    job_end_datetime: jobEnd,
  };
  console.log('Creating job with payload:', payload);

  try {
    const response = await POSTNETWORK(
      `${BASE_URL}maintenance/maintenance_job_card/`,
      payload,
      true, // includeAuthHeader
    );

    console.log('Job creation response:', response);

    if (response && response.success !== false) {
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
      setProjectValue(null);
      setVehicleValue(null);
      setMaintenanceValue(null);
      setIssues('');
      setWork('');
      setParts('');
      setCost('');
      setJobStart('');
      setJobEnd('');
      setProjectOpen(false);
      setVehicleOpen(false);
      setMaintenanceOpen(false);

      alert('Job created successfully.');
    } else {
      alert(response?.message || 'Failed to create job. Please try again.');
    }
  } catch (error) {
    console.error('Error creating job:', error);
    alert('Error creating job. Please try again later.');
  }
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
            <View style={[styles.column, {zIndex: 5000}]}>
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
                zIndexInverse={1000}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
            </View>

            <View style={[styles.column, {zIndex: 4000}]}>
              <Text style={styles.label}>Vehicle</Text>
              <DropDownPicker
                open={vehicleOpen}
                value={vehicleValue}
                items={vehicleItems}
                setOpen={setVehicleOpen}
                setValue={setVehicleValue}
                onSelectItem={(item) => {
                  console.log('Selected Vehicle:', item);
                  setVehicleValue(item);
                }
                }
                setItems={setVehicleItems}
                placeholder="Select Vehicle"
                zIndex={4000}
                zIndexInverse={2000}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
            </View>
          </View>

          {/* Maintenance Type */}
          <View style={[styles.inputBlock, {zIndex: 3000}]}>
            <Text style={styles.label}>Maintenance Type</Text>
            <DropDownPicker
              open={maintenanceOpen}
              value={maintenanceValue}
              items={maintenanceItems}
              setOpen={setMaintenanceOpen}
              setValue={setMaintenanceValue}
              setItems={setMaintenanceItems}
              onSelectItem={(item) => {
                console.log('Selected Maintenance Type:', item);
                setMaintenanceValue(item);
              }}
              placeholder="Select Type"
              zIndex={3000}
              zIndexInverse={3000}
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
                  <Text style={styles.tableCell}>{job.category}</Text>
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
