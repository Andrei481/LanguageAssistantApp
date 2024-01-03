import React, { useState, useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { languages } from '../../languages';
import translate from 'translate-google-api';
import useTranslation from '../../useTranslation';

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
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Image source={{ uri: pickedImage }} style={{ width: 200, height: 500 }} />
      <Text>{`Object Detected: ${objectInfo.className} (${(objectInfo.probability * 100).toFixed(2)}%)`}</Text>
      <Text>Select a Language:</Text>
      <DropDownPicker
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
        searchPlaceholder="Search for a language"
        onSearch={handleSearch}
      />
      <Text>{`${selectedLanguage} Translation: ${translatedClassName}`}</Text>
    </View>
  );
};

export default ObjectDetectionScreen;
