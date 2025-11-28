export const UserRole = {
    TRAVELLER: "TRAVELLER",
    BUSINESS_OWNER: "BUSINESS_OWNER",
    ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
