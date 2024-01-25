import React, { useState, useEffect } from 'react';
import { serverIp, serverPort } from '../../network';
import { View, Text, StyleSheet, useWindowDimensions, Alert, StatusBar, Modal, TextInput } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton'
import { useNavigation } from '@react-navigation/native';
import axios from "axios";

const ForgotPasswordScreen = () => {
    const [dialogVisible, setDialogVisible] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [identifier, setIdentifier] = useState('');

    const { height } = useWindowDimensions();
    const navigation = useNavigation();

    useEffect(() => {
        /* Run every time the screen is rendered */
        StatusBar.setBarStyle('dark-content');
    }, []);

    const onSignUpPressed = () => {
        navigation.navigate('SignUp');
    };

    const onForgotPasswordPressed = () => {

        axios
            .post(`http://${serverIp}:${serverPort}/forgotpass`, { identifier: identifier })
            .then((response) => {
                StatusBar.setBarStyle('light-content');
                setDialogVisible(true);
            })
            .catch((error) => {
                if (!error.response)
                    Alert.alert("Network error", "Unable to connect to the server.");
                else
                    Alert.alert("Forgot password error", error.response.data.message);
            });
    };

    const handleCancel = () => {
        StatusBar.setBarStyle('dark-content');
        setDialogVisible(false);
        setVerificationCode('');

    };

    const handleOK = () => {
        const data = {
            identifier: identifier,
            userCode: verificationCode
        };

        axios.post(`http://${serverIp}:${serverPort}/verify`, data)
            .then(response => {
                setIdentifier("");
                navigation.navigate('Reset Password', { identifier: identifier });
            })
            .catch(error => {
                if (error.response) {
                    if (error.response.status === 403) {
                        Alert.alert("Incorrect Verification Code", "Please try again.");
                    }
                    else {
                        Alert.alert("Network error", "Unable to connect to the server.");
                    }
                }
                else {
                    Alert.alert("Network error", "Unable to connect to the server.");
                }
            });

        StatusBar.setBarStyle('dark-content');
        setDialogVisible(false);

    };

    const handleVerificationCodeChange = (code) => {
        /* Allow only digits */
        const numericCode = code.replace(/[^0-9]/g, '');
        setVerificationCode(numericCode);
    };

    return (

        <View style={styles.root}>

            <Text style={styles.text_title}>Forgot your password?</Text>
            <View>
                <Text style={styles.text_help}>Don't worry, we can help you recover it.</Text>
            </View>
            <CustomInput
                placeholder="Username or Email"
                value={identifier}
                setValue={setIdentifier}
                keyboardType='email-address'
            />
            <View style={{ width: 200, marginTop: 10 }}>
                <CustomButton
                    text='Password forgotten' onPress={onForgotPasswordPressed}
                    type='PRIMARY'
                    disabled={!identifier}
                />
            </View>
            <View style={[styles.container_login, { top: height - 100 }]}>
                <Text>Don't have an account?</Text>
                <CustomButton
                    text='Sign Up!' onPress={onSignUpPressed}
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
                    style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>

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