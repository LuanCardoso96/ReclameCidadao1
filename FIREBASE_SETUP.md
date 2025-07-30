# Configuração do Firebase

## Passos para configurar o Firebase no seu app React Native:

### 1. Configurar o Firebase Console

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um novo projeto ou use um existente
3. Ative o Authentication:
   - Vá em "Authentication" > "Sign-in method"
   - Ative "Email/Password"
   - Ative "Google" (opcional)

4. Configure o Firestore Database:
   - Vá em "Firestore Database"
   - Clique em "Create database"
   - Escolha "Start in test mode" (para desenvolvimento)
   - Escolha a localização mais próxima

### 2. Configurar o Android

1. No Firebase Console, vá em "Project Settings" > "General"
2. Clique em "Add app" > "Android"
3. Digite o package name do seu app (ex: `com.testandoreact`)
4. Baixe o arquivo `google-services.json`
5. Coloque o arquivo na pasta `android/app/` do seu projeto

### 3. Configurar o iOS (se necessário)

1. No Firebase Console, vá em "Project Settings" > "General"
2. Clique em "Add app" > "iOS"
3. Digite o Bundle ID do seu app
4. Baixe o arquivo `GoogleService-Info.plist`
5. Adicione o arquivo ao projeto iOS via Xcode

### 4. Atualizar o arquivo de configuração

Edite o arquivo `firebase.config.ts` e adicione suas configurações:

```typescript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:android:abcdef"
};
```

### 5. Regras do Firestore

Configure as regras do Firestore para permitir leitura/escrita:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Testar a integração

1. Execute `npx react-native run-android` ou `npx react-native run-ios`
2. Teste criar uma conta
3. Teste fazer login
4. Teste a recuperação de senha
5. Verifique no Firebase Console se os dados estão sendo salvos

## Funcionalidades implementadas:

- ✅ Login com email/senha
- ✅ Cadastro de usuários
- ✅ Recuperação de senha
- ✅ Logout
- ✅ Armazenamento de dados no Firestore
- ✅ Validações de formulário
- ✅ Interface de loading
- ✅ Tratamento de erros

## Estrutura dos dados no Firestore:

Coleção: `usuarios`
Documento: `{uid}` (ID do usuário)
Campos:
- `uid`: string
- `email`: string
- `nomeCompleto`: string
- `telefone`: string
- `dataCriacao`: timestamp
- `ultimoLogin`: timestamp 