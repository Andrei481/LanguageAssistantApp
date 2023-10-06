import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton'

const SignupScreen = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const {height} = useWindowDimensions();

    const onSignUpPressed = () => {
        console.log('Sign Up Button Pressed');
    };
    
    const onLoginPressed = () => {
        console.log("Login Button Pressed");
    };

    return (
        <View style={styles.root}>
            <Text style={styles.text}>Sign up</Text>
            <CustomInput
                placeholder="Enter Username"
                value={username}
                setValue={setUsername}
            />
            <CustomInput 
                placeholder="Enter Email Address"
                value={email}
                setValue={setEmail}
            />
            <CustomInput
                placeholder="Enter Password"
                value={password}
                setValue={setPassword}
                secureTextEntry={true}
            />
            <CustomInput
                placeholder="Confirm Password"
                value={confirmPassword}
                setValue={setConfirmPassword}
                secureTextEntry={true}
            />
            <View>
                <CustomButton 
                    text='Create Account' onPress={onSignUpPressed}
                    type='PRIMARY'
                />
            </View>
            <View style={[styles.container_login, { top: height - 100 }]}>
                <Text>Already have an account?</Text>
                <CustomButton
                    text='Login!' onPress={onLoginPressed}
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
    
    text: {
        fontWeight: 'bold',
        color: 'darkblue',
        fontSize: 32,
        paddingTop: 150,
        paddingBottom: 25,
    },
    container_login: {
        position: 'absolute',
        width: '100%',
        height: 100, // Set the height of your component
        justifyContent: 'center', // Vertically center content
        alignItems: 'center', // Horizontally center content
      }
  });

export default SignupScreen;