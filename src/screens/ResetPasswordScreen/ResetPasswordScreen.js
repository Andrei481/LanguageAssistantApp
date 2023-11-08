import React, { useState } from 'react';
import { serverIp, serverPort } from '../../network';
import { View, Text, StyleSheet, Alert } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton'
import { useNavigation } from '@react-navigation/native';
import axios from "axios";

const ResetPasswordScreen = ({ route }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const { identifier } = route.params; // Access identifier here
    const navigation = useNavigation();

    const onResetPasswordPressed = () => {
        axios
            .post(`http://${serverIp}:${serverPort}/resetpass`, { identifier: identifier, newPassword: newPassword })
            .then((response) => {
                navigation.navigate('Home');
                Alert.alert("Password Reset", "Your password has been reset.");
            })
            .catch((error) => {
                Alert.alert("error", error.response.data.message);
            });

    };

    return (
        <View style={styles.root}>
            <Text style={styles.text_title}>Reset Password</Text>
            <CustomInput
                placeholder="New Password"
                value={newPassword}
                setValue={setNewPassword}
            />
            <CustomInput
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                setValue={setConfirmNewPassword}
            />
            <View>
                <CustomButton
                    text='Reset Password' onPress={onResetPasswordPressed}
                    type='PRIMARY'
                    disabled={!newPassword || !confirmNewPassword}
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
        fontSize: 32,
        paddingTop: 150,
        paddingBottom: 25,
    },
});

export default ResetPasswordScreen;