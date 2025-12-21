export interface IMessage {
  message: string;
}

export interface ILocation {
  lat: number;
  lng: number;
}

export interface IAmrEntry {
  method: string;
  timestamp: number;
}

export interface ITokenPayload {
  iss: string;
  aud: string | string[];
  exp: number;
  iat: number;
  sub: string;
  role: string;
  aal: string;
  session_id: string;
  email: string;
  phone: string;
  is_anonymous: boolean;
  jti?: string | null;
  nbf?: number | null;
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
  amr?: IAmrEntry[] | null;
  ref?: string | null;
}
export interface ITag {
  id: string;
  name: string;
}

export interface IOwnerSchema {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
  full_name?: string | null;
}
