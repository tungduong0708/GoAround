import type { IPlacePublic } from "./IPlace";

export interface ISavedListItemWithPlace {
  place: IPlacePublic;
  saved_at: string;
}

export interface ISavedListSchema {
  id: string;
  name: string;
  created_at: string;
  item_count?: number;
}

export interface ISavedListDetailSchema {
  id: string;
  name: string;
  created_at: string;
  items?: ISavedListItemWithPlace[];
}

export interface ISavedListCreate {
  name: string;
}

export interface ISavedListUpdate {
  name?: string | null;
  place_ids?: string[] | null;
}

export interface IAddPlaceToListRequest {
  place_id: string;
}
