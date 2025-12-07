export type Position = "QB" | "RB" | "WR" | "TE" | "OL" | "DL" | "LB" | "DB" | "K" | "P";
export type Unit = "Offense" | "Defense" | "Special Teams";

export interface Player {
    id: string;
    name: string;
    number: string;
    position: Position;
    unit: Unit;
    height: string;
    weight: string;
    college: string;
    image?: string; // Placeholder for now
    isStar?: boolean; // For homepage spotlight
}

export const roster: Player[] = [
    {
        id: "p1",
        name: "Adrian Martinez",
        number: "9",
        position: "QB",
        unit: "Offense",
        height: "6'2\"",
        weight: "220 lbs",
        college: "Kansas State",
        isStar: true,
    },
    {
        id: "p2",
        name: "C.J. Marable",
        number: "11",
        position: "RB",
        unit: "Offense",
        height: "5'10\"",
        weight: "200 lbs",
        college: "Coastal Carolina",
        isStar: true,
    },
    {
        id: "p3",
        name: "Deon Cain",
        number: "8",
        position: "WR",
        unit: "Offense",
        height: "6'2\"",
        weight: "202 lbs",
        college: "Clemson",
        isStar: false,
    },
    {
        id: "p4",
        name: "Jace Sternberger",
        number: "85",
        position: "TE",
        unit: "Offense",
        height: "6'4\"",
        weight: "251 lbs",
        college: "Texas A&M",
        isStar: true, // Top TE
    },
    {
        id: "p5",
        name: "Scooby Wright",
        number: "33",
        position: "LB",
        unit: "Defense",
        height: "6'0\"",
        weight: "240 lbs",
        college: "Arizona",
        isStar: true, // Fan favorite "Shark Dog"
    },
    {
        id: "p6",
        name: "Kyahva Tezino",
        number: "51",
        position: "LB",
        unit: "Defense",
        height: "6'0\"",
        weight: "235 lbs",
        college: "San Diego State",
        isStar: false,
    },
    {
        id: "p7",
        name: "Taco Charlton",
        number: "98",
        position: "DL",
        unit: "Defense",
        height: "6'6\"",
        weight: "270 lbs",
        college: "Michigan",
        isStar: true, // NFL vet
    },
    {
        id: "p8",
        name: "Chris Blewitt",
        number: "12",
        position: "K",
        unit: "Special Teams",
        height: "5'9\"",
        weight: "195 lbs",
        college: "Pittsburgh",
        isStar: false,
    },
];
