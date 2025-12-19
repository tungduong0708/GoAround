import type { IPlacePublic } from "./IPlace";

export interface ITripStopCreate {
  place_id: string; 
  stop_order: number;
  arrival_time: string;
  notes: string; 
}
export interface ITripCreate {
  trip_name: string;
  start_date: string;
  end_date: string;
  tags: string[];
  stops: ITripStopCreate[]
}
export interface ITripUpdate{
  trip_name?: string;
  start_date?: string;
  end_date?: string;
  tags?: string[];
}
export interface ITripStopWithPlace {
  id: string;
  trip_id: string;
  stop_order: number; 
  arrival_time: string;
  notes: string;
  place: IPlacePublic
}
export interface ITripSchema {
  id: string;
  trip_name: string;
  start_date: string;
  end_date: string;
  tags: string[];
  stops: ITripStopWithPlace[]; 
}
export interface ITripListSchema {
  id: string;
  trip_name: string;
  start_date: string;
  end_date: string;
  stop_count: number;
}
export interface ITripStopUpdate {
  order_index?: number;
  arrival_time?: string;
  notes?: string;
}

export interface ITripStopSchema {
  id: string
  trip_id: string;
  place_id: string;
  stop_order: number;
  arrival_time: string;
  notes: string;
}
