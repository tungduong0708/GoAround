import type { IPlacePublic } from "./IPlace";

export interface ISavedListItemsWithPlace {
  place: IPlacePublic;
  saved_at: string;
}

export interface ISavedListSchema {
  id: string;
  name: string;
  created_at?: string;
  item_count?: number;
}

export interface ISavedListDetailedSchema {
  id: string;
  name: string;
  created_at?: string;
  items: ISavedListItemsWithPlace[];
}
export interface ISavedListCreate {
  name: string;
}
export interface IAddPlaceToListRequest {
  place_id: string;
}
