import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton'

const ResetPasswordScreen = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');


    const {height} = useWindowDimensions();

    const onSignUpPressed = () => {
        console.log('Sign Up Button Pressed');
    };
    
    const onResetPasswordPressed = () => {
        console.log("Reset Password Button Pressed");
    };

    return (
        <View style={styles.root}>
            <Text style={styles.text_title}>Reset Password</Text>
            <CustomInput
                placeholder="Enter New Password"
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