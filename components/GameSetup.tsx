import React, { useState } from 'react';
import { Globe, Crown, Zap, Play, Flag, Wand2, MapPin, Box, Scale, Calendar, Upload, Heart, BookOpen, HelpCircle, Layers, ScrollText, Users } from 'lucide-react';
import { generateFlag } from '../services/geminiService';
import { GameMode, AmasSetting } from '../types';

interface Props {
  onStart: (name: string, leader: string, diff: 'easy' | 'normal' | 'hard', flagUrl: string | null, mode: GameMode, ideology: string, startYear: number, amasSetting?: AmasSetting, whatIfScenario?: string, customHistory?: string, leaderAge?: number, partyName?: string) => void;
  isLoading: boolean;
}

const IDEOLOGIES = [
  "Liberal Democracy", "Social Democracy", "Representative Democracy", "Direct Democracy", "Constitutional Monarchy",
  "Republic", "Federal Republic", "Parliamentary Republic", 
  "Autocracy", "Absolute Monarchy", "Dictatorship", "Military Junta (Stratocracy)", 
  "Communism", "Socialism", "Marxism-Leninism", "Trotskyism", "Maoism", "Democratic Socialism",
  "Fascism", "National Socialism", "Ultranationalism",
  "Theocracy", "Islamic Republic", "Christian Democracy",
  "Libertarianism", "Minarchism", "Anarcho-Capitalism",
  "Anarchism", "Anarcho-Communism", "Syndicalism",
  "Technocracy", "Cyberocracy", "Noocracy",
  "Oligarchy", "Plutocracy", "Corporatocracy", "Kleptocracy",
  "Environmentalism (Green Politics)", "Eco-Socialism", "Eco-Fascism",
  "Feudalism", "Imperialism", "Colonialism",
  "Centrism", "Conservatism", "Liberalism", "Progressivism", "Populism"
].sort();

const GameSetup: React.FC<Props> = ({ onStart, isLoading }) => {
  const [mode, setMode] = useState<GameMode>('fictional');
  const [amasSetting, setAmasSetting] = useState<AmasSetting>('fictional');
  const [whatIfScenario, setWhatIfScenario] = useState('');
  const [customHistory, setCustomHistory] = useState('');
  const [name, setName] = useState('');
  const [leader, setLeader] = useState('');
  const [leaderAge, setLeaderAge] = useState<number>(45);
  const [partyName, setPartyName] = useState('');
  const [ideology, setIdeology] = useState("Liberal Democracy");
  const [diff, setDiff] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [year, setYear] = useState<number>(2024);
  const [flagDesc, setFlagDesc] = useState('');
  const [flagUrl, setFlagUrl] = useState<string | null>(null);
  const [isGeneratingFlag, setIsGeneratingFlag] = useState(false);

  const handleGenerateFlag = async () => {
    if (!name) return;
    setIsGeneratingFlag(true);
    try {
      const url = await generateFlag(name, mode, flagDesc || ideology);
      if (url) setFlagUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingFlag(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFlagUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      onStart(name, leader || (mode === 'real' || mode === 'sandbox_real' ? 'Current Leader' : 'President'), diff, flagUrl, mode, ideology, year, amasSetting, whatIfScenario, customHistory, leaderAge, partyName);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-grid-zinc-900/[0.2] relative overflow-hidden py-10">
       <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

      <div className="z-10 w-full max-w-lg p-8 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-600/20 rounded-lg">
                <Globe className="text-blue-500" size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">PolisAI</h1>
                <p className="text-zinc-400 text-sm">Geopolitical Strategy Engine</p>
            </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8 bg-zinc-900 p-1 rounded-lg">
            <button type="button" onClick={() => setMode('fictional')} className={`py-2 px-1 rounded-md text-[10px] md:text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${mode === 'fictional' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <Crown size={14} /> Fictional
            </button>
            <button type="button" onClick={() => setMode('real')} className={`py-2 px-1 rounded-md text-[10px] md:text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${mode === 'real' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <MapPin size={14} /> Real
            </button>
             <button type="button" onClick={() => setMode('sandbox')} className={`py-2 px-1 rounded-md text-[10px] md:text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${mode === 'sandbox' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <Box size={14} /> Sandbox (Fictional)
            </button>
            <button type="button" onClick={() => setMode('sandbox_real')} className={`py-2 px-1 rounded-md text-[10px] md:text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${mode === 'sandbox_real' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <Layers size={14} /> Sandbox (Real)
            </button>
            <button type="button" onClick={() => setMode('what_if')} className={`py-2 px-1 rounded-md text-[10px] md:text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${mode === 'what_if' ? 'bg-purple-900/50 text-purple-200 shadow' : 'text-purple-600/50 hover:text-purple-400'}`} title="Alt History">
                <BookOpen size={14} /> What If
            </button>
            <button type="button" onClick={() => setMode('amas')} className={`py-2 px-1 rounded-md text-[10px] md:text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${mode === 'amas' ? 'bg-pink-900/50 text-pink-200 shadow' : 'text-pink-600/50 hover:text-pink-400'}`} title="Valentine's Special">
                <Heart size={14} /> Amas
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* WHAT IF SCENARIO INPUT */}
          {mode === 'what_if' && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-xs uppercase font-bold text-purple-400 tracking-wider">Alternate History Scenario</label>
                <textarea
                    required
                    value={whatIfScenario}
                    onChange={(e) => setWhatIfScenario(e.target.value)}
                    placeholder="e.g. What if Napoleon won Waterloo? What if the Roman Empire never fell?"
                    className="w-full bg-purple-950/20 border border-purple-800/50 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all placeholder:text-purple-700 h-24 text-sm"
                />
              </div>
          )}

          {/* AMAS SETTING SELECTOR */}
          {mode === 'amas' && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                 <label className="text-xs uppercase font-bold text-pink-400 tracking-wider">Romance Setting</label>
                 <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => setAmasSetting('fictional')} className={`py-2 rounded border text-xs font-bold ${amasSetting === 'fictional' ? 'bg-pink-900/40 border-pink-500 text-pink-200' : 'border-zinc-800 text-zinc-500'}`}>Fictional World</button>
                    <button type="button" onClick={() => setAmasSetting('real')} className={`py-2 rounded border text-xs font-bold ${amasSetting === 'real' ? 'bg-pink-900/40 border-pink-500 text-pink-200' : 'border-zinc-800 text-zinc-500'}`}>Real World</button>
                    <button type="button" onClick={() => setAmasSetting('town')} className={`py-2 rounded border text-xs font-bold ${amasSetting === 'town' ? 'bg-pink-900/40 border-pink-500 text-pink-200' : 'border-zinc-800 text-zinc-500'}`}>Small Town</button>
                 </div>
              </div>
          )}

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">
                    {mode === 'real' || mode === 'sandbox_real' ? 'Country' : mode === 'amas' && amasSetting === 'town' ? 'Town Name' : 'Nation Name'}
                </label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-zinc-600" size={18} />
                    <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={mode === 'real' || mode === 'sandbox_real' ? "e.g. France" : mode === 'amas' && amasSetting === 'town' ? "e.g. Stars Hollow" : "e.g. Nova"}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-2 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-zinc-700"
                    />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Start Year</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-zinc-600" size={18} />
                    <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-zinc-700"
                    />
                </div>
              </div>
          </div>

           {/* LEADER AGE AND PARTY NAME */}
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">
                    Leader Age
                </label>
                <div className="relative">
                    <Users className="absolute left-3 top-3 text-zinc-600" size={18} />
                    <input
                    type="number"
                    min={18}
                    max={100}
                    value={leaderAge}
                    onChange={(e) => setLeaderAge(parseInt(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-2 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-zinc-700"
                    />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Ruling Party</label>
                <div className="relative">
                    <Flag className="absolute left-3 top-3 text-zinc-600" size={18} />
                    <input
                    type="text"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder="e.g. The People's Front"
                    className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-zinc-700"
                    />
                </div>
              </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">
                 {mode === 'amas' && amasSetting === 'town' ? 'Your Role' : 'Leader Title / Name'}
            </label>
            <div className="relative">
                <Zap className="absolute left-3 top-3 text-zinc-600" size={18} />
                <input
                type="text"
                value={leader}
                onChange={(e) => setLeader(e.target.value)}
                placeholder={mode === 'real' || mode === 'sandbox_real' ? "Leave empty for real leader" : "e.g. President, Mayor"}
                className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-zinc-700"
                />
            </div>
          </div>

          {/* CUSTOM HISTORY INPUT FOR FICTIONAL MODE */}
          {mode === 'fictional' && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Nation History / Backstory (Optional)</label>
                <div className="relative">
                    <ScrollText className="absolute left-3 top-3 text-zinc-600" size={18} />
                    <textarea
                        value={customHistory}
                        onChange={(e) => setCustomHistory(e.target.value)}
                        placeholder="e.g. A former colony that gained independence through a peaceful revolution. Known for its rich iron mines and ancient traditions..."
                        className="w-full bg-zinc-900 border border-zinc-800 text-white px-10 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-zinc-700 h-24 text-sm resize-none"
                    />
                </div>
              </div>
          )}

          {amasSetting !== 'town' && (
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Ideology</label>
                <div className="relative">
                    <Scale className="absolute left-3 top-3 text-zinc-600" size={18} />
                    <select
                    value={ideology}
                    onChange={(e) => setIdeology(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all appearance-none cursor-pointer text-sm"
                    >
                    {IDEOLOGIES.map(i => (
                        <option key={i} value={i}>{i}</option>
                    ))}
                    </select>
                </div>
              </div>
          )}

          <div className="space-y-2">
            <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">
                {amasSetting === 'town' ? 'Town Emblem' : 'National Flag'}
            </label>
            <div className="flex gap-2 mb-2 items-center">
                <div className="relative flex-1">
                    <Flag className="absolute left-3 top-3 text-zinc-600" size={18} />
                    <input
                    type="text"
                    value={flagDesc}
                    onChange={(e) => setFlagDesc(e.target.value)}
                    placeholder={mode === 'real' || mode === 'sandbox_real' ? "Auto-generated" : "Description (optional)"}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-zinc-700"
                    />
                </div>
                
                <label className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-3 rounded-lg cursor-pointer transition-colors" title="Upload Flag">
                    <Upload size={20} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>

                <button
                    type="button"
                    onClick={handleGenerateFlag}
                    disabled={!name || isGeneratingFlag}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                    title="Generate AI Flag"
                >
                    {isGeneratingFlag ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <Wand2 size={20} />}
                </button>
            </div>
            
            {flagUrl && (
                <div className="w-full h-32 bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden flex items-center justify-center relative group">
                    <img src={flagUrl} alt="National Flag" className="w-full h-full object-cover" />
                    <button 
                        type="button" 
                        onClick={() => setFlagUrl(null)}
                        className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        ✕
                    </button>
                </div>
            )}
          </div>

          {mode !== 'sandbox' && mode !== 'sandbox_real' && mode !== 'amas' && mode !== 'what_if' && (
            <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                {(['easy', 'normal', 'hard'] as const).map((d) => (
                    <button
                    key={d}
                    type="button"
                    onClick={() => setDiff(d)}
                    className={`py-2 px-4 rounded-lg text-sm font-medium capitalize transition-colors ${
                        diff === d 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                    }`}
                    >
                    {d}
                    </button>
                ))}
                </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !name || (mode === 'what_if' && !whatIfScenario)}
            className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                isLoading 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {isLoading ? (
                <>Loading Simulation...</>
            ) : (
                <>
                    <Play size={20} fill="currentColor" /> Initialize
                </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GameSetup;