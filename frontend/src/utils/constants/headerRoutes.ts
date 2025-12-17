import type { NavLink } from "../types/header";

export const headerNavLinks: NavLink[] = [
  { label: "Explore", to: { name: "search" } },
  { label: "My Trips", to: { name: "trip" } },
  { label: "Saved Place", to: { path: "/landing#saved" } },
  { label: "Forum", to: { name: "forums-home" } },
];
