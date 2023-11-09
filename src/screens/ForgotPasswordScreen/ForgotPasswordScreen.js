import React, { useState } from 'react';
import { serverIp, serverPort } from '../../network';
import { View, Text, StyleSheet, useWindowDimensions, Alert } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton'
import { useNavigation } from '@react-navigation/native';
import axios from "axios";
import Dialog from "react-native-dialog";

const ForgotPasswordScreen = () => {
    const [dialogVisible, setDialogVisible] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [identifier, setIdentifier] = useState('');

    const { height } = useWindowDimensions();
    const navigation = useNavigation();

    const onSignUpPressed = () => {
        navigation.navigate('SignUp');
    };

    const onForgotPasswordPressed = () => {
        axios
            .post(`http://${serverIp}:${serverPort}/forgotpass`, { identifier: identifier })
            .then((response) => {
                setDialogVisible(true);
            })
            .catch((error) => {
                Alert.alert("Login error", error.response.data.message);
            });
    };

    const handleCancel = () => {
        setDialogVisible(false);
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
                        console.log("Response data:", error.response.data);
                    }
                }
                else {
                    console.error(error);
                }
            });


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
            />
            <View style={{ width: '50%', marginTop: 10 }}>
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