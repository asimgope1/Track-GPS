import { View, Text, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, FlatList } from 'react-native';
import React, { Fragment } from 'react';
import { MyStatusBar } from '../../constants/config';
import { WHITE } from '../../constants/color';
import { appStyles } from '../../styles/AppStyles';
import { Loader } from '../../components/Loader';
import { TextInput } from 'react-native-paper';
import Dash from '../Dash/Dash';

const DashBoard = ({ navigation }) => {

    return (
        <Fragment>
            <MyStatusBar backgroundColor={WHITE} barStyle={'dark-content'} />
            <SafeAreaView style={appStyles.safeareacontainer}>

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
