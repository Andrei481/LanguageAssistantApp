import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar, Dimensions, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { languages } from '../../languages';
import translate from 'translate-google-api';
import useTranslation from '../../useTranslation';
import * as Speech from 'expo-speech';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';

const ObjectDetectionScreen = ({ route }) => {
    const { userId, pickedImage, prediction } = route.params;
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [isProfileInfoVisible, setIsProfileInfoVisible] = useState(false);
    const navigation = useNavigation();
    const screenWidth = Dimensions.get('window').width;

    const [filteredLanguages, setFilteredLanguages] = useState(
        Object.entries(languages).map(([language, code]) => ({
            label: language,
            value: code,
        }))
    );

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
    const translatedClassName = useTranslation(objectInfo.className, selectedLanguage);

    const translateText = async (text, targetLanguage) => {
        try {
            const translation = await translate(text, { to: targetLanguage });
            return translation[0];
        } catch (error) {
            Alert.alert("Translation error", error.message);
            return text;
        }
    };

    const speakInLanguage = async (text, languageCode) => {
        Speech.speak(text, { language: languageCode });
    };

    useEffect(() => {
        if (selectedLanguage && objectInfo.className) {
            translateText(objectInfo.className, selectedLanguage);
        }
    }, [selectedLanguage, objectInfo.className]);

    const openProfileInfo = () => {
        setIsProfileInfoVisible(true);
    };

    const closeProfileInfo = () => {
        setIsProfileInfoVisible(false);
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
                <StatusBar barStyle='default' backgroundColor={'transparent'} translucent={true} />
                <Text style={{ fontWeight: 'bold', fontSize: 22, color: 'white' }}>Results</Text>

                <TouchableOpacity /* Profile icon */
                    onPress={handleProfilePress}>
                    <Icon name="account-circle" size={30} color="#fff" />
                </TouchableOpacity>
            </View>

            <View /* Image box */
                style={{ width: screenWidth - 40, margin: 20, aspectRatio: 1, borderWidth: 1, borderColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
                <Image source={{ uri: pickedImage }} style={{ width: '100%', height: '100%' }} />
            </View>


            <View /* Area below image */
                style={{ flex: 0.95, width: screenWidth - 40, alignItems: 'center', justifyContent: 'space-around', maxHeight: 300, }}>

                <View /* Detection results (english) row */
                    style={{ flex: 0.33, flexDirection: 'row' }}>

                    <View style={{ flex: 7.5, justifyContent: 'center', borderWidth: 1, backgroundColor: 'white', borderRadius: 13, alignItems: 'center', }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 22, color: 'darkblue' }}>{`${objectInfo.className}`}</Text>
                    </View>

                    <View style={{ flex: 2.5, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 22, color: 'darkblue' }}>{`${(objectInfo.probability * 100).toFixed(2)}%`}</Text>
                    </View>
                </View>

                <View /* Language select row */
                    style={{ flex: 0.33, flexDirection: 'row' }}>

                    <View style={{ flex: 7.5, justifyContent: 'center' }}>
                        <DropDownPicker
                            placeholder='Select a language'
                            open={open}
                            value={value}
                            items={filteredLanguages}
                            setOpen={setOpen}
                            setValue={(selectedValue) => {
                                setValue(selectedValue);
                                setSelectedLanguage(selectedValue);
                            }}
                            searchable={true}
                            searchPlaceholder="Search"
                            dropDownDirection="TOP"
                            textStyle={{ fontWeight: 'bold', fontSize: 22, color: 'darkblue', alignItems: 'center' }}

                        />
                    </View>

                    <View style={{ flex: 2.5, justifyContent: 'center', alignItems: 'center' }}>
                        <Icon name="translate" size={40} color="darkblue" />
                    </View>
                </View>

                <View /* Translate results row */
                    style={{ flex: 0.33, flexDirection: 'row', opacity: translatedClassName == null ? 0 : 1 }}>
                    <View style={{ flex: 7.5, justifyContent: 'center', borderWidth: 1, backgroundColor: 'white', borderRadius: 13, alignItems: 'center', }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 22, color: 'darkblue' }}>{`${translatedClassName}`}</Text>
                    </View>
                    <View style={{ flex: 2.5, justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity /* Listen button */
                            onPress={() => speakInLanguage(translatedClassName, selectedLanguage)}>
                            <Icon name="volume-up" size={40} color="darkblue" />
                        </TouchableOpacity>
                    </View>
                </View>

            </View>

            <Modal /* Profile info overlay */
                transparent={true}
                statusBarTranslucent={true}
                animationType="fade"
                visible={isProfileInfoVisible}
                onRequestClose={closeProfileInfo}
            >
                <View /* Shadow */
                    style={{ height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>

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

        </View >
    );
};

export default ObjectDetectionScreen;
