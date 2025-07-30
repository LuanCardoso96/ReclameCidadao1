import { StackNavigationProp } from '@react-navigation/stack';

// Definir os tipos para as rotas de forma centralizada
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

// Tipos de navegação para cada tela
export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;
export type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>; 