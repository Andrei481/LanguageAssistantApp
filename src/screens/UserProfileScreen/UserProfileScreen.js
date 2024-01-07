import { serverIp, serverPort } from '../../network';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from "axios";

const UserProfileScreen = ({ route }) => {
    const { userId } = route.params;
    const { height } = useWindowDimensions();
    const navigation = useNavigation();
    const [detectedImages, setDetectedImages] = useState([]);

    useEffect(() => {
        const fetchDetectedImages = async () => {
            try {
                const response = await axios.get(`http://${serverIp}:${serverPort}/detection?userId=${userId}`);
                setDetectedImages(response.data.detectedImages);
            } catch (error) {
                console.error('Error fetching detected images:', error);
            }
        };
    
        fetchDetectedImages();
    }, [userId]);

    const handleImagePress = (imageDetails) => {
        navigation.navigate('ObjectDetection', {
        imageDetails,
        });
    };

    const renderDetectedImage = ({ item }) => (
        <TouchableOpacity onPress={() => handleImagePress(item)}>
        <Image source={{ uri: item.imageUrl }} style={styles.detectedImage} />
        </TouchableOpacity>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Detected Images</Text>
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
