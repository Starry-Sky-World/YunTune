export type UpstreamCookieMap = Record<string, string>;

export type SessionUser = {
  userId: number;
  nickname?: string;
  avatarUrl?: string;
};

export type YunTuneSessionV1 = {
  v: 1;
  cookies?: UpstreamCookieMap;
  user?: SessionUser;
  updatedAt?: number;
};

