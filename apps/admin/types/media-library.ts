export interface MediaType {
  id: number;
  title?: string;
  fileName: string;
  fileAlt: string;
  fileType: 'webp' | 'png' | 'jpg' | 'jpeg' | 'svg' | 'pdf' | 'csv' | 'xlsx';
  fileSize: number;
  fileUrl: string;
  createdAt: string;
}

export interface UploadMediaType {
  file: File;
  title?: string;
  alt?: string;
}
