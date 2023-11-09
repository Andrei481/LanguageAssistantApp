import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'

const CustomButton = ({ onPress, text, type, disabled }) => {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                styles[`container_${type}`],
                disabled ? styles.container_DISABLED : {},
                { opacity: pressed || disabled ? 0.5 : 1 }
            ]}
            disabled={disabled}
        >
            <Text style={[styles.text, styles[`text_${type}`]]}>{text}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        marginVertical: 5,
        alignItems: 'center',
    },

    container_PRIMARY: {
        backgroundColor: '#6499E9',
        width: '100%',
        borderRadius: 13,
    },

    container_SECONDARY: {
        borderWidth: 0,
        marginLeft: 10,
    },

    container_TERTIARY: {
    },

    container_DISABLED: {
        backgroundColor: 'gray',
        width: '100%',
        borderRadius: 13,
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