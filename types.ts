export interface CountryStats {
  population: number; // In millions
  happiness: number; // 0-100
  economy: number; // GDP Index (arbitrary units, starts at 100)
  stability: number; // 0-100
  treasury: number; // Billions
  year: number;
}

export interface GameOption {
  id: string;
  label: string;
  predicted_outcome: string;
}

export interface TurnData {
  scenario_title: string;
  scenario_description: string;
  options: GameOption[];
  img_prompt_hint?: string; // Optional hint for background generation
}

export interface PoliticalParty {
  name: string;
  ideology: string;
  influence: number; // 0-100%
  isRuling: boolean;
  description: string;
}

export interface TurnResult {
  stats_delta: {
    population: number;
    happiness: number;
    economy: number;
    stability: number;
    treasury: number;
  };
  narrative_outcome: string;
  world_news: string[]; 
  updated_parties?: PoliticalParty[]; // New: AI can update party stats
  is_game_over: boolean;
  game_over_reason?: string;
}

export interface HistoryEntry {
  year: number;
  event: string;
  decision: string;
  outcome: string;
  statsSnapshot: CountryStats;
  news?: string[];
}

export interface ChatMessage {
  sender: 'player' | 'ai';
  text: string;
  timestamp: number;
}

export interface DiplomaticContact {
  id: string;
  name: string;
  leaderName: string;
  leaderAge: number; // New
  leaderBio: string; // New
  leaderImgUrl?: string; // New
  personality: string;
  description: string;
  relationshipScore: number; // 0-100
  flagCode?: string; // ISO 2-digit code for real countries
  color?: string; // Hex color for fictional countries
  flagSymbol?: string; // New: E.g., 'star', 'sword', 'shield'
}

export type GameMode = 'fictional' | 'real' | 'sandbox' | 'sandbox_real' | 'amas' | 'what_if';
export type AmasSetting = 'fictional' | 'real' | 'town';

export interface GameState {
  isStarted: boolean;
  isLoading: boolean;
  gameMode: GameMode;
  amasSetting?: AmasSetting;
  whatIfScenario?: string;
  customHistory?: string; // New: User defined history
  countryName: string;
  leaderTitle: string;
  ideology: string;
  flagUrl: string | null;
  mapUrl: string | null;
  difficulty: 'easy' | 'normal' | 'hard';
  stats: CountryStats;
  currentTurnData: TurnData | null;
  history: HistoryEntry[];
  neighbors: DiplomaticContact[];
  chats: Record<string, ChatMessage[]>;
  latestNews: string[];
  parties: PoliticalParty[]; // New: List of parties
  gameOver: boolean;
  gameOverReason: string | null;
}