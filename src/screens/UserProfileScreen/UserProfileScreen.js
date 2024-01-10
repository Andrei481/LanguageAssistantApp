import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, FlatList, Image, TouchableOpacity, StatusBar, ScrollView, Alert, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { serverIp, serverPort } from '../../network';
import * as FileSystem from 'expo-file-system';
import Collapsible from 'react-native-collapsible';
import Dialog from "react-native-dialog";

const UserProfileScreen = ({ route }) => {
    const { userId } = route.params;
    const navigation = useNavigation();
    const [detectedImages, setDetectedImages] = useState([]);
    const [dialogVisible, setDialogVisible] = useState(false);

    const fetchDetectedImages = async () => {
        try {
            const response = await axios.get(`http://${serverIp}:${serverPort}/detection?userId=${userId}`);
            // console.log('Detected Images Response:', response.data);
            setDetectedImages(response.data.detectedImages);
        } catch (error) {
            Alert.alert('Network error', "Unable to connect to the server.");
        }
    };

    useEffect(() => {

        fetchDetectedImages();

    }, [userId]);

    const deleteAllImages = async () => {
        try {
            await axios.delete(`http://${serverIp}:${serverPort}/deleteAllImages`, { data: { userId: userId }, });
            await fetchDetectedImages();
            setDialogVisible(false);
        } catch (error) {
            setDialogVisible(false);
            Alert.alert('Network error', "Unable to connect to the server.");
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
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 0.3 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Name: </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Username: </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Email: </Text>
                        </View>
                        <View style={{ flex: 0.7 }}>
                            <Text style={{ fontSize: 18 }}>Andrei Lazarov</Text>
                            <Text style={{ fontSize: 18 }}>andy</Text>
                            <Text style={{ fontSize: 18 }}>andrei_lazarov@yahoo.com</Text>
                        </View>
                    </View>
                </Collapsible>


                <TouchableOpacity onPress={toggleDetectionHistory} >
                    <Text style={[styles.header, { marginTop: 10 }]}>Detection history {isDetectionHistoryCollapsed ? '▼' : '▲'}</Text>
                </TouchableOpacity>
                <Collapsible collapsed={isDetectionHistoryCollapsed} key={isDetectionHistoryCollapsed} style={{ height: '99%' }}>
                    <View style={{ flex: 0.8 }}>
                        <FlatList
                            data={detectedImages}
                            keyExtractor={(item) => item._id}
                            renderItem={renderDetectedImage}
                        />
                    </View>
                    <TouchableOpacity onPress={setDialogVisible} style={{ flex: 0.1, margin: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 22, marginRight: 5 }}>Clear history</Text>
                            <Icon name="delete" size={20} color="black" />
                        </View>
                    </TouchableOpacity>
                </Collapsible>

            </View>
            <Dialog.Container visible={dialogVisible}>
                <Dialog.Title>Are you sure you want to delete all images?</Dialog.Title>
                <Dialog.Button label="Cancel" onPress={() => { setDialogVisible(false) }} />
                <Dialog.Button label="Delete" onPress={deleteAllImages} />
            </Dialog.Container>
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
        fontSize: 32,
        fontWeight: 'bold',
        color: 'darkblue',

    },
    detectedImage: {
        width: 200,
        height: 200,
        margin: 10,
    },
});

export default UserProfileScreen;
