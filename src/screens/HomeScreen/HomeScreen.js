import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Image, useWindowDimensions, BackHandler } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import CustomButton from '../../components/CustomButton'
import * as ImagePicker from 'expo-image-picker';
import { MediaLibrary } from 'expo';
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

  const [cameraPhoto, setCameraPhoto] = useState(null);
  const [galleryPhoto, setGalleryPhoto] = useState(null);

  const saveToGallery = async (uri) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      // You can now access the created asset, such as asset.id
    } catch (error) {
      console.error('Error saving to gallery:', error);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setCameraPhoto(result.assets[0].uri);
        saveToGallery(result.assets[0].uri);
      }
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setGalleryPhoto(result.uri);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CustomButton
        text="Open Camera"
        onPress={openCamera}
        type="PRIMARY"
      />
      <Image style={styles.imageStyle} source={{ uri: cameraPhoto }} />
      <CustomButton
        text="Open Gallery"
        onPress={openGallery}
        type="PRIMARY"
      />
      <Image style={styles.imageStyle} source={{ uri: galleryPhoto }} />
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