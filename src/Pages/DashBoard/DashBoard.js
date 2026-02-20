import { View, Text, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, FlatList, StatusBar } from 'react-native';
import React, { Fragment } from 'react';
import { Loader } from '../../components/Loader';
import { TextInput } from 'react-native-paper';
import Dash from '../Dash/Dash';

const DashBoard = ({ navigation }) => {

    return (
        <Fragment>
            <StatusBar translucent backgroundColor="transparent" barStyle={'light-content'} />
            <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}>
                    <Dash />
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Fragment>

    );
}

export default DashBoard;
