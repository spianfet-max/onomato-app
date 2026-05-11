import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Languages, BookOpen, Volume2, Trophy, Play, GraduationCap } from 'lucide-react';
import words from './data/words.json';

export default function App() {
  // --- STATE ---
  const [lang, setLang] = useState('fr'); // Default set to French
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [activeWord, setActiveWord] = useState(null);
  const [view, setView] = useState('study'); // 'study' or 'quiz'
  
  // --- ANALYTICS STATE ---
  const [mastered, setMastered] = useState([]);

  // --- QUIZ STATE ---
  const [quizCard, setQuizCard] = useState(null);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);

  // --- INITIALIZE ANALYTICS ---
  useEffect(() => {
    const saved = localStorage.getItem('onoma_mastered');
    if (saved) setMastered(JSON.parse(saved));
  }, []);

  const saveMastery = (wordJa) => {
    const newMastered = [...new Set([...mastered, wordJa])];
    setMastered(newMastered);
    localStorage.setItem('onoma_mastered', JSON.stringify(newMastered));
  };

  // --- HELPERS ---
  const categories = useMemo(() => ['All', ...new Set(words.map(w => w.cat))], []);
  const filteredWords = words.filter(w => {
    const matchesSearch = w.ja.includes(search) || w.en.toLowerCase().includes(search.toLowerCase()) || w.fr.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCat === 'All' || w.cat === activeCat;
    return matchesSearch && matchesCat;
  });

  const playAudio = (text, e) => {
    if (e) e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // --- QUIZ LOGIC ---
  const startQuiz = () => {
    const correct = words[Math.floor(Math.random() * words.size || words.length)];
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
      setTimeout(startQuiz, 1200);
    } else {
      setFeedback('wrong');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-2xl text-indigo-600">
            <BookOpen /> <span>OnomaBox</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setLang(lang === 'en' ? 'fr' : 'en')} className="p-2 hover:bg-slate-100 rounded-full transition">
              <Languages size={24} className="text-slate-600" />
            </button>
          </div>
        </div>
        
        {/* Progress Bar (Idea #4) */}
        <div className="max-w-6xl mx-auto mt-4 px-2">
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">
            <span>{lang === 'fr' ? 'Maîtrise' : 'Mastery'}</span>
            <span>{mastered.length} / {words.length}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(mastered.length / words.length) * 100}%` }}
              className="h-full bg-indigo-500" 
            />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        
        {/* View Switcher */}
        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => setView('study')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition ${view === 'study' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}
          >
            <GraduationCap size={20} /> {lang === 'fr' ? 'Apprendre' : 'Study'}
          </button>
          <button 
            onClick={startQuiz}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition ${view === 'quiz' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}
          >
            <Trophy size={20} /> {lang === 'fr' ? 'Quiz' : 'Play'}
          </button>
        </div>

        {view === 'study' ? (
          <>
            {/* Study Search & Grid */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
              <input 
                type="text" 
                placeholder={lang === 'fr' ? "Chercher..." : "Search..."}
                className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl shadow-xl border-none focus:ring-2 focus:ring-indigo-500 text-lg"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWords.map((word) => (
                <motion.div 
                  layout
                  key={word.ja}
                  onClick={() => { setActiveWord(activeWord === word.ja ? null : word.ja); playAudio(word.ja); }}
                  className={`bg-white p-8 rounded-[2rem] shadow-sm border ${mastered.includes(word.ja) ? 'border-green-200 bg-green-50/30' : 'border-slate-100'} cursor-pointer relative overflow-hidden`}
                >
                  {mastered.includes(word.ja) && <Trophy size={16} className="absolute top-4 right-4 text-green-500" />}
                  <h2 className="text-5xl font-bold mb-2 text-slate-800">{word.ja}</h2>
                  <p className="text-indigo-400 font-medium italic mb-4">{word.ro}</p>
                  <p className="text-lg text-slate-600">
                    {lang === 'en' ? word.en : word.fr}
                  </p>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          /* Quiz View (Idea #2) */
          <div className="max-w-xl mx-auto mt-10">
            <motion.div 
              key={quizCard?.ja}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl text-center border-4 border-white"
            >
              <div className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-4">{quizCard?.cat}</div>
              <h2 className="text-4xl font-medium mb-10 text-slate-700">
                {lang === 'fr' ? 'Que signifie' : 'What does'} <span className="font-black text-indigo-600">"{quizCard?.ja}"</span> ?
              </h2>
              
              <div className="grid gap-4">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt.ja)}
                    className={`py-4 px-6 rounded-2xl text-xl font-bold border-2 transition-all ${
                      feedback === 'correct' && opt.ja === quizCard.ja ? 'bg-green-500 border-green-500 text-white' :
                      feedback === 'wrong' ? 'border-red-100 text-slate-400' : 'bg-slate-50 border-slate-50 hover:border-indigo-200 text-slate-700'
                    }`}
                  >
                    {lang === 'en' ? opt.en : opt.fr}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
