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
  Modal,
} from 'react-native';
import { DenunciarScreenNavigationProp } from './types/navigation';
import FirebaseAuthService from './FirebaseAuthService';
import firestore from '@react-native-firebase/firestore';
import LocationService from './LocationService';

// Ícones (simulados)
const ArrowLeftIcon = () => <Text style={denunciarStyles.iconText}>←</Text>;
const CameraIcon = () => <Text style={denunciarStyles.cameraIconText}>📸</Text>;
const LocationIcon = () => <Text style={denunciarStyles.locationIconText}>📍</Text>;

// Categorias de problemas pré-definidas
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

type Props = {
  navigation: DenunciarScreenNavigationProp;
};

export default function DenunciarScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [rua, setRua] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [reporterName, setReporterName] = useState('Usuário Anônimo');

  useEffect(() => {
    const currentUser = FirebaseAuthService.getCurrentUser();
    if (currentUser) {
      setUserId(currentUser.uid);
      setReporterName(currentUser.nomeCompleto || 'Usuário Anônimo');
    } else {
      setUserId(null);
      setReporterName('Usuário Anônimo');
    }
  }, []);

  // Função para obter localização atual
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    
    try {
      console.log('Iniciando obtenção de localização...');
      const locationData = await LocationService.getCurrentLocation();
      
      console.log('Dados de localização recebidos:', locationData);
      
      if (locationData && locationData.address) {
        setRua(locationData.address.street);
        setBairro(locationData.address.neighborhood);
        setCidade(locationData.address.city);
        setEstado(locationData.address.state);
        Alert.alert('Sucesso', 'Localização obtida e endereço preenchido automaticamente!');
      } else {
        console.log('Localização não retornou dados válidos');
        Alert.alert('Erro', 'Não foi possível obter sua localização. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert('Erro', 'Não foi possível obter sua localização. Tente novamente.');
    } finally {
      setLocationLoading(false);
    }
  };

  // Função para obter o título da categoria selecionada
  const getCategoryTitle = () => {
    if (selectedCategory === 'outro') {
      return customCategory || 'Outro problema';
    }
    const category = PROBLEM_CATEGORIES.find(cat => cat.id === selectedCategory);
    return category ? category.label : '';
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    setMessageType('');

    // Validação dos campos obrigatórios
    if (!selectedCategory || !description || !rua || !bairro || !cidade || !estado) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    // Monta o endereço completo
    const fullAddress = `${rua}, ${bairro}, ${cidade} - ${estado}`;

    try {
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
        isAnonymous,
        reporterName: isAnonymous ? 'Anônimo' : reporterName,
        userId: userId || 'anonymous',
        timestamp: firestore.FieldValue.serverTimestamp(),
        status: 'Não Resolvido',
        likes: [],
        dislikes: [],
        imageUrl: '',
      };
      
      await firestore().collection('denunciations').add(denunciationData);

      setMessage('Denúncia enviada com sucesso!');
      setMessageType('success');
      
      // Limpa os campos
      setTitle('');
      setDescription('');
      setSelectedCategory('');
      setCustomCategory('');
      setRua('');
      setBairro('');
      setCidade('');
      setEstado('');
      setIsAnonymous(false);

      setTimeout(() => navigation.navigate('Home'), 1500);
    } catch (error: any) {
      console.log("Erro ao enviar denúncia");
      setMessage(`Erro ao enviar denúncia: ${error?.message || 'Erro desconhecido'}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={denunciarStyles.container}>
      {/* Cabeçalho */}
      <View style={denunciarStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={denunciarStyles.backButton}>
          <ArrowLeftIcon />
        </TouchableOpacity>
        <Text style={denunciarStyles.title}>Fazer Denúncia</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView 
        contentContainerStyle={denunciarStyles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={denunciarStyles.formContainer}>
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

            <TextInput
              style={[denunciarStyles.input, { marginTop: 10 }]}
              placeholder="Rua/Avenida"
              value={rua}
              onChangeText={setRua}
            />
            
            <TextInput
              style={[denunciarStyles.input, { marginTop: 10 }]}
              placeholder="Bairro"
              value={bairro}
              onChangeText={setBairro}
            />
            
            <View style={denunciarStyles.row}>
              <TextInput
                style={[denunciarStyles.input, denunciarStyles.halfInput]}
                placeholder="Cidade"
                value={cidade}
                onChangeText={setCidade}
              />
              
              <TextInput
                style={[denunciarStyles.input, denunciarStyles.halfInput, { marginLeft: 10 }]}
                placeholder="Estado (UF)"
                value={estado}
                onChangeText={setEstado}
                maxLength={2}
              />
            </View>
          </View>

          {/* Placeholder para Upload de Imagem */}
          <View style={denunciarStyles.inputGroup}>
            <Text style={denunciarStyles.label}>Foto do Problema (Opcional)</Text>
            <TouchableOpacity style={denunciarStyles.imageUploadPlaceholder}>
              <CameraIcon />
              <Text style={denunciarStyles.imageUploadText}>Toque para adicionar uma imagem</Text>
            </TouchableOpacity>
            <Text style={denunciarStyles.hintText}>
              *O upload de imagens requer armazenamento de arquivos e não está implementado neste exemplo.
            </Text>
          </View>

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
  // Novos estilos para categorias
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
  // Estilos para localização
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
  // Estilos para campos de endereço
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
  },
});