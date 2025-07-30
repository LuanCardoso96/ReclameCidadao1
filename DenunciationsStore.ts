// Tipo para denúncias
export interface Denunciation {
  id: string;
  title: string;
  description: string;
  location: string;
  isAnonymous: boolean;
  reporterName: string;
  userId: string;
  timestamp: Date;
  status: 'Resolvido' | 'Não Resolvido';
  imageUrl?: string;
  likes: string[]; // IDs de usuários que curtiram
  dislikes: string[]; // IDs de usuários que não curtiram
}

// Armazenamento global para denúncias
let mockDenunciations: Denunciation[] = [];

// Funções para gerenciar denúncias
export const addDenunciation = (denunciation: Denunciation) => {
  mockDenunciations.push(denunciation);
  return mockDenunciations;
};

export const getDenunciations = () => {
  return [...mockDenunciations].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const updateDenunciation = (id: string, updates: Partial<Denunciation>) => {
  const index = mockDenunciations.findIndex(d => d.id === id);
  if (index !== -1) {
    mockDenunciations[index] = { ...mockDenunciations[index], ...updates };
  }
  return mockDenunciations;
};

export const clearDenunciations = () => {
  mockDenunciations = [];
}; 