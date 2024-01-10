import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import 'react-native-gesture-handler';
import Navigation from './src/navigation';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
    'Key "uri" in the image picker result is deprecated and will be removed in SDK 48, you can access selected assets through the "assets" array instead',
    'source.uri should not be an empty string',
    'Warning: Each child in a list should have a unique "key" prop'
]);

export default function App() {
    return (
        <SafeAreaView style={styles.root}>
            <Navigation />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#F9F3CC',
    },
});
