import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
        const onBackPress = () => {
            navigation.replace('Login');
            return true;
        };
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        };
    }, []);
    return (
        <View style={styles.root}>
            <Text style={styles.text_title}>This is the Home Screen</Text>
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

export default HomeScreen;