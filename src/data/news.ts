export interface NewsItem {
    id: string;
    title: string;
    date: string;
    snippet: string;
    imageUrl?: string;
    category: "Team News" | "Game Recap" | "Community";
}

export const news: NewsItem[] = [
    {
        id: "n1",
        title: "Stallions Clinch 3rd Straight Championship Title",
        date: "June 17, 2024",
        snippet: "Birmingham cements its dynasty status with a dominant shutout performance in the UFL Championship game.",
        category: "Game Recap",
    },
    {
        id: "n2",
        title: "Quarterback Adrian Martinez Named League MVP",
        date: "June 8, 2024",
        snippet: "After a record-breaking season on the ground and through the air, Martinez takes home the highest individual honor.",
        category: "Team News",
    },
    {
        id: "n3",
        title: "Protective Stadium: Know Before You Go",
        date: "March 15, 2024",
        snippet: "Updated parking maps, bag policies, and new concession options for the upcoming 2024 season.",
        category: "Community",
    },
    {
        id: "n4",
        title: "Training Camp Report: Defense Looks Sharper Than Ever",
        date: "March 1, 2024",
        snippet: "Defensive Coordinator discusses correctable mistakes and the hunger to repeat as champions.",
        category: "Team News",
    },
];
