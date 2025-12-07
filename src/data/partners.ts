export type PartnerTier = "Premier" | "Official" | "Supporting";

export interface Partner {
    id: string;
    name: string;
    tier: PartnerTier;
    logo?: string; // Placeholder or URL
}

export const partners: Partner[] = [
    {
        id: "pt1",
        name: "Protective Life",
        tier: "Premier",
    },
    {
        id: "pt2",
        name: "Regions Bank",
        tier: "Premier",
    },
    {
        id: "pt3",
        name: "UAB Medicine",
        tier: "Official",
    },
    {
        id: "pt4",
        name: "Coca-Cola United",
        tier: "Official",
    },
    {
        id: "pt5",
        name: "Good People Brewing",
        tier: "Supporting",
    },
    {
        id: "pt6",
        name: "Alabaster Auto",
        tier: "Supporting",
    },
];
