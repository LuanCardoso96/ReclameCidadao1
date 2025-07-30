import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  SignUp: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    navigation.navigate('Home');
  };

  const handleGoogleLogin = () => {
    console.log('Login com Google');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
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

      <Text style={styles.title}>LOGIN</Text>

      {/* Campo de e-mail */}
      <View style={styles.inputContainer}>
        <Text style={styles.icon}>📧</Text>
        <TextInput
          style={styles.input}
          placeholder="Email ID"
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
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
      </View>

      {/* Remember me + Forgot Password */}
      <View style={styles.rememberContainer}>
        <View style={styles.rememberLeft}>
          <TouchableOpacity 
            style={styles.checkbox}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <Text style={styles.checkboxText}>
              {rememberMe ? '☑️' : '☐'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.rememberText}>Remember me</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Botão de login */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>LOGIN</Text>
      </TouchableOpacity>

      {/* Botão de login com Google */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Text style={styles.googleIcon}>G</Text>
        <Text style={styles.googleButtonText}>Login with Google</Text>
      </TouchableOpacity>

      {/* Link para criar conta */}
      <TouchableOpacity onPress={handleSignUp} style={styles.signUpLink}>
        <Text style={styles.signUpText}>Não tem uma conta? Criar conta</Text>
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
  rememberContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    width: '100%', 
    marginBottom: 20 
  },
  rememberLeft: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  checkbox: {
    marginRight: 5
  },
  checkboxText: {
    fontSize: 16
  },
  rememberText: { 
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  forgotText: { 
    color: '#fff', 
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  loginButton: { 
    backgroundColor: '#1c3d91', 
    paddingVertical: 12, 
    borderRadius: 8, 
    width: '100%', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  loginButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  googleButton: { 
    flexDirection: 'row', 
    backgroundColor: '#db4437', 
    paddingVertical: 12, 
    borderRadius: 8, 
    width: '100%', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 15
  },
  googleIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8
  },
  googleButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  signUpLink: {
    marginTop: 10
  },
  signUpText: { 
    color: '#fff', 
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
});
