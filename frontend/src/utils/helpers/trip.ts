import type { ITrip } from "@/utils/interfaces";

/**
 * Get a display string for the trip location based on the first stop
 * @param trip - The trip object
 * @returns A formatted location string (e.g., "Paris, France")
 */
export const getLocationDisplay = (trip: ITrip): string => {
  if (trip.stops && trip.stops.length > 0) {
    const firstPlace = trip.stops[0]?.place;
    if (firstPlace) {
      return `${firstPlace.city}, ${firstPlace.country}`;
    }
  }
  return "No location set";
};

/**
 * Format an ISO date string to a readable format
 * @param dateString - ISO date string (e.g., "2025-12-12")
 * @returns Formatted date string (e.g., "Dec 12, 2025")
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format a date range for display
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns Formatted date range (e.g., "Dec 12, 2025 - Dec 18, 2025")
 */
export const formatDateRange = (
  startDate?: string,
  endDate?: string,
): string => {
  const start = formatDate(startDate);
  if (!start) return "";
  if (!endDate) return start;
  const end = formatDate(endDate);
  return `${start} - ${end}`;
};

/**
 * Get a pluralized string for place count
 * @param count - Number of places
 * @returns Pluralized string (e.g., "1 place", "5 places")
 */
export const getPlaceCountText = (count?: number): string => {
  const num = count || 0;
  return `${num} ${num === 1 ? "place" : "places"}`;
};
