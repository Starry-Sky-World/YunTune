export type Artist = { id: number; name: string };
export type Album = { id: number; name: string; picUrl?: string };

export type Track = {
  id: number;
  name: string;
  artists: Artist[];
  album?: Album;
  durationMs?: number;
};

export type PlaylistSummary = {
  id: number;
  name: string;
  coverImgUrl?: string;
  trackCount?: number;
  creatorName?: string;
};

export type PlaylistDetail = PlaylistSummary & {
  description?: string;
  tracks: Track[];
};

