import React, { useEffect, useState } from 'react';
import { View, Text, Image, Modal, ActivityIndicator, TouchableOpacity, Alert, Button, StatusBar, StyleSheet, Dimensions, Platform, Linking, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import CustomButton from '../../components/CustomButton';
import * as MediaLibrary from 'expo-media-library';
import axios from "axios";
import { serverIp, serverPort } from '../../network';
import appIcon from '../../../assets/icon.png';
import appInfo from '../../../app.json';
import { getStoredMobilenetAlpha, storeMobilenetAlpha } from '../../storedMobilenetAlpha.js';

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
    const [isAboutVisible, setIsAboutVisible] = useState(false);
    const [isProfileInfoVisible, setIsProfileInfoVisible] = useState(false);
    const [mobilenetAlpha, setMobilenetAlpha] = useState(0);
    const [changedAlpha, setChangedAlpha] = useState(false);
    const screenWidth = Dimensions.get('window').width;
    let logoutVisible = false;

    const loadMobileNet = async (selectedAlpha) => {
        /* Load MobileNet model with selected alpha */
        try {
            setisModelLoaded(false);
            await tf.ready();
            const mobilenetModel = await mobilenet.load({ version: 1, alpha: selectedAlpha });
            setisModelLoaded(true);
            setModel(mobilenetModel);
        } catch (error) {
            Alert.alert("Model error", error.message || "Something went wrong.");
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (logoutVisible) return true;

                logoutVisible = true;
                Alert.alert('', 'Are you sure you want to log out?',
                    [
                        { text: 'Cancel', onPress: () => { logoutVisible = false; }, style: 'cancel' },
                        { text: 'Log out', onPress: () => { logoutVisible = false; navigation.navigate('Login'); } },
                    ],
                    { cancelable: false }
                );
                return true;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => { BackHandler.removeEventListener('hardwareBackPress', onBackPress); };
        }, [navigation])
    );

    useEffect(() => {
        const storedMobilenetAlpha = getStoredMobilenetAlpha();
        setMobilenetAlpha(storedMobilenetAlpha);
        loadMobileNet(storedMobilenetAlpha);
    }, []);

    const openAbout = () => {
        NavigationBar.setButtonStyleAsync('light');
        setIsAboutVisible(true);
    };

    const closeAbout = () => {
        NavigationBar.setButtonStyleAsync('dark');
        setIsAboutVisible(false);
        if (changedAlpha) {
            loadMobileNet(mobilenetAlpha);
            storeMobilenetAlpha(mobilenetAlpha);
            setChangedAlpha(false);
        }
    }

    const openProfileInfo = () => {
        NavigationBar.setButtonStyleAsync('light');
        setIsProfileInfoVisible(true);
    };

    const closeProfileInfo = () => {
        NavigationBar.setButtonStyleAsync('dark');
        setIsProfileInfoVisible(false);
    };

    const showDetecting = () => {
        NavigationBar.setButtonStyleAsync('light');
        setisDetecting(true);
    };

    const hideDetecting = () => {
        NavigationBar.setButtonStyleAsync('dark');
        setisDetecting(false);
    };

    const toggleAlpha = () => {
        if (mobilenetAlpha === 1) {
            setMobilenetAlpha(0.75);
        } else {
            setMobilenetAlpha(1);
        }
        setChangedAlpha(!changedAlpha);
    }

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
            const imageLow = await manipulateAsync(
                pickerResult.assets[0].uri, [{ resize: { width: widthValue } }], { compress: compressValue, format: SaveFormat.JPEG }
            );
            setPickedImageLow(imageLow.uri);

            const imageLowSize = (await FileSystem.getInfoAsync(imageLow.uri)).size / 1024;
            if (imageLowSize > 73) {
                /* Can't upload images larger than ~74 KB */
                /* So we resize again */
                const lowerWidthValue = pickerResult.assets[0].width > 400 ? 400 : pickerResult.assets[0].width;
                const imageLower = await manipulateAsync(
                    pickerResult.assets[0].uri, [{ resize: { width: lowerWidthValue } }], { compress: compressValue, format: SaveFormat.JPEG }
                );
                setPickedImageLow(imageLower.uri);
            }
        }

        setIsPickerOpen(false);
    };

    const saveToGallery = async (uri) => {
        try {
            if (Platform.OS === 'android' && Platform.Version < 30) {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert("Permission error", 'Unable to save to gallery');
                    return;
                }
            }
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
            showDetecting();

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

                if (userId !== 0) {
                    await axios.post(`http://${serverIp}:${serverPort}/detection`, detectionData)
                        .catch(error => {
                            if (error.response && error.response.status !== 409) {
                                if (error.response.status === 413) {
                                    Alert.alert('Upload error', "Image too large.\n\nDon't worry, you still get the results.");
                                }
                                else
                                    Alert.alert('Upload error', error.message || "Unable to connect to the server.");
                            }
                        });
                }

                prediction.forEach(item => {
                    if (item.rawImageData) {
                        tf.dispose(item.rawImageData);
                    }
                });

                if (userId !== 0) {
                    await axios.post(`http://${serverIp}:${serverPort}/progressPoints`, { userId, progressIncrement: 10 })
                        .catch(error => {
                            if (error.response && error.response.status !== 409) {
                                Alert.alert('Update error', error.message || "Unable to connect to the server.");
                            }
                        });
                }
                navigation.navigate('Object Detection', { userId, pickedImage: pickedImageHigh, prediction });
            }
            hideDetecting();

        } catch (err) {
            Alert.alert("Detection error", err.message || "Something went wrong.");
            hideDetecting();
        }
    };

    const handleProfilePress = () => {
        if (userId == 0) {
            openProfileInfo();
        } else {
            navigation.navigate('User Profile', { userId });
        }
    };

    return (

        <View /* Page */
            style={{ height: '100%', alignItems: 'center' }}>

            <View /* Top bar */
                style={{ width: '100%', backgroundColor: '#6499E9', flexDirection: 'row', justifyContent: 'space-between', padding: 15, paddingTop: 40, }}>
                <StatusBar barStyle={'light-content'} backgroundColor={'transparent'} translucent={true} />

                <TouchableOpacity /* Language Assistant */
                    onPress={() => openAbout()}>
                    <Text style={{ fontWeight: 'bold', fontSize: 22, color: 'white' }}>Language Assistant</Text>
                </TouchableOpacity>

                <TouchableOpacity /* Profile icon */
                    onPress={handleProfilePress}>
                    <Icon name="account-circle" size={30} color="#fff" />
                </TouchableOpacity>
            </View>

            <View /* Image box */
                style={{ width: screenWidth - 40, margin: 20, aspectRatio: 1, backgroundColor: 'white', borderWidth: 1, borderColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
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
                <Text /* Loading */
                    style={{ opacity: isModelLoaded ? 0 : 1 }}>Loading MobileNet (alpha {mobilenetAlpha.toFixed(2)})...
                </Text>

                <View /* Choose image */
                    style={{ flex: 1 }}>
                    <View /* Spacing */
                        style={{ flex: 0.8 }} />
                    <View /* Buttons */
                        style={{ flexDirection: 'row', margin: 10 }}>

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
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
                                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 13, alignItems: 'center' }}>
                                    <ActivityIndicator size="large" color="darkblue" />
                                    <Text>Detecting objects...</Text>
                                </View>
                            </View>

                        </Modal>

                    </View>
                </View>
            </View>

            <Modal  /* About overlay */
                transparent={true}
                statusBarTranslucent={true}
                animationType="fade"
                visible={isAboutVisible}
                onRequestClose={closeAbout}
            >
                <View /* Shadow */
                    style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>

                    <View /* About card */
                        style={{ width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 13, alignItems: 'center' }}>

                        <Text /* Title */
                            style={{ fontWeight: 'bold', fontSize: 22, color: 'darkblue', marginBottom: 20 }}>About
                        </Text>

                        <View /* Icon */
                            style={{ width: '40%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }} >
                            <Image source={appIcon} style={{ borderRadius: 80, width: '100%', height: '100%' }} />
                        </View>

                        <Text /* Description title */
                            style={{ textAlign: 'center' }}>
                            Welcome to Language Assistant!
                        </Text>
                        <Text /* Description body */
                            style={{ textAlign: 'center', marginBottom: 20 }}>
                            Your AI-powered language learning companion
                        </Text>

                        <View /* Info */
                            style={{ flexDirection: 'row', marginBottom: 20 }}>
                            <View /* Left side - keys */
                                style={{ flex: 0.5, paddingRight: 5 }}>
                                <Text style={{ textAlign: 'right', marginBottom: 5 }}>MobileNet alpha:</Text>
                                <Text style={{ textAlign: 'right', marginBottom: 5 }}>Version:</Text>
                                <Text style={{ textAlign: 'right', marginBottom: 5 }}>Repository:</Text>
                                <Text style={{ textAlign: 'right' }}>Developers:</Text>
                            </View>
                            <View /* Right side - values */
                                style={{ flex: 0.5, paddingRight: 5 }}>
                                <TouchableOpacity onPress={() => { toggleAlpha() }}>
                                    <Text style={{ textAlign: 'left', marginBottom: 5, fontWeight: 'bold', color: 'darkblue' }}>{mobilenetAlpha.toFixed(2)}</Text>
                                </TouchableOpacity>
                                <Text style={{ textAlign: 'left', marginBottom: 5 }}>{appInfo.expo.version}</Text>
                                <TouchableOpacity
                                    onPress={() => Linking.openURL('https://github.com/Andrei481/LanguageAssistantApp')}>
                                    <Text style={{ textAlign: 'left', marginBottom: 5, fontWeight: 'bold', color: 'darkblue' }}>GitHub</Text>
                                </TouchableOpacity>
                                <Text style={{ textAlign: 'left' }}>Joldea Andrei</Text>
                                <Text style={{ textAlign: 'left' }}>Lazarov Andrei</Text>
                            </View>
                        </View>

                        <View /* Close button */
                            style={{ width: '100%', marginTop: 10 }}>
                            <CustomButton
                                text="Close"
                                onPress={() => closeAbout()}
                                type="PRIMARY"
                            />
                        </View>

                    </View>

                </View>

            </Modal>

            <Modal /* Profile info overlay */
                transparent={true}
                statusBarTranslucent={true}
                animationType="fade"
                visible={isProfileInfoVisible}
                onRequestClose={closeProfileInfo}
            >
                <View /* Shadow */
                    style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>

                    <View /* Go online card */
                        style={{ width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 13, alignItems: 'center' }}>

                        <Text /* Title */
                            style={{ fontWeight: 'bold', fontSize: 22, color: 'darkblue', marginBottom: 20 }}>Go online
                        </Text>

                        <Text /* Description body */
                            style={{ textAlign: 'center', marginBottom: 20 }}>
                            Create an account to access the profile page. Here you will find your progress and past detections.
                        </Text>

                        <View /* Close button */
                            style={{ width: '100%', marginTop: 10 }}>
                            <CustomButton
                                text="Close"
                                onPress={closeProfileInfo}
                                type="PRIMARY"
                            />
                        </View>

                    </View>

                </View>
            </Modal>

        </View>

    );
};


export default HomeScreen;