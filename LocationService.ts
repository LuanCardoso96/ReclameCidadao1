import { Platform, PermissionsAndroid, Alert } from 'react-native';

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
      return true; // No iOS, a permissão é solicitada automaticamente
    }

    try {
      console.log('LocationService: Solicitando permissão de localização...');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permissão de Localização',
          message: 'Este app precisa acessar sua localização para preencher automaticamente o endereço.',
          buttonNeutral: 'Perguntar depois',
          buttonNegative: 'Cancelar',
          buttonPositive: 'OK',
        }
      );
      
      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      console.log('LocationService: Permissão concedida?', isGranted);
      return isGranted;
    } catch (err) {
      console.warn('LocationService: Erro ao solicitar permissão de localização:', err);
      return false;
    }
  }

  // Obtém a localização atual
  async getCurrentLocation(): Promise<LocationData | null> {
    console.log('LocationService: Iniciando obtenção de localização');
    
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        console.log('LocationService: Permissão negada');
        Alert.alert('Permissão Negada', 'Não foi possível acessar sua localização.');
        return null;
      }

      console.log('LocationService: Permissão concedida, simulando localização...');

      // Simulação de obtenção de localização
      // Em um app real, você usaria:
      // import Geolocation from '@react-native-community/geolocation';
      // 
      // return new Promise((resolve, reject) => {
      //   Geolocation.getCurrentPosition(
      //     (position) => {
      //       resolve({
      //         latitude: position.coords.latitude,
      //         longitude: position.coords.longitude,
      //       });
      //     },
      //     (error) => reject(error),
      //     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      //   );
      // });

      // Simulação para demonstração
      return new Promise((resolve) => {
        console.log('LocationService: Iniciando simulação de 2 segundos...');
        
        setTimeout(() => {
          console.log('LocationService: Simulação concluída, retornando dados...');
          
          const mockLocation: LocationData = {
            latitude: -23.5505,
            longitude: -46.6333,
            address: {
              street: 'Rua das Flores',
              neighborhood: 'Centro',
              city: 'São Paulo',
              state: 'SP',
            },
          };
          
          console.log('LocationService: Dados finais:', mockLocation);
          resolve(mockLocation);
        }, 2000);
      });
    } catch (error) {
      console.error('LocationService: Erro:', error);
      return null;
    }
  }

  // Converte coordenadas em endereço usando Google Geocoding API
  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<{
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  } | null> {
    try {
      // Em um app real, você faria uma requisição para a Google Geocoding API
      // const response = await fetch(
      //   `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_API_KEY`
      // );
      // const data = await response.json();
      // 
      // if (data.results && data.results.length > 0) {
      //   const addressComponents = data.results[0].address_components;
      //   // Processar os componentes do endereço...
      // }

      // Simulação para demonstração
      return {
        street: 'Rua das Flores',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
      };
    } catch (error) {
      console.error('Erro ao converter coordenadas em endereço:', error);
      return null;
    }
  }
}

export default new LocationService(); 