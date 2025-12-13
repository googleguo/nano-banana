export enum AppMode {
  TEXT_TO_IMAGE = 'TEXT_TO_IMAGE',
  IMAGE_TO_IMAGE = 'IMAGE_TO_IMAGE',
  IMAGE_EDIT = 'IMAGE_EDIT',
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT = '3:4',
  LANDSCAPE = '4:3',
  WIDE = '16:9',
  TALL = '9:16',
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  mode: AppMode;
  timestamp: number;
}

export interface GenerationConfig {
  aspectRatio: AspectRatio;
}
