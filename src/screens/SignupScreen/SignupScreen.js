import { serverIp, serverPort } from '../../network';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Alert, StatusBar, Modal, TextInput } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import axios from "axios";

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

    const showDialog = () => {
        StatusBar.setBarStyle('light-content');
        NavigationBar.setButtonStyleAsync('light');
        setDialogVisible(true);
    };

    const hideDialog = () => {
        StatusBar.setBarStyle('dark-content');
        NavigationBar.setButtonStyleAsync('dark');
        setDialogVisible(false);
    };


    const handleRegister = () => {
        const usernameRegex = /^[a-zA-Z0-9._-]+$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/;
        const nameRegex = /^[a-zA-Z -]+$/;

        if (!usernameRegex.test(username)) {
            Alert.alert("Invalid Username", "Username can only contain letters, numbers, and the symbols: . _ -");
            return;
        }
        if (!emailRegex.test(email)) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }
        if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
            Alert.alert("Invalid Name", "Please enter your real name");
            return;
        }
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
                showDialog();
            })
            .catch((error) => {
                if (error.response) {
                    Alert.alert("Registration error", error.response.data.message);
                } else {
                    Alert.alert("Network error", 'Unable to connect to the server');
                }
            });
    };

    const handleCancel = () => {
        hideDialog();
        setVerificationCode('');
        //delete user from db
    };

    const handleOK = () => {
        const data = {
            identifier: username,
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

                const userId = response.data.userId;
                navigation.navigate("Home", { userId });
                Alert.alert("Registration succesful", "Welcome!");
            })
            .catch(error => {
                if (error.response) {
                    if (error.response.status === 403) {
                        Alert.alert("Incorrect Verification Code", "Please try again.");
                    }
                    else {
                        Alert.alert("Network error", 'Unable to connect to the server');
                    }
                }
                else {
                    Alert.alert("Network error", 'Unable to connect to the server');
                }
            });

        hideDialog();
    };

    const handleVerificationCodeChange = (code) => {
        /* Allow only digits */
        const numericCode = code.replace(/[^0-9]/g, '');
        setVerificationCode(numericCode);
    };

    const onLoginPressed = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={styles.root}>
            <Text style={styles.text}>Sign up</Text>
            <CustomInput
                placeholder="First Name"
                value={firstName}
                setValue={setFirstName}
                autoCapitalize="words"
            />
            <CustomInput
                placeholder="Last Name"
                value={lastName}
                setValue={setLastName}
                autoCapitalize="words"
            />
            <CustomInput
                placeholder="Username"
                value={username}
                setValue={setUsername}
            />
            <CustomInput
                placeholder="Email Address"
                value={email}
                setValue={setEmail}
                keyboardType='email-address'
            />
            <CustomInput
                placeholder="Password"
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
            <View style={{ width: 200, marginTop: 10 }}>
                <CustomButton
                    text='Create Account' onPress={handleRegister}
                    type='PRIMARY'
                    disabled={!firstName || !lastName || !username || !email || !password || !confirmPassword}
                />
            </View>
            <View style={[styles.container_login, { top: height - 100 }]}>
                <Text>Already have an account?</Text>
                <CustomButton
                    text='Login!' onPress={onLoginPressed}
                    type='TERTIARY'
                />
            </View>

            <Modal /* Verification code dialog */
                transparent={true}
                statusBarTranslucent={true}
                animationType="fade"
                visible={dialogVisible}
            >
                <View /* Shadow */
                    style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>

                    <View /* Card */
                        style={{ width: '80%', backgroundColor: '#f2f2f2', padding: 20, borderRadius: 13, alignItems: 'center' }}>

                        <Text /* Title */
                            style={{ fontWeight: 'bold', fontSize: 22, color: 'darkblue', marginBottom: 20 }}>Verification
                        </Text>

                        <Text /* Title */
                            style={{ marginBottom: 20 }}>Enter the code we sent to your email
                        </Text>

                        <TextInput
                            style={{
                                fontSize: 40,
                                borderRadius: 10,
                                marginBottom: 20,
                                backgroundColor: 'white',
                                padding: 10,
                            }}
                            placeholder="000000"
                            placeholderTextColor="lightgrey"
                            keyboardType="numeric"
                            maxLength={6}
                            value={verificationCode}
                            onChangeText={handleVerificationCodeChange}
                        />

                        <View /* Button row */
                            style={{ flexDirection: 'row', width: '100%' }}>

                            <View /* Cancel button */
                                style={{ flex: 0.5, marginRight: 10 }}>
                                <CustomButton
                                    text="Cancel"
                                    onPress={handleCancel}
                                    type="CANCEL"
                                />
                            </View>

                            <View /* Verify button */
                                style={{ flex: 0.5, marginLeft: 10 }}>
                                <CustomButton
                                    text="Verify"
                                    onPress={handleOK}
                                    type="PRIMARY"
                                />
                            </View>

                        </View>

                    </View>

                </View>
            </Modal>
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
        paddingTop: 70,
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