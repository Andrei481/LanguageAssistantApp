import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { serverIp, serverPort } from '../../network';
import * as FileSystem from 'expo-file-system';

const UserProfileScreen = ({ route }) => {
  const { userId } = route.params;
  const navigation = useNavigation();
  const [detectedImages, setDetectedImages] = useState([]);
  console.log({ userId });

  const fetchDetectedImages = async () => {
    try {
      const response = await axios.get(`http://${serverIp}:${serverPort}/detection?userId=${userId}`);
      console.log('Detected Images Response:', response.data);
      setDetectedImages(response.data.detectedImages);
    } catch (error) {
      console.error('Error fetching detected images:', error);
    }
  };

  useEffect(() => {


    fetchDetectedImages();
  }, [userId]);

  const deleteAllImages = async () => {
    try {
      const response = await axios.delete(`http://${serverIp}:${serverPort}/deleteAllImages`, {
        data: { userId: userId },
      });

      console.log('Delete Images Response:', response.data);
      // Optionally, you can fetch the updated list of images after deletion
      await fetchDetectedImages();
    } catch (error) {
      console.error('Error deleting images:', error);
    }
  };


  const handleImagePress = (imageDetails) => {
    const { userId, image, className, probability } = imageDetails;

    const detectionInfo = {
      userId,
      pickedImage: image,
      prediction: [{ className, probability }],
    };

    navigation.navigate('Object Detection', {
      ...detectionInfo,
    });
  };


  const renderDetectedImage = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleImagePress(item)}>
        {item.image ? (
          <Image source={{ uri: `data:image/jpeg;base64,${item.image}` }} style={styles.detectedImage} />
        ) : (
          <Text>No Image Available</Text>
        )}
      </TouchableOpacity>
    );
  };



  return (
    <View style={styles.container}>
      <Text style={styles.header}>Detected Images</Text>
      <TouchableOpacity onPress={deleteAllImages}>
        <Text>Delete All Images</Text>
      </TouchableOpacity>
      <FlatList
        data={detectedImages}
        keyExtractor={(item) => item._id}
        renderItem={renderDetectedImage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detectedImage: {
    width: 200,
    height: 200,
    margin: 10,
  },
});

export default UserProfileScreen;
