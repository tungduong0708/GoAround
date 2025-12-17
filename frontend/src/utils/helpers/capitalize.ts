export function capitalize(str: string) {
  if (!str || str === undefined || str === null) return "";
  return str[0]?.toUpperCase() + str.slice(1);
}
