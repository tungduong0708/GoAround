import type { IPlace } from "./IPlace";

export interface ITripStop {
  id: string;
  place: IPlace;
  stopOrder: number;
  arrivalTime: string;
  notes?: string;
}

export interface ITrip {
  id: string;
  tripName: string;
  startDate?: string;
  endDate?: string;
  stopCount?: number;
  stops?: ITripStop[];
}
