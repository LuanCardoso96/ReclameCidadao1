# Configuração de Geolocalização

Este documento explica como configurar a geolocalização real no projeto React Native.

## 1. Instalação das Dependências

Execute os seguintes comandos para instalar as dependências necessárias:

```bash
npm install @react-native-community/geolocation
npm install react-native-geolocation-service
```

## 2. Configuração do Android

### 2.1 Permissões no AndroidManifest.xml

Adicione as seguintes permissões no arquivo `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### 2.2 Configuração do build.gradle

No arquivo `android/app/build.gradle`, adicione:

```gradle
dependencies {
    // ... outras dependências
    implementation 'com.google.android.gms:play-services-location:21.0.1'
}
```

## 3. Configuração do iOS

### 3.1 Permissões no Info.plist

Adicione as seguintes chaves no arquivo `ios/TestandoReact/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Este app precisa acessar sua localização para preencher automaticamente o endereço das denúncias.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Este app precisa acessar sua localização para preencher automaticamente o endereço das denúncias.</string>
```

## 4. Configuração da Google Geocoding API

### 4.1 Obter API Key

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API "Geocoding API"
4. Crie uma chave de API

### 4.2 Configurar a API Key

No arquivo `LocationService.ts`, substitua a simulação pela implementação real:

```typescript
// Converte coordenadas em endereço usando Google Geocoding API
async getAddressFromCoordinates(latitude: number, longitude: number): Promise<{
  street: string;
  neighborhood: string;
  city: string;
  state: string;
} | null> {
  try {
    const API_KEY = 'SUA_API_KEY_AQUI';
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}&language=pt-BR`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const addressComponents = data.results[0].address_components;
      
      let street = '';
      let neighborhood = '';
      let city = '';
      let state = '';
      
      for (const component of addressComponents) {
        if (component.types.includes('route')) {
          street = component.long_name;
        } else if (component.types.includes('sublocality')) {
          neighborhood = component.long_name;
        } else if (component.types.includes('locality')) {
          city = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          state = component.short_name;
        }
      }
      
      return { street, neighborhood, city, state };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao converter coordenadas em endereço:', error);
    return null;
  }
}
```

## 5. Implementação Real da Geolocalização

No arquivo `LocationService.ts`, substitua a simulação pela implementação real:

```typescript
import Geolocation from '@react-native-community/geolocation';

// Obtém a localização atual
async getCurrentLocation(): Promise<LocationData | null> {
  try {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permissão Negada', 'Não foi possível acessar sua localização.');
      return null;
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const address = await this.getAddressFromCoordinates(latitude, longitude);
          
          resolve({
            latitude,
            longitude,
            address,
          });
        },
        (error) => reject(error),
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 10000 
        }
      );
    });
  } catch (error) {
    console.error('Erro ao obter localização:', error);
    return null;
  }
}
```

## 6. Configuração de Segurança da API Key

### 6.1 Para Android

Crie um arquivo `android/app/src/main/res/values/strings.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="google_maps_key">SUA_API_KEY_AQUI</string>
</resources>
```

### 6.2 Para iOS

Adicione a chave no arquivo `ios/TestandoReact/AppDelegate.swift`:

```swift
import UIKit
import GoogleMaps

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    GMSServices.provideAPIKey("SUA_API_KEY_AQUI")
    return true
  }
}
```

## 7. Variáveis de Ambiente (Recomendado)

Para maior segurança, use variáveis de ambiente:

1. Instale o react-native-dotenv:
```bash
npm install react-native-dotenv
```

2. Crie um arquivo `.env`:
```
GOOGLE_MAPS_API_KEY=sua_api_key_aqui
```

3. Configure o babel.config.js:
```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }],
  ],
};
```

4. Use no código:
```typescript
import { GOOGLE_MAPS_API_KEY } from '@env';
```

## 8. Teste

Após a configuração, teste a funcionalidade:

1. Execute o app
2. Vá para a tela de denúncia
3. Toque no botão "Usar localização atual"
4. Conceda permissão de localização
5. Verifique se os campos de endereço são preenchidos automaticamente

## 9. Considerações de Segurança

- Nunca commite sua API key no repositório
- Use restrições de domínio na Google Cloud Console
- Monitore o uso da API para evitar cobranças inesperadas
- Considere implementar cache local para reduzir chamadas à API

## 10. Troubleshooting

### Erro de permissão no Android
- Verifique se as permissões estão no AndroidManifest.xml
- Teste em um dispositivo físico (o emulador pode ter problemas)

### Erro de permissão no iOS
- Verifique se as chaves estão no Info.plist
- Teste em um dispositivo físico

### API Key inválida
- Verifique se a API está ativada no Google Cloud Console
- Verifique se a chave está correta
- Verifique as restrições de domínio/IP 