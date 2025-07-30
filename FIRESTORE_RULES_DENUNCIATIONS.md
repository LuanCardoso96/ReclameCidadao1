# 🔧 Regras do Firestore para Denúncias

## 🚨 Problema Atual:
As denúncias não estão sendo salvas no Firestore porque as regras estão bloqueando o acesso.

## ✅ Regras Corretas para Denúncias:

### **Para Desenvolvimento (Permissivo):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite tudo para desenvolvimento
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### **Para Produção (Seguro):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Coleção de usuários - cada usuário pode ler/escrever apenas seus dados
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Coleção de denúncias - qualquer usuário autenticado pode ler/escrever
    match /denunciations/{documentId} {
      allow read, write: if request.auth != null;
    }
    
    // Coleção de teste - para desenvolvimento
    match /test/{documentId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🔍 Como Aplicar:

1. **Vá no Firebase Console** → **Firestore Database** → **Rules**
2. **Substitua completamente** as regras atuais pelas regras acima
3. **Clique em "Publish"**

## 📋 Estrutura das Coleções:

```
/usuarios/{userId}          # Dados do usuário
/denunciations/{docId}      # Denúncias públicas
/test/{docId}              # Documentos de teste
```

## 🎯 Recomendação:

**Use as regras permissivas primeiro** para testar se o Firebase está funcionando, depois mude para as regras seguras quando tudo estiver funcionando.

**Regras permissivas para teste:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 🔧 Próximos Passos:

1. **Configure as regras permissivas** no Firebase Console
2. **Teste o app** - as denúncias devem aparecer na coleção
3. **Verifique no Firebase Console** → **Firestore Database** → **Data** se as denúncias estão sendo salvas 