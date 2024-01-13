import React, { useEffect, useState } from 'react';
import { View, Text, Image, Modal, ActivityIndicator, TouchableOpacity, Alert, Button, StatusBar, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import * as MediaLibrary from 'expo-media-library';
import axios from "axios";
import { serverIp, serverPort } from '../../network';

const HomeScreen = ({ route }) => {
    const { userId } = route.params;
    const navigation = useNavigation();
    const [isModelLoaded, setisModelLoaded] = useState(false);
    const [detectionResult, setDetectionResult] = useState('');
    const [pickedImageHigh, setPickedImageHigh] = useState('');
    const [pickedImageLow, setPickedImageLow] = useState('');
    const [model, setModel] = useState(null);
    const [isDetecting, setisDetecting] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                const mobilenetModel = await mobilenet.load({ version: 1, alpha: 0.75 });
                setisModelLoaded(true);
                setModel(mobilenetModel);
            } catch (error) {
                Alert.alert("Model error", error.message || "Something went wrong.");
            }
        };

        loadModel();
    }, []);

    const pickImage = async () => {
        if (isCameraOpen || isPickerOpen) return;   // Prevent multiple launches

        setIsPickerOpen(true);

        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        });

        if (!pickerResult.canceled) {
            setPickedImageHigh(pickerResult.assets[0].uri);

            /* Compress image */
            const compressValue = 0.6;
            const widthValue = pickerResult.assets[0].width > 600 ? 600 : pickerResult.assets[0].width;
            const manipulatedImage = await manipulateAsync(
                pickerResult.assets[0].uri, [{ resize: { width: widthValue } }], { compress: compressValue, format: SaveFormat.JPEG }
            );
            setPickedImageLow(manipulatedImage.uri);
        }

        setIsPickerOpen(false);
    };

    const saveToGallery = async (uri) => {
        try {
            await MediaLibrary.createAssetAsync(uri);
        } catch (error) {
            Alert.alert("Error", 'Unable to save to gallery');
        }
    };

    const openCamera = async () => {
        if (isCameraOpen || isPickerOpen) return;

        setIsCameraOpen(true);

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status === 'granted') {

            const cameraResult = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1
            });

            if (!cameraResult.canceled) {
                setPickedImageHigh(cameraResult.assets[0].uri);

                /* Compress image */
                const compressValue = 0.6;
                const widthValue = cameraResult.assets[0].width > 600 ? 600 : cameraResult.assets[0].width;
                const manipulatedImage = await manipulateAsync(
                    cameraResult.assets[0].uri, [{ resize: { width: widthValue } }], { compress: compressValue, format: SaveFormat.JPEG }
                );
                setPickedImageLow(manipulatedImage.uri);

                await saveToGallery(cameraResult.assets[0].uri);
            }
        }

        setIsCameraOpen(false);
    };

    const classifyUsingMobilenet = async () => {
        try {
            if (!model) {
                Alert.alert("Detection error", "Model not loaded.");
                return;
            }
            setisDetecting(true);

            // Convert image to tensor
            const imgB64 = await FileSystem.readAsStringAsync(pickedImageLow, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
            const raw = new Uint8Array(imgBuffer)
            const imageTensor = decodeJpeg(raw);

            // Classify the tensor and show the result
            const prediction = await model.classify(imageTensor);
            imageTensor.dispose(); // release memory

            if (prediction && prediction.length > 0) {
                setDetectionResult(`${prediction[0].className} (${prediction[0].probability.toFixed(3)})`);

                const detectionData = {
                    userId,
                    image: imgB64,
                    className: prediction[0].className,
                    probability: prediction[0].probability.toFixed(3),
                };
                axios.post(`http://${serverIp}:${serverPort}/detection`, detectionData)
                    .catch(error => {
                        if (error.response.status != 409)
                            Alert.alert('Upload error', error.message || "Unable to connect to the server.");
                    });

                // Dispose of model-generated tensors
                prediction.forEach(item => {
                    if (item.rawImageData) {
                        tf.dispose(item.rawImageData);
                    }
                });
                axios.post(`http://${serverIp}:${serverPort}/updateProgressPoints`, { userId, pointsToAdd: 10 })
                .catch(error => {
                    if (error.response.status != 409)
                        Alert.alert('Upload error', error.message || "Unable to connect to the server.");
                });
                navigation.navigate('Object Detection', { userId, pickedImage: pickedImageHigh, prediction });
            }
            setisDetecting(false);

        } catch (err) {
            Alert.alert("Detection error", err.message || "Something went wrong.");
            setisDetecting(false);
        }
    };

    return (

        <View /* Page */
            style={{ height: '100%', alignItems: 'center' }}>

            <View /* Top bar */
                style={{ width: '100%', backgroundColor: '#6499E9', flexDirection: 'row', justifyContent: 'space-between', padding: 15, paddingTop: 40, }}>
                <StatusBar barStyle='default' backgroundColor={'transparent'} translucent={true} />
                <Text style={{ fontWeight: 'bold', fontSize: 22, color: 'white' }}>Language Assistant</Text>
                <TouchableOpacity /* Profile icon */
                    onPress={() => { navigation.navigate('User Profile', { userId }); }}>
                    <Icon name="account-circle" size={30} color="#fff" />
                </TouchableOpacity>
            </View>

            <View /* Image box */
                style={{ width: screenWidth - 40, margin: 20, aspectRatio: 1, borderWidth: 1, borderColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
                {pickedImageHigh ?
                    <Image source={{ uri: pickedImageHigh }} style={{ width: '100%', height: '100%' }} /> :
                    <Text style={{ fontWeight: 'bold', fontSize: (screenWidth) * 0.08, color: 'darkblue', padding: 10 }}>Choose an image</Text>
                }
            </View>

            <View /* Area below image */
                style={{ width: '100%', flex: 1, alignItems: 'center' }}>

                <View /* Detect objects button */
                    style={{ width: '50%' }}>
                    <CustomButton
                        text="Detect objects"
                        onPress={classifyUsingMobilenet}
                        type="PRIMARY"
                        disabled={pickedImageLow === '' || !isModelLoaded}
                    />
                </View>

                <Text style={{ opacity: isModelLoaded ? 0 : 1 }}>Loading TFJS Model...</Text>

                <View /* Choose image bar */
                    style={{ position: 'absolute', bottom: 40, flexDirection: 'row' }}>

                    <TouchableOpacity /* Camera button */
                        onPress={openCamera}>
                        <View style={{ borderTopLeftRadius: 13, borderBottomLeftRadius: 13, padding: 10, backgroundColor: '#6499E9' }} >
                            <Icon name="photo-camera" size={40} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    <View /* Devider */
                        style={{ width: 1, backgroundColor: 'white' }} />

                    <TouchableOpacity /* Gallery button icon */
                        onPress={pickImage} >
                        <View style={{ borderTopRightRadius: 13, borderBottomRightRadius: 13, padding: 10, backgroundColor: '#6499E9' }} >
                            <Icon name="image" size={40} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    <Modal  /* Detecting objects overlay */
                        transparent={true}
                        animationType="fade"
                        visible={isDetecting}
                        statusBarTranslucent={true}
                    >
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
                            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 13, alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="darkblue" />
                                <Text>Detecting objects...</Text>
                            </View>
                        </View>

                    </Modal>

                </View>

            </View>

        </View>
    );
};


export default HomeScreen;