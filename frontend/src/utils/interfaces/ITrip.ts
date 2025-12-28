import type { IPlacePublic } from "./IPlace";

export interface ITripStopCreate {
  place_id: string; 
  stop_order?: number | null;
  arrival_time: string;
  notes?: string | null; 
}
export interface ITripCreate {
  trip_name: string;
  start_date?: string | null;
  end_date?: string | null;
  public?: boolean;
  tags?: string[];
  stops?: ITripStopCreate[]
}
export interface ITripUpdate{
  trip_name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  public?: boolean | null;
  tags?: string[] | null;
  stops?: ITripStopCreate[] | null;
}
export interface ITripStopWithPlace {
  id: string;
  trip_id: string;
  place_id?: string;
  stop_order: number; 
  arrival_time?: string | null;
  notes?: string | null;
  place?: IPlacePublic | null;
}
export interface ITripSchema {
  id: string;
  trip_name: string;
  start_date?: string | null;
  end_date?: string | null;
  public?: boolean;
  tags?: string[];
  stops?: ITripStopWithPlace[]; 
}
export interface ITripListSchema {
  id: string;
  trip_name: string;
  start_date: string;
  end_date: string;
  public?: boolean;
  stop_count?: number;
  preview_image_url?: string | null;
}
// export interface ITripStopUpdate {
//   order_index?: number;
//   arrival_time?: string;
//   notes?: string;
// }

export interface ITripStopSchema {
  id: string
  trip_id: string;
  place_id: string;
  stop_order: number;
  arrival_time: string;
  notes: string;
}

export interface ITripGenerateRequest {
  destination: string;
  start_date: string;
  end_date: string;
}
