import React, { useState } from 'react';
import { DiplomaticContact, GameMode } from '../types';
import { User, Flag, Briefcase, Loader2, Camera, Star, Sword, Shield, Crown, Anchor, Zap, Cloud, Sun, Moon, TreePine, Skull, Heart } from 'lucide-react';
import { generateLeaderPortrait } from '../services/geminiService';

interface Props {
  neighbors: DiplomaticContact[];
  countryName: string;
  mode?: GameMode;
}

const getFlagIcon = (symbol?: string) => {
  if (!symbol) return null;
  const s = symbol.toLowerCase();
  if (s.includes('star')) return <Star size={40} className="text-white/80 drop-shadow-xl" />;
  if (s.includes('sword') || s.includes('weapon')) return <Sword size={40} className="text-white/80 drop-shadow-xl" />;
  if (s.includes('shield')) return <Shield size={40} className="text-white/80 drop-shadow-xl" />;
  if (s.includes('crown') || s.includes('king')) return <Crown size={40} className="text-white/80 drop-shadow-xl" />;
  if (s.includes('anchor') || s.includes('ship')) return <Anchor size={40} className="text-white/80 drop-shadow-xl" />;
  if (s.includes('bolt') || s.includes('zap') || s.includes('power')) return <Zap size={40} className="text-white/80 drop-shadow-xl" />;
  if (s.includes('cloud')) return <Cloud size={40} className="text-white/80 drop-shadow-xl" />;
  if (s.includes('sun')) return <Sun size={40} className="text-white/80 drop-shadow-xl" />;
  if (s.includes('moon')) return <Moon size={40} className="text-white/80 drop-shadow-xl" />;
  if (s.includes('tree') || s.includes('leaf')) return <TreePine size={40} className="text-white/80 drop-shadow-xl" />;
  if (s.includes('skull')) return <Skull size={40} className="text-white/80 drop-shadow-xl" />;
  if (s.includes('heart') || s.includes('love')) return <Heart size={40} className="text-white/80 drop-shadow-xl" />;
  return <Flag size={40} className="text-white/80 drop-shadow-xl" />;
};

const LeadersView: React.FC<Props> = ({ neighbors, countryName, mode }) => {
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [leaderImages, setLeaderImages] = useState<Record<string, string>>({});

  const handleGeneratePortrait = async (leader: DiplomaticContact) => {
    setLoadingImages(prev => ({ ...prev, [leader.id]: true }));
    try {
        const url = await generateLeaderPortrait(leader.leaderName, leader.name, leader.leaderAge || 50, leader.leaderBio || "", mode);
        if (url) {
            setLeaderImages(prev => ({ ...prev, [leader.id]: url }));
        }
    } catch (error) {
        console.error(error);
    } finally {
        setLoadingImages(prev => ({ ...prev, [leader.id]: false }));
    }
  };

  return (
    <div className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
             <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Briefcase size={24} className="text-blue-500" />
                World Leaders & Heads of State
             </h2>

             {neighbors.length === 0 ? (
                 <div className="text-center text-zinc-500 py-12">No diplomatic contacts established yet.</div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                     {neighbors.map((leader) => (
                         <div key={leader.id} className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden group hover:border-zinc-700 transition-colors">
                             {/* Card Header (Flag Background) */}
                             <div className="h-24 bg-zinc-800 relative">
                                {leader.flagCode ? (
                                    <img 
                                        src={`https://flagcdn.com/w320/${leader.flagCode.toLowerCase()}.png`} 
                                        alt="flag" 
                                        className="w-full h-full object-cover opacity-50"
                                    />
                                ) : leader.color ? (
                                    <div style={{ backgroundColor: leader.color }} className="w-full h-full opacity-70 flex items-center justify-center">
                                         {getFlagIcon(leader.flagSymbol)}
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-zinc-800" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
                             </div>

                             {/* Profile Picture */}
                             <div className="px-6 relative">
                                 <div className="absolute -top-12 w-24 h-24 rounded-xl border-4 border-zinc-950 bg-zinc-900 overflow-hidden flex items-center justify-center shadow-lg">
                                    {leaderImages[leader.id] ? (
                                        <img src={leaderImages[leader.id]} alt={leader.leaderName} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} className="text-zinc-600" />
                                    )}
                                    
                                    {/* Generate Button Overlay */}
                                    {!leaderImages[leader.id] && (
                                        <button 
                                            onClick={() => handleGeneratePortrait(leader)}
                                            disabled={loadingImages[leader.id]}
                                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                                        >
                                            {loadingImages[leader.id] ? (
                                                <Loader2 size={24} className="animate-spin text-white" />
                                            ) : (
                                                <Camera size={24} className="text-white" />
                                            )}
                                        </button>
                                    )}
                                 </div>
                             </div>

                             {/* Info */}
                             <div className="px-6 pt-14 pb-6">
                                 <h3 className="text-lg font-bold text-white">{leader.leaderName}</h3>
                                 <div className="text-blue-400 text-xs font-mono mb-3 uppercase tracking-wider">{leader.name}</div>
                                 
                                 <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                                     <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                                         <span className="text-zinc-500 block">Age</span>
                                         <span className="text-zinc-300 font-mono">{leader.leaderAge || 'N/A'}</span>
                                     </div>
                                     <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                                         <span className="text-zinc-500 block">Personality</span>
                                         <span className="text-zinc-300 truncate">{leader.personality}</span>
                                     </div>
                                 </div>

                                 <div className="text-sm text-zinc-400 leading-relaxed h-20 overflow-y-auto pr-1 custom-scrollbar">
                                     {leader.leaderBio || "No biographical data available."}
                                 </div>

                                 <div className="mt-4 pt-4 border-t border-zinc-900 flex justify-between items-center text-xs">
                                     <span className="text-zinc-600 font-mono">RELATIONSHIP</span>
                                     <div className="flex items-center gap-2">
                                         <div className="w-20 bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                                             <div 
                                                className={`h-full ${leader.relationshipScore > 50 ? 'bg-green-500' : 'bg-red-500'}`} 
                                                style={{ width: `${leader.relationshipScore}%` }}
                                             />
                                         </div>
                                         <span className={leader.relationshipScore > 50 ? 'text-green-500' : 'text-red-500'}>
                                             {leader.relationshipScore}%
                                         </span>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
        </div>
    </div>
  );
};

export default LeadersView;