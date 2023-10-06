import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton'

const ForgotPasswordScreen = () => {
    const [recoveryEmail, setRecoveryEmail] = useState('');

    const {height} = useWindowDimensions();

    const onSignUpPressed = () => {
        console.log('Sign Up Button Pressed');
    };
    
    const onResetPasswordPressed = () => {
        console.log("Reset Password Button Pressed");
    };

    return (
        <View style={styles.root}>
            <Text style={styles.text_title}>Forgot your password?</Text>
            <View>
                <Text style={styles.text_help}>Don't worry! We will help you recover it!</Text>
                <Text style={styles.text_help}>Enter your username or email address</Text>
            </View>
            <CustomInput
                placeholder="Enter Username or Email"
                value={recoveryEmail}
                setValue={setRecoveryEmail}
            />
            <View>
                <CustomButton 
                    text='Reset Password' onPress={onResetPasswordPressed}
                    type='PRIMARY'
                />
            </View>
            <View style={[styles.container_login, {top: height - 100}]}>
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