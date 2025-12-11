import { UflTeam } from '@/types/fantasy';

export interface TeamBrand {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string; // Optional for now
}

// Fallback colors if DB is missing them or for UI consistency
const TEAM_COLORS: Record<string, TeamBrand> = {
    'bham-stallions': { primaryColor: '#a51417', secondaryColor: '#B0B7BC' },
    'col-aviators': { primaryColor: '#001f3f', secondaryColor: '#ffffff' },
    'dal-renegades': { primaryColor: '#6399bb', secondaryColor: '#000000' },
    'dc-defenders': { primaryColor: '#CE1126', secondaryColor: '#ffffff' },
    'hou-gamblers': { primaryColor: '#000000', secondaryColor: '#FDBB30' },
    'lou-kings': { primaryColor: '#1a3c34', secondaryColor: '#d4af37' },
    'orl-storm': { primaryColor: '#ff5200', secondaryColor: '#002C5F' },
    'stl-battlehawks': { primaryColor: '#005AC6', secondaryColor: '#A4A9AD' },
    // Keep standard UFL ones just in case
    'mem-showboats': { primaryColor: '#002C5F', secondaryColor: '#FDBB30' },
    'sa-brahmas': { primaryColor: '#FDBB30', secondaryColor: '#121212' },
    'mich-panthers': { primaryColor: '#A33338', secondaryColor: '#B0B7BC' },
};

export const getTeamBrand = (team?: UflTeam | null): TeamBrand => {
    if (!team) {
        // Default brand (e.g. Stallions or Neutral)
        return { primaryColor: '#1f2937', secondaryColor: '#9ca3af' };
    }

    // Use DB colors if available, else fallback to hardcoded map by slug
    if (team.primary_color) {
        return {
            primaryColor: team.primary_color,
            secondaryColor: team.secondary_color || '#ffffff',
            logoUrl: team.logo_url || undefined,
        };
    }

    const hardcoded = TEAM_COLORS[team.slug];
    if (hardcoded) return hardcoded;

    return { primaryColor: '#333333', secondaryColor: '#999999' };
};
