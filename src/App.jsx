import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Languages, BookOpen } from 'lucide-react';
import words from './data/words.json';

export default function App() {
  const [lang, setLang] = useState('en');
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');

  const categories = useMemo(() => ['All', ...new Set(words.map(w => w.cat))], []);

  const filteredWords = words.filter(w => {
    const matchesSearch = w.ja.includes(search) || 
                         w.en.toLowerCase().includes(search.toLowerCase()) ||
                         w.fr.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCat === 'All' || w.cat === activeCat;
    return matchesSearch && matchesCat;
  });

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
              placeholder={lang === 'en' ? "Search 300+ words..." : "Rechercher parmi 300+ mots..."}
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
            {filteredWords.map((word, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                key={word.ja}
                className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all cursor-default relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">{word.cat}</span>
                </div>
                <h2 className="text-6xl font-bold mb-2 tracking-tighter text-slate-800">{word.ja}</h2>
                <p className="text-indigo-400 font-medium italic mb-6">{word.ro}</p>
                <div className="h-px w-12 bg-slate-200 mb-6"></div>
                <p className="text-xl text-slate-600 leading-relaxed">
                  {lang === 'en' ? word.en : word.fr}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
