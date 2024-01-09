import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { languages } from '../../languages';
import translate from 'translate-google-api';
import useTranslation from '../../useTranslation';
import * as Speech from 'expo-speech';
import { useNavigation } from '@react-navigation/native';

const ObjectDetectionScreen = ({ route }) => {
    const { userId, pickedImage, prediction } = route.params;
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
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
            console.log("Translation: ", translation[0]);
            return translation[0];
        } catch (error) {
            console.error('Translation error:', error);
            console.log("Text: ", text);
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
                <Image source={{ uri: pickedImage }} style={{ width: '100%', height: '100%' }} />
            </View>


            <View /* Area below image */
                style={{ flex: 0.95, width: screenWidth - 40, alignItems: 'center', justifyContent: 'space-around', maxHeight: 300, }}>

                <View /* English row */
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

        </View >
    );
};

export default ObjectDetectionScreen;
