export interface HistoryEvent {
    year: string;
    title: string;
    description: string;
    image?: string; // Optional path to trophy image etc
}

export const history: HistoryEvent[] = [
    {
        year: "1983-1985",
        title: "The Legacy Lives On",
        description: "The original Birmingham Stallions were a juggernaut of the 80s USFL, drawing massive crowds to Legion Field and fielding one of the most competitive rosters in the league. Despite the league’s eventual collapse, the passion for the Stallions never faded, creating the foundation for today’s dynasty.",
    },
    {
        year: "2021",
        title: "The Ride Begins Again",
        description: "In November 2021, the USFL announced its return, selecting Birmingham as the headquarters and hub city for the 2022 reboot. The beloved 'Stallions' identity was officially revived, waking a sleeping giant of a fanbase that had been waiting decades for their team to return.",
    },
    {
        year: "2022",
        title: "Champions Reborn",
        description: "After 36 years of silence, the Stallions returned. With Birmingham serving as the solitary hub for the entire USFL season, the team treated the home crowd to a stunning 9–1 run. They capped the revival with a dramatic 33–30 victory over the Philadelphia Stars to win the inaugural USFL Championship.",
    },
    {
        year: "2023",
        title: "Back-to-Back Champions",
        description: "Proving 2022 was no fluke, the Stallions solidified their dynasty. Led by MVP QB Alex McGough, Birmingham boasted the league’s top offense and a suffocating defense, rolling to an 8–2 record before dismantling the Pittsburgh Maulers 28–12 to defend the crown.",
    },
    {
        year: "2024",
        title: "A New League, Same Dominance",
        description: "As the USFL and XFL merged to form the United Football League (UFL), critics wondered if Birmingham could maintain its supremacy in a stronger, consolidated league. The answer was resounding: The Stallions finished with a league-best 9–1 record, answering every challenge.",
    },
    {
        year: "2024",
        title: "The Shutout & Three-Peat",
        description: "History made. Capping off another dominant season, the Stallions delivered a defensive masterpiece in the UFL Championship Game, crushing the San Antonio Brahmas 25–0. It was the first shutout in league history and secured Birmingham’s third consecutive professional title.",
    },
    {
        year: "Future",
        title: "The Standard of Spring Football",
        description: "The Stallions have established themselves as the undisputed powerhouse of the UFL. With a deeply rooted culture of winning, a passionate fanbase committed to the Magic City, and a roster loaded with NFL-caliber talent, Birmingham isn't just a team—it's the capital of spring football.",
    },
];
