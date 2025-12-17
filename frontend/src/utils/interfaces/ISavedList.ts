import type { IPlace } from "./IPlace";

export interface ISavedListItem {
  place: IPlace;
  saved_at: string;
}

export interface ISavedList {
  id: string;
  name: string;
  created_at?: string;
  item_count?: number;
  items?: ISavedListItem[];
}
