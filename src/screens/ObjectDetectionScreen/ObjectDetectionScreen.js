import React from 'react';
import { View, Text, Image } from 'react-native';

const ObjectDetectionScreen = ({ route }) => {
  const { pickedImage, prediction } = route.params;

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Image source={{ uri: pickedImage }} style={{ width: 500, height: 500, margin: 40 }} />
      <Text>{`Object Detected: ${prediction.className}`}</Text>
      <Text>{`Probability: ${prediction.probability.toFixed(3)}`}</Text>
    </View>
  );
};

export default ObjectDetectionScreen;
