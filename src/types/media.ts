export interface Media {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  category: 'profile' | 'product' | 'chat' | 'document' | 'other';
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
  };
}

export interface MediaResponse {
  data: Media[];
  total: number;
}

