import type { NavLink } from "../types/header";

export const headerNavLinks: NavLink[] = [
  { label: "Explore", to: { name: "search" } },
  { label: "My Trips", to: { name: "trip" } },
  { label: "Saved Places", to: { name: "saved-places" } },
  { label: "Forum", to: { name: "forums-home" } },
];
