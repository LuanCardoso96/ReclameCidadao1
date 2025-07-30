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
import BannerAdComponent from './BannerAd';
import FirebaseAuthService from './FirebaseAuthService';
import { LoginScreenNavigationProp } from './types/navigation';
import { simpleFirebaseTest } from './SimpleFirebaseTest';

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu email');
      return;
    }

    if (!senha.trim()) {
      Alert.alert('Erro', 'Por favor, digite sua senha');
      return;
    }

    setLoading(true);
    try {
      const userData = await FirebaseAuthService.signInWithEmail(email, senha);
      Alert.alert(
        'Sucesso!',
        `Bem-vindo, ${userData.nomeCompleto}!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert('Em desenvolvimento', 'Login com Google será implementado em breve');
  };

  const handleTestFirebase = async () => {
    console.log('🧪 Iniciando teste do Firebase...');
    const result = await simpleFirebaseTest();
    if (result) {
      Alert.alert('Sucesso', 'Firebase está funcionando corretamente!');
    } else {
      Alert.alert('Erro', 'Firebase não está funcionando. Verifique os logs.');
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <ImageBackground
      // Corrigido: caminho correto para imagem local
      source={require('./assets/images/japao.jpg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Ícone do usuário */}
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
          }}
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
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Botão de login */}
        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.disabledButton]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>LOGIN</Text>
          )}
        </TouchableOpacity>

        {/* Botão de login com Google */}
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleButtonText}>Login with Google</Text>
        </TouchableOpacity>

        {/* Botão de teste do Firebase */}
        <TouchableOpacity style={styles.testButton} onPress={handleTestFirebase}>
          <Text style={styles.testButtonText}>🧪 Testar Firebase</Text>
        </TouchableOpacity>

        {/* Link para criar conta */}
        <TouchableOpacity onPress={handleSignUp} style={styles.signUpLink}>
          <Text style={styles.signUpText}>Não tem uma conta? Criar conta</Text>
        </TouchableOpacity>
      </View>

      {/* Banner fixo no rodapé */}
      <View style={styles.bannerContainer}>
        <BannerAdComponent />
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
    paddingHorizontal: 20,
    paddingBottom: 80 // espaço extra para o banner
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
    textShadowRadius: 4
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
    borderColor: 'rgba(255,255,255,0.3)'
  },

  icon: { marginRight: 8, fontSize: 16 },

  input: {
    flex: 1,
    color: '#000',
    height: 50,
    fontSize: 16,
    fontWeight: '500'
  },

  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20
  },

  rememberLeft: { flexDirection: 'row', alignItems: 'center' },

  checkbox: { marginRight: 5 },

  checkboxText: { fontSize: 16 },

  rememberText: {
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3
  },

  forgotText: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3
  },

  loginButton: {
    backgroundColor: '#1c3d91',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15
  },

  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledButton: { backgroundColor: '#95a5a6' },

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

  googleButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  testButton: {
    backgroundColor: '#9b59b6',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15
  },

  testButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  signUpLink: { marginTop: 10 },

  signUpText: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3
  },

  bannerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%'
  }
});
