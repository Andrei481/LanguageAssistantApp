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
                setDialogVisible(true);
            })
            .catch((error) => {
                if (error.response) {
                    Alert.alert("Registration error", error.response.data.message);
                } else {
                    Alert.alert("Network error", 'No response from server');
                }
            });
    };

    const handleCancel = () => {
        setDialogVisible(false);
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
            />
            <CustomInput
                placeholder="Last Name"
                value={lastName}
                setValue={setLastName}
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
            <View style={{ width: '50%', marginTop: 10 }}>
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