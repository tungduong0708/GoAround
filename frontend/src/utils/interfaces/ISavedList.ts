import type { IPlace } from "./IPlace";

export interface ISavedListItem {
    place: IPlace;
    savedAt: string;
}

export interface ISavedList {
    id: string;
    name: string;
    createdAt?: string;
    itemCount?: number;
    items?: ISavedListItem[];
}
