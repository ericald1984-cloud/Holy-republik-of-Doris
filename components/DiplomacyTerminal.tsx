import React, { useState, useRef, useEffect } from 'react';
import { DiplomaticContact, ChatMessage } from '../types';
import { Send, Lock, User, Bot, Radio, Wifi, Globe, Flag, Star, Sword, Shield, Crown, Anchor, Zap, Cloud, Sun, Moon, TreePine, Skull, Heart } from 'lucide-react';

interface Props {
  neighbors: DiplomaticContact[];
  chats: Record<string, ChatMessage[]>;
  onSendMessage: (neighborId: string, text: string) => void;
  isThinking: boolean;
}

const getFlagIcon = (symbol?: string) => {
  if (!symbol) return null;
  const s = symbol.toLowerCase();
  if (s.includes('star')) return <Star size={14} className="text-white drop-shadow-md" />;
  if (s.includes('sword') || s.includes('weapon')) return <Sword size={14} className="text-white drop-shadow-md" />;
  if (s.includes('shield')) return <Shield size={14} className="text-white drop-shadow-md" />;
  if (s.includes('crown') || s.includes('king')) return <Crown size={14} className="text-white drop-shadow-md" />;
  if (s.includes('anchor') || s.includes('ship')) return <Anchor size={14} className="text-white drop-shadow-md" />;
  if (s.includes('bolt') || s.includes('zap') || s.includes('power')) return <Zap size={14} className="text-white drop-shadow-md" />;
  if (s.includes('cloud')) return <Cloud size={14} className="text-white drop-shadow-md" />;
  if (s.includes('sun')) return <Sun size={14} className="text-white drop-shadow-md" />;
  if (s.includes('moon')) return <Moon size={14} className="text-white drop-shadow-md" />;
  if (s.includes('tree') || s.includes('leaf')) return <TreePine size={14} className="text-white drop-shadow-md" />;
  if (s.includes('skull')) return <Skull size={14} className="text-white drop-shadow-md" />;
  if (s.includes('heart') || s.includes('love')) return <Heart size={14} className="text-white drop-shadow-md" />;
  return <Flag size={14} className="text-white drop-shadow-md" />;
};

const DiplomacyTerminal: React.FC<Props> = ({ neighbors, chats, onSendMessage, isThinking }) => {
  const [selectedId, setSelectedId] = useState<string | null>(neighbors[0]?.id || null);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, selectedId]);

  const activeContact = neighbors.find(n => n.id === selectedId);
  const currentChat = selectedId ? (chats[selectedId] || []) : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedId || isThinking) return;
    onSendMessage(selectedId, input);
    setInput('');
  };

  if (neighbors.length === 0) {
    return (
      <div className="h-[500px] bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-600">
        <Wifi size={48} className="mb-4 opacity-50" />
        <p className="font-mono">Searching for diplomatic signals...</p>
      </div>
    );
  }

  return (
    <div className="h-[500px] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
      {/* Sidebar: Contacts */}
      <div className="w-full md:w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center gap-2">
          <Globe size={16} className="text-blue-500" />
          <h3 className="font-mono font-bold text-zinc-300 text-xs tracking-wider uppercase">Secure Link ({neighbors.length})</h3>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {neighbors.map(n => (
            <button
              key={n.id}
              onClick={() => setSelectedId(n.id)}
              className={`w-full text-left p-2 rounded-lg transition-all border flex items-center gap-3 ${
                selectedId === n.id 
                  ? 'bg-blue-900/20 border-blue-500/50 text-white' 
                  : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <div className="shrink-0 w-8 h-6 rounded overflow-hidden bg-zinc-800 flex items-center justify-center relative shadow-sm border border-zinc-700">
                {n.flagCode ? (
                    <img 
                        src={`https://flagcdn.com/w40/${n.flagCode.toLowerCase()}.png`} 
                        alt={n.name}
                        className="w-full h-full object-cover"
                    />
                ) : n.color ? (
                    <div style={{ backgroundColor: n.color }} className="w-full h-full flex items-center justify-center">
                        {getFlagIcon(n.flagSymbol)}
                    </div>
                ) : (
                    <Flag size={14} className="text-zinc-500" />
                )}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-sm truncate">{n.name}</div>
                <div className="text-xs text-zinc-500 truncate mt-0.5">
                    {n.leaderName}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-black relative">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div className="flex items-center gap-3">
             <div className="shrink-0 w-10 h-7 rounded overflow-hidden bg-zinc-800 shadow-sm border border-zinc-700">
                {activeContact?.flagCode ? (
                    <img 
                        src={`https://flagcdn.com/w80/${activeContact.flagCode.toLowerCase()}.png`} 
                        alt={activeContact.name}
                        className="w-full h-full object-cover"
                    />
                ) : activeContact?.color ? (
                    <div style={{ backgroundColor: activeContact.color }} className="w-full h-full flex items-center justify-center">
                        {getFlagIcon(activeContact.flagSymbol)}
                    </div>
                ) : (
                    <Flag size={16} className="text-zinc-500 m-auto mt-1" />
                )}
              </div>
              <div>
                <h2 className="text-white font-bold flex items-center gap-2">
                <Lock size={14} className="text-green-500" />
                {activeContact?.leaderName}
                </h2>
                <div className="text-xs text-zinc-500 font-mono">
                {activeContact?.name} • Relationship: <span className={`${(activeContact?.relationshipScore || 0) > 50 ? 'text-green-500' : 'text-red-500'}`}>{activeContact?.relationshipScore}</span>
                </div>
              </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono">
            <Radio size={12} className={isThinking ? "animate-pulse text-yellow-500" : ""} />
            {isThinking ? "TRANSMITTING..." : "CONNECTED"}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm relative">
           {/* CRT Scanline effect overlay */}
           <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20"></div>

          {currentChat.length === 0 ? (
            <div className="text-center text-zinc-700 mt-10">
              <p>-- ENCRYPTED CHANNEL ESTABLISHED --</p>
              <p className="text-xs mt-2">Begin negotiation.</p>
            </div>
          ) : (
            currentChat.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                    <Bot size={16} className="text-zinc-400" />
                  </div>
                )}
                <div 
                  className={`max-w-[80%] p-3 rounded-lg border ${
                    msg.sender === 'player' 
                      ? 'bg-blue-950/40 border-blue-900 text-blue-100' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === 'player' && (
                  <div className="w-8 h-8 rounded bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-800">
                    <User size={16} className="text-blue-400" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isThinking}
              className="flex-1 bg-black border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm placeholder:text-zinc-700"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isThinking}
              className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiplomacyTerminal;