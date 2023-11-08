import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Alert } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton'
import { useNavigation } from '@react-navigation/native';

const ForgotPasswordScreen = () => {
    const [recoveryEmail, setRecoveryEmail] = useState('');

    const { height } = useWindowDimensions();
    const navigation = useNavigation();

    const onSignUpPressed = () => {
        navigation.navigate('SignUp');
    };

    const onResetPasswordPressed = () => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(recoveryEmail)) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }
        navigation.navigate('Reset Password');
    };

    return (
        <View style={styles.root}>
            <Text style={styles.text_title}>Forgot your password?</Text>
            <View>
                <Text style={styles.text_help}>Don't worry, we can help you recover it.</Text>
            </View>
            <CustomInput
                placeholder="Enter Username or Email"
                value={recoveryEmail}
                setValue={setRecoveryEmail}
            />
            <View style={{ width: '50%', marginTop: 10 }}>
                <CustomButton
                    text='Reset Password' onPress={onResetPasswordPressed}
                    type='PRIMARY'
                    disabled={!recoveryEmail}
                />
            </View>
            <View style={[styles.container_login, { top: height - 100 }]}>
                <Text>Don't have an account?</Text>
                <CustomButton
                    text='Sign Up!' onPress={onSignUpPressed}
                    type='TERTIARY'
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        alignItems: 'center',
        padding: 50,
    },

    text_title: {
        fontWeight: 'bold',
        color: 'darkblue',
        fontSize: 24,
        paddingTop: 150,
        paddingBottom: 25,
    },
    text_help: {
        fontSize: 14,
        marginBottom: 10, // Add margin between the two text lines
    },
    container_login: {
        position: 'absolute',
        width: '100%',
        height: 100, // Set the height of your component
        justifyContent: 'center', // Vertically center content
        alignItems: 'center', // Horizontally center content
    }
});

export default ForgotPasswordScreen;