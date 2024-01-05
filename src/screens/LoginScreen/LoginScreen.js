import React, { useState, useEffect } from 'react';
import { serverIp, serverPort } from '../../network';
import { View, Text, Image, StyleSheet, useWindowDimensions, Alert } from 'react-native';
import Logo from '../../../assets/Logo_1.png'
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton'
import { useNavigation } from '@react-navigation/native';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { height } = useWindowDimensions();
    const navigation = useNavigation();

    const onForgotPasswordPressed = () => {
        navigation.navigate('Forgot Password');
    };

    const onSignUpPressed = () => {
        navigation.navigate('SignUp');
    };

    const handleLogin = () => {
        axios
            .post(`http://${serverIp}:${serverPort}/login`, { identifier: username, password: password, })
            .then((response) => {
                const token = response.data.token;
                AsyncStorage.setItem("authToken", token);
                navigation.navigate("Home");
            })
            .catch((error) => {
                if (!error.response)
                    Alert.alert("Network error", "Unable to connect to the server.");
                else
                    Alert.alert("Login error", error.response.data.message);
            });
    };

    return (
        <View style={styles.root}>
            <Image source={Logo} style={[styles.logo, { height: height * 0.3 }]}
                resizeMode="contain"
            />

            <CustomInput
                placeholder="Enter Username or Email"
                value={username}
                setValue={setUsername}
                keyboardType='email-address'
            />
            <CustomInput
                placeholder="Enter Password"
                value={password}
                setValue={setPassword}
                secureTextEntry={true}
            />
            <View style={{ width: '50%', marginTop: 10 }}>
                <CustomButton
                    text='Login' onPress={handleLogin}
                    type='PRIMARY'
                    disabled={!username || !password}
                />
            </View>
            <View style={styles.container_resetPassword}>
                <CustomButton
                    text='Forgot your Password?'
                    onPress={onForgotPasswordPressed}
                    type='TERTIARY'
                />
            </View>
            <View style={[styles.container_signup, { top: height - 100 }]}>
                <Text>Don't have an account?</Text>
                <CustomButton
                    text='Sign Up!' onPress={onSignUpPressed}
                    type='TERTIARY'
                />
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    root: {
        alignItems: 'center',
        padding: 50,
    },
    logo: {
        width: '70%',
        maxWidth: 3300,
        maxHeight: 200,
        borderRadius: 30,
        marginBottom: 20,
        marginTop: 65,
    },
    container_resetPassword: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    container_signup: {
        position: 'absolute',
        width: '100%',
        height: 100, // Set the height of your component
        justifyContent: 'center', // Vertically center content
        alignItems: 'center', // Horizontally center content
    }
});

export default LoginScreen;
