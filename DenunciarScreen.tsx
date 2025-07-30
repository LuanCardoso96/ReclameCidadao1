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
} from 'react-native';
import { DenunciarScreenNavigationProp } from './types/navigation';
import FirebaseAuthService from './FirebaseAuthService'; // Importa o serviço de autenticação
import firestore from '@react-native-firebase/firestore';

// Ícones (simulados)
const ArrowLeftIcon = () => <Text style={denunciarStyles.iconText}>←</Text>;
const CameraIcon = () => <Text style={denunciarStyles.cameraIconText}>📸</Text>;

type Props = {
  navigation: DenunciarScreenNavigationProp;
};

export default function DenunciarScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [reporterName, setReporterName] = useState('Usuário Anônimo');

  useEffect(() => {
    // Escuta mudanças no estado de autenticação para obter o userId e nome do usuário
    const currentUser = FirebaseAuthService.getCurrentUser();
    if (currentUser) {
      setUserId(currentUser.uid);
      setReporterName(currentUser.nomeCompleto || 'Usuário Anônimo');
    } else {
      setUserId(null);
      setReporterName('Usuário Anônimo');
    }
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    setMessageType('');

    if (!title || !description || !location) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      // Cria o objeto da denúncia para o Firestore
      const denunciationData = {
        title,
        description,
        location,
        isAnonymous,
        reporterName: isAnonymous ? 'Anônimo' : reporterName,
        userId: userId || 'anonymous',
        timestamp: firestore.FieldValue.serverTimestamp(),
        status: 'Não Resolvido',
        likes: [],
        dislikes: [],
        imageUrl: '',
      };
      
      // Salva a denúncia no Firestore
      await firestore().collection('denunciations').add(denunciationData);

      setMessage('Denúncia enviada com sucesso!');
      setMessageType('success');
      setTitle('');
      setDescription('');
      setLocation('');
      setIsAnonymous(false);

      // Opcionalmente, navega de volta para a home após um pequeno atraso
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
        <View style={{ width: 30 }} /> {/* Espaçador para alinhamento */}
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

          <View style={denunciarStyles.inputGroup}>
            <Text style={denunciarStyles.label}>Título da Denúncia</Text>
            <TextInput
              style={denunciarStyles.input}
              placeholder="Ex: Buraco na rua, Lixo acumulado..."
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          <View style={denunciarStyles.inputGroup}>
            <Text style={denunciarStyles.label}>Descrição Detalhada</Text>
            <TextInput
              style={[denunciarStyles.input, denunciarStyles.textArea]}
              placeholder="Descreva o problema com detalhes..."
              multiline
              numberOfLines={5}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={denunciarStyles.inputGroup}>
            <Text style={denunciarStyles.label}>Localização (Endereço ou Ponto de Referência)</Text>
            <TextInput
              style={denunciarStyles.input}
              placeholder="Ex: Rua das Flores, 123, Centro"
              value={location}
              onChangeText={setLocation}
            />
            <Text style={denunciarStyles.hintText}>
              *A integração com mapa do Google é complexa e requer configuração de API. Por enquanto, insira o endereço.
            </Text>
          </View>

          {/* Placeholder para Upload de Imagem */}
          <View style={denunciarStyles.inputGroup}>
            <Text style={denunciarStyles.label}>Foto do Problema (Opcional)</Text>
            <TouchableOpacity style={denunciarStyles.imageUploadPlaceholder}>
              <CameraIcon />
              <Text style={denunciarStyles.imageUploadText}>Toque para adicionar uma imagem</Text>
            </TouchableOpacity>
            <Text style={denunciarStyles.hintText}>
              *O upload de imagens requer armazenamento de arquivos (ex: Firebase Storage) e não está implementado neste exemplo.
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
    paddingBottom: 100, // Espaço extra para o botão não ser cortado
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
    marginBottom: 15,
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
    textAlignVertical: 'top', // Para Android
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
    fontSize: 30, // Tamanho do ícone da câmera
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
});

