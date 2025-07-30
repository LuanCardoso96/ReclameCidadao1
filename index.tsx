import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

// Lista de rotas e parâmetros
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};

// Tipo do navigation para esta tela
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// Props que a tela recebe
type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function IndexScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela Inicial</Text>
      <Button
        title="Ir para Login"
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, marginBottom: 20 },
});
