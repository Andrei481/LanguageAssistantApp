import React from 'react';
import { View, Text, Image } from 'react-native';

const ObjectDetectionScreen = ({ route }) => {
  const { pickedImage, prediction } = route.params;

  const getObjectInfo = () => {
    if (prediction && prediction.length > 0) {
      const firstPrediction = prediction[0];
      return {
        className: firstPrediction.className,
        probability: firstPrediction.probability.toFixed(3),
      };
    }
    return {
      className: 'Not detected',
      probability: 'N/A',
    };
  };

  const objectInfo = getObjectInfo();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Image source={{ uri: pickedImage }} style={{ width: 500, height: 500, margin: 40 }} />
      <Text>{`Object Detected: ${objectInfo.className}`}</Text>
      <Text>{`Probability: ${objectInfo.probability}`}</Text>
    </View>
  );
};

export default ObjectDetectionScreen;
