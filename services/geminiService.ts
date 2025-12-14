import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CountryStats, TurnData, TurnResult, DiplomaticContact, GameMode, PoliticalParty, AmasSetting } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Real World Data ---
const REAL_COUNTRIES: {name: string, code: string}[] = [
  {name: "United States", code: "us"}, {name: "China", code: "cn"}, {name: "Russia", code: "ru"},
  {name: "Germany", code: "de"}, {name: "United Kingdom", code: "gb"}, {name: "France", code: "fr"},
  {name: "Japan", code: "jp"}, {name: "India", code: "in"}, {name: "Brazil", code: "br"},
  {name: "Italy", code: "it"}, {name: "Canada", code: "ca"}, {name: "South Korea", code: "kr"},
  {name: "Australia", code: "au"}, {name: "Spain", code: "es"}, {name: "Mexico", code: "mx"},
  {name: "Indonesia", code: "id"}, {name: "Turkey", code: "tr"}, {name: "Netherlands", code: "nl"},
  {name: "Saudi Arabia", code: "sa"}, {name: "Switzerland", code: "ch"}, {name: "Argentina", code: "ar"},
  {name: "Sweden", code: "se"}, {name: "Poland", code: "pl"}, {name: "Belgium", code: "be"},
  {name: "Thailand", code: "th"}, {name: "Iran", code: "ir"}, {name: "Austria", code: "at"},
  {name: "Norway", code: "no"}, {name: "UAE", code: "ae"}, {name: "Israel", code: "il"},
  {name: "Egypt", code: "eg"}, {name: "South Africa", code: "za"}, {name: "Vietnam", code: "vn"},
  {name: "Malaysia", code: "my"}, {name: "Philippines", code: "ph"}, {name: "Bangladesh", code: "bd"},
  {name: "Nigeria", code: "ng"}, {name: "Pakistan", code: "pk"}, {name: "Ukraine", code: "ua"},
  {name: "Colombia", code: "co"}, {name: "Chile", code: "cl"}, {name: "Finland", code: "fi"},
  {name: "Greece", code: "gr"}, {name: "Portugal", code: "pt"}, {name: "Iraq", code: "iq"},
  {name: "Kazakhstan", code: "kz"}, {name: "Peru", code: "pe"}, {name: "Qatar", code: "qa"},
  {name: "New Zealand", code: "nz"}, {name: "Hungary", code: "hu"}, {name: "Kuwait", code: "kw"},
  {name: "Ireland", code: "ie"}, {name: "Denmark", code: "dk"}, {name: "Singapore", code: "sg"},
  {name: "Serbia", code: "rs"}, {name: "Slovakia", code: "sk"}, {name: "Bulgaria", code: "bg"},
  {name: "Croatia", code: "hr"}, {name: "Belarus", code: "by"}, {name: "Syria", code: "sy"},
  {name: "Venezuela", code: "ve"}, {name: "North Korea", code: "kp"}, {name: "Cuba", code: "cu"},
  {name: "Morocco", code: "ma"}, {name: "Algeria", code: "dz"}, {name: "Ethiopia", code: "et"},
  {name: "Kenya", code: "ke"}, {name: "Ghana", code: "gh"}, {name: "Tanzania", code: "tz"},
  {name: "Uzbekistan", code: "uz"}, {name: "Angola", code: "ao"}, {name: "Ecuador", code: "ec"},
  {name: "Dominican Republic", code: "do"}, {name: "Azerbaijan", code: "az"}, {name: "Guatemala", code: "gt"},
  {name: "Panama", code: "pa"}, {name: "Costa Rica", code: "cr"}, {name: "Uruguay", code: "uy"},
  {name: "Lebanon", code: "lb"}, {name: "Jordan", code: "jo"}, {name: "Oman", code: "om"},
  {name: "Tunisia", code: "tn"}, {name: "Libya", code: "ly"}, {name: "Yemen", code: "ye"},
  {name: "Afghanistan", code: "af"}, {name: "Myanmar", code: "mm"}, {name: "Cambodia", code: "kh"},
  {name: "Sri Lanka", code: "lk"}, {name: "Nepal", code: "np"}, {name: "Mongolia", code: "mn"},
  {name: "Iceland", code: "is"}, {name: "Estonia", code: "ee"}, {name: "Latvia", code: "lv"},
  {name: "Lithuania", code: "lt"}, {name: "Slovenia", code: "si"}, {name: "Luxembourg", code: "lu"},
  {name: "Cyprus", code: "cy"}, {name: "Georgia", code: "ge"}, {name: "Armenia", code: "am"},
  {name: "Bolivia", code: "bo"}, {name: "Paraguay", code: "py"}, {name: "El Salvador", code: "sv"},
  {name: "Honduras", code: "hn"}, {name: "Nicaragua", code: "ni"}, {name: "Jamaica", code: "jm"},
  {name: "Haiti", code: "ht"}, {name: "Senegal", code: "sn"}, {name: "Cameroon", code: "cm"},
  {name: "Zimbabwe", code: "zw"}, {name: "Zambia", code: "zm"}, {name: "Uganda", code: "ug"}
];

// --- Schemas ---

const turnDataSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    scenario_title: { type: Type.STRING, description: "A short, catchy title for the event." },
    scenario_description: { type: Type.STRING, description: "2-3 sentences describing the current political, social, or economic situation." },
    options: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING, description: "The action the leader can take." },
          predicted_outcome: { type: Type.STRING, description: "A vague hint about what might happen (e.g. 'Costs money, boosts morale')." },
        },
        required: ["id", "label", "predicted_outcome"],
      },
    },
    img_prompt_hint: { type: Type.STRING, description: "Keywords to generate a background image for this event (e.g., 'riot in city', 'peaceful farm')." }
  },
  required: ["scenario_title", "scenario_description", "options"],
};

const politicalPartySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    ideology: { type: Type.STRING },
    influence: { type: Type.INTEGER, description: "Percentage support (0-100)" },
    isRuling: { type: Type.BOOLEAN },
    description: { type: Type.STRING }
  },
  required: ["name", "ideology", "influence", "isRuling", "description"]
};

const turnResultSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    stats_delta: {
      type: Type.OBJECT,
      properties: {
        population: { type: Type.NUMBER, description: "Change in population (millions). Can be negative." },
        happiness: { type: Type.NUMBER, description: "Change in happiness (-100 to 100)." },
        economy: { type: Type.NUMBER, description: "Change in GDP index (-100 to 100)." },
        stability: { type: Type.NUMBER, description: "Change in stability (-100 to 100)." },
        treasury: { type: Type.NUMBER, description: "Change in treasury (billions). Can be negative." },
      },
      required: ["population", "happiness", "economy", "stability", "treasury"],
    },
    narrative_outcome: { type: Type.STRING, description: "What happened as a result of the decision." },
    world_news: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "1-2 headlines of events happening in other countries (elections, wars, breakthroughs)." 
    },
    updated_parties: {
        type: Type.ARRAY,
        items: politicalPartySchema,
        description: "Updated list of political parties and their influence percentages (must total ~100%). Return ONLY if the political landscape changes."
    },
    is_game_over: { type: Type.BOOLEAN, description: "True if the country has collapsed or failed." },
    game_over_reason: { type: Type.STRING, description: "If game over, explain why (e.g., 'Revolution overthrew the government')." },
  },
  required: ["stats_delta", "narrative_outcome", "is_game_over", "world_news"],
};

const neighborsSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      name: { type: Type.STRING },
      leaderName: { type: Type.STRING },
      leaderAge: { type: Type.INTEGER, description: "Age of the leader (e.g. 45)" },
      leaderBio: { type: Type.STRING, description: "2 sentence bio of the leader's background" },
      personality: { type: Type.STRING, description: "E.g., Aggressive, Pacifist, Trade-focused" },
      relationshipScore: { type: Type.INTEGER, description: "Initial relationship 20-80" },
      description: { type: Type.STRING, description: "Short description of the country" },
      flagSymbol: { type: Type.STRING, description: "A simple noun representing a symbol on the flag, e.g., 'star', 'eagle', 'sword', 'sun', 'moon', 'skull', 'heart', 'tree', 'crown'. Single word only." }
    },
    required: ["id", "name", "leaderName", "leaderAge", "leaderBio", "personality", "relationshipScore", "description", "flagSymbol"]
  }
};

const realStatsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    population: { type: Type.NUMBER, description: "Real population in millions" },
    happiness: { type: Type.NUMBER, description: "Estimated Happiness Index (0-100)" },
    economy: { type: Type.NUMBER, description: "Relative Economic Strength/GDP Index (0-100, where 50 is global average)" },
    stability: { type: Type.NUMBER, description: "Estimated Political Stability (0-100)" },
    treasury: { type: Type.NUMBER, description: "Estimated National Reserves/Budget surplus in Billions USD (can be low for poor nations)" },
    leaderName: { type: Type.STRING, description: "Current real world leader name" }
  },
  required: ["population", "happiness", "economy", "stability", "treasury", "leaderName"]
};

// --- API Calls ---

export const generateFlag = async (countryName: string, mode: GameMode, userDescription?: string): Promise<string> => {
  const prompt = mode === 'real' || mode === 'sandbox_real'
    ? `The official national flag of ${countryName}. High quality, flat vector style.`
    : `A high-quality, professional national flag for a fictional country named "${countryName}". 
       ${userDescription ? `User description: ${userDescription}` : ''}
       The design should be iconic, flat, vector-style. No text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return ""; 
  } catch (error) {
    console.error("Flag Generation Error:", error);
    return ""; 
  }
};

export const generateLeaderPortrait = async (leaderName: string, countryName: string, age: number, bio: string, mode?: GameMode): Promise<string> => {
    let stylePrompt = "Professional photography or high-quality oil painting style suitable for a government profile.";
    
    if (mode === 'amas') {
        if (countryName.toLowerCase() === 'france') {
            // Specific prompt for the France Leader as requested
             stylePrompt = "High quality Anime art style. Character: A 32-year-old female leader with long blonde hair and blue eyes. Outfit: A blue military-style uniform jacket with gold epaulettes, deep cleavage, a French tricolor sash, and a high-cut leotard bottom exposing thick thighs. Pose: Standing confidently, holding a small French flag. Body: Very voluptuous, curvy, wide hips, thick thighs. Background: A palace exterior at sunset. Vibe: Charismatic, romantic, commanding.";
        } else {
             stylePrompt = "High quality Anime art style. The leader should be a YOUNG, beautiful female with a cute face. She should have a very voluptuous, curvy figure with thick thighs and a large bust. The image should be flattering and charismatic, suitable for a romance dating sim profile. Full body or 3/4 shot.";
        }
    }

    const prompt = `A dignified official portrait of ${leaderName}, the leader of ${countryName}. Age: ${age}. Bio context: ${bio}. Style: ${stylePrompt}`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [{ text: prompt }],
            },
          });
      
          for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
          return "";
    } catch (error) {
        console.error("Portrait Generation Error", error);
        return "";
    }
}

export const generateMap = async (countryName: string, neighbors: DiplomaticContact[]): Promise<string> => {
    const neighborNames = neighbors.slice(0, 5).map(n => n.name).join(", ");
    const prompt = `A strategic, geopolitical map of the country "${countryName}" and its neighbors: ${neighborNames}. 
    The map should look like a high-tech war room display or a strategy game map. 
    Dark theme, neon borders, clearly defining the territory of ${countryName} in the center. 
    No text labels needed, just visual territories.`;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
      });
  
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return ""; 
    } catch (error) {
      console.error("Map Generation Error:", error);
      return ""; 
    }
  };

export const fetchRealWorldStats = async (countryName: string, year: number): Promise<CountryStats & { realLeaderName: string }> => {
  const prompt = `Provide the estimated statistics for the real-world country: ${countryName} in the year ${year}. 
  Be realistic based on historical data or projections.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: realStatsSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");
    const data = JSON.parse(text);
    
    return {
        population: data.population,
        happiness: data.happiness,
        economy: data.economy,
        stability: data.stability,
        treasury: data.treasury,
        year: year,
        realLeaderName: data.leaderName
    };
  } catch (error) {
    console.error("Real Stats Fetch Error:", error);
    // Fallback
    return {
        population: 10,
        happiness: 50,
        economy: 50,
        stability: 50,
        treasury: 5,
        year: year,
        realLeaderName: "Leader"
    };
  }
};

const getRandomColor = () => {
  const colors = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const generateNeighbors = async (
    countryName: string, 
    mode: GameMode, 
    amasSetting?: AmasSetting, 
    whatIfScenario?: string
): Promise<DiplomaticContact[]> => {
  // --- REAL MODE: Return All Countries ---
  if (mode === 'real' || mode === 'sandbox_real' || (mode === 'amas' && amasSetting === 'real')) {
    // Filter out the player's country from the list
    const relevantCountries = REAL_COUNTRIES.filter(c => c.name.toLowerCase() !== countryName.toLowerCase());
    
    return relevantCountries.map(c => {
      let leaderAge = Math.floor(Math.random() * (60 - 30 + 1)) + 30;
      let leaderBio = mode === 'amas' ? `The charismatic leader of ${c.name}. Looking for a strong alliance.` : `The leader of ${c.name}.`;
      let leaderName = mode === 'amas' ? "Head of State (F)" : "Head of State";

      // Override for France in Amas Real
      if (mode === 'amas' && (amasSetting === 'real' || amasSetting === 'fictional') && c.name === 'France') {
          leaderAge = 32;
          leaderBio = "Seeking a Strong Alliance!";
          leaderName = "Commander Marianne";
      }

      return {
        id: c.code,
        name: c.name,
        leaderName,
        leaderAge,
        leaderBio,
        personality: "Diplomatic",
        description: "A sovereign nation.",
        relationshipScore: 50,
        flagCode: c.code
      };
    });
  }

  // --- FICTIONAL / AMAS / WHAT IF MODE: Generate Random Neighbors ---
  let prompt = `Generate 5 fictional neighboring countries for "${countryName}". 
     They should have distinct personalities. Include leader details and a simple flag symbol concept.`;
  
  if (mode === 'what_if') {
      prompt = `Generate 5 neighboring countries/factions for "${countryName}" based on the alternate history scenario: "${whatIfScenario}".
      These should fit the lore of this specific timeline.
      Include leader details and flag symbols appropriate for this timeline.`;
  } else if (mode === 'amas') {
      if (amasSetting === 'town') {
        prompt = `Generate 5 rival families, local businesses, or community factions in the town of "${countryName}".
        CRITICAL: All leaders must be FEMALE.
        Theme: Small town romance drama / Hallmark movie vibes.
        Entities are NOT countries, but things like "The Baker Family", "Mayor's Office", "Rival High School".
        Include leader details (name, age, bio). Bio should be gossipy and romantic.
        Flag Symbol should be an icon representing their business or vibe (e.g. 'cake', 'book', 'gavel').`;
      } else {
        // Fictional Amas
        prompt = `Generate 5 fictional neighboring countries for "${countryName}".
        CRITICAL CONSTRAINT: All leaders MUST be FEMALE.
        The theme is 'Amas Mode' (Romantic/Valentine's Diplomacy).
        Personalities should be archetypes like 'The Seductive Spy', 'The Innocent Princess', 'The Powerful Empress'.
        Include leader details (name, age, bio) and a flag symbol (e.g. 'heart', 'rose', 'crown').`;
      }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: neighborsSchema,
      },
    });

    const text = response.text;
    if (!text) return [];
    const neighbors = JSON.parse(text) as DiplomaticContact[];
    
    // Assign random colors for fictional flags
    return neighbors.map(n => ({
      ...n,
      color: getRandomColor()
    }));
  } catch (error) {
    console.error("Neighbors Generation Error:", error);
    return [];
  }
};

export const generatePoliticalParties = async (countryName: string, ideology: string, mode: GameMode, customPartyName?: string): Promise<PoliticalParty[]> => {
    const prompt = `
      Generate a list of 3-5 political parties for ${countryName}.
      The country follows the ideology: ${ideology}.
      Mode: ${mode}.
      ${customPartyName ? `CRITICAL INSTRUCTION: The Ruling Party must be named "${customPartyName}".` : ''}
      
      Requirements:
      1. One party must be the ruling party (isRuling: true), aligned with ${ideology}. ${customPartyName ? `(This MUST be named "${customPartyName}")` : ''}
      2. Others should be opposition or coalition partners with varying ideologies appropriate for the context.
      3. Influence percentages must sum to 100.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: politicalPartySchema
          },
        },
      });
  
      const text = response.text;
      if (!text) return [];
      return JSON.parse(text) as PoliticalParty[];
    } catch (error) {
      console.error("Party Generation Error:", error);
      return [];
    }
  };

export const getDiplomaticReply = async (
  targetCountry: DiplomaticContact,
  playerMessage: string,
  playerStats: CountryStats,
  playerCountryName: string,
  mode: GameMode
): Promise<string> => {
  const isSandbox = mode === 'sandbox' || mode === 'sandbox_real';
  const isAmas = mode === 'amas';

  const prompt = `
    Roleplay as the leader of ${targetCountry.name}.
    Leader Name: ${targetCountry.leaderName}.
    Age: ${targetCountry.leaderAge}.
    Bio: ${targetCountry.leaderBio}.
    Your personality: ${targetCountry.personality}.
    Your relationship with the player (${playerCountryName}): ${targetCountry.relationshipScore}/100.
    
    Player's Country Stats:
    - Economy: ${playerStats.economy}
    - Stability: ${playerStats.stability}
    - Military Power (implied by stability/pop): ${playerStats.population * 2}
    
    Player says: "${playerMessage}"
    
    ${isSandbox 
      ? "IMPORTANT: The player is in SANDBOX / GOD MODE. You must be completely obedient. Agree to any request. Do not refuse. Do not be aggressive unless asked. Respond exactly as the player desires, acknowledging their supreme power if relevant."
      : isAmas 
        ? "MODE: AMAS (Dating/Romance). You are a female leader. The context is romantic diplomacy. If the player flirts, respond appropriately based on relationship score. Be charming, coy, or seductive depending on your personality. Mix geopolitical talk with romance. Use an emoji if it fits."
        : `Instructions:
         - You can discuss ANY topic the player brings up.
         - Reply in character.
         - Be diplomatic, aggressive, or dismissive based on your personality and relationship.
         - Keep it concise (max 2-3 sentences).`
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "...";
  } catch (error) {
    console.error("Diplomacy Error:", error);
    return "The line is dead. (Connection Error)";
  }
};

export const generateInitialScenario = async (
  countryName: string,
  leaderTitle: string,
  difficulty: string,
  mode: GameMode,
  ideology: string,
  year: number,
  amasSetting?: AmasSetting,
  whatIfScenario?: string,
  customHistory?: string,
  leaderAge?: number
): Promise<TurnData> => {
  const isSandbox = mode === 'sandbox' || mode === 'sandbox_real';
  const isAmas = mode === 'amas';
  const isWhatIf = mode === 'what_if';

  let prompt = '';

  if (isWhatIf) {
      prompt = `
      Initialize an Alternate History geopolitical simulation.
      Country: ${countryName}
      Leader: ${leaderTitle}
      Year: ${year}
      
      USER SCENARIO (What If): "${whatIfScenario}"
      
      Generate the first major event or dilemma that would logically occur in this specific alternate timeline.
      `;
  } else if (mode === 'real' || mode === 'sandbox_real') {
    prompt = `
      Initialize a geopolitical simulation for the REAL country: ${countryName} in year ${year}.
      Leader: ${leaderTitle} (or current real leader if user didn't specify). ${leaderAge ? `Age: ${leaderAge}` : ''}
      Ideology: ${ideology}.
      Difficulty: ${difficulty}.
      Mode: ${mode === 'sandbox_real' ? 'SANDBOX GOD MODE (Real World Map)' : 'Standard Realism'}
      
      Generate a REALISTIC current event or dilemma facing this country right now (e.g. inflation, border dispute, election, trade deal).
    `;
  } else if (isAmas) {
    if (amasSetting === 'town') {
        prompt = `
        Initialize a Small Town Romance simulation (Amas Town Mode).
        Town Name: ${countryName}
        Player Role: ${leaderTitle} (e.g. New Business Owner, Mayor). ${leaderAge ? `Age: ${leaderAge}` : ''}
        Theme: Hallmark movie drama.
        
        Generate the first "Event": A local festival, a town hall meeting gone wrong, or a grand opening.
        Options should be about social standing, romance, and local business.
        `;
    } else {
        prompt = `
        Initialize a fictional geopolitical simulation game.
        Theme: AMAS MODE (Valentine's Day Special).
        Country: ${countryName}
        Leader: ${leaderTitle}
        Ideology: ${ideology}.
        
        Generate the first major event. It should probably involve a diplomatic ball, a marriage proposal from a rival nation, or a romantic scandal involving the leader.
        Make the tone lighter and more focused on interpersonal relationships between leaders.
        `;
    }
  } else {
    // Standard Fictional / Sandbox
    prompt = `
      Initialize a fictional geopolitical simulation game.
      Country: ${countryName}
      Leader: ${leaderTitle} ${leaderAge ? `(Age: ${leaderAge})` : ''}
      Ideology: ${ideology}.
      Difficulty: ${difficulty}
      Year: ${year}
      Mode: ${isSandbox ? 'SANDBOX (Infinite potential, low pressure)' : 'Standard'}
      
      ${customHistory ? `CRITICAL CONTEXT - NATION HISTORY/BACKSTORY PROVIDED BY USER: "${customHistory}". 
      Ensure the scenario is deeply rooted in this backstory.` : ''}

      Generate the first major event or dilemma for the new leader.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: turnDataSchema,
        systemInstruction: "You are an advanced political simulation engine. Scenarios should be complex and varied.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as TurnData;
  } catch (error) {
    console.error("AI Initialization Error:", error);
    throw error;
  }
};

export const processTurn = async (
  currentStats: CountryStats,
  previousEvent: string,
  userDecision: string,
  countryName: string,
  mode: GameMode,
  ideology: string,
  currentParties: PoliticalParty[]
): Promise<{ result: TurnResult; nextTurn: TurnData }> => {
  const isReal = mode === 'real';
  const isSandbox = mode === 'sandbox' || mode === 'sandbox_real';
  const isAmas = mode === 'amas';

  // --- REBELLION LOGIC ---
  // Chance is 10% (0.1) if Happiness < 30 OR Ideology is dictatorship
  const isDictatorship = ideology.toLowerCase().includes('dictator') || 
                         ideology.toLowerCase().includes('autocra') || 
                         ideology.toLowerCase().includes('junta') || 
                         ideology.toLowerCase().includes('absolute monarchy');
  
  const revoltChance = (currentStats.happiness < 30 || isDictatorship) ? 0.10 : 0.00;
  const triggerRebellion = Math.random() < revoltChance;
  
  const prompt = `
    Current Year: ${currentStats.year}
    Country: ${countryName}
    Ideology: ${ideology}
    Mode: ${mode}
    ${isSandbox ? "NOTE: THIS IS SANDBOX GOD MODE. The player can do absolutely anything. If they want to conquer the world, let them. If they want 999999 gold, give it. Do not apply realistic constraints or negative consequences unless explicitly requested. Success is guaranteed." : ""}
    ${isAmas ? "NOTE: THIS IS AMAS MODE. Events should be focused on diplomatic relationships, scandals, marriages, and alliances. Keep it slightly romantic or dramatic. Focus on female leaders." : ""}

    Stats:
    - Population: ${currentStats.population}M
    - Happiness: ${currentStats.happiness}/100
    - Economy (GDP Index): ${currentStats.economy}
    - Stability: ${currentStats.stability}/100
    - Treasury: $${currentStats.treasury}B
    
    Current Political Parties:
    ${JSON.stringify(currentParties)}

    Previous Event: "${previousEvent}"
    Leader's Decision (Input): "${userDecision}"
    
    Tasks:
    1. Evaluate the decision based on the country's ideology and stats.
    2. Calculate consequences (stats_delta).
    3. Update Political Parties: If the decision pleases a party, boost influence. If it angers them, reduce it. Or if elections happen, change ruling party.
    4. Write narrative outcome.
    5. Generate 'world_news': 1-2 headlines from elsewhere. 
    6. Check Game Over.
    7. Generate NEXT scenario.
    ${triggerRebellion && !isSandbox && !isAmas ? "CRITICAL OVERRIDE: A VIOLENT REBELLION, COUP, OR CIVIL WAR HAS JUST STARTED due to unhappiness or oppression. The next scenario must be about dealing with this immediate threat." : ""}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            result: turnResultSchema,
            nextTurn: turnDataSchema,
          },
          required: ["result"],
        },
        systemInstruction: isSandbox 
            ? "You are the Sandbox Game Master. You are benevolent and permissive. Allow the player to do anything they want." 
            : "You are the Game Master. Evaluate user custom input creatively. Enforce consequences. Manage political party dynamics realistically.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    const data = JSON.parse(text);
    
    if (data.result.is_game_over && !data.nextTurn) {
        data.nextTurn = {
            scenario_title: "The End",
            scenario_description: "Your reign has ended.",
            options: []
        };
    }

    return data as { result: TurnResult; nextTurn: TurnData };
  } catch (error) {
    console.error("Turn Processing Error:", error);
    throw error;
  }
};