import type { IPlace } from "./IPlace";

export interface ITripStop {
  id: string;
  place: IPlace;
  stop_order: number;
  arrival_time: string;
  notes?: string;
}

export interface ITrip {
  id: string;
  trip_name: string;
  start_date?: string;
  end_date?: string;
  stop_count?: number;
  stops?: ITripStop[];
}
