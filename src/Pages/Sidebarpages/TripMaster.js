import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useMemo } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import Header from '../../components/Header';
import { BASE_URL } from '../../constants/url';
import { POSTNETWORK } from '../../utils/Network';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Loader } from '../../components/Loader';
import Toast from 'react-native-toast-message';
import { useAppTheme } from '../../theme/ThemeContext';
const TripMaster = ({ navigation }) => {
  const { theme, isDark } = useAppTheme();
  
  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundSolid,
    },
    scrollContainer: {
      padding: 16,
      paddingBottom: 40,
    },
    inputItem: {
      marginBottom: 16,
    },
    label: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
      paddingTop: 12,
    },
    errorBorder: {
      borderColor: theme.colors.error || '#EF4444',
    },
    errorText: {
      color: theme.colors.error || '#EF4444',
      fontSize: 12,
      marginTop: 4,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    sectionHeader: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    dateButton: {
      justifyContent: 'center',
    },
    dateButtonText: {
      color: theme.colors.text,
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      padding: 18,
      alignItems: 'center',
      marginVertical: 24,
      ...theme.shadows.md,
      borderWidth: isDark ? 0 : 1,
      borderColor: theme.colors.border,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
    },
    disabledButton: {
      opacity: 0.7,
    },
    dropdown: {
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: 12,
    },
    dropdownContainer: {
      borderColor: theme.colors.border,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceElevated,
    }
  }), [theme, isDark]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [tripName, setTripName] = useState('');
  const [tripTypeOpen, setTripTypeOpen] = useState(false);
  const [tripTypeValue, setTripTypeValue] = useState('delivery');
  const [tripTypeItems, setTripTypeItems] = useState([
    { label: 'Delivery', value: 'delivery' },
    { label: 'Pickup', value: 'pickup' },
    { label: 'Service', value: 'service' },
    { label: 'Other', value: 'other' },
  ]);

  const [originLat, setOriginLat] = useState('');
  const [originLng, setOriginLng] = useState('');
  const [destLat, setDestLat] = useState('');
  const [destLng, setDestLng] = useState('');

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [tripInfo, setTripInfo] = useState('');
  const [cost, setCost] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({});

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!tripName) newErrors.tripName = 'Trip name is required';
    if (!originLat || isNaN(originLat)) newErrors.originLat = 'Valid latitude required';
    if (!originLng || isNaN(originLng)) newErrors.originLng = 'Valid longitude required';
    if (!destLat || isNaN(destLat)) newErrors.destLat = 'Valid latitude required';
    if (!destLng || isNaN(destLng)) newErrors.destLng = 'Valid longitude required';
    if (!cost || isNaN(cost)) newErrors.cost = 'Valid cost required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('error', 'Validation Error', 'Please check the form fields');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const payload = {
        trip_name: tripName,
        trip_type: tripTypeValue,
        origin: {
          lat: parseFloat(originLat),
          lng: parseFloat(originLng),
        },
        destination: {
          lat: parseFloat(destLat),
          lng: parseFloat(destLng),
        },
        preferred_datetime: moment(date).format('YYYY-MM-DD HH:mm:ss'),
        trip_info: tripInfo,
        cost: parseFloat(cost),
        special_instructions: specialInstructions,
      };

      const apiUrl = `${BASE_URL}trips/trip_master/`;
      const response = await POSTNETWORK(apiUrl, payload, true);

      if (response?.status === 'success' || response?.trip_id) {
        showToast('success', 'Success', 'Trip created successfully');
        resetForm();
      } else {
        showToast('error', 'Error', response?.msg || 'Failed to create trip');
      }
    } catch (error) {
      showToast('error', 'Error', 'Something went wrong');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTripName('');
    setTripTypeValue('delivery');
    setOriginLat('');
    setOriginLng('');
    setDestLat('');
    setDestLng('');
    setDate(new Date());
    setTripInfo('');
    setCost('');
    setSpecialInstructions('');
    setErrors({});
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());
      setDate(newDate);
      setShowTimePicker(true);
    }
  };

  const onChangeTime = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
      setDate(newDate);
    }
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header title="Create Trip" onMenuPress={() => navigation.openDrawer()} />
      <KeyboardAvoidingView
        style={dynamicStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView contentContainerStyle={dynamicStyles.scrollContainer} keyboardShouldPersistTaps="handled">
          
          <View style={theme.formSection}>
            <View style={dynamicStyles.inputItem}>
              <Text style={dynamicStyles.label}>Trip Name *</Text>
              <TextInput
                style={[theme.input, errors.tripName && dynamicStyles.errorBorder]}
                value={tripName}
                onChangeText={setTripName}
                placeholder="e.g. Client Delivery - Zone C"
                placeholderTextColor={theme.colors.textPlaceholder}
              />
              {errors.tripName && <Text style={dynamicStyles.errorText}>{errors.tripName}</Text>}
            </View>
 
            <View style={[dynamicStyles.inputItem, { zIndex: 1000 }]}>
              <Text style={dynamicStyles.label}>Trip Type *</Text>
              <DropDownPicker
                open={tripTypeOpen}
                value={tripTypeValue}
                items={tripTypeItems}
                setOpen={setTripTypeOpen}
                setValue={setTripTypeValue}
                setItems={setTripTypeItems}
                style={[dynamicStyles.dropdown, { backgroundColor: theme.colors.inputBg }]}
                dropDownContainerStyle={dynamicStyles.dropdownContainer}
                textStyle={{ color: theme.colors.text }}
                placeholderStyle={{ color: theme.colors.textPlaceholder }}
                listMode="SCROLLVIEW"
              />
            </View>
          </View>
 
          <View style={theme.formSection}>
            <Text style={dynamicStyles.sectionHeader}>Origin Coordinates</Text>
            <View style={dynamicStyles.row}>
              <View style={dynamicStyles.inputItem}>
                <Text style={dynamicStyles.label}>Latitude *</Text>
                <TextInput
                  style={[theme.input, errors.originLat && dynamicStyles.errorBorder]}
                  value={originLat}
                  onChangeText={setOriginLat}
                  keyboardType="numeric"
                  placeholder="20.3236"
                  placeholderTextColor={theme.colors.textPlaceholder}
                />
              </View>
              <View style={dynamicStyles.inputItem}>
                <Text style={dynamicStyles.label}>Longitude *</Text>
                <TextInput
                  style={[theme.input, errors.originLng && dynamicStyles.errorBorder]}
                  value={originLng}
                  onChangeText={setOriginLng}
                  keyboardType="numeric"
                  placeholder="85.8217"
                  placeholderTextColor={theme.colors.textPlaceholder}
                />
              </View>
            </View>
          </View>
 
          <View style={theme.formSection}>
            <Text style={dynamicStyles.sectionHeader}>Destination Coordinates</Text>
            <View style={dynamicStyles.row}>
              <View style={dynamicStyles.inputItem}>
                <Text style={dynamicStyles.label}>Latitude *</Text>
                <TextInput
                  style={[theme.input, errors.destLat && dynamicStyles.errorBorder]}
                  value={destLat}
                  onChangeText={setDestLat}
                  keyboardType="numeric"
                  placeholder="22.5744"
                  placeholderTextColor={theme.colors.textPlaceholder}
                />
              </View>
              <View style={dynamicStyles.inputItem}>
                <Text style={dynamicStyles.label}>Longitude *</Text>
                <TextInput
                  style={[theme.input, errors.destLng && dynamicStyles.errorBorder]}
                  value={destLng}
                  onChangeText={setDestLng}
                  keyboardType="numeric"
                  placeholder="88.3629"
                  placeholderTextColor={theme.colors.textPlaceholder}
                />
              </View>
            </View>
          </View>
 
          <View style={theme.formSection}>
            <View style={dynamicStyles.inputItem}>
              <Text style={dynamicStyles.label}>Preferred Date & Time *</Text>
              <TouchableOpacity style={[theme.input, dynamicStyles.dateButton]} onPress={() => setShowDatePicker(true)}>
                <Text style={dynamicStyles.dateButtonText}>
                  {moment(date).format('DD MMM YYYY, hh:mm A')}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
              )}
              {showTimePicker && (
                <DateTimePicker value={date} mode="time" display="default" is24Hour={true} onChange={onChangeTime} />
              )}
            </View>
 
            <View style={dynamicStyles.inputItem}>
              <Text style={dynamicStyles.label}>Cost *</Text>
              <TextInput
                style={[theme.input, errors.cost && dynamicStyles.errorBorder]}
                value={cost}
                onChangeText={setCost}
                keyboardType="numeric"
                placeholder="4550"
                placeholderTextColor={theme.colors.textPlaceholder}
              />
            </View>
          </View>
 
          <View style={theme.formSection}>
            <View style={dynamicStyles.inputItem}>
              <Text style={dynamicStyles.label}>Trip Info</Text>
              <TextInput
                style={[theme.input, dynamicStyles.textArea]}
                value={tripInfo}
                onChangeText={setTripInfo}
                multiline
                numberOfLines={3}
                placeholder="Provide trip details..."
                placeholderTextColor={theme.colors.textPlaceholder}
              />
            </View>
 
            <View style={dynamicStyles.inputItem}>
              <Text style={dynamicStyles.label}>Special Instructions</Text>
              <TextInput
                style={[theme.input, dynamicStyles.textArea]}
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                multiline
                numberOfLines={3}
                placeholder="e.g. Handle with care"
                placeholderTextColor={theme.colors.textPlaceholder}
              />
            </View>
          </View>
 
          <TouchableOpacity
            style={[dynamicStyles.submitButton, isSubmitting && dynamicStyles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={dynamicStyles.submitButtonText}>Create Trip</Text>
            )}
          </TouchableOpacity>
 
          <Loader visible={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </>
  );
};

export default TripMaster;
