import { AdEventType } from 'react-native-google-mobile-ads';
import { interstitial } from './adsService';
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
  Modal,
} from 'react-native';
import FirebaseAuthService, { UserData } from './FirebaseAuthService';
import { HomeScreenNavigationProp } from './types/navigation';
import firestore from '@react-native-firebase/firestore';

// Ícones (simulados)
const MenuIcon = () => <Text style={styles.iconText}>☰</Text>;
const CloseIcon = () => <Text style={styles.iconText}>✕</Text>;
const ThumbsUpIcon = () => <Text style={styles.iconText}>👍</Text>;
const ThumbsDownIcon = () => <Text style={styles.iconText}>👎</Text>;
const MapPinIcon = () => <Text style={styles.iconText}>📍</Text>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

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
  const [adLoaded, setAdLoaded] = useState(false);
  const [adShown, setAdShown] = useState(false); // ✅ controla se já mostrou

  // Configuração do Interstitial
  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setAdLoaded(true);
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      // Não recarrega imediatamente para evitar loop
    });

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  // Exibe anúncio apenas uma vez
  useEffect(() => {
    if (adLoaded && !adShown) {
      interstitial.show();
      setAdShown(true); // marca que já mostrou
      setAdLoaded(false);
    }
  }, [adLoaded, adShown]);

  // Carrega usuário e denúncias
  useEffect(() => {
    const checkUserAndLoadDenunciations = async () => {
      try {
        const currentUser = FirebaseAuthService.getCurrentUser();
        if (currentUser) {
          setUserData(currentUser);
        } else {
          navigation.navigate('Login');
          return;
        }

        const unsubscribe = firestore()
          .collection('denunciations')
          .orderBy('timestamp', 'desc')
          .onSnapshot(
            (querySnapshot) => {
              const firestoreDenunciations = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              })) as Denunciation[];

              setDenunciations(firestoreDenunciations);
            },
            (error) => {
              console.error('Erro ao buscar denúncias em tempo real:', error);
              setMessage('Erro ao carregar denúncias. Tente novamente.');
              setMessageType('error');
            }
          );

        setLoading(false);
        return () => unsubscribe();
      } catch (error: any) {
        console.error('Erro ao verificar usuário ou carregar denúncias:', error);
        setMessage('Erro ao carregar dados. Tente novamente.');
        setMessageType('error');
        navigation.navigate('Login');
      }
    };

    checkUserAndLoadDenunciations();
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await FirebaseAuthService.signOut();
      setMessage('Logout realizado com sucesso!');
      setMessageType('success');
      setTimeout(() => navigation.navigate('Login'), 1000);
    } catch {
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
        newLikes = newLikes.filter(id => id !== userData.uid);
      } else {
        newLikes.push(userData.uid);
        newDislikes = newDislikes.filter(id => id !== userData.uid);
      }
    } else {
      if (newDislikes.includes(userData.uid)) {
        newDislikes = newDislikes.filter(id => id !== userData.uid);
      } else {
        newDislikes.push(userData.uid);
        newLikes = newLikes.filter(id => id !== userData.uid);
      }
    }

    try {
      await firestore().collection('denunciations').doc(denunciationId).update({
        likes: newLikes,
        dislikes: newDislikes,
      });
    } catch {
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

      {/* Mensagens */}
      {message ? (
        <View style={[styles.messageBox, messageType === 'success' ? styles.successBox : styles.errorBox]}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}

      {/* Lista */}
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
                <View style={styles.imagePlaceholder}>
                  {denunciation.imageUrl ? (
                    <Image source={{ uri: denunciation.imageUrl }} style={styles.denunciaImage} resizeMode="cover" />
                  ) : (
                    <Text style={styles.imagePlaceholderText}>Sem Imagem</Text>
                  )}
                </View>
                <View style={styles.detailRow}>
                  <MapPinIcon />
                  <Text style={styles.denunciaDetailText}>Local: {denunciation.location || 'Não informado'}</Text>
                </View>
                <Text style={styles.reporterText}>
                  Denunciado por: {denunciation.isAnonymous ? 'Anônimo' : (denunciation.reporterName || 'Usuário Anônimo')}
                </Text>
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

      {/* Menu Lateral */}
      <Modal animationType="fade" transparent={true} visible={isMenuOpen} onRequestClose={() => setIsMenuOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setIsMenuOpen(false)}>
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
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  header: {
    backgroundColor: '#1c3d91',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  menuButton: { padding: 5 },
  iconText: { fontSize: 24, color: '#fff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'flex-end' },
  menuContainer: { width: 250, backgroundColor: '#fff', paddingTop: 50, paddingHorizontal: 20 },
  closeMenuButton: { alignSelf: 'flex-end', padding: 10, marginBottom: 20 },
  menuItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  logoutMenuItem: { borderBottomWidth: 0 },
  menuItemText: { fontSize: 18, color: '#333' },
  messageBox: { padding: 10, marginHorizontal: 20, marginTop: 10, borderRadius: 8, alignItems: 'center' },
  successBox: { backgroundColor: '#d4edda' },
  errorBox: { backgroundColor: '#f8d7da' },
  messageText: { fontSize: 14, textAlign: 'center' },
  contentArea: { flex: 1, backgroundColor: '#e0e0e0', margin: 10, borderRadius: 15, padding: 10 },
  denunciasList: { paddingVertical: 10 },
  emptyListContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyListText: { fontSize: 18, color: '#666', textAlign: 'center' },
  denunciaCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15 },
  denunciaTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  imagePlaceholder: { height: 150, backgroundColor: '#ccc', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  denunciaImage: { width: '100%', height: '100%' },
  imagePlaceholderText: { color: '#666', fontSize: 14 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  denunciaDetailText: { fontSize: 15, marginLeft: 5 },
  reporterText: { fontSize: 13, marginBottom: 10 },
  statusContainer: { alignSelf: 'flex-start', marginBottom: 10 },
  statusText: { fontSize: 14, fontWeight: 'bold', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20 },
  statusResolved: { backgroundColor: '#d4edda', color: '#28a745' },
  statusUnresolved: { backgroundColor: '#f8d7da', color: '#dc3545' },
  likeDislikeContainer: { flexDirection: 'row', marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  likeDislikeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', padding: 8, borderRadius: 20, marginRight: 10 },
  likedButton: { backgroundColor: '#bbdefb' },
  dislikedButton: { backgroundColor: '#ffcdd2' },
  likeDislikeCount: { marginLeft: 5, fontSize: 14 },
});
