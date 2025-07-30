import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  SignUp: undefined;
};

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

type Props = {
  navigation: SignUpScreenNavigationProp;
};

export default function SignUpScreen({ navigation }: Props) {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [telefone, setTelefone] = useState('');

  const handleSignUp = () => {
    // Validações
    if (!nomeCompleto.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu nome completo');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu email');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Erro', 'Por favor, digite um email válido');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (!telefone.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu telefone');
      return;
    }

    // Se tudo estiver correto, navega para Home
    Alert.alert(
      'Sucesso!', 
      'Conta criada com sucesso!',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home')
        }
      ]
    );
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' }}
      style={styles.background}
    >
      {/* Ícone do usuário */}
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/847/847969.png' }}
        style={styles.userIcon}
      />

      <Text style={styles.title}>CRIAR CONTA</Text>

      {/* Campo de nome completo */}
      <View style={styles.inputContainer}>
        <Text style={styles.icon}>👤</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome Completo"
          placeholderTextColor="#666"
          value={nomeCompleto}
          onChangeText={setNomeCompleto}
        />
      </View>

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
        />
      </View>

      {/* Campo de senha */}
      <View style={styles.inputContainer}>
        <Text style={styles.icon}>🔒</Text>
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#666"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
      </View>

      {/* Campo de confirmar senha */}
      <View style={styles.inputContainer}>
        <Text style={styles.icon}>🔐</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirmar Senha"
          placeholderTextColor="#666"
          secureTextEntry
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />
      </View>

      {/* Campo de telefone */}
      <View style={styles.inputContainer}>
        <Text style={styles.icon}>📱</Text>
        <TextInput
          style={styles.input}
          placeholder="Telefone"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          value={telefone}
          onChangeText={setTelefone}
        />
      </View>

      {/* Botão de criar conta */}
      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.signUpButtonText}>CRIAR CONTA</Text>
      </TouchableOpacity>

      {/* Link para voltar ao login */}
      <TouchableOpacity onPress={handleBackToLogin}>
        <Text style={styles.backToLoginText}>Já tem uma conta? Faça login</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 20 
  },
  userIcon: { 
    width: 80, 
    height: 80, 
    marginBottom: 20, 
    tintColor: '#fff' 
  },
  title: { 
    fontSize: 22, 
    color: '#fff', 
    marginBottom: 20, 
    letterSpacing: 2,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8, 
    paddingHorizontal: 10, 
    marginBottom: 15, 
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
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
    fontWeight: '500',
  },
  signUpButton: { 
    backgroundColor: '#27ae60', 
    paddingVertical: 12, 
    borderRadius: 8, 
    width: '100%', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  signUpButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  backToLoginText: { 
    color: '#fff', 
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
}); 