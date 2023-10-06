import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import LoginScreen from './src/LoginScreen';
import SignupScreen from './src/SignupScreen';
import ForgotPasswordScreen from './src/ForgotPasswordScreen';
import ResetPasswordScreen from './src/ResetPasswordScreen';


export default function App() {
  return (
    <SafeAreaView style={styles.root}>
      <ResetPasswordScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9F3CC',
  },
});
