import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import FirebaseAuthService from './FirebaseAuthService';
import { ForgotPasswordScreenNavigationProp } from './types/navigation';

type Props = {
  navigation: ForgotPasswordScreenNavigationProp;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu email');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Erro', 'Por favor, digite um email válido');
      return;
    }

    setLoading(true);
    try {
      await FirebaseAuthService.resetPassword(email);
      Alert.alert(
        'Email enviado!',
        'Verifique sua caixa de entrada para redefinir sua senha.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ImageBackground
      source={require('./assets/images/japao.jpg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Ícone de cadeado */}
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/483/483408.png'
          }}
          style={styles.lockIcon}
        />

        <Text style={styles.title}>Recuperar Senha</Text>
        <Text style={styles.subtitle}>
          Digite seu email para receber um link de redefinição de senha
        </Text>

        {/* Campo de e-mail */}
        <View style={styles.inputContainer}>
          <Text style={styles.icon}>📧</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        {/* Botão de enviar */}
        <TouchableOpacity 
          style={[styles.resetButton, loading && styles.disabledButton]} 
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.resetButtonText}>Enviar Email</Text>
          )}
        </TouchableOpacity>

        {/* Link para voltar ao login */}
        <TouchableOpacity onPress={handleBackToLogin} style={styles.backLink}>
          <Text style={styles.backText}>Voltar para Login</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  lockIcon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    tintColor: '#fff'
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  icon: {
    marginRight: 8,
    fontSize: 16
  },
  input: {
    flex: 1,
    color: '#000',
    height: 50,
    fontSize: 16,
    fontWeight: '500'
  },
  resetButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20
  },
  disabledButton: {
    backgroundColor: '#95a5a6'
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  backLink: {
    marginTop: 10
  },
  backText: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3
  }
}); 