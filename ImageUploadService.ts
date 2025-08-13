import storage from '@react-native-firebase/storage';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { Platform, Alert } from 'react-native';

export interface ImageUploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

class ImageUploadService {
  /**
   * Abre a galeria de imagens para seleção
   */
  static async pickImage(): Promise<ImagePickerResponse> {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 1024,
      maxWidth: 1024,
      quality: 0.8,
    };

    return new Promise((resolve) => {
      launchImageLibrary(options, (response) => {
        resolve(response);
      });
    });
  }

  /**
   * Faz upload de uma imagem para o Firebase Storage
   */
  static async uploadImage(
    imageUri: string,
    denunciationId: string
  ): Promise<ImageUploadResult> {
    try {
      console.log('ImageUploadService.uploadImage iniciado');
      console.log('imageUri:', imageUri);
      console.log('denunciationId:', denunciationId);
      
      if (!imageUri) {
        console.log('URI da imagem não fornecida');
        return { success: false, error: 'URI da imagem não fornecida' };
      }

      // Criar referência única para a imagem
      const imageFileName = `denunciations/${denunciationId}_${Date.now()}.jpg`;
      console.log('imageFileName:', imageFileName);
      
      const imageRef = storage().ref(imageFileName);
      console.log('imageRef criado');

      // Upload da imagem
      console.log('Iniciando putFile...');
      const uploadTask = imageRef.putFile(imageUri);
      console.log('putFile iniciado, aguardando...');

      // Aguardar conclusão do upload
      await uploadTask;
      console.log('Upload concluído com sucesso');

      // Obter URL de download
      console.log('Obtendo URL de download...');
      const downloadUrl = await imageRef.getDownloadURL();
      console.log('URL de download obtida:', downloadUrl);

      return {
        success: true,
        imageUrl: downloadUrl,
      };
    } catch (error: any) {
      console.error('Erro no upload da imagem:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      return {
        success: false,
        error: error.message || 'Erro no upload da imagem',
      };
    }
  }

  /**
   * Remove uma imagem do Firebase Storage
   */
  static async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      if (!imageUrl) return true;

      // Extrair o caminho do arquivo da URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0];
      const filePath = `denunciations/${fileName}`;

      await storage().ref(filePath).delete();
      return true;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return false;
    }
  }

  /**
   * Valida se a imagem é adequada para upload
   */
  static validateImage(imageUri: string): boolean {
    if (!imageUri) return false;
    
    // Verificar se é uma URI válida
    if (!imageUri.startsWith('file://') && !imageUri.startsWith('content://')) {
      return false;
    }

    return true;
  }

  /**
   * Obtém informações sobre o tamanho do arquivo (se disponível)
   */
  static async getImageInfo(imageUri: string): Promise<{ size?: number; width?: number; height?: number }> {
    try {
      // Para React Native, não temos acesso direto ao tamanho do arquivo
      // mas podemos verificar se a URI é válida
      if (!this.validateImage(imageUri)) {
        throw new Error('URI da imagem inválida');
      }

      return {};
    } catch (error) {
      console.error('Erro ao obter informações da imagem:', error);
      return {};
    }
  }
}

export default ImageUploadService; 