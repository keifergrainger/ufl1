export type UflTeam = {
    id: string;
    slug: string;
    name: string;
    city: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    logo_url: string | null;
};

export type Player = {
    id: string;
    name: string;
    position: string;
    ufl_team_id: string | null;
    headshot_url: string | null;
    is_active: boolean;
    // Joined fields
    ufl_team?: UflTeam;
};

export type FantasyLeague = {
    id: string;
    name: string;
    description: string | null;
    primary_ufl_team_id: string | null;
    season_year: number;
    is_public: boolean;
    created_by: string | null;
    created_at: string;
    // New fields
    league_code: string | null;
    max_teams: number;
    current_week: number;
    auto_generated: boolean;
    // Joined fields
    _count?: {
        members: number;
        teams: number;
    };
};

export type FantasyTeam = {
    id: string;
    league_id: string;
    user_id: string | null;
    name: string;
    avatar_url: string | null;
    wins: number;
    losses: number;
    ties: number;
    points_for: number;
    points_against: number;
    created_at: string;
    is_claimed: boolean;
};

export type FantasyWeek = {
    id: string;
    league_id: string;
    label: string;
    week_number: number;
    start_date: string | null;
    end_date: string | null;
};

export type FantasyMatchup = {
    id: string;
    league_id: string;
    week_id: string;
    home_team_id: string;
    away_team_id: string;
    home_score: number;
    away_score: number;
    // Joined fields
    home_team?: FantasyTeam;
    away_team?: FantasyTeam;
};

export type FantasyRosterEntry = {
    id: string;
    team_id: string;
    player_id: string;
    slot: string | null;
    // Joined fields
    player?: Player;
};

export type FantasyDraftPick = {
    id: string;
    league_id: string;
    round: number;
    pick_in_round: number;
    overall_pick: number;
    team_id: string;
    player_id: string | null;
    // Joined fields
    team?: FantasyTeam;
    player?: Player;
};
