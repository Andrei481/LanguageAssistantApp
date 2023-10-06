import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

const HomeScreen = () => {
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