export interface AppLink {
  id: number;
  name: string;
  url: string;
}

export interface AppLinkWithThumbnail extends AppLink {
  thumbnail: string;
}
