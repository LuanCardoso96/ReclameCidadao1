# Como Testar a Funcionalidade de Localização

## ✅ Permissões Configuradas

As permissões de localização foram adicionadas ao `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

## 🧪 Como Testar

### 1. Compilar e Instalar o App

```bash
npx react-native run-android
```

### 2. Testar a Funcionalidade

1. **Abra o app**
2. **Navegue até a tela de denúncia**
3. **Toque no botão "Usar localização atual"**
4. **Conceda permissão quando solicitado**
5. **Aguarde 2 segundos** (simulação)
6. **Verifique se os campos foram preenchidos automaticamente**

### 3. Verificar os Logs

Abra o Metro bundler ou use `adb logcat` para ver os logs:

```bash
adb logcat | grep "LocationService"
```

Você deve ver logs como:
```
LocationService: Iniciando obtenção de localização
LocationService: Solicitando permissão de localização...
LocationService: Permissão concedida? true
LocationService: Permissão concedida, simulando localização...
LocationService: Iniciando simulação de 2 segundos...
LocationService: Simulação concluída, retornando dados...
LocationService: Dados finais: {latitude: -23.5505, longitude: -46.6333, ...}
```

## 🔍 Campos que Devem ser Preenchidos

Após o teste bem-sucedido, os seguintes campos devem ser preenchidos automaticamente:

- **Rua/Avenida**: "Rua das Flores"
- **Bairro**: "Centro"
- **Cidade**: "São Paulo"
- **Estado**: "SP"

## ⚠️ Possíveis Problemas

### 1. Permissão Negada
- **Sintoma**: Aparece alerta "Permissão Negada"
- **Solução**: Vá em Configurações > Apps > TestandoReact > Permissões > Localização

### 2. App Não Compila
- **Sintoma**: Erro de compilação
- **Solução**: Execute `cd android && ./gradlew clean && cd ..` antes de `npx react-native run-android`

### 3. Botão Não Responde
- **Sintoma**: Botão não faz nada
- **Solução**: Verifique se o LocationService está sendo importado corretamente

## 📱 Teste em Dispositivo Físico

Para melhor teste, use um dispositivo físico:

1. **Conecte o dispositivo via USB**
2. **Ative a depuração USB**
3. **Execute**: `npx react-native run-android`
4. **Teste a funcionalidade**

## 🔧 Debug

Se algo não funcionar, verifique:

1. **Logs do Metro bundler**
2. **Logs do Android**: `adb logcat`
3. **Permissões do app** nas configurações do Android
4. **Localização ativada** no dispositivo

## 📋 Checklist de Teste

- [ ] App compila sem erros
- [ ] Tela de denúncia abre
- [ ] Botão "Usar localização atual" está visível
- [ ] Ao tocar no botão, solicita permissão
- [ ] Permissão é concedida
- [ ] Após 2 segundos, campos são preenchidos
- [ ] Alerta de sucesso aparece
- [ ] Dados corretos nos campos

## 🚀 Próximos Passos

Após confirmar que a simulação funciona:

1. **Instalar dependências reais**:
   ```bash
   npm install @react-native-community/geolocation
   ```

2. **Configurar Google Geocoding API** (ver `GEOLOCATION_SETUP.md`)

3. **Substituir simulação por implementação real**

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs primeiro
2. Teste em dispositivo físico
3. Confirme que as permissões estão no AndroidManifest.xml
4. Verifique se o LocationService está sendo importado corretamente 