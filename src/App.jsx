import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Languages, BookOpen, Volume2 } from 'lucide-react';
import words from './data/words.json';

// Fallback illustrations based on category
const getIllustration = (cat) => {
  const visuals = {
    Texture: "☁️", Emotion: "💖", Weather: "🌧️", Eating: "🍔", 
    Movement: "🏃", Action: "🎬", Condition: "🩺", Animal: "🐾", 
    Appearance: "✨", Sound: "🔊"
  };
  return visuals[cat] || "💡";
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [activeWord, setActiveWord] = useState(null); // Tracks the clicked card

  const categories = useMemo(() => ['All', ...new Set(words.map(w => w.cat))], []);

  const filteredWords = words.filter(w => {
    const matchesSearch = w.ja.includes(search) || 
                         w.en.toLowerCase().includes(search.toLowerCase()) ||
                         w.fr.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCat === 'All' || w.cat === activeCat;
    return matchesSearch && matchesCat;
  });

  // The Magic Audio Function
  const playAudio = (text, e) => {
    if (e) e.stopPropagation(); // Stops the card from closing when clicking the play button
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85; // Slightly slower for easier learning
    window.speechSynthesis.speak(utterance);
  };

  // Handle Card Click
  const handleCardClick = (word) => {
    if (activeWord === word.ja) {
      setActiveWord(null); // Close if already open
    } else {
      setActiveWord(word.ja); // Open card
      playAudio(word.ja);     // Play sound immediately on open
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-2xl text-indigo-600">
            <BookOpen /> <span>OnomaBox</span>
          </div>
          <button 
            onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition-all font-medium"
          >
            <Languages size={18} /> {lang === 'en' ? 'English ➔ FR' : 'Français ➔ EN'}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {/* Search & Categories */}
        <div className="mb-10 space-y-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input 
              type="text" 
              placeholder={lang === 'en' ? "Search words..." : "Rechercher des mots..."}
              className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl shadow-xl border-none focus:ring-2 focus:ring-indigo-500 text-lg"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  activeCat === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* The Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredWords.map((word) => {
              const isExpanded = activeWord === word.ja;

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={word.ja}
                  onClick={() => handleCardClick(word)}
                  className={`bg-white rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-shadow cursor-pointer relative overflow-hidden group ${isExpanded ? 'p-10 col-span-1 sm:col-span-2 lg:col-span-3 bg-indigo-50 border-indigo-200' : 'p-8'}`}
                >
                  {isExpanded ? (
                    // --- EXPANDED "LEARNING" VIEW ---
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row items-center gap-10">
                      
                      {/* Illustration Section */}
                      <div className="text-9xl drop-shadow-2xl bg-white p-12 rounded-3xl">
                        {word.emoji || getIllustration(word.cat)}
                      </div>

                      {/* Info & Audio Section */}
                      <div className="flex-1 text-center md:text-left">
                        <span className="text-sm font-bold bg-indigo-200 text-indigo-700 px-4 py-2 rounded-full mb-4 inline-block">{word.cat}</span>
                        <h2 className="text-7xl font-black mb-2 text-slate-900">{word.ja}</h2>
                        <p className="text-2xl text-indigo-500 font-medium italic mb-6">{word.ro}</p>
                        
                        <p className="text-3xl text-slate-700 leading-relaxed mb-8 font-medium">
                          {lang === 'en' ? word.en : word.fr}
                        </p>

                        <button 
                          onClick={(e) => playAudio(word.ja, e)}
                          className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 mx-auto md:mx-0"
                        >
                          <Volume2 size={28} /> Listen / Écouter
                        </button>
                      </div>

                    </motion.div>
                  ) : (
                    // --- STANDARD CARD VIEW ---
                    <>
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">{word.cat}</span>
                      </div>
                      <h2 className="text-6xl font-bold mb-2 tracking-tighter text-slate-800">{word.ja}</h2>
                      <p className="text-indigo-400 font-medium italic mb-6">{word.ro}</p>
                      <div className="h-px w-12 bg-slate-200 mb-6"></div>
                      <p className="text-xl text-slate-600 leading-relaxed">
                        {lang === 'en' ? word.en : word.fr}
                      </p>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
