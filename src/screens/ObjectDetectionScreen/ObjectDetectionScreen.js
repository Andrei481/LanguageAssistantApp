import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import CustomButton from '../../components/CustomButton';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as cocossd from '@tensorflow-models/coco-ssd';

const ObjectDetectionScreen = () => {
    const detectObjects = async (imageUri) => {
        const image = Image.resolveAssetSource({ uri: imageUri });
        const imageTensor = tf.browser.fromPixels(image);
    
        const model = await cocossd.load();
        const predictions = await model.detect(imageTensor);
    
        // Process and display the predictions as needed.
        console.log(predictions);
    
        // Clean up resources.
        imageTensor.dispose();
    };
    return (
        <View style={styles.root}>
            <Text style={styles.text_title}>This is the OD Screen</Text>
            <CustomButton onPress={detectObjects('../../../assets/fruits.jpg')}
                text='Detect'>
            </CustomButton>
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

export default ObjectDetectionScreen;