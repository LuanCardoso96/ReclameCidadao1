import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import FirebaseAuthService, { UserData } from './FirebaseAuthService';
import { HomeScreenNavigationProp } from './types/navigation';

// Props que a tela recebe
type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Verificar se há usuário logado
    const currentUser = FirebaseAuthService.getCurrentUser();
    if (currentUser) {
      setUserData(currentUser);
    } else {
      // Se não há usuário logado, redirecionar para login
      navigation.navigate('Login');
    }
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await FirebaseAuthService.signOut();
      Alert.alert('Sucesso', 'Logout realizado com sucesso!');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela Inicial</Text>
      <Text style={styles.subtitle}>Bem-vindo ao app!</Text>
      
      <View style={styles.userInfo}>
        <Text style={styles.userInfoText}>Nome: {userData.nomeCompleto}</Text>
        <Text style={styles.userInfoText}>Email: {userData.email}</Text>
        <Text style={styles.userInfoText}>Telefone: {userData.telefone}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Voltar para Login"
          onPress={() => navigation.navigate('Login')}
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Logout"
          onPress={handleLogout}
          color="#e74c3c"
        />
      </View>
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
  userInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '80%',
  },
  buttonSpacer: {
    height: 15,
  },
}); 