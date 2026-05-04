import { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Search, 
  Save, 
  RefreshCcw, 
  History, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Loader2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IdeaAnalysis {
  id: string;
  originalIdea: string;
  score: number;
  insight: string;
  expansions: string[];
  timestamp: string;
}

export default function App() {
  const [idea, setIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IdeaAnalysis | null>(null);
  const [history, setHistory] = useState<IdeaAnalysis[]>([]);

  // Simulate Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mindtrack_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem('mindtrack_history', JSON.stringify(history));
  }, [history]);

  // Simulated API function as requested
  const analyzeIdea = async (inputIdea: string): Promise<IdeaAnalysis> => {
    // Artificial delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const randomScore = Math.floor(Math.random() * (90 - 60 + 1)) + 60;
    const insights = [
      "Ide ini memiliki potensi yang kuat, namun bisa lebih spesifik mengenai target audiens.",
      "Topik ini sedang tren, cobalah fokus pada sisi 'how-to' untuk meningkatkan engagement.",
      "Ide yang solid! Pertimbangkan untuk menggunakan analogi agar lebih mudah dipahami pemula.",
      "Cukup menarik, namun pastikan ada nilai unik (USP) yang membedakan dari konten serupa."
    ];
    
    const expansionsSet = [
      [`5 Tools AI terbaik untuk ${inputIdea}`, `Cara memulai ${inputIdea} dalam 30 hari`, `Kesalahan pemula saat melakukan ${inputIdea}`],
      [`Kenapa ${inputIdea} akan populer di 2026`, `Strategi expert untuk ${inputIdea}`, `Case study: Sukses dengan ${inputIdea}`],
      [`Tutorial lengkap ${inputIdea}`, `Tips produktivitas untuk ${inputIdea}`, `${inputIdea}: Mitos vs Fakta`]
    ];

    const randomExpansions = expansionsSet[Math.floor(Math.random() * expansionsSet.length)];

    return {
      id: Date.now().toString(),
      originalIdea: inputIdea,
      score: randomScore,
      insight: insights[Math.floor(Math.random() * insights.length)],
      expansions: randomExpansions,
      timestamp: new Date().toLocaleString('id-ID', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const handleAnalyze = async () => {
    if (!idea.trim()) return;
    
    setIsLoading(true);
    try {
      const analysis = await analyzeIdea(idea);
      setResult(analysis);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (result) {
      // Prevent duplicates in history if saving same result twice
      if (!history.find(h => h.id === result.id)) {
        setHistory([result, ...history]);
      }
      // Reset state for another analysis
      setResult(null);
      setIdea('');
    }
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
  };

  const viewFromHistory = (item: IdeaAnalysis) => {
    setResult(item);
    setIdea(item.originalIdea);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-indigo-600 flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              MindTrack
            </h1>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">
              Idea Intelligence for Creators
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 mt-12 space-y-12">
        {/* Input Section */}
        <section id="input-section" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-800">What's on your mind?</h2>
            <p className="text-sm text-slate-500">Masukkan ide konten kamu dan biarkan MindTrack menganalisis potensinya.</p>
          </div>
          
          <div className="glass-card p-6 space-y-4">
            <textarea
              className="input-field"
              placeholder="Tulis ide konten kamu di sini (contoh: Strategi AI untuk mahasiswa)..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              disabled={isLoading || result !== null}
            />
            
            <div className="flex justify-end gap-3">
              {!result ? (
                <button 
                  onClick={handleAnalyze} 
                  disabled={isLoading || !idea.trim()}
                  className="btn-primary w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Analyze Idea
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button onClick={() => {setResult(null); setIdea('')}} className="btn-secondary">
                    <RefreshCcw className="w-5 h-5" />
                    Analyze Another
                  </button>
                  <button onClick={handleSave} className="btn-primary">
                    <Save className="w-5 h-5" />
                    Save Idea
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score Card */}
                <div className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Idea Strength Score</span>
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-100"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={364.4}
                        strokeDashoffset={364.4 * (1 - result.score / 100)}
                        className="text-indigo-600 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-black text-slate-800">{result.score}</span>
                    </div>
                  </div>
                </div>

                {/* Insight Card */}
                <div className="md:col-span-2 glass-card p-8 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <TrendingUp className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wide text-sm">Key Insights</h3>
                  </div>
                  <p className="text-lg leading-relaxed text-slate-700 italic">
                    "{result.insight}"
                  </p>
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Ready for expansion
                  </div>
                </div>
              </div>

              {/* Expansion Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800">Idea Expansion</h3>
                  <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Derived Variations</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {result.expansions.map((exp, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-card p-4 flex items-center justify-between group hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-default"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          {idx + 1}
                        </span>
                        <p className="font-medium text-slate-700">{exp}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* History List */}
        <section className="space-y-6 pt-12 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" />
              <h2 className="text-xl font-bold text-slate-800">Saved Ideas</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">{history.length} items</span>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 px-6 glass-card border-dashed bg-slate-50/50">
              <p className="text-slate-400 text-sm italic">Belum ada ide yang disimpan. Ayo mulai analisis!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {history.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card p-5 group relative hover:ring-2 hover:ring-indigo-500/10 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{item.timestamp}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.score > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className="text-xs font-bold text-slate-600">Score: {item.score}</span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistory(item.id);
                        }}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h4 className="font-bold text-slate-800 line-clamp-2 mb-4 group-hover:text-indigo-600 transition-colors">
                      {item.originalIdea}
                    </h4>

                    <button 
                      onClick={() => viewFromHistory(item)}
                      className="w-full py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      View Details
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-4xl mx-auto px-6 mt-20 text-center space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-300">MindTrack v1.0.0</p>
        <p className="text-[10px] text-slate-400">Created for content intelligence and strategic planning.</p>
      </footer>
    </div>
  );
}
