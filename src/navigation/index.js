import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import ObjectDetectionScreen from '../screens/ObjectDetectionScreen/ObjectDetectionScreen';
import UserProfileScreen from '../screens/UserProfileScreen';

const Stack = createStackNavigator();

const Navigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name='Login' component={LoginScreen} />
                <Stack.Screen name='SignUp' component={SignupScreen} />
                <Stack.Screen name='Forgot Password' component={ForgotPasswordScreen} />
                <Stack.Screen name='Reset Password' component={ResetPasswordScreen} />
                <Stack.Screen name='Home' component={HomeScreen} />
                <Stack.Screen name='Object Detection' component={ObjectDetectionScreen} />
                <Stack.Screen name='User Profile' component={UserProfileScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Navigation;