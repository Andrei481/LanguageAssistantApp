import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import LoginScreen from './src/LoginScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.root}>
      <LoginScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9F3CC',
  },
});
