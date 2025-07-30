# Debug do Firebase - Guia de Solução de Problemas

## Problemas Comuns e Soluções:

### 1. Erro "Erro desconhecido. Tente novamente"
**Causa:** Geralmente indica problemas de configuração ou regras do Firestore

**Soluções:**
1. Verificar se o `google-services.json` está correto
2. Verificar as regras do Firestore
3. Verificar se o Authentication está ativado

### 2. Regras do Firestore (IMPORTANTE)
No Firebase Console, vá em **Firestore Database > Rules** e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita para usuários autenticados
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Permitir criação de novos usuários
    match /usuarios/{userId} {
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Para desenvolvimento, você pode usar regras mais permissivas:
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3. Verificar Configurações do Firebase Console

1. **Authentication:**
   - Vá em Authentication > Sign-in method
   - Ative "Email/Password"
   - Verifique se não há restrições de domínio

2. **Firestore Database:**
   - Vá em Firestore Database
   - Verifique se o banco está criado
   - Verifique as regras de segurança

3. **Project Settings:**
   - Verifique se o `google-services.json` está atualizado
   - Verifique se o package name está correto: `com.testandoreact`

### 4. Teste de Conectividade
O app agora inclui logs detalhados. Verifique no console:
- "=== TESTE DO FIREBASE ==="
- "1. Testando Firebase Auth..."
- "2. Testando Firestore..."
- "3. Testando escrita no Firestore..."

### 5. Comandos para Debug

```bash
# Limpar cache do Metro
npx react-native start --reset-cache

# Rebuild do Android
cd android && ./gradlew clean && cd ..
npx react-native run-android

# Ver logs em tempo real
adb logcat | grep -E "(Firebase|ReactNativeJS)"
```

### 6. Verificar se o Firebase está inicializado
No console do Metro, você deve ver:
```
Firebase inicializado automaticamente
```

Se não aparecer, há problema na configuração. 