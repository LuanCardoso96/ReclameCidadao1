import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Switch,
  Alert,
  Image,
} from 'react-native';

import { DenunciarScreenNavigationProp } from './types/navigation';
import FirebaseAuthService from './FirebaseAuthService';
import LocationService from './LocationService';
import ImageUploadService from './ImageUploadService';
import { testStorageConnection, testImageUpload } from './StorageTest';

import firestore from '@react-native-firebase/firestore';

// --- Ícones (Simulados) ---
const ArrowLeftIcon = () => <Text style={denunciarStyles.iconText}>←</Text>;
const CameraIcon = () => <Text style={denunciarStyles.cameraIconText}>📸</Text>;
const LocationIcon = () => <Text style={denunciarStyles.locationIconText}>📍</Text>;

// --- Categorias de Problemas ---
const PROBLEM_CATEGORIES = [
  { id: 'buraco', label: 'Buraco na via' },
  { id: 'poste_sem_luz', label: 'Poste sem luz' },
  { id: 'lixo_acumulado', label: 'Lixo acumulado' },
  { id: 'esgoto_entupido', label: 'Esgoto entupido' },
  { id: 'sinalizacao_danificada', label: 'Sinalização danificada' },
  { id: 'calçada_danificada', label: 'Calçada danificada' },
  { id: 'arvore_caida', label: 'Árvore caída' },
  { id: 'iluminacao_publica', label: 'Iluminação pública' },
  { id: 'transito', label: 'Problema de trânsito' },
  { id: 'outro', label: 'Outro' },
];

// --- Propriedades do Componente ---
type Props = {
  navigation: DenunciarScreenNavigationProp;
};

// --- Componente DenunciarScreen ---
export default function DenunciarScreen({ navigation }: Props) {
  // --- Estados do Formulário ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [rua, setRua] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // --- Estados de Carregamento e Mensagens ---
  const [loading, setLoading] = useState(false); // Para o envio da denúncia
  const [locationLoading, setLocationLoading] = useState(false); // Para a geolocalização
  const [imageUploading, setImageUploading] = useState(false); // Para o upload da imagem
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // --- Estados do Utilizador ---
  const [userId, setUserId] = useState<string | null>(null);
  const [reporterName, setReporterName] = useState('Usuário Anônimo');

  // --- Efeitos Colaterais ---

  // Efeito para obter informações do utilizador logado
  useEffect(() => {
    const currentUser = FirebaseAuthService.getCurrentUser();
    console.log('useEffect: currentUser obtido:', currentUser);
    if (currentUser) {
      setUserId(currentUser.uid);
      const name = currentUser.nomeCompleto || 'Usuário Anônimo';
      setReporterName(name);
      console.log('useEffect: Reporter Name definido como:', name);
    } else {
      setUserId(null);
      setReporterName('Usuário Anônimo');
      console.log('useEffect: Usuário não autenticado, Reporter Name definido como "Usuário Anônimo".');
    }
  }, []);

  // --- Funções de Geolocalização ---

  // Função para obter localização atual usando LocationService
  const getCurrentLocation = async () => {
    console.log('=== INICIANDO getCurrentLocation ===');
    setLocationLoading(true);
    
    try {
      console.log('1. Iniciando obtenção de localização...');
      console.log('2. Chamando LocationService.getCurrentLocation()...');
      
      const locationData = await LocationService.getCurrentLocation();
      
      console.log('3. Dados de localização recebidos:', locationData);
      console.log('4. Tipo de locationData:', typeof locationData);
      console.log('5. locationData é null?', locationData === null);
      console.log('6. locationData é undefined?', locationData === undefined);
      
      if (locationData && locationData !== undefined) {
        console.log('7. locationData existe, verificando propriedades...');
        
        // Salvar coordenadas GPS
        if (locationData.latitude && locationData.longitude) {
          console.log('8. Coordenadas encontradas:', locationData.latitude, locationData.longitude);
          setLatitude(locationData.latitude);
          setLongitude(locationData.longitude);
          console.log('9. Coordenadas GPS salvas no estado');
        } else {
          console.log('8. Coordenadas NÃO encontradas');
        }
        
        // Preencher endereço se disponível
        if (locationData.address) {
          console.log('10. Endereço encontrado:', locationData.address);
          setRua(locationData.address.street);
          setBairro(locationData.address.neighborhood);
          setCidade(locationData.address.city);
          setEstado(locationData.address.state);
          console.log('11. Endereço preenchido nos campos');
          Alert.alert('Sucesso', 'Localização GPS obtida e endereço preenchido automaticamente!');
        } else {
          console.log('10. Endereço NÃO encontrado');
          // Se não tiver endereço, mostrar apenas as coordenadas
          if (locationData.latitude && locationData.longitude) {
            Alert.alert('Localização GPS', `Coordenadas obtidas: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`);
          } else {
            Alert.alert('Localização GPS', 'Coordenadas obtidas, mas endereço não disponível');
          }
        }
      } else {
        console.log('7. locationData é falsy');
        console.log('Localização não retornou dados válidos');
        Alert.alert('Erro', 'Não foi possível obter sua localização. Tente novamente.');
      }
    } catch (error: any) {
      console.error('ERRO na função getCurrentLocation:', error);
      console.error('Stack trace:', error.stack);
      Alert.alert('Erro', `Não foi possível obter sua localização: ${error.message || 'Erro desconhecido'}`);
    } finally {
      console.log('12. Finalizando getCurrentLocation');
      setLocationLoading(false);
    }
  };

  // --- Funções de Manipulação de Imagem ---

  // Função para selecionar imagem da galeria/câmera
  const handleImagePicker = async () => {
    setMessage('');
    setMessageType('');
    try {
      console.log('Iniciando seleção de imagem...');
      // ImageUploadService.pickImage() deve usar launchImageLibrary ou launchCamera
      // e retornar um objeto com 'uri' ou 'assets'
      const result = await ImageUploadService.pickImage(); 
      
      if (result.didCancel) {
        console.log('Usuário cancelou a seleção');
        return;
      }
      
      if (result.errorCode) {
        console.error('Erro na seleção:', result.errorMessage);
        Alert.alert('Erro', `Erro ao selecionar imagem: ${result.errorMessage}`);
        return;
      }
      
      if (result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('URI da imagem selecionada:', imageUri);
        if (imageUri) {
          setSelectedImage(imageUri);
          console.log('Imagem selecionada e definida no estado');
        }
      } else {
        console.log('Nenhuma imagem selecionada');
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem. Tente novamente.');
    }
  };

  // Função para remover imagem selecionada
  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  // --- Funções de Teste de Storage (para depuração) ---
  const handleTestStorage = async () => {
    try {
      console.log('Iniciando teste do Storage...');
      const result = await testStorageConnection();
      console.log('Resultado do teste:', result);
      
      if (result.success) {
        Alert.alert('Sucesso', 'Conexão com Firebase Storage funcionando!');
      } else {
        Alert.alert('Erro', `Erro no teste: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro no teste:', error);
      Alert.alert('Erro', 'Erro ao testar Storage');
    }
  };

  const handleTestImageUpload = async () => {
    if (!selectedImage) {
      Alert.alert('Erro', 'Selecione uma imagem primeiro');
      return;
    }

    try {
      console.log('Iniciando teste de upload de imagem...');
      setImageUploading(true); // Ativa o loading para o teste de upload

      const uploadResult = await testImageUpload(selectedImage);
      console.log('Resultado do teste de upload:', uploadResult);
      
      if (uploadResult.success) {
        Alert.alert('Sucesso', 'Upload de imagem funcionando!');
      } else {
        Alert.alert('Erro', `Erro no upload: ${uploadResult.error}`);
      }
    } catch (error) {
      console.error('Erro no teste de upload:', error);
      Alert.alert('Erro', 'Erro ao testar upload de imagem');
    } finally {
      setImageUploading(false); // Desativa o loading após o teste
    }
  };

  // --- Funções de Validação ---
  const getCategoryTitle = () => {
    if (selectedCategory === 'outro') {
      return customCategory || 'Outro problema';
    }
    const category = PROBLEM_CATEGORIES.find(cat => cat.id === selectedCategory);
    return category ? category.label : '';
  };

  const validateForm = () => {
    setMessage('');
    setMessageType('');
    let isValid = true;

    if (!selectedCategory) {
      setMessage('Por favor, selecione um tipo de problema.');
      setMessageType('error');
      isValid = false;
    } else if (selectedCategory === 'outro' && !customCategory.trim()) {
      setMessage('Por favor, descreva o tipo de problema personalizado.');
      setMessageType('error');
      isValid = false;
    }
    
    if (!description.trim()) {
      setMessage(prev => (prev ? prev + '\n' : '') + 'Por favor, preencha a descrição detalhada.');
      setMessageType('error');
      isValid = false;
    }
    if (!rua.trim() || !bairro.trim() || !cidade.trim() || !estado.trim()) {
      setMessage(prev => (prev ? prev + '\n' : '') + 'Por favor, preencha o endereço completo.');
      setMessageType('error');
      isValid = false;
    }

    return isValid;
  };

  // --- Função de Submissão do Formulário ---
  const handleSubmit = async () => {
    if (!validateForm()) {
      return; // Sai se a validação falhar
    }

    setLoading(true);
    setMessage('');
    setMessageType('');

    // Monta o endereço completo
    const fullAddress = `${rua}, ${bairro}, ${cidade} - ${estado}`;

    try {
      // 1. Criar a denúncia no Firestore (sem a URL da imagem por enquanto)
      const denunciationData = {
        title: getCategoryTitle(),
        category: selectedCategory,
        customCategory: selectedCategory === 'outro' ? customCategory : '',
        description,
        location: fullAddress,
        rua,
        bairro,
        cidade,
        estado,
        // Adicionar coordenadas GPS se disponíveis
        ...(latitude !== null && longitude !== null && {
          latitude: latitude,
          longitude: longitude,
          coordinates: {
            latitude: latitude,
            longitude: longitude
          }
        }),
        isAnonymous,
        reporterName: isAnonymous ? 'Anônimo' : reporterName,
        userId: userId || 'anonymous',
        timestamp: firestore.FieldValue.serverTimestamp(),
        status: 'Não Resolvido', // Status inicial
        likes: [],
        dislikes: [],
        imageUrl: '', // Inicializa com string vazia
      };
      
      const docRef = await firestore().collection('denunciations').add(denunciationData);
      const denunciationId = docRef.id;
      console.log('Denúncia criada no Firestore com ID:', denunciationId);

      // 2. Se há uma imagem selecionada, fazer upload e atualizar a denúncia
      let uploadedImageUrl = '';
      if (selectedImage) {
        console.log('Iniciando upload da imagem para denúncia ID:', denunciationId);
        setImageUploading(true); // Ativa o loading de upload de imagem
        try {
          const uploadResult = await ImageUploadService.uploadImage(selectedImage, denunciationId);
          
          if (uploadResult.success && uploadResult.imageUrl) {
            uploadedImageUrl = uploadResult.imageUrl;
            console.log('URL da imagem obtida após upload:', uploadedImageUrl);
            
            // Atualizar a denúncia com a URL da imagem
            await firestore().collection('denunciations').doc(denunciationId).update({
              imageUrl: uploadedImageUrl,
            });
            console.log('Denúncia atualizada com URL da imagem.');
          } else {
            console.error('Erro no upload da imagem:', uploadResult.error);
            Alert.alert('Aviso', 'Denúncia enviada, mas houve um problema com o upload da imagem.');
          }
        } catch (uploadError) {
          console.error('Erro no upload da imagem (catch externo):', uploadError);
          Alert.alert('Aviso', 'Denúncia enviada, mas houve um problema com o upload da imagem.');
        } finally {
          setImageUploading(false); // Desativa o loading de upload de imagem
        }
      } else {
        console.log('Nenhuma imagem selecionada para upload.');
      }

      setMessage('Denúncia enviada com sucesso!');
      setMessageType('success');
      
      // Limpa os campos do formulário
      setTitle('');
      setDescription('');
      setSelectedCategory('');
      setCustomCategory('');
      setRua('');
      setBairro('');
      setCidade('');
      setEstado('');
      setIsAnonymous(false);
      setSelectedImage(null);
      setLatitude(null);
      setLongitude(null);

      // Navega de volta para a tela Home após um pequeno atraso
      setTimeout(() => navigation.navigate('Home' as never), 1500);
    } catch (error: any) {
      console.error("Erro ao enviar denúncia para o Firestore:", error);
      setMessage(`Erro ao enviar denúncia: ${error?.message || 'Erro desconhecido'}`);
      setMessageType('error');
    } finally {
      setLoading(false); // Desativa o loading principal
    }
  };

  // --- Renderização do Componente ---
  return (
    <SafeAreaView style={denunciarStyles.container}>
      {/* Cabeçalho */}
      <View style={denunciarStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={denunciarStyles.backButton}>
          <ArrowLeftIcon />
        </TouchableOpacity>
        <Text style={denunciarStyles.title}>Fazer Denúncia</Text>
        <View style={{ width: 30 }} /> {/* Espaçador para centralizar o título */}
      </View>

      <ScrollView 
        contentContainerStyle={denunciarStyles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={denunciarStyles.formContainer}>
          {/* Caixa de Mensagem de Sucesso/Erro */}
          {message ? (
            <View style={[denunciarStyles.messageBox, messageType === 'success' ? denunciarStyles.successBox : denunciarStyles.errorBox]}>
              <Text style={denunciarStyles.messageText}>{message}</Text>
            </View>
          ) : null}

          {/* Seleção de Categoria */}
          <View style={denunciarStyles.inputGroup}>
            <Text style={denunciarStyles.label}>Tipo de Problema *</Text>
            <View style={denunciarStyles.categoryContainer}>
              {PROBLEM_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    denunciarStyles.categoryButton,
                    selectedCategory === category.id && denunciarStyles.categoryButtonSelected
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={[
                    denunciarStyles.categoryButtonText,
                    selectedCategory === category.id && denunciarStyles.categoryButtonTextSelected
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {selectedCategory === 'outro' && (
              <TextInput
                style={[denunciarStyles.input, { marginTop: 10 }]}
                placeholder="Descreva o tipo de problema..."
                placeholderTextColor="#666"
                value={customCategory}
                onChangeText={setCustomCategory}
              />
            )}
          </View>

          {/* Descrição */}
          <View style={denunciarStyles.inputGroup}>
            <Text style={denunciarStyles.label}>Descrição Detalhada *</Text>
            <TextInput
              style={[denunciarStyles.input, denunciarStyles.textArea]}
              placeholder="Descreva o problema com detalhes..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={5}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Endereço */}
          <View style={denunciarStyles.inputGroup}>
            <Text style={denunciarStyles.label}>Endereço *</Text>
            
            {/* Botão para usar localização atual */}
            <TouchableOpacity
              style={denunciarStyles.locationButton}
              onPress={getCurrentLocation}
              disabled={locationLoading}
            >
              <LocationIcon />
              <Text style={denunciarStyles.locationButtonText}>
                {locationLoading ? 'Obtendo localização...' : 'Usar localização atual'}
              </Text>
              {locationLoading && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 10 }} />}
            </TouchableOpacity>

            {/* Exibir coordenadas GPS se disponíveis */}
            {(latitude !== null && longitude !== null) && (
              <View style={denunciarStyles.coordinatesContainer}>
                <Text style={denunciarStyles.coordinatesLabel}>Coordenadas GPS:</Text>
                <Text style={denunciarStyles.coordinatesText}>
                  Lat: {latitude.toFixed(6)}, Long: {longitude.toFixed(6)}
                </Text>
              </View>
            )}

            <TextInput
              style={[denunciarStyles.input, { marginTop: 10 }]}
              placeholder="Rua/Avenida"
              placeholderTextColor="#666"
              value={rua}
              onChangeText={setRua}
            />
            
            <TextInput
              style={[denunciarStyles.input, { marginTop: 10 }]}
              placeholder="Bairro"
              placeholderTextColor="#666"
              value={bairro}
              onChangeText={setBairro}
            />
            
            <View style={denunciarStyles.row}>
              <TextInput
                style={[denunciarStyles.input, denunciarStyles.halfInput]}
                placeholder="Cidade"
                placeholderTextColor="#666"
                value={cidade}
                onChangeText={setCidade}
              />
              
              <TextInput
                style={[denunciarStyles.input, denunciarStyles.halfInput, { marginLeft: 10 }]}
                placeholder="Estado (UF)"
                placeholderTextColor="#666"
                value={estado}
                onChangeText={setEstado}
                maxLength={2}
              />
            </View>
          </View>

          {/* Upload de Imagem */}
          <View style={denunciarStyles.inputGroup}>
            <Text style={denunciarStyles.label}>Foto do Problema (Opcional)</Text>
            
            {selectedImage ? (
              <View style={denunciarStyles.imageContainer}>
                <Image source={{ uri: selectedImage }} style={denunciarStyles.selectedImage} resizeMode="cover" />
                <TouchableOpacity 
                  style={denunciarStyles.removeImageButton}
                  onPress={handleRemoveImage}
                >
                  <Text style={denunciarStyles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={denunciarStyles.imageUploadPlaceholder}
                onPress={handleImagePicker}
                disabled={imageUploading}
              >
                {imageUploading ? (
                  <ActivityIndicator size="large" color="#1c3d91" />
                ) : (
                  <>
                    <CameraIcon />
                    <Text style={denunciarStyles.imageUploadText}>Toque para adicionar uma imagem</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            
            <Text style={denunciarStyles.hintText}>
              Adicione uma foto do problema para melhor visualização
            </Text>
            
            {/* Botões de teste (para depuração) */}
            <View style={denunciarStyles.testButtonsContainer}>
              <TouchableOpacity 
                style={denunciarStyles.testButton}
                onPress={handleTestStorage}
              >
                <Text style={denunciarStyles.testButtonText}>Testar Storage</Text>
              </TouchableOpacity>
              
              {selectedImage && (
                <TouchableOpacity 
                  style={denunciarStyles.testButton}
                  onPress={handleTestImageUpload}
                >
                  <Text style={denunciarStyles.testButtonText}>Testar Upload</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Opção de Denúncia Anônima */}
          <View style={denunciarStyles.switchContainer}>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isAnonymous ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setIsAnonymous}
              value={isAnonymous}
            />
            <Text style={denunciarStyles.switchLabel}>Denunciar como anônimo</Text>
          </View>

          {/* Botão de Enviar Denúncia */}
          <TouchableOpacity
            style={denunciarStyles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={denunciarStyles.submitButtonText}>Enviar Denúncia</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Estilos do Componente ---
const denunciarStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#1c3d91',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    padding: 5,
  },
  iconText: {
    fontSize: 24,
    color: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 100,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  messageBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  successBox: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
    borderWidth: 1,
  },
  messageText: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hintText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  imageUploadPlaceholder: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraIconText: {
    fontSize: 30,
    color: '#888',
    marginRight: 10,
  },
  imageUploadText: {
    fontSize: 14,
    color: '#666',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    minWidth: '48%',
    alignItems: 'center',
  },
  categoryButtonSelected: {
    backgroundColor: '#1c3d91',
    borderColor: '#1c3d91',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  categoryButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  locationButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  locationIconText: {
    fontSize: 20,
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
  },
  testButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  testButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  locationTrackingContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  trackingButton: {
    backgroundColor: '#9b59b6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackingButtonActive: {
    backgroundColor: '#e74c3c',
  },
  trackingButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  coordinatesContainer: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    marginBottom: 15,
  },
  coordinatesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 5,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
});
