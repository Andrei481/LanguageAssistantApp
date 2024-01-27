import * as FileSystem from 'expo-file-system';
import * as Device from 'expo-device';

let storedMobilenetAlpha;

const getStoredMobilenetAlpha = () => {
    return storedMobilenetAlpha;
};

const storeMobilenetAlpha = async (newValue) => {
    /* Store alpha value in local storage */
    storedMobilenetAlpha = newValue;
    try {
        const fileUri = `${FileSystem.documentDirectory}mobilenetAlpha.txt`;
        await FileSystem.writeAsStringAsync(fileUri, newValue.toString());
    } catch (error) {
        Alert.alert('Error storing MobileNet alpha', error);
    }
};

const loadMobilenetAlpha = async () => {
    /* Load alpha value from local storage */
    try {
        const fileUri = `${FileSystem.documentDirectory}mobilenetAlpha.txt`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (fileInfo.exists) {
            const content = await FileSystem.readAsStringAsync(fileUri);
            storedMobilenetAlpha = parseFloat(content);
            return;
        }

        if (Device.brand === 'google') {
            storeMobilenetAlpha(0.75);
            return;
        }

        /* Default value */
        storeMobilenetAlpha(1);

    } catch (error) {
        Alert.alert('Error loading MobileNet alpha', error);
    }
};

export { getStoredMobilenetAlpha, storeMobilenetAlpha, loadMobilenetAlpha };
