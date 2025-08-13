import storage from '@react-native-firebase/storage';

export const testStorageConnection = async () => {
  try {
    console.log('Testando conexão com Firebase Storage...');
    
    // Testar se conseguimos criar uma referência
    const testRef = storage().ref('test/connection.txt');
    console.log('Referência criada:', testRef);
    
    // Testar se conseguimos fazer upload de um arquivo simples
    const testData = 'Teste de conexão com Firebase Storage';
    const testBlob = new Blob([testData], { type: 'text/plain' });
    
    console.log('Tentando upload de teste...');
    await testRef.putString(testData);
    console.log('Upload de teste realizado com sucesso!');
    
    // Testar se conseguimos obter a URL
    const downloadUrl = await testRef.getDownloadURL();
    console.log('URL de download obtida:', downloadUrl);
    
    // Limpar o arquivo de teste
    await testRef.delete();
    console.log('Arquivo de teste removido');
    
    return { success: true, message: 'Conexão com Firebase Storage funcionando' };
  } catch (error: any) {
    console.error('Erro no teste de Storage:', error);
    return { 
      success: false, 
      error: error.message || 'Erro desconhecido',
      code: error.code 
    };
  }
};

export const testImageUpload = async (imageUri: string) => {
  try {
    console.log('Testando upload de imagem...');
    console.log('URI da imagem:', imageUri);
    
    const testFileName = `test/test_image_${Date.now()}.jpg`;
    const imageRef = storage().ref(testFileName);
    
    console.log('Iniciando upload...');
    const uploadTask = imageRef.putFile(imageUri);
    await uploadTask;
    
    console.log('Upload concluído, obtendo URL...');
    const downloadUrl = await imageRef.getDownloadURL();
    console.log('URL obtida:', downloadUrl);
    
    // Limpar arquivo de teste
    await imageRef.delete();
    console.log('Arquivo de teste removido');
    
    return { success: true, url: downloadUrl };
  } catch (error: any) {
    console.error('Erro no teste de upload:', error);
    return { 
      success: false, 
      error: error.message || 'Erro desconhecido',
      code: error.code 
    };
  }
}; 