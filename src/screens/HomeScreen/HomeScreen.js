import React, { useEffect, useState } from 'react';
import { View, Text, Image, Modal, ActivityIndicator, TouchableOpacity, Alert, Button, StatusBar, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocossd from '@tensorflow-models/coco-ssd'
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as jpeg from 'jpeg-js'
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import * as MediaLibrary from 'expo-media-library';
import axios from "axios";
import { serverIp, serverPort } from '../../network';

const HomeScreen = ({ route }) => {
    const { userId } = route.params;
    const navigation = useNavigation();
    const [isTfReady, setIsTfReady] = useState(false);
    const [result, setResult] = useState('');
    const [pickedImage, setPickedImage] = useState('');
    const [model, setModel] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                const mobilenetModel = await mobilenet.load({ version: 1, alpha: 0.75 });
                setIsTfReady(true);
                setModel(mobilenetModel);
            } catch (err) {
                console.log(err);
            }
        };

        loadModel();
    }, []);

    const pickImage = async () => {
        if (isCameraOpen || isPickerOpen) return;   // Prevent multiple launches

        setIsPickerOpen(true);
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1]
        });
        setIsPickerOpen(false);

        if (result.canceled) return;

        setPickedImage(result.assets[0].uri);

    };

    const saveToGallery = async (uri) => {
        try {
            const asset = await MediaLibrary.createAssetAsync(uri);
        } catch (error) {
            console.error('Error saving to gallery:', error);
        }
    };

    const openCamera = async () => {
        if (isCameraOpen || isPickerOpen) return;

        setIsCameraOpen(true);
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status === 'granted') {

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1]
            });

            if (!result.canceled) {
                setPickedImage(result.assets[0].uri);
                saveToGallery(result.assets[0].uri);
            }
        }
        setIsCameraOpen(false);

    };

    const classifyUsingCocoSSD = async () => {
        try {
            // Load Coco-SSD.
            await tf.ready();
            const model = await cocossd.load();
            setIsTfReady(true);
            console.log("starting inference with picked image: " + pickedImage)
            // Convert image to tensor
            const imgB64 = await FileSystem.readAsStringAsync(pickedImage, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
            const raw = new Uint8Array(imgBuffer)
            const TO_UINT8ARRAY = true
            const { width, height, data } = jpeg.decode(raw, TO_UINT8ARRAY)
            const buffer = new Uint8Array(width * height * 3)
            let offset = 0
            for (let i = 0; i < buffer.length; i += 3) {
                buffer[i] = data[offset]
                buffer[i + 1] = data[offset + 1]
                buffer[i + 2] = data[offset + 2]
                offset += 4
            }
            const imageTensor = tf.tensor3d(buffer, [height, width, 3])
            // Classify the tensor and show the result
            const prediction = await model.detect(imageTensor);
            if (prediction && prediction.length > 0) {
                setResult(`${prediction[0].class} (${prediction[0].score.toFixed(3)}`);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const classifyUsingMobilenet = async () => {
        try {
            if (!model) {
                console.log("Model not loaded.");
                return;
            }
            setIsLoading(true);
            console.log("Starting inference with picked image")

            // Convert image to tensor
            const imgB64 = await FileSystem.readAsStringAsync(pickedImage, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
            const raw = new Uint8Array(imgBuffer)
            const imageTensor = decodeJpeg(raw);

            // Classify the tensor and show the result
            const prediction = await model.classify(imageTensor);
            imageTensor.dispose(); // release memory

            if (prediction && prediction.length > 0) {
                console.log("Result: " + prediction[0].className);
                setResult(`${prediction[0].className} (${prediction[0].probability.toFixed(3)})`);

                const detectionData = {
                    userId,
                    image: pickedImage,
                    className: prediction[0].className,
                    probability: prediction[0].probability.toFixed(3),
                };
                axios.post(`http://${serverIp}:${serverPort}/detection`, detectionData)
                    .then(response => {
                        console.log(response.data.message);
                    })
                    .catch(error => {
                        console.error('Error saving detection:', error);
                    });

                // Dispose of model-generated tensors
                prediction.forEach(item => {
                    if (item.rawImageData) {
                        tf.dispose(item.rawImageData);
                    }
                });

                navigation.navigate('Object Detection', { userId, pickedImage, prediction });
            }
            setIsLoading(false);

        } catch (err) {
            console.log(err);
            Alert.alert("Detection error", err.message || "Something went wrong.");
            setIsLoading(false);
        }
    };

    return (

        <View /* Page */
            style={{ height: '100%', alignItems: 'center' }}>

            <View /* Top bar */
                style={{ width: '100%', backgroundColor: '#6499E9', flexDirection: 'row', justifyContent: 'space-between', padding: 15, paddingTop: 40, }}>
                <StatusBar barStyle='default' backgroundColor={'transparent'} translucent={true} />
                <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'white' }}>Language Assistant</Text>
                <TouchableOpacity /* Profile icon */
                    onPress={() => { navigation.navigate('User Profile', { userId }); }}>
                    <Icon name="account-circle" size={30} color="#fff" />
                </TouchableOpacity>
            </View>

            <View /* Image box */
                style={{ width: screenWidth - 40, margin: 20, aspectRatio: 1, borderWidth: 1, borderColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
                {pickedImage ?
                    <Image source={{ uri: pickedImage }} style={{ width: '100%', height: '100%' }} /> :
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
                        disabled={pickedImage === '' || !isTfReady}
                    />
                </View>

                <Text style={{ opacity: isTfReady ? 0 : 1 }}>Loading TFJS Model...</Text>

                <View /* Choose image bar */
                    style={{ position: 'absolute', bottom: 50, flexDirection: 'row' }}>

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
                        visible={isLoading}
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