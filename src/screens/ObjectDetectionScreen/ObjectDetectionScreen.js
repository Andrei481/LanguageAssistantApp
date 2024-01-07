import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { languages } from '../../languages';
import translate from 'translate-google-api';
import useTranslation from '../../useTranslation';
import * as Speech from 'expo-speech';


const ObjectDetectionScreen = ({ route }) => {
    const { pickedImage, prediction } = route.params;
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);

    // Filtered languages based on the search query
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
            // Call translateText when selectedLanguage or objectInfo.className changes
            translateText(objectInfo.className, selectedLanguage);
        }
    }, [selectedLanguage, objectInfo.className]);

    const handleSearch = (query) => {
        const lowercaseQuery = query.toLowerCase();
        const filtered = filteredLanguages.filter(
            (lang) => lang.label.toLowerCase().includes(lowercaseQuery)
        );
        setFilteredLanguages(filtered);
    };

    return (
        <View /* Page */
            style={{ flex: 1 }}>
            <View /* Top bar */
                style={{ backgroundColor: '#6499E9', flexDirection: 'row', justifyContent: 'space-between', padding: 15, paddingTop: 50, }}>
                <StatusBar barStyle='default' backgroundColor={'transparent'} translucent={true} />
                <Text style={{ fontWeight: 'bold', fontSize: 20, marginRight: 10, color: 'white' }}>Language Assistant</Text>
                <TouchableOpacity /* Profile icon */
                    onPress={() => {
                        // Navigate to the profile page here
                    }}
                >
                    <Icon name="account-circle" size={30} color="#fff" />
                </TouchableOpacity>
            </View>

            <View /* Image box */
                style={{ margin: 20, marginTop: 40, flex: 0.5, borderWidth: 1, borderColor: 'black', alignItems: 'center', justifyContent: 'center' }}>

                <Image source={{ uri: pickedImage }} style={{ width: '100%', height: '100%' }} />

            </View>

            <View /* Area below image */
                style={{ flex: 0.5, alignItems: 'center' }}>

                <Text /* Detected object */
                    style={{ fontWeight: 'bold', fontSize: 32, color: 'darkblue' }}
                >
                    {`${objectInfo.className} (${(objectInfo.probability * 100).toFixed(2)}%)`}
                </Text>

                <View /* Translate select row */
                    style={{ borderRadius: 13, padding: 10, margin: 20, backgroundColor: '#6499E9', flexDirection: 'row', width: '60%', alignItems: 'center', justifyContent: 'space-between' }}>

                    <Text style={{ fontWeight: 'bold', color: 'white' }}>Translate to:</Text>
                    <View style={{ width: '60%' }}>

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
                            setItems={setFilteredLanguages}
                            searchable={true}
                            searchPlaceholder="Search"
                            onSearch={handleSearch}
                        />
                    </View>

                </View>
                {translatedClassName != null && open == false ?
                    <View /* Translate results row */
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>


                        <Text style={{ fontWeight: 'bold', fontSize: 32, color: 'darkblue' }}>{`${translatedClassName}`}</Text>

                        <View style={{ paddingLeft: 10 }}>
                            <TouchableOpacity /* Listen button */
                                onPress={() => speakInLanguage(translatedClassName, selectedLanguage)}>
                                <Icon name="volume-up" size={40} color="darkblue" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    : null}
            </View>
        </View >
    );
};

export default ObjectDetectionScreen;
