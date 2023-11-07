import { serverIp, serverPort } from '../../network';
import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Alert } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import axios from "axios";
import Dialog from "react-native-dialog";



const SignupScreen = () => {
    const [dialogVisible, setDialogVisible] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { height } = useWindowDimensions();
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
        axios.post(`http://${serverIp}:${serverPort}/register`, user)
            .then((response) => {

                setDialogVisible(true);
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 401) {
                        Alert.alert("Email already registered", "Please try again.");
                    }
                    else if (error.response.status === 402) {
                        Alert.alert("Username already taken", "Please try again.");
                    }
                    else {
                        console.log("Response data:", error.response.data);
                    }
                } else if (error.request) {
                    // No response was received
                    console.log("No response received. The request may have failed.");
                } else {
                    // Something happened in setting up the request
                    console.log("Error setting up the request:", error.message);
                }
            });
    };

    const handleCancel = () => {
        setDialogVisible(false);
        //delete user from db
    };

    const handleOK = () => {
        const data = {
            username: username,
            userCode: verificationCode
        };

        axios.post(`http://${serverIp}:${serverPort}/verify`, data)
            .then(response => {
                setFirstName("");
                setLastName("");
                setUsername("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setDialogVisible(false);
                navigation.navigate('Home');
                Alert.alert("Registration succesful", "Welcome!");
            })
            .catch(error => {
                if (error.response) {
                    if (error.response.status === 403) {
                        Alert.alert("Incorrect Verification Code", "Please try again.");
                    }
                    else {
                        console.log("Response data:", error.response.data);
                    }
                }
                else {
                    console.error(error);
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
            <Dialog.Container visible={dialogVisible}>
                <Dialog.Title>Enter Verification Code</Dialog.Title>
                <Dialog.Description>
                    Please enter the verification code sent to your email
                </Dialog.Description>
                <Dialog.Input onChangeText={setVerificationCode} />
                <Dialog.Button label="Cancel" onPress={handleCancel} />
                <Dialog.Button label="OK" onPress={handleOK} />
            </Dialog.Container>
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