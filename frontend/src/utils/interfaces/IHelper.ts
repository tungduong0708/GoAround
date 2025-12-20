export interface IMessage {
  message: string;
}

export interface ILocation {
  lat: number;
  lng: number;
}

export interface ITokenPayload {
  access_token: string;
  refresh_token: string;
}
export interface ITag {
  id: string;
  name: string;
}
