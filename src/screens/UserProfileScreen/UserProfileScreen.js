import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import axios from 'axios';
import { serverIp, serverPort } from '../../network';
import Collapsible from 'react-native-collapsible';
import profileIcon from "../../../assets/profile-icon.png";

const UserProfileScreen = ({ route }) => {
    const { userId } = route.params;
    const navigation = useNavigation();
    const [detectedImages, setDetectedImages] = useState([]);
    const [userData, setUserData] = useState({});
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const fetchDetectedImages = async () => {
        try {
            const response = await axios.get(`http://${serverIp}:${serverPort}/detection?userId=${userId}`);
            setDetectedImages(response.data.detectedImages.reverse());
        } catch (error) {
            Alert.alert('Network error', "Unable to connect to the server.");
        }
    };

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`http://${serverIp}:${serverPort}/user/${userId}`);
            setUserData(response.data);

        } catch (error) {
            Alert.alert('Network error', error.message);
        }
    };

    useEffect(() => {
        fetchDetectedImages();
        fetchUserData();
    }, []);

    const clearHistoryPress = async () => {
        Alert.alert('', "Are you sure you want to delete all images?",
            [
                { text: 'Cancel', onPress: () => null, style: 'cancel' },
                { text: 'Delete', onPress: () => deleteAllImages() },
            ],
            { cancelable: true }
        );
    };

    const pickProfilePicture = async () => {
        if (isPickerOpen) return;   // Prevent multiple launches

        setIsPickerOpen(true);

        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        });

        if (!pickerResult.canceled) {

            /* Compress image */
            const compressValue = 0.6;
            const widthValue = pickerResult.assets[0].width > 600 ? 600 : pickerResult.assets[0].width;
            const manipulatedImage = await manipulateAsync(
                pickerResult.assets[0].uri, [{ resize: { width: widthValue } }], { compress: compressValue, format: SaveFormat.JPEG, base64: true }
            );
            setIsPickerOpen(false);
            return manipulatedImage.base64;
        }

        setIsPickerOpen(false);
        return null;
    };

    const uploadProfilePicture = async () => {
        try {
            const imgB64 = await pickProfilePicture();
            if (!imgB64) return;
            await axios.post(`http://${serverIp}:${serverPort}/profilePicture/`, { userId: userId, profilePicture: imgB64 });
            await fetchUserData();
        } catch (error) {
            Alert.alert('Network error', "Unable to connect to the server.");
        }
    }

    const deleteAllImages = async () => {
        try {
            await axios.delete(`http://${serverIp}:${serverPort}/deleteAllImages`, { data: { userId: userId }, });
            await fetchDetectedImages();
        } catch (error) {
            Alert.alert('Network error', "Unable to connect to the server.");
        }
    };

    const handleImagePress = (imageDetails) => {
        const { userIdFromImage, image, className, probability } = imageDetails;

        const detectionInfo = {
            userId,
            pickedImage: `data:image/jpeg;base64,${image}`,
            prediction: [{ className, probability }],
        };

        navigation.navigate('Object Detection', {
            ...detectionInfo,
        });
    };

    const renderDetectedImage = ({ item }) => {
        const formattedClassName = item.className.replace(/, /g, ',\n');

        return (
            <View style={{ flex: 1, flexDirection: 'row' }}>

                <TouchableOpacity /* Image box */
                    style={{ flex: 0.6, aspectRatio: 1, margin: 10, marginRight: 3, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => handleImagePress(item)}>

                    {item.image ? (
                        <Image source={{ uri: `data:image/jpeg;base64,${item.image}` }} style={{ borderRadius: 13, width: '100%', height: '100%' }} />
                    ) : (
                        <Text>No Image Available</Text>
                    )}
                </TouchableOpacity>

                <View /* Result box */
                    style={{ flex: 0.4, margin: 10, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{formattedClassName}</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{`${(item.probability * 100).toFixed(2)}%`}</Text>
                </View>

            </View>
        );
    };
    const [isAccountInfoCollapsed, setAccountInfoCollapsed] = useState(false);
    const [isDetectionHistoryCollapsed, setDetectionHistoryCollapsed] = useState(true);

    const toggleAccountInfo = () => {
        setAccountInfoCollapsed(!isAccountInfoCollapsed);
    };

    const toggleDetectionHistory = () => {
        setDetectionHistoryCollapsed(!isDetectionHistoryCollapsed);
    };

    return (
        <View /* Page */
            style={{ flex: 1 }}>

            <View /* Top bar */
                style={{ width: '100%', backgroundColor: '#6499E9', flexDirection: 'row', justifyContent: 'space-between', padding: 15, paddingTop: 40, }}>
                <StatusBar barStyle={'light-content'} backgroundColor={'transparent'} translucent={true} />
                <Text style={{ fontWeight: 'bold', fontSize: 22, color: 'white' }}>Your profile</Text>
            </View>

            <View /* Below top bar */
                style={{ flex: 1, margin: 20 }}>

                <TouchableOpacity /* Account information */
                    onPress={toggleAccountInfo} >
                    <Text style={[styles.header]}>Account information {isAccountInfoCollapsed ? '▼' : '▲'}</Text>
                </TouchableOpacity>

                <Collapsible    /* Account information content */
                    style={{ padding: 10 }} collapsed={isAccountInfoCollapsed}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <TouchableOpacity /* *Profile picture* */
                            style={{ flex: 0.3, aspectRatio: 1, borderRadius: 100, marginRight: 20, alignItems: 'center', justifyContent: 'center' }}
                            onPress={() => uploadProfilePicture()}>
                            {userData.profilePicture ? (
                                <Image source={{ uri: `data:image/jpeg;base64,${userData.profilePicture}` }} style={{ width: '99%', height: '99%', borderRadius: 100 }} />
                            ) : (
                                <Image source={profileIcon} style={{ width: '99%', height: '99%' }} />
                            )}
                        </TouchableOpacity>
                        <View style={{ flex: 0.7 }}>
                            <Text style={{ fontSize: 17, fontWeight: 'bold' }}>{userData.name || " "}</Text>
                            <Text style={{ fontSize: 17 }}>{userData.username || " "}</Text>
                            <Text style={{ fontSize: 17 }}>{userData.email || " "}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                        <Text style={{ fontSize: 17, fontWeight: 'bold' }}>LEVEL {userData.level || "1"}</Text>
                        <Text style={{ fontSize: 17, fontWeight: 'bold', color: 'darkgrey' }}>POINTS: {userData.progressPoints || "0"} / {userData.level * 100 || "100"}</Text>
                    </View>

                    <View style={{ height: 20, backgroundColor: 'lightgrey', borderRadius: 10 }}>
                        <View style={{ width: userData.level ? `${userData.progressPoints / userData.level}%` : 0, height: '100%', backgroundColor: 'green', borderRadius: 100 }} />
                    </View>

                </Collapsible>


                <TouchableOpacity /* Detection history */
                    onPress={toggleDetectionHistory} >
                    <Text style={[styles.header, { marginTop: 10, marginBottom: 10 }]}>Detection history {isDetectionHistoryCollapsed ? '▼' : '▲'}</Text>
                </TouchableOpacity>
                <Collapsible /* Detection history content */
                    collapsed={isDetectionHistoryCollapsed} key={isDetectionHistoryCollapsed} style={{ height: '99%' }}>
                    {detectedImages != '' ? (
                        <View style={{ flex: 1 }}>
                            <View style={{ flex: 0.8 }}>
                                <FlatList
                                    data={detectedImages}
                                    keyExtractor={(item) => item._id}
                                    renderItem={renderDetectedImage}
                                    onEndReached={() => setAccountInfoCollapsed(true)}
                                />
                            </View>
                            <TouchableOpacity /* Clear history button */
                                onPress={clearHistoryPress} style={{ flex: 0.1, margin: 10 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 22, marginRight: 5 }}>Clear history</Text>
                                    <Icon name="delete" size={20} color="black" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Text style={{ margin: 10, fontSize: 18 }}>Your results will appear here</Text>
                    )}
                </Collapsible>

            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        color: 'darkblue',

    },
});

export default UserProfileScreen;
