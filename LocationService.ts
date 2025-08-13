import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

class LocationService {
  // Solicita permissão de localização
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return true;
    }

    try {
      console.log('LocationService: Verificando permissão de localização...');
      
      // Primeiro, verificar se já tem a permissão
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      
      if (hasPermission) {
        console.log('LocationService: Permissão já concedida');
        return true;
      }
      
      console.log('LocationService: Solicitando permissão de localização...');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permissão de Localização',
          message: 'Este app precisa acessar sua localização para preencher automaticamente o endereço das denúncias.',
          buttonNeutral: 'Perguntar depois',
          buttonNegative: 'Cancelar',
          buttonPositive: 'Permitir',
        }
      );
      
      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      console.log('LocationService: Resultado da permissão:', granted);
      console.log('LocationService: Permissão concedida?', isGranted);
      
      if (isGranted) {
        console.log('LocationService: Permissão concedida com sucesso');
        return true;
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        console.log('LocationService: Usuário marcou "Nunca perguntar novamente"');
        Alert.alert(
          'Permissão Necessária',
          'Para usar a localização, você precisa habilitar a permissão nas configurações do app.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configurações', onPress: () => this.openAppSettings() }
          ]
        );
        return false;
      } else {
        console.log('LocationService: Permissão negada pelo usuário');
        Alert.alert(
          'Permissão Negada',
          'Sem permissão de localização, não é possível obter seu endereço automaticamente.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (err) {
      console.warn('LocationService: Erro ao solicitar permissão de localização:', err);
      Alert.alert('Erro', 'Erro ao solicitar permissão de localização. Tente novamente.');
      return false;
    }
  }

  // Função para abrir configurações do app
  private openAppSettings() {
    if (Platform.OS === 'android') {
      Alert.alert(
        'Configurações do App',
        'Vá em Configurações > Apps > ReclameCidadao > Permissões e habilite a localização.',
        [{ text: 'OK' }]
      );
    }
  }

  // Obtém a localização atual usando GPS real
  async getCurrentLocation(): Promise<LocationData | undefined> {
    console.log('LocationService: Iniciando obtenção de localização real...');
    
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        console.log('LocationService: Permissão negada');
        Alert.alert('Permissão Negada', 'Não foi possível acessar sua localização.');
        return undefined;
      }

      console.log('LocationService: Permissão concedida, obtendo localização GPS...');

      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          async (position) => {
            console.log('LocationService: Posição GPS obtida:', position);
            
            const { latitude, longitude } = position.coords;
            
            try {
              // Tentar obter o endereço das coordenadas
              const address = await this.getAddressFromCoordinates(latitude, longitude);
              
              const locationData: LocationData = {
                latitude,
                longitude,
                address,
              };
              
              console.log('LocationService: Dados finais com endereço:', locationData);
              resolve(locationData);
            } catch (addressError) {
              console.log('LocationService: Erro ao obter endereço, retornando apenas coordenadas');
              // Se não conseguir o endereço, retorna apenas as coordenadas
              resolve({
                latitude,
                longitude,
              });
            }
          },
          (error) => {
            console.error('LocationService: Erro ao obter posição GPS:', error);
            reject(error);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 15000, 
            maximumAge: 10000 
          }
        );
      });
    } catch (error) {
      console.error('LocationService: Erro geral:', error);
      return undefined;
    }
  }

  // Converte coordenadas em endereço usando OpenStreetMap
  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<{
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  } | undefined> {
    try {
      console.log('LocationService: Convertendo coordenadas para endereço...');
      console.log('LocationService: Coordenadas recebidas:', latitude, longitude);
      
      // Primeira tentativa: OpenStreetMap (gratuita e confiável)
      try {
        console.log('LocationService: Tentando OpenStreetMap...');
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=pt-BR`
        );
        
        if (!response.ok) {
          throw new Error('Erro na requisição de geocoding OpenStreetMap');
        }
        
        const data = await response.json();
        console.log('LocationService: Resposta da API OpenStreetMap:', data);
        
        if (data.address) {
          const address = data.address;
          
          const formattedAddress = {
            street: this.formatStreetName(address.road || address.street || address.highway || ''),
            neighborhood: this.formatNeighborhood(address.suburb || address.neighbourhood || address.city_district || ''),
            city: this.formatCity(address.city || address.town || address.village || address.county || ''),
            state: this.formatState(address.state || ''),
          };
          
          console.log('LocationService: Endereço formatado OpenStreetMap:', formattedAddress);
          return formattedAddress;
        }
      } catch (osmError) {
        console.log('LocationService: Erro na API OpenStreetMap:', osmError);
      }
      
      // Segunda tentativa: Endereço baseado na região geográfica
      const regionAddress = this.getRegionBasedAddress(latitude, longitude);
      if (regionAddress) {
        console.log('LocationService: Endereço baseado em região retornado:', regionAddress);
        return regionAddress;
      }
      
      // Fallback final: retorna um endereço genérico baseado nas coordenadas
      const fallbackAddress = {
        street: `Localização GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        neighborhood: 'Localização atual',
        city: 'Sua localização',
        state: 'GPS',
      };
      
      console.log('LocationService: Endereço fallback retornado:', fallbackAddress);
      return fallbackAddress;
      
    } catch (error) {
      console.error('LocationService: Erro ao converter coordenadas em endereço:', error);
      
      // Fallback final: retorna um endereço genérico baseado nas coordenadas
      const fallbackAddress = {
        street: `Localização GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        neighborhood: 'Localização atual',
        city: 'Sua localização',
        state: 'GPS',
      };
      
      console.log('LocationService: Endereço fallback por erro:', fallbackAddress);
      return fallbackAddress;
    }
  }

  // Função para obter endereço baseado na região geográfica
  private getRegionBasedAddress(latitude: number, longitude: number): {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  } | undefined {
    // Determina a região baseada nas coordenadas
    let region = '';
    let state = '';

    if (latitude < -20) {
      if (longitude < -45) {
        region = 'Região Sudeste';
        state = 'MG';
      } else if (longitude < -40) {
        region = 'Região Sudeste';
        state = 'RJ';
      } else {
        region = 'Região Sudeste';
        state = 'SP';
      }
    } else if (latitude < -10) {
      if (longitude < -40) {
        region = 'Região Nordeste';
        state = 'BA';
      } else {
        region = 'Região Nordeste';
        state = 'PE';
      }
    } else {
      region = 'Região Norte';
      state = 'AM';
    }

    return {
      street: `Localização ${region}`,
      neighborhood: 'Sua área',
      city: 'Localização atual',
      state: state,
    };
  }

  // Funções auxiliares para formatação
  private formatStreetName(street: string): string {
    if (!street) return 'Rua não identificada';
    
    // Remove números e caracteres especiais
    const cleanStreet = street.replace(/[0-9]/g, '').replace(/[^\w\s]/g, '').trim();
    
    if (cleanStreet.toLowerCase().includes('rua')) return cleanStreet;
    if (cleanStreet.toLowerCase().includes('avenida') || cleanStreet.toLowerCase().includes('av')) return `Avenida ${cleanStreet}`;
    if (cleanStreet.toLowerCase().includes('estrada')) return `Estrada ${cleanStreet}`;
    
    return `Rua ${cleanStreet}`;
  }

  private formatNeighborhood(neighborhood: string): string {
    if (!neighborhood) return 'Bairro não identificado';
    
    // Capitaliza a primeira letra
    return neighborhood.charAt(0).toUpperCase() + neighborhood.slice(1).toLowerCase();
  }

  private formatCity(city: string): string {
    if (!city) return 'Cidade não identificada';
    
    // Capitaliza a primeira letra
    return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  }

  private formatState(state: string): string {
    if (!state) return 'Estado não identificado';
    
    // Converte para maiúsculas (padrão brasileiro)
    return state.toUpperCase();
  }
}

export default new LocationService(); 