import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import Logo from '../../../assets/Logo_1.png'
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton'
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const {height} = useWindowDimensions();
  const navigation = useNavigation();

  const onLoginPressed = () => {
    console.log("Login Button Pressed");
    navigation.navigate('Home');
  };

  const onForgotPasswordPressed = () => {
    console.log('Forgot Password Button Pressed');
    navigation.navigate('Forgot Password');
  };

  const onSignUpPressed = () => {
    console.log('Sign Up Button Pressed');
    navigation.navigate('SignUp');
  };

  return (
    <View style={styles.root}>
      <Image source={Logo} style={[styles.logo, {height: height * 0.3}]} 
      resizeMode="contain"
      />

      <CustomInput 
      placeholder="Enter Username"
      value={username}
      setValue={setUsername}
      />
      <CustomInput
      placeholder="Enter Password"
      value={password}
      setValue={setPassword}
      secureTextEntry={true}
      />
       <View style={styles.container_resetPassword}>
        <CustomButton
          text='Forgot your Password?'
          onPress={onForgotPasswordPressed}
          type='TERTIARY'
        />
      </View>
      <CustomButton 
        text='Login' onPress={onLoginPressed}
        type='PRIMARY'
      />
      <View style={[styles.container_signup, { top: height - 100 }]}>
        <Text>Don't have an account?</Text>
        <CustomButton 
          text='Sign Up!' onPress={onSignUpPressed}
          type='TERTIARY'
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    padding: 50,
  },
  logo: {
    width: '70%',
    maxWidth: 3300,
    maxHeight: 200,
    borderRadius: 30,
    marginBottom: 20,
    marginTop: 65,
  },
  container_resetPassword: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10, 
  },
  container_signup: {
    position: 'absolute',
    width: '100%',
    height: 100, // Set the height of your component
    justifyContent: 'center', // Vertically center content
    alignItems: 'center', // Horizontally center content
  }
});

export default LoginScreen;
