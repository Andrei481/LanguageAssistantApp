import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Alert } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import axios from "axios";

const SignupScreen = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const {height} = useWindowDimensions();
    const navigation = useNavigation();
    const handleRegister = () => {
        if (password !== confirmPassword) {
            Alert.alert("Password Mismatch", "Password and Confirm Password do not match.");
            return;
        }
        const user = {
            name: lastName + " " + firstName,
            username: username,
            email: email,
            password: password
        };
        axios
            .post("http://192.168.0.102:3000/register", user)
            .then((response) => {
                console.log(response);
                Alert.alert(
                "Registration successful",
                "you have been registered successfully"
                );
                setFirstName("");
                setLastName("");
                setUsername("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
            })
            .catch((error) => {
                if (error.response) {
                  // The server responded with a status code outside the 2xx range
                  console.log("Server responded with an error:", error.response.status);
                  console.log("Response data:", error.response.data);
                } else if (error.request) {
                  // No response was received
                  console.log("No response received. The request may have failed.");
                } else {
                  // Something happened in setting up the request
                  console.log("Error setting up the request:", error.message);
                }
              });
    };

    const onSignUpPressed = () => {
        console.log('Sign Up Button Pressed');
        navigation.navigate('Home');
    };
    
    const onLoginPressed = () => {
        console.log("Login Button Pressed");
        navigation.navigate('Login');
    };

    return (
        <View style={styles.root}>
            <Text style={styles.text}>Sign up</Text>
            <CustomInput
                placeholder="Enter First Name"
                value={firstName}
                setValue={setFirstName}
            />
            <CustomInput
                placeholder="Enter Last Name"
                value={lastName}
                setValue={setLastName}
            />
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
                    text='Create Account' onPress={handleRegister}
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