import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

// Lista de rotas e parâmetros
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  SignUp: undefined;
};

// Tipo do navigation para esta tela
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// Props que a tela recebe
type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela Inicial</Text>
      <Text style={styles.subtitle}>Bem-vindo ao app!</Text>
      <Button
        title="Voltar para Login"
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
}); 