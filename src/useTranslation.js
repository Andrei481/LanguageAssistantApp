import { useState, useEffect } from 'react';
import translate from 'translate-google-api';

const useTranslation = (text, targetLanguage) => {
    const [translatedText, setTranslatedText] = useState(null);

    useEffect(() => {
        const translateText = async () => {
            try {
                const translation = await translate(text, { to: targetLanguage });
                console.log("Translation: ", translation[0]);
                setTranslatedText(translation[0]);
            } catch (error) {
                console.error('Translation error:', error);
                console.log("Text: ", text);
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
