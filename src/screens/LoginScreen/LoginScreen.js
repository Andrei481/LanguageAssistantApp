import React, { useState, useEffect } from 'react';
import { serverIp, serverPort } from '../../network';
import { View, Text, Image, StyleSheet, useWindowDimensions, Alert, StatusBar, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Logo from '../../../assets/Logo_1.png'
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton'
import { useNavigation } from '@react-navigation/native';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as NavigationBar from 'expo-navigation-bar';
import { loadMobilenetAlpha } from '../../storedMobilenetAlpha.js';

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { height } = useWindowDimensions();
    const navigation = useNavigation();

    useEffect(() => {
        loadMobilenetAlpha();
        NavigationBar.setButtonStyleAsync('dark');
        NavigationBar.setBackgroundColorAsync('#f2f2f2');
    }, []);

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
                const { token, userId } = response.data;
                AsyncStorage.setItem("authToken", token);
                AsyncStorage.setItem("userId", userId);
                navigation.navigate("Home", { userId });
                setPassword("");
            })
            .catch((error) => {
                if (!error.response)
                    Alert.alert("Network error", "Unable to connect to the server.");
                else
                    Alert.alert("Login error", error.response.data.message);
            });
    };

    const useOffline = () => {
        navigation.navigate("Home", { userId: 0 });
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView>
                <View style={{ height: height, alignItems: 'center', justifyContent: 'center' }}>
                    <StatusBar barStyle={'dark-content'} backgroundColor={'transparent'} translucent={true} />

                    <View /* Image box */
                        style={{ width: '70%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={Logo} style={{ borderRadius: 30, width: '80%', height: '80%' }} />
                    </View>
                    <View
                        style={{ paddingBottom: 50, width: '80%', alignItems: 'center', justifyContent: 'center' }}>
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
                        <View style={{ width: 200, marginTop: 10 }}>
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

                    </View>
                    <View style={[styles.container_signup,]}>
                        <Text>Don't have an account?</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                            <CustomButton
                                text='Sign Up!' onPress={onSignUpPressed}
                                type='TERTIARY'
                            />
                            <Text> or </Text>
                            <CustomButton
                                text='Use offline!' onPress={useOffline}
                                type='TERTIARY'
                            />
                        </View>
                    </View>
                </View >
            </ScrollView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    root: {
        alignItems: 'center',
    },

    container_resetPassword: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    container_signup: {
        position: 'absolute',
        bottom: 20,
        alignItems: 'center', // Horizontally center content
    }
});

export default LoginScreen;
