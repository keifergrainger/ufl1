export type GameResult = "W" | "L" | "T" | null;

export interface Game {
    id: string;
    week: number;
    opponent: string;
    opponentLogo?: string; // Optional path to logo
    date: string;
    time: string;
    venue: string;
    isHome: boolean;
    result?: GameResult;
    score?: string; // e.g. "27-10"
    broadcaster?: string;
}

export const schedule: Game[] = [
    {
        id: "g1",
        week: 1,
        opponent: "Arlington Renegades",
        date: "Mar 30, 2024",
        time: "1:00 PM EST",
        venue: "Choctaw Stadium",
        isHome: false,
        result: "W",
        score: "27-14",
        broadcaster: "FOX",
    },
    {
        id: "g2",
        week: 2,
        opponent: "Michigan Panthers",
        date: "Apr 7, 2024",
        time: "12:00 PM EST",
        venue: "Ford Field",
        isHome: false,
        result: "W",
        score: "20-13",
        broadcaster: "ESPN",
    },
    {
        id: "g3",
        week: 3,
        opponent: "Memphis Showboats",
        date: "Apr 13, 2024",
        time: "7:00 PM EST",
        venue: "Protective Stadium",
        isHome: true,
        result: "W",
        score: "33-14",
        broadcaster: "FOX",
    },
    {
        id: "g4",
        week: 4,
        opponent: "DC Defenders",
        date: "Apr 20, 2024",
        time: "7:00 PM EST",
        venue: "Protective Stadium",
        isHome: true,
        result: null, // Next game
        broadcaster: "FOX",
    },
    {
        id: "g5",
        week: 5,
        opponent: "Houston Roughnecks",
        date: "Apr 27, 2024",
        time: "7:00 PM EST",
        venue: "Rice Stadium",
        isHome: false,
        result: null,
        broadcaster: "FOX",
    },
    {
        id: "g6",
        week: 6,
        opponent: "Memphis Showboats",
        date: "May 4, 2024",
        time: "12:00 PM EST",
        venue: "Liberty Stadium",
        isHome: false,
        result: null,
        broadcaster: "ABC",
    },
    {
        id: "g7",
        week: 7,
        opponent: "St. Louis Battlehawks",
        date: "May 11, 2024",
        time: "4:00 PM EST",
        venue: "Protective Stadium",
        isHome: true,
        result: null,
        broadcaster: "FOX",
    },
];
