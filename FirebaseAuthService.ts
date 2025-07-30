import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export interface UserData {
  uid: string;
  email: string;
  nomeCompleto: string;
  telefone: string;
  dataCriacao: Date;
  ultimoLogin: Date;
}

class FirebaseAuthService {
  // Login com email e senha
  async signInWithEmail(email: string, password: string): Promise<UserData> {
    try {
      console.log('Iniciando login:', email);
      
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      console.log('Usuário autenticado:', user.uid);
      
      // Buscar dados do usuário no Firestore
      const userDoc = await firestore().collection('usuarios').doc(user.uid).get();
      
      if (userDoc) {
        const userData = userDoc.data() as UserData;
        
        // Atualizar último login
        await firestore().collection('usuarios').doc(user.uid).update({
          ultimoLogin: new Date()
        });
        
        console.log('Login realizado com sucesso');
        
        return {
          ...userData,
          ultimoLogin: new Date()
        };
      } else {
        throw new Error('Dados do usuário não encontrados');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Cadastro com email e senha
  async signUpWithEmail(
    email: string, 
    password: string, 
    nomeCompleto: string, 
    telefone: string
  ): Promise<UserData> {
    try {
      console.log('Iniciando cadastro de usuário:', { email, nomeCompleto, telefone });
      
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      console.log('Usuário criado no Auth:', user.uid);
      
      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        nomeCompleto,
        telefone,
        dataCriacao: new Date(),
        ultimoLogin: new Date()
      };
      
      console.log('Salvando dados no Firestore:', userData);
      
      // Salvar dados do usuário no Firestore
      await firestore().collection('usuarios').doc(user.uid).set(userData);
      
      console.log('Dados salvos com sucesso no Firestore');
      
      return userData;
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Recuperação de senha
  async resetPassword(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Logout
  async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error: any) {
      throw new Error('Erro ao fazer logout');
    }
  }

  // Verificar se usuário está logado
  getCurrentUser(): UserData | null {
    const user = auth().currentUser;
    if (user) {
      // Retornar dados básicos do usuário logado
      return {
        uid: user.uid,
        email: user.email!,
        nomeCompleto: user.displayName || '',
        telefone: user.phoneNumber || '',
        dataCriacao: new Date(),
        ultimoLogin: new Date()
      };
    }
    return null;
  }

  // Listener para mudanças de autenticação
  onAuthStateChanged(callback: (user: UserData | null) => void) {
    return auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await firestore().collection('usuarios').doc(user.uid).get();
          if (userDoc) {
            callback(userDoc.data() as UserData);
          } else {
            callback(null);
          }
        } catch (error) {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Atualizar dados do usuário
  async updateUserData(uid: string, data: Partial<UserData>): Promise<void> {
    try {
      await firestore().collection('usuarios').doc(uid).update({
        ...data,
        ultimaAtualizacao: new Date()
      });
    } catch (error: any) {
      throw new Error('Erro ao atualizar dados do usuário');
    }
  }

  // Buscar dados do usuário
  async getUserData(uid: string): Promise<UserData | null> {
    try {
      const userDoc = await firestore().collection('usuarios').doc(uid).get();
      if (userDoc) {
        return userDoc.data() as UserData;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Traduzir códigos de erro do Firebase
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Usuário não encontrado';
      case 'auth/wrong-password':
        return 'Senha incorreta';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/weak-password':
        return 'Senha muito fraca';
      case 'auth/email-already-in-use':
        return 'Email já está em uso';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet';
      default:
        return 'Erro desconhecido. Tente novamente';
    }
  }
}

export default new FirebaseAuthService(); 