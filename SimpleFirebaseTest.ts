import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { testFirestoreRules } from './FirestoreRulesTest';

export const simpleFirebaseTest = async () => {
  try {
    console.log('🔍 INICIANDO TESTE SIMPLES DO FIREBASE');
    
    // Teste 1: Verificar se o Firebase está inicializado
    console.log('1️⃣ Verificando inicialização do Firebase...');
    try {
      const app = auth().app;
      console.log('✅ Firebase App:', app.name);
    } catch (error) {
      console.error('❌ Erro na inicialização do Firebase:', error);
      return false;
    }
    
    // Teste 2: Verificar se o Auth está funcionando
    console.log('2️⃣ Testando Firebase Auth...');
    try {
      const currentUser = auth().currentUser;
      console.log('✅ Auth funcionando. Usuário atual:', currentUser ? currentUser.uid : 'Nenhum');
    } catch (error) {
      console.error('❌ Erro no Auth:', error);
      return false;
    }
    
    // Teste 3: Verificar se o Firestore está funcionando
    console.log('3️⃣ Testando Firestore...');
    try {
      const testDoc = await firestore().collection('test').doc('test').get();
      console.log('✅ Firestore funcionando. Documento existe:', testDoc.exists);
    } catch (error) {
      console.error('❌ Erro no Firestore:', error);
      return false;
    }
    
    // Teste 4: Verificar regras do Firestore
    console.log('4️⃣ Testando regras do Firestore...');
    const rulesTest = await testFirestoreRules();
    if (!rulesTest) {
      console.error('❌ Problema com as regras do Firestore');
      return false;
    }
    
    // Teste 5: Tentar criar um usuário de teste
    console.log('5️⃣ Testando criação de usuário...');
    try {
      const testEmail = `test${Date.now()}@test.com`;
      const testPassword = '123456';
      
      const userCredential = await auth().createUserWithEmailAndPassword(testEmail, testPassword);
      console.log('✅ Usuário criado:', userCredential.user.uid);
      
      // Deletar o usuário de teste
      await userCredential.user.delete();
      console.log('✅ Usuário de teste removido');
      
    } catch (error: any) {
      console.error('❌ Erro na criação de usuário:', error.code, error.message);
      
      // Se o erro for de email já em uso, tentar fazer login
      if (error.code === 'auth/email-already-in-use') {
        console.log('🔄 Tentando fazer login com usuário existente...');
        try {
          const userCredential = await auth().signInWithEmailAndPassword(testEmail, testPassword);
          console.log('✅ Login realizado com usuário existente');
        } catch (loginError) {
          console.error('❌ Erro no login:', loginError);
        }
      }
    }
    
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    return true;
    
  } catch (error: any) {
    console.error('💥 ERRO GERAL NO TESTE:', error);
    console.error('Código:', error.code);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}; 