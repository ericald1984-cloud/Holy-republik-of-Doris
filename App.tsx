import React, { useState, useEffect, useRef } from 'react';
import { GameState, HistoryEntry, ChatMessage, GameMode, PoliticalParty, AmasSetting } from './types';
import { generateInitialScenario, processTurn, generateNeighbors, getDiplomaticReply, fetchRealWorldStats, generateMap, generatePoliticalParties } from './services/geminiService';
import GameSetup from './components/GameSetup';
import StatsDisplay from './components/StatsDisplay';
import TrendChart from './components/TrendChart';
import DiplomacyTerminal from './components/DiplomacyTerminal';
import MapView from './components/MapView';
import LeadersView from './components/LeadersView';
import { Terminal, Activity, AlertTriangle, ArrowRight, Skull, History as HistoryIcon, RotateCcw, MessageSquare, BarChart3, Map as MapIcon, Globe, Send, ChevronRight, PieChart, Wrench, Coins, Smile, ShieldCheck, RefreshCw, Users, Heart, Layers } from 'lucide-react';

const INITIAL_STATE: GameState = {
  isStarted: false,
  isLoading: false,
  gameMode: 'fictional',
  countryName: '',
  leaderTitle: '',
  ideology: 'Liberal Democracy',
  flagUrl: null,
  mapUrl: null,
  difficulty: 'normal',
  stats: {
    population: 10,
    happiness: 50,
    economy: 50,
    stability: 60,
    treasury: 5,
    year: 2024,
  },
  currentTurnData: null,
  history: [],
  neighbors: [],
  chats: {},
  latestNews: [],
  parties: [],
  gameOver: false,
  gameOverReason: null,
};

const DEMOCRATIC_IDEOLOGIES = [
    "Liberal Democracy", "Social Democracy", "Representative Democracy", "Direct Democracy", 
    "Republic", "Federal Republic", "Parliamentary Republic", "Christian Democracy",
    "Constitutional Monarchy"
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [lastOutcome, setLastOutcome] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'intel' | 'diplomacy' | 'map' | 'leaders'>('intel');
  const [isChatThinking, setIsChatThinking] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [customAction, setCustomAction] = useState('');
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'intel' && historyEndRef.current) {
        historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gameState.history, lastOutcome, activeTab]);

  const startGame = async (
      name: string, 
      leader: string, 
      difficulty: 'easy' | 'normal' | 'hard', 
      flagUrl: string | null, 
      mode: GameMode, 
      ideology: string, 
      startYear: number,
      amasSetting?: AmasSetting,
      whatIfScenario?: string,
      customHistory?: string,
      leaderAge?: number,
      partyName?: string
  ) => {
    setGameState(prev => ({ 
        ...prev, 
        isLoading: true, 
        countryName: name, 
        leaderTitle: leader, 
        difficulty, 
        flagUrl, 
        gameMode: mode, 
        ideology,
        amasSetting,
        whatIfScenario,
        customHistory
    }));
    
    // Default stats
    let stats = { ...INITIAL_STATE.stats, year: startYear };
    
    // Sandbox Override (Both Fictional and Real Sandbox start with boosted stats)
    if (mode === 'sandbox' || mode === 'sandbox_real') {
        stats = {
            population: 50,
            happiness: 100,
            economy: 100,
            stability: 100,
            treasury: 1000,
            year: startYear
        };
    } else if (mode === 'fictional' || mode === 'amas' || mode === 'what_if') {
      // Adjust initial stats based on difficulty for fictional mode
      if (difficulty === 'easy') {
          stats.treasury = 20; stats.stability = 80; stats.economy = 70;
      } else if (difficulty === 'hard') {
          stats.treasury = 2; stats.stability = 40; stats.economy = 40;
      }
    }

    try {
      // 1. If Real World (or Sandbox Real), fetch stats first 
      // Note: For Sandbox Real, we might want real stats OR god stats. 
      // Let's stick to GOD stats for sandbox, but maybe use real leader name if not provided.
      let realLeader = leader;
      const isRealMode = mode === 'real' || (mode === 'amas' && amasSetting === 'real') || mode === 'sandbox_real';
      
      if (isRealMode) {
         // Fetch real data to get the leader name and potentially population if we want realism
         const realData = await fetchRealWorldStats(name, startYear);
         
         if (mode !== 'sandbox_real') {
             // Only overwrite stats if NOT sandbox. Sandbox keeps God stats.
             stats = { 
                population: realData.population,
                happiness: realData.happiness,
                economy: realData.economy,
                stability: realData.stability,
                treasury: realData.treasury,
                year: startYear
             };
         }
         
         if (!leader || leader === "Current Leader") {
            realLeader = realData.realLeaderName;
         }
      }

      setGameState(prev => ({ ...prev, leaderTitle: realLeader, stats }));

      // 2. Parallel Generation: Neighbors, Scenario, and potentially Political Parties
      const isDemocratic = DEMOCRATIC_IDEOLOGIES.some(d => ideology.includes(d) || ideology.includes("Democracy") || ideology.includes("Republic"));
      
      // Amas Town mode doesn't need political parties usually, but we'll leave it in for "factions"
      
      const promises: any[] = [
        generateInitialScenario(name, realLeader, difficulty, mode, ideology, startYear, amasSetting, whatIfScenario, customHistory, leaderAge),
        generateNeighbors(name, mode, amasSetting, whatIfScenario)
      ];
      
      if (isDemocratic && amasSetting !== 'town') {
          promises.push(generatePoliticalParties(name, ideology, mode, partyName));
      }

      const results = await Promise.all(promises);
      const turnData = results[0];
      const neighbors = results[1];
      const parties = (isDemocratic && amasSetting !== 'town') ? results[2] : [];

      setGameState(prev => ({
        ...prev,
        isStarted: true,
        isLoading: false,
        stats,
        leaderTitle: realLeader,
        currentTurnData: turnData,
        neighbors,
        parties
      }));

      // 3. Map Generation
      // FIXED: Generate map for Real Mode too, instead of using static image.
      setIsMapLoading(true);
      generateMap(name, neighbors).then(url => {
          setGameState(prev => ({ ...prev, mapUrl: url }));
          setIsMapLoading(false);
      }).catch(() => setIsMapLoading(false));

    } catch (error) {
      console.error(error);
      alert("Failed to initialize simulation. Please check API Key.");
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDecision = async (decisionLabel: string) => {
    if (!gameState.currentTurnData) return;

    setGameState(prev => ({ ...prev, isLoading: true }));
    setLastOutcome(null);

    try {
      const { result, nextTurn } = await processTurn(
        gameState.stats,
        gameState.currentTurnData.scenario_description,
        decisionLabel,
        gameState.countryName,
        gameState.gameMode,
        gameState.ideology,
        gameState.parties
      );

      // Calculate new stats
      const newStats = {
        population: Math.max(0, gameState.stats.population + result.stats_delta.population),
        happiness: Math.max(0, Math.min(100, gameState.stats.happiness + result.stats_delta.happiness)),
        economy: Math.max(0, Math.min(100, gameState.stats.economy + result.stats_delta.economy)),
        stability: Math.max(0, Math.min(100, gameState.stats.stability + result.stats_delta.stability)),
        treasury: gameState.stats.treasury + result.stats_delta.treasury,
        year: gameState.stats.year + 1,
      };

      const historyEntry: HistoryEntry = {
        year: gameState.stats.year,
        event: gameState.currentTurnData.scenario_title,
        decision: decisionLabel,
        outcome: result.narrative_outcome,
        statsSnapshot: newStats,
        news: result.world_news
      };

      setLastOutcome(result.narrative_outcome);
      setCustomAction(''); // Clear custom action if used

      // Check for Game Over - UNLESS IT IS SANDBOX MODE
      const isSandbox = gameState.gameMode === 'sandbox' || gameState.gameMode === 'sandbox_real';
      const isGameOver = !isSandbox && (result.is_game_over || newStats.stability <= 0 || newStats.population <= 0);

      setGameState(prev => ({
        ...prev,
        isLoading: false,
        stats: newStats,
        history: [...prev.history, historyEntry],
        parties: result.updated_parties || prev.parties, // Update parties if AI returned changes
        currentTurnData: nextTurn,
        latestNews: result.world_news || [],
        gameOver: isGameOver,
        gameOverReason: isGameOver ? (result.game_over_reason || (newStats.stability <= 0 ? "Nation collapsed into anarchy." : "Population annihilated.")) : null,
      }));

    } catch (error) {
      console.error(error);
      alert("Simulation Error. Trying to recover...");
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAction.trim() && !gameState.isLoading) {
      handleDecision(customAction);
    }
  };

  const handleSendMessage = async (neighborId: string, text: string) => {
    const neighbor = gameState.neighbors.find(n => n.id === neighborId);
    if (!neighbor) return;

    const userMsg: ChatMessage = { sender: 'player', text, timestamp: Date.now() };
    
    setGameState(prev => ({
      ...prev,
      chats: {
        ...prev.chats,
        [neighborId]: [...(prev.chats[neighborId] || []), userMsg]
      }
    }));

    setIsChatThinking(true);

    try {
      const replyText = await getDiplomaticReply(
        neighbor,
        text,
        gameState.stats,
        gameState.countryName,
        gameState.gameMode
      );

      const aiMsg: ChatMessage = { sender: 'ai', text: replyText, timestamp: Date.now() };

      setGameState(prev => ({
        ...prev,
        chats: {
          ...prev.chats,
          [neighborId]: [...(prev.chats[neighborId] || []), aiMsg]
        }
      }));
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsChatThinking(false);
    }
  };

  const updateSandboxStats = (updates: Partial<typeof gameState.stats>) => {
      setGameState(prev => ({
          ...prev,
          stats: { ...prev.stats, ...updates }
      }));
  };

  const resetGame = () => {
    setGameState(INITIAL_STATE);
    setLastOutcome(null);
  };

  if (!gameState.isStarted) {
    return <GameSetup onStart={startGame} isLoading={gameState.isLoading} />;
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-blue-500/30">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {gameState.flagUrl ? (
                        <img src={gameState.flagUrl} alt="Flag" className="w-10 h-6 object-cover rounded shadow-sm border border-zinc-700" />
                    ) : (
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <Terminal size={18} className="text-white" />
                        </div>
                    )}
                    <div>
                        <h2 className="font-bold text-white leading-none">{gameState.countryName}</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 font-mono uppercase">Role: {gameState.leaderTitle}</span>
                            <span className="text-xs text-blue-500 font-mono uppercase px-1.5 py-0.5 bg-blue-500/10 rounded">{gameState.ideology}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {gameState.gameMode === 'amas' && <Heart size={16} className="text-pink-500 animate-pulse" />}
                    {gameState.gameMode === 'what_if' && <Globe size={16} className="text-purple-500" />}
                    {gameState.gameMode === 'sandbox_real' && <Layers size={16} className="text-blue-500" />}
                    
                    {(gameState.gameMode === 'sandbox' || gameState.gameMode === 'sandbox_real') && (
                        <div className="flex items-center gap-1">
                             <span className="text-yellow-500 text-xs font-bold mr-2 border border-yellow-500/50 px-2 py-1 rounded bg-yellow-500/10">[GOD MODE]</span>
                             <button onClick={() => updateSandboxStats({treasury: gameState.stats.treasury + 100})} className="p-1 hover:bg-zinc-800 rounded text-yellow-500" title="Add $100B"><Coins size={16}/></button>
                             <button onClick={() => updateSandboxStats({happiness: 100})} className="p-1 hover:bg-zinc-800 rounded text-blue-500" title="Max Happiness"><Smile size={16}/></button>
                             <button onClick={() => updateSandboxStats({stability: 100})} className="p-1 hover:bg-zinc-800 rounded text-emerald-500" title="Max Stability"><ShieldCheck size={16}/></button>
                             <button onClick={resetGame} className="p-1 hover:bg-zinc-800 rounded text-red-500" title="Change Country / Restart"><RefreshCw size={16}/></button>
                        </div>
                    )}
                    <div className="text-xs font-mono text-zinc-600 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        SIMULATION ACTIVE
                    </div>
                </div>
            </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
            <StatsDisplay stats={gameState.stats} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Narrative & Decisions */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* Game Over Screen */}
                    {gameState.gameOver ? (
                        <div className="bg-red-950/30 border border-red-900 rounded-xl p-8 text-center animate-in fade-in slide-in-from-bottom-4">
                            <Skull className="mx-auto text-red-500 mb-4" size={48} />
                            <h2 className="text-3xl font-bold text-white mb-2">REGIME FALLEN</h2>
                            <p className="text-red-200 text-lg mb-6">{gameState.gameOverReason}</p>
                            <div className="text-zinc-400 font-mono text-sm mb-8">
                                Ruled for {gameState.stats.year - 2024} years
                            </div>
                            <button 
                                onClick={resetGame}
                                className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2 mx-auto"
                            >
                                <RotateCcw size={18} /> Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Current Scenario Card */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl relative">
                                {gameState.isLoading && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <span className="font-mono text-sm animate-pulse">Processing Outcome...</span>
                                    </div>
                                )}
                                
                                {/* Image Placeholder/Banner */}
                                <div className="h-48 w-full bg-zinc-800 relative overflow-hidden">
                                     <img 
                                        src={`https://picsum.photos/800/400?grayscale&blur=2&random=${gameState.stats.year}`} 
                                        alt="Scenario Background" 
                                        className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                                     />
                                     <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-zinc-900 to-transparent w-full">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 mb-3">
                                            <AlertTriangle size={12} />
                                            PRIORITY ALERT
                                        </div>
                                        <h2 className="text-3xl font-bold text-white shadow-black drop-shadow-lg">{gameState.currentTurnData?.scenario_title}</h2>
                                     </div>
                                </div>

                                <div className="p-6">
                                    <p className="text-lg text-zinc-300 leading-relaxed mb-8 font-light">
                                        {gameState.currentTurnData?.scenario_description}
                                    </p>

                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Available Actions</h3>
                                        {gameState.currentTurnData?.options.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => handleDecision(option.label)}
                                                disabled={gameState.isLoading}
                                                className="w-full text-left p-4 rounded-lg bg-black border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 transition-all group relative overflow-hidden"
                                            >
                                                <div className="relative z-10 flex justify-between items-center">
                                                    <div>
                                                        <span className="block font-bold text-zinc-200 group-hover:text-white transition-colors">
                                                            {option.label}
                                                        </span>
                                                        <span className="text-xs text-zinc-500 mt-1 block font-mono">
                                                            Projection: {option.predicted_outcome}
                                                        </span>
                                                    </div>
                                                    <ArrowRight className="text-zinc-700 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" size={20} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom Executive Order Input */}
                                    <div className="mt-8 pt-6 border-t border-zinc-800">
                                         <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Or Execute Custom Directive</h3>
                                         <form onSubmit={handleCustomSubmit} className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <ChevronRight className="absolute left-3 top-3 text-zinc-500" size={16} />
                                                <input
                                                    type="text"
                                                    value={customAction}
                                                    onChange={(e) => setCustomAction(e.target.value)}
                                                    placeholder="Type your executive order here..."
                                                    className="w-full bg-zinc-950 border border-zinc-700 text-white pl-9 pr-4 py-3 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-zinc-600 font-mono text-sm"
                                                    disabled={gameState.isLoading}
                                                />
                                            </div>
                                            <button 
                                                type="submit"
                                                disabled={!customAction.trim() || gameState.isLoading}
                                                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 rounded-lg disabled:opacity-50 transition-colors"
                                            >
                                                <Send size={18} />
                                            </button>
                                         </form>
                                    </div>
                                </div>
                            </div>

                            {/* Previous Outcome Display */}
                            {lastOutcome && (
                                <div className="p-4 bg-zinc-900/50 border-l-4 border-emerald-500 rounded-r-lg animate-in fade-in slide-in-from-top-2">
                                    <div className="text-xs font-bold text-emerald-500 uppercase mb-1 flex items-center gap-2">
                                        <Activity size={12} /> Previous Turn Result
                                    </div>
                                    <p className="text-zinc-300 italic">{lastOutcome}</p>
                                </div>
                            )}

                             {/* World News Ticker / Section */}
                            {gameState.latestNews && gameState.latestNews.length > 0 && (
                                <div className="bg-black border border-zinc-800 rounded-lg p-4">
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Globe size={14} className="text-blue-500" /> Global News Wire
                                    </h3>
                                    <div className="space-y-2">
                                        {gameState.latestNews.map((news, idx) => (
                                            <div key={idx} className="flex gap-3 items-start border-l-2 border-zinc-800 pl-3">
                                                <span className="text-xs font-mono text-zinc-600 mt-1">BREAKING</span>
                                                <p className="text-sm text-zinc-300">{news}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Right Column: Tools & Intel */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    {/* Tab Switcher */}
                    <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 overflow-x-auto">
                        <button 
                            onClick={() => setActiveTab('intel')}
                            className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                                activeTab === 'intel' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <BarChart3 size={16} /> Intel
                        </button>
                        <button 
                            onClick={() => setActiveTab('map')}
                            className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                                activeTab === 'map' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <MapIcon size={16} /> Map
                        </button>
                        <button 
                            onClick={() => setActiveTab('leaders')}
                            className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                                activeTab === 'leaders' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <Users size={16} /> Leaders
                        </button>
                        <button 
                            onClick={() => setActiveTab('diplomacy')}
                            className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                                activeTab === 'diplomacy' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <MessageSquare size={16} /> Comms
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1">
                        {activeTab === 'intel' && (
                            <div className="space-y-6">
                                <TrendChart history={gameState.history} />
                                
                                {gameState.parties.length > 0 && (
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                                        <h3 className="font-bold text-zinc-300 flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                                            <PieChart size={16} />
                                            {gameState.amasSetting === 'town' ? 'Town Factions' : 'Political Landscape'}
                                        </h3>
                                        <div className="space-y-3">
                                            {gameState.parties.map((party, idx) => (
                                                <div key={idx} className="flex flex-col gap-1">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${party.isRuling ? 'bg-blue-500 animate-pulse' : 'bg-zinc-600'}`}></span>
                                                            <span className="font-bold text-zinc-300">{party.name}</span>
                                                            {party.isRuling && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded uppercase">Ruling</span>}
                                                        </div>
                                                        <span className="font-mono text-zinc-400">{party.influence}%</span>
                                                    </div>
                                                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${party.isRuling ? 'bg-blue-500' : 'bg-zinc-500'}`} 
                                                            style={{ width: `${party.influence}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-xs text-zinc-500 truncate">{party.ideology} • {party.description}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[500px]">
                                    <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
                                        <h3 className="font-bold text-zinc-300 flex items-center gap-2">
                                            <HistoryIcon size={16} />
                                            Annals of History
                                        </h3>
                                        <span className="text-xs text-zinc-600 font-mono">LOG_V.1.0</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {gameState.history.length === 0 ? (
                                            <div className="text-center text-zinc-600 py-12 italic">History is yet to be written...</div>
                                        ) : (
                                            gameState.history.map((entry, idx) => (
                                                <div key={idx} className="border-b border-zinc-800 pb-4 last:border-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <span className="text-xs font-mono text-blue-500">Year {entry.year}</span>
                                                        <span className="text-[10px] text-zinc-600 uppercase">Archive</span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-zinc-300">{entry.event}</h4>
                                                    <div className="mt-1 text-xs text-zinc-500 pl-2 border-l-2 border-zinc-700">
                                                        <span className="block text-zinc-400 font-medium">Action: {entry.decision}</span>
                                                        <span className="block italic mt-1">{entry.outcome}</span>
                                                    </div>
                                                    {/* Inline news history */}
                                                    {entry.news && entry.news.length > 0 && (
                                                        <div className="mt-2 text-xs text-zinc-600 bg-black/20 p-2 rounded">
                                                            <div className="font-mono text-[10px] uppercase mb-1">Global Headlines:</div>
                                                            {entry.news.map((n, i) => (
                                                                <div key={i} className="italic">- {n}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                        <div ref={historyEndRef} />
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'map' && (
                           <MapView 
                                mapUrl={gameState.mapUrl} 
                                countryName={gameState.countryName} 
                                isLoading={isMapLoading}
                            />
                        )}

                        {activeTab === 'leaders' && (
                           <LeadersView 
                                neighbors={gameState.neighbors}
                                countryName={gameState.countryName}
                                mode={gameState.gameMode}
                            />
                        )}

                        {activeTab === 'diplomacy' && (
                            <DiplomacyTerminal 
                                neighbors={gameState.neighbors}
                                chats={gameState.chats}
                                onSendMessage={handleSendMessage}
                                isThinking={isChatThinking}
                            />
                        )}
                    </div>
                </div>

            </div>
        </main>
    </div>
  );
};

export default App;