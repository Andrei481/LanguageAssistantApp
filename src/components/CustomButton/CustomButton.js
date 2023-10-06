import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'

const CustomButton = ({ onPress, text, type }) => {
    return (
        <Pressable onPress={onPress} style={[styles.container, styles[`container_${type}`]]}>
            <Text style={[styles.text, styles[`text_${type}`]]}>{text}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        

        padding: 5,
        marginVertical: 10,
        alignItems: 'center',
    },
    
    container_PRIMARY: {
        backgroundColor: '#6499E9',
        width: '100%',
        borderColor: '#6499E9',
        borderWidth: 12,
        borderRadius: 13,
    },

    container_SECONDARY: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        marginLeft: 10,
    },

    container_TERTIARY: {
    },

    text: {
        fontWeight: 'bold',
    },

    text_PRIMARY: {
        color: 'white'
    },
    text_SECONDARY: {
        color: 'black'
    },
    text_TERTIARY: {
        color: 'black',
        textDecorationLine: 'underline',
    }
});

export default CustomButton;