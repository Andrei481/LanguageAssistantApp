import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import translate from 'translate-google-api';

const useTranslation = (text, targetLanguage) => {
    const [translatedText, setTranslatedText] = useState(null);

    useEffect(() => {
        const translateText = async () => {
            try {
                const translation = await translate(text, { to: targetLanguage });
                setTranslatedText(translation[0]);
            } catch (error) {
                Alert.alert("Translation error", error.message);
                setTranslatedText(text);
            }
        };

        if (text && targetLanguage) {
            translateText();
        }
    }, [text, targetLanguage]);

    return translatedText;
};

export default useTranslation;
