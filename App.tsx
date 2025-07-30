import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import SignUpScreen from './SignUpScreen';

// Definir os tipos para as rotas
type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  SignUp: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2c3e50', // Cor mais escura e elegante
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ title: 'Login' }}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen}
          options={{ title: 'Criar Conta' }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Tela Inicial' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 