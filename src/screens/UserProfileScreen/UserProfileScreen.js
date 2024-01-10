import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, FlatList, Image, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { serverIp, serverPort } from '../../network';
import * as FileSystem from 'expo-file-system';
import Collapsible from 'react-native-collapsible';

const UserProfileScreen = ({ route }) => {
    const { userId } = route.params;
    const navigation = useNavigation();
    const [detectedImages, setDetectedImages] = useState([]);

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
            await axios.delete(`http://${serverIp}:${serverPort}/deleteAllImages`, { data: { userId: userId }, });
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
    const [isAccountInfoCollapsed, setAccountInfoCollapsed] = useState(false);
    const [isDetectionHistoryCollapsed, setDetectionHistoryCollapsed] = useState(false);

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
                <StatusBar barStyle='default' backgroundColor={'transparent'} translucent={true} />
                <Text style={{ fontWeight: 'bold', fontSize: 22, color: 'white' }}>Profile page</Text>
            </View>

            <View /* Below top bar */
                style={{ margin: 20 }}>
                <TouchableOpacity onPress={toggleAccountInfo}>
                    <Text style={[styles.header]}>Account information {isAccountInfoCollapsed ? '▼' : '▲'}</Text>
                </TouchableOpacity>
                <Collapsible collapsed={isAccountInfoCollapsed}>
                    <View>
                        <Text>Name: </Text>
                        <Text>Username: </Text>
                        <Text>Email: </Text>
                    </View>
                </Collapsible>

                <TouchableOpacity onPress={toggleDetectionHistory}>
                    <Text style={[styles.header]}>Detection history {isDetectionHistoryCollapsed ? '▼' : '▲'}</Text>
                </TouchableOpacity>
                <Collapsible collapsed={isDetectionHistoryCollapsed}>
                    <View>

                        <Text>Collapsible View 2 Content</Text>
                    </View>
                </Collapsible>
            </View>
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
        fontSize: 32,
        fontWeight: 'bold',
        color: 'darkblue',
        marginBottom: 10,
    },
    detectedImage: {
        width: 200,
        height: 200,
        margin: 10,
    },
});

export default UserProfileScreen;
