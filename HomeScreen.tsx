import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Modal, // Usado para o menu hambúrguer
} from 'react-native';
import FirebaseAuthService, { UserData } from './FirebaseAuthService';
import { HomeScreenNavigationProp } from './types/navigation';
import firestore from '@react-native-firebase/firestore';

// Ícones (simulados, em um projeto real você usaria uma biblioteca de ícones)
const MenuIcon = () => <Text style={styles.iconText}>☰</Text>;
const CloseIcon = () => <Text style={styles.iconText}>✕</Text>;
const ThumbsUpIcon = () => <Text style={styles.iconText}>👍</Text>;
const ThumbsDownIcon = () => <Text style={styles.iconText}>👎</Text>;
const MapPinIcon = () => <Text style={styles.iconText}>📍</Text>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

// Interface para denúncias
interface Denunciation {
  id: string;
  title: string;
  description: string;
  location: string;
  isAnonymous: boolean;
  reporterName: string;
  userId: string;
  timestamp: any;
  status: 'Resolvido' | 'Não Resolvido';
  imageUrl?: string;
  likes: string[];
  dislikes: string[];
}

export default function HomeScreen({ navigation }: Props) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [denunciations, setDenunciations] = useState<Denunciation[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    const checkUserAndLoadDenunciations = async () => {
      try {
        const currentUser = FirebaseAuthService.getCurrentUser();
        if (currentUser) {
          setUserData(currentUser);
        } else {
          // Se não há usuário logado, redireciona para Login
          navigation.navigate('Login');
          return;
        }

        // Carrega denúncias do Firestore
        const denunciationsSnapshot = await firestore().collection('denunciations').orderBy('timestamp', 'desc').get();
        const firestoreDenunciations = denunciationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Denunciation[];
        
        // Usa apenas as denúncias do Firestore
        setDenunciations(firestoreDenunciations);

      } catch (error: any) {
        console.log('Erro ao verificar usuário ou carregar denúncias');
        setMessage('Erro ao carregar dados. Tente novamente.');
        setMessageType('error');
        navigation.navigate('Login');
        return;
      } finally {
        setLoading(false);
      }
    };

    // Adiciona listener para atualizações de denúncias (simulado)
    const unsubscribe = () => {
      // Em um app real, aqui você desinscreveria do onSnapshot do Firestore
      // Para o mock, não há nada para desinscrever, mas mantemos a estrutura.
    };
    // Atualiza denúncias periodicamente do Firestore
    const interval = setInterval(async () => {
      try {
        const denunciationsSnapshot = await firestore().collection('denunciations').orderBy('timestamp', 'desc').get();
        const firestoreDenunciations = denunciationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Denunciation[];
        
        setDenunciations(firestoreDenunciations);
      } catch (error: any) {
        console.log('Erro ao atualizar denúncias');
      }
    }, 5000); // Verifica a cada 5 segundos

    checkUserAndLoadDenunciations();

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await FirebaseAuthService.signOut();
      setMessage('Logout realizado com sucesso!');
      setMessageType('success');
      setTimeout(() => navigation.navigate('Login'), 1000);
    } catch (error: any) {
      console.log('Erro ao fazer logout');
      setMessage('Erro ao fazer logout. Tente novamente.');
      setMessageType('error');
    }
  };

  const handleLikeDislike = async (denunciationId: string, type: 'like' | 'dislike') => {
    if (!userData) {
      setMessage('Você precisa estar logado para interagir.');
      setMessageType('error');
      return;
    }

    const currentDenunciation = denunciations.find(den => den.id === denunciationId);
    if (!currentDenunciation) return;

    let newLikes = [...currentDenunciation.likes];
    let newDislikes = [...currentDenunciation.dislikes];

    if (type === 'like') {
      if (newLikes.includes(userData.uid)) {
        newLikes = newLikes.filter(id => id !== userData.uid); // Descurtir
      } else {
        newLikes.push(userData.uid);
        newDislikes = newDislikes.filter(id => id !== userData.uid); // Remove dos dislikes
      }
    } else if (type === 'dislike') {
      if (newDislikes.includes(userData.uid)) {
        newDislikes = newDislikes.filter(id => id !== userData.uid); // Desfazer "não curtir"
      } else {
        newDislikes.push(userData.uid);
        newLikes = newLikes.filter(id => id !== userData.uid); // Remove dos likes
      }
    }

    // Atualiza no Firestore
    try {
      await firestore().collection('denunciations').doc(denunciationId).update({
        likes: newLikes,
        dislikes: newDislikes,
      });
      
      // Atualiza o estado local
      setDenunciations(prev => 
        prev.map(den => 
          den.id === denunciationId 
            ? { ...den, likes: newLikes, dislikes: newDislikes }
            : den
        )
      );
    } catch (error: any) {
      console.log('Erro ao atualizar like/dislike no Firestore');
    }
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1c3d91" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Denúncias</Text>
        <TouchableOpacity onPress={() => setIsMenuOpen(true)} style={styles.menuButton}>
          <MenuIcon />
        </TouchableOpacity>
      </View>

      {/* Mensagens de feedback */}
      {message ? (
        <View style={[styles.messageBox, messageType === 'success' ? styles.successBox : styles.errorBox]}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}

      {/* Conteúdo principal com fundo cinza */}
      <View style={styles.contentArea}>
        <ScrollView contentContainerStyle={styles.denunciasList}>
          {denunciations.length === 0 ? (
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>Nenhuma denúncia encontrada. Seja o primeiro a denunciar!</Text>
            </View>
          ) : (
            denunciations.map((denunciation) => (
              <View key={denunciation.id} style={styles.denunciaCard}>
                <Text style={styles.denunciaTitle}>{denunciation.title}</Text>

                {/* Placeholder para Imagem */}
                <View style={styles.imagePlaceholder}>
                  {denunciation.imageUrl ? (
                    <Image source={{ uri: denunciation.imageUrl }} style={styles.denunciaImage} resizeMode="cover" />
                  ) : (
                    <Text style={styles.imagePlaceholderText}>Sem Imagem</Text>
                  )}
                </View>

                {/* Localização */}
                <View style={styles.detailRow}>
                  <MapPinIcon />
                  <Text style={styles.denunciaDetailText}>Local: {denunciation.location || 'Não informado'}</Text>
                </View>

                {/* Nome do Denunciante */}
                <Text style={styles.reporterText}>
                  Denunciado por: {denunciation.isAnonymous ? 'Anônimo' : (denunciation.reporterName || 'Usuário Anônimo')}
                </Text>

                {/* Status */}
                <View style={styles.statusContainer}>
                  <Text
                    style={[
                      styles.statusText,
                      denunciation.status === 'Resolvido' ? styles.statusResolved : styles.statusUnresolved,
                    ]}
                  >
                    {denunciation.status || 'Não Resolvido'}
                  </Text>
                </View>

                {/* Botões de Curtir/Não Curtir */}
                <View style={styles.likeDislikeContainer}>
                  <TouchableOpacity
                    onPress={() => handleLikeDislike(denunciation.id, 'like')}
                    style={[
                      styles.likeDislikeButton,
                      denunciation.likes.includes(userData?.uid || '') && styles.likedButton,
                    ]}
                  >
                    <ThumbsUpIcon />
                    <Text style={styles.likeDislikeCount}>{denunciation.likes.length}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleLikeDislike(denunciation.id, 'dislike')}
                    style={[
                      styles.likeDislikeButton,
                      denunciation.dislikes.includes(userData?.uid || '') && styles.dislikedButton,
                    ]}
                  >
                    <ThumbsDownIcon />
                    <Text style={styles.likeDislikeCount}>{denunciation.dislikes.length}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Menu Lateral (Modal) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isMenuOpen}
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsMenuOpen(false)} // Fecha o menu ao clicar fora
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity onPress={() => setIsMenuOpen(false)} style={styles.closeMenuButton}>
              <CloseIcon />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                navigation.navigate('Denunciar');
              }}
            >
              <Text style={styles.menuItemText}>Fazer Nova Denúncia</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                navigation.navigate('Login');
              }}
            >
              <Text style={styles.menuItemText}>Voltar para Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutMenuItem]}
              onPress={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
            >
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuButton: {
    padding: 5,
  },
  iconText: {
    fontSize: 24,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start', // Alinha o menu no topo
    alignItems: 'flex-end', // Alinha o menu à direita
  },
  menuContainer: {
    width: 250,
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 50, // Espaço para a barra de status
    paddingHorizontal: 20,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeMenuButton: {
    alignSelf: 'flex-end',
    padding: 10,
    marginBottom: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logoutMenuItem: {
    borderBottomWidth: 0, // Remove a borda do último item
  },
  menuItemText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  messageBox: {
    padding: 10,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  successBox: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  messageText: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#e0e0e0', // Fundo cinza para a área de conteúdo
    margin: 10,
    borderRadius: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  denunciasList: {
    paddingVertical: 10,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  denunciaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  denunciaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden', // Garante que a imagem se ajuste
  },
  denunciaImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholderText: {
    color: '#666',
    fontSize: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  denunciaDetailText: {
    fontSize: 15,
    color: '#555',
    marginLeft: 5,
  },
  reporterText: {
    fontSize: 13,
    color: '#777',
    marginBottom: 10,
  },
  statusContainer: {
    alignSelf: 'flex-start', // Alinha o status à esquerda
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusResolved: {
    backgroundColor: '#d4edda',
    color: '#28a745',
  },
  statusUnresolved: {
    backgroundColor: '#f8d7da',
    color: '#dc3545',
  },
  likeDislikeContainer: {
    flexDirection: 'row',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  likeDislikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  likedButton: {
    backgroundColor: '#bbdefb', // Light blue for liked
  },
  dislikedButton: {
    backgroundColor: '#ffcdd2', // Light red for disliked
  },
  likeDislikeCount: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
});
