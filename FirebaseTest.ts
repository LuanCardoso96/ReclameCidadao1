import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const testFirebase = async () => {
  try {
    console.log('=== TESTE DO FIREBASE ===');
    
    // Teste 1: Verificar se o auth está funcionando
    console.log('1. Testando Firebase Auth...');
    const currentUser = auth().currentUser;
    console.log('Usuário atual:', currentUser ? currentUser.uid : 'Nenhum usuário logado');
    
    // Teste 2: Verificar se o firestore está funcionando
    console.log('2. Testando Firestore...');
    const testDoc = await firestore().collection('test').doc('test').get();
    console.log('Teste de conexão com Firestore:', testDoc.exists ? 'Sucesso' : 'Documento não existe (normal)');
    
    // Teste 3: Tentar escrever um documento de teste
    console.log('3. Testando escrita no Firestore...');
    await firestore().collection('test').doc('test').set({
      timestamp: new Date(),
      message: 'Teste de conexão'
    });
    console.log('Escrita no Firestore: Sucesso');
    
    // Limpar documento de teste
    await firestore().collection('test').doc('test').delete();
    console.log('Documento de teste removido');
    
    console.log('=== TODOS OS TESTES PASSARAM ===');
    return true;
  } catch (error: any) {
    console.error('=== ERRO NO TESTE DO FIREBASE ===');
    console.error('Erro:', error);
    console.error('Código:', error.code);
    console.error('Mensagem:', error.message);
    return false;
  }
}; 