import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Languages, BookOpen, Volume2, Trophy, GraduationCap, X } from 'lucide-react';
import words from './data/words.json';

export default function App() {
  const [lang, setLang] = useState('fr'); 
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [view, setView] = useState('study'); 
  const [mastered, setMastered] = useState([]);

  // Quiz States
  const [quizCard, setQuizCard] = useState(null);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('onoma_mastered');
    if (saved) setMastered(JSON.parse(saved));
  }, []);

  const saveMastery = (wordJa) => {
    const newMastered = [...new Set([...mastered, wordJa])];
    setMastered(newMastered);
    localStorage.setItem('onoma_mastered', JSON.stringify(newMastered));
  };

  const categories = useMemo(() => ['All', ...new Set(words.map(w => w.cat))], []);
  
  const filteredWords = words.filter(w => {
    const matchesSearch = w.ja.includes(search) || 
                         w.en.toLowerCase().includes(search.toLowerCase()) || 
                         w.fr.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCat === 'All' || w.cat === activeCat;
    return matchesSearch && matchesCat;
  });

  const playAudio = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // --- FIXED QUIZ LOGIC ---
  const startQuiz = () => {
    if (!words || words.length < 4) return;
    
    const correct = words[Math.floor(Math.random() * words.length)];
    const distractors = words
      .filter(w => w.ja !== correct.ja)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    setQuizCard(correct);
    setOptions([correct, ...distractors].sort(() => 0.5 - Math.random()));
    setFeedback(null);
    setView('quiz');
  };

  const handleAnswer = (selectedJa) => {
    if (selectedJa === quizCard.ja) {
      setFeedback('correct');
      saveMastery(quizCard.ja);
      playAudio(quizCard.ja);
      setTimeout(startQuiz, 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-10">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-2xl text-indigo-600">
            <BookOpen /> <span>OnomaBox</span>
          </div>
          <button onClick={() => setLang(lang === 'en' ? 'fr' : 'en')} className="p-2 bg-slate-100 rounded-full">
            <Languages size={20} />
          </button>
        </div>
        
        <div className="max-w-6xl mx-auto mt-4 px-2">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">
            <span>{lang === 'fr' ? 'Maîtrise' : 'Mastery'}</span>
            <span>{mastered.length} / {words.length}</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(mastered.length / words.length) * 100}%` }} />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center gap-2 mb-8 bg-slate-200/50 p-1 rounded-2xl w-fit mx-auto">
          <button onClick={() => setView('study')} className={`px-6 py-2 rounded-xl font-bold transition ${view === 'study' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
            {lang === 'fr' ? 'Étudier' : 'Study'}
          </button>
          <button onClick={startQuiz} className={`px-6 py-2 rounded-xl font-bold transition ${view === 'quiz' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
            Quiz
          </button>
        </div>

        {view === 'study' ? (
          <>
            <div className="max-w-2xl mx-auto mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" placeholder={lang === 'fr' ? "Rechercher..." : "Search..."} className="w-full pl-12 pr-4 py-3 bg-white rounded-xl shadow-sm border-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCat(cat)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${activeCat === cat ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWords.map((word) => (
                <div key={word.ja} onClick={() => playAudio(word.ja)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-300 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase">{word.cat}</span>
                    {mastered.includes(word.ja) && <Trophy size={14} className="text-yellow-500" />}
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800">{word.ja}</h2>
                  <p className="text-sm text-slate-400 italic mb-3">{word.ro}</p>
                  <p className="text-slate-600 font-medium">{lang === 'fr' ? word.fr : word.en}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-md mx-auto mt-10">
             <AnimatePresence mode="wait">
              <motion.div key={quizCard?.ja} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 text-center">
                <h3 className="text-slate-400 text-sm font-bold uppercase mb-2">{quizCard?.cat}</h3>
                <h2 className="text-5xl font-black text-indigo-600 mb-8">{quizCard?.ja}</h2>
                <div className="grid gap-3">
                  {options.map((opt) => (
                    <button key={opt.ja} onClick={() => handleAnswer(opt.ja)} className={`py-4 px-6 rounded-2xl font-bold text-lg transition-all border-2 ${feedback === 'correct' && opt.ja === quizCard.ja ? 'bg-green-500 border-green-500 text-white' : feedback === 'wrong' && opt.ja !== quizCard.ja ? 'opacity-50 border-slate-100' : 'bg-slate-50 border-slate-50 hover:border-indigo-200'}`}>
                      {lang === 'fr' ? opt.fr : opt.en}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
