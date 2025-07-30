import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const testFirestoreRules = async () => {
  try {
    console.log('🔍 TESTANDO REGRAS DO FIRESTORE');
    
    // Teste 1: Verificar se conseguimos ler uma coleção
    console.log('1️⃣ Testando leitura de coleção...');
    try {
      const testCollection = await firestore().collection('test').get();
      console.log('✅ Leitura de coleção funcionando');
    } catch (error: any) {
      console.error('❌ Erro na leitura de coleção:', error.code, error.message);
      if (error.code === 'permission-denied') {
        console.error('🚨 PROBLEMA: Regras do Firestore bloqueando leitura');
        return false;
      }
    }
    
    // Teste 2: Verificar se conseguimos escrever um documento
    console.log('2️⃣ Testando escrita de documento...');
    try {
      const testDoc = firestore().collection('test').doc('rules-test');
      await testDoc.set({
        timestamp: new Date(),
        message: 'Teste de regras'
      });
      console.log('✅ Escrita de documento funcionando');
      
      // Limpar documento de teste
      await testDoc.delete();
      console.log('✅ Documento de teste removido');
    } catch (error: any) {
      console.error('❌ Erro na escrita de documento:', error.code, error.message);
      if (error.code === 'permission-denied') {
        console.error('🚨 PROBLEMA: Regras do Firestore bloqueando escrita');
        return false;
      }
    }
    
    // Teste 3: Verificar se conseguimos acessar a coleção 'usuarios'
    console.log('3️⃣ Testando acesso à coleção usuarios...');
    try {
      const usuariosCollection = await firestore().collection('usuarios').get();
      console.log('✅ Acesso à coleção usuarios funcionando');
    } catch (error: any) {
      console.error('❌ Erro no acesso à coleção usuarios:', error.code, error.message);
      if (error.code === 'permission-denied') {
        console.error('🚨 PROBLEMA: Regras do Firestore bloqueando acesso à coleção usuarios');
        return false;
      }
    }
    
    console.log('🎉 TODOS OS TESTES DE REGRAS PASSARAM!');
    return true;
    
  } catch (error: any) {
    console.error('💥 ERRO GERAL NO TESTE DE REGRAS:', error);
    return false;
  }
}; 