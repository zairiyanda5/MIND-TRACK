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
  Tag,
  Zap,
  BarChart3,
  PieChart,
  Trophy,
  Layers,
  Activity,
  Loader2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMemo } from 'react';

interface IdeaAnalysis {
  id: string;
  originalIdea: string;
  score: number;
  insight: string;
  categories: string[];
  suggestions: string[];
  expansions: string[];
  timestamp: string;
  isTooVague?: boolean;
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
    
    // Scoring logic - implementing deterministic rule-based scoring
    let calculatedScore = 50; // Starting base point
    const words = inputIdea.trim().split(/\s+/);
    const wordCount = words.length;
    const lowerIdea = inputIdea.toLowerCase();

    // Helper to clean the idea for expansion use (e.g., removing unnecessary prefixes for better template fit)
    const cleanForExpansion = (text: string) => {
      return text.replace(/^(how to|tutorial|tips|guide|the secret to|how i)\b/i, '').trim();
    };
    const coreTopic = cleanForExpansion(inputIdea);

    // 1. Word Count Check (Deterministic penalties/bonuses)
    if (wordCount < 3) {
      calculatedScore -= 30; // Very weak
    } else if (wordCount >= 3 && wordCount < 6) {
      calculatedScore -= 10; // Slightly weak
    } else if (wordCount >= 7 && wordCount <= 15) {
      calculatedScore += 15; // Optimal range
    } else if (wordCount > 15) {
      calculatedScore -= 5; // Too long
    }

    // 2. Numerical Value Check (+10)
    const hasNumbers = /\d+/.test(inputIdea);
    if (hasNumbers) calculatedScore += 10;

    // 3. Audience Check (+10)
    const audienceKeywords = ["student", "creator", "business", "pro", "beginner", "user", "expert", "freelancer", "founder", "manager"];
    const hasAudience = audienceKeywords.some(k => lowerIdea.includes(k));
    if (hasAudience) calculatedScore += 10;

    // 4. Actionable Word Check (+10)
    const actionableKeywords = ["how to", "strategy", "tips", "tutorial", "guide", "secret", "system", "framework", "blueprint"];
    const isActionable = actionableKeywords.some(k => lowerIdea.includes(k));
    if (isActionable) calculatedScore += 10;

    // 5. Emotional/Storytelling Context (+10)
    const storyKeywords = ["failure", "mistake", "journey", "lesson", "experience", "story", "struggle", "success", "failed", "learned"];
    const hasStory = storyKeywords.some(k => lowerIdea.includes(k));
    if (hasStory) calculatedScore += 10;

    // 6. Vague Word Check (-15)
    const vagueWords = ["stuff", "things", "something", "generic", "basic", "whatever"];
    const isVague = vagueWords.some(k => lowerIdea.includes(k));
    if (isVague) calculatedScore -= 15;

    // 7. Advanced Vague/Invalid Detection
    const invalidKeywords = ["what", "how", "why", "who", "when", "where", "thing", "apa", "itu", "anu", "hall", "ok", "yes", "no"];
    const isSingleInvalidWord = wordCount === 1 && invalidKeywords.includes(lowerIdea);
    const isExtremelyShort = wordCount < 2 && !hasNumbers;
    const isTooVague = isSingleInvalidWord || isExtremelyShort || (isVague && wordCount < 3);

    // Weighted Category detection logic
    const categoriesConfig: Record<string, Record<string, number>> = {
      "Technology": { "ai": 2, "tech": 2, "software": 2, "code": 2, "programming": 2, "digital": 1, "app": 1, "web": 1, "automation": 2, "robot": 2, "data": 1, "developer": 1, "cloud": 1 },
      "Education": { "student": 2, "students": 2, "learn": 2, "learning": 2, "study": 2, "studying": 2, "university": 1, "college": 1, "school": 1, "classroom": 2, "education": 2, "academic": 2, "course": 2, "tutorial": 2, "explain": 1, "thesis": 2, "tips": 1, "how to": 1, "guide": 1 },
      "Productivity": { "habit": 2, "schedule": 2, "time": 1, "efficient": 1, "workflow": 2, "focus": 2, "organize": 1, "productive": 2, "discipline": 2, "to-do": 1, "management": 1, "system": 1 },
      "Storytelling": { "story": 2, "narrative": 2, "experience": 2, "journey": 2, "hook": 1, "personal": 2, "anecdote": 2, "mistake": 2, "failure": 2, "life": 1, "lesson": 2, "failed": 2, "learned": 2, "my first": 2, "almost quit": 2, "struggle": 2 },
      "Business": { "profit": 2, "startup": 1, "marketing": 1, "sales": 1, "entrepreneur": 2, "lead": 1, "business": 2, "b2b": 2, "revenue": 2, "money": 2, "finance": 2, "investment": 2, "ecommerce": 2 },
      "Entertainment": { "fun": 1, "comedy": 2, "vlog": 1, "game": 1, "gaming": 2, "lifestyle": 1, "funny": 2, "meme": 2, "challenge": 2, "reaction": 1, "movie": 1, "music": 1 },
      "Self Improvement": { "motivation": 1, "mindset": 1, "growth": 1, "health": 1, "habits": 2, "wellness": 1, "confidence": 2, "psychology": 1, "mental": 1, "discipline": 2 },
      "Marketing": { "branding": 2, "social media": 2, "ads": 2, "advertising": 2, "copywriting": 2, "seo": 2, "engagement": 2, "content strategy": 2, "viral": 2, "instagram": 1, "tiktok": 1, "strategy": 1 }
    };

    const catScores: Record<string, number> = {};

    Object.entries(categoriesConfig).forEach(([category, keywordWeights]) => {
      let categoryScore = 0;
      Object.entries(keywordWeights).forEach(([keyword, weight]) => {
        // Strict whole-word matching using regex word boundaries
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
        if (regex.test(inputIdea)) {
          categoryScore += weight;
        }
      });
      // Filter out unrelated categories with low scores
      if (categoryScore > 1) {
        catScores[category] = categoryScore;
      } else if (categoryScore > 0 && Object.keys(catScores).length === 0) {
        // Fallback for very specific single keyword matches
        catScores[category] = categoryScore;
      }
    });

    const sortedCategories = Object.entries(catScores)
      .sort((a, b) => b[1] - a[1]) // Sort by score descending
      .map(entry => entry[0]);

    const finalCategories = isTooVague 
      ? ["Unclear"] 
      : (sortedCategories.length > 0 ? sortedCategories.slice(0, 3) : ["Other"]);

    // Penalty for "Other" or lack of categories
    if (!isTooVague) {
      if (finalCategories.includes("Other")) calculatedScore -= 10;
      if (finalCategories.length > 1) calculatedScore += 5;
    }

    // Enforce score ranges and clamping
    let finalScore = Math.min(95, Math.max(20, calculatedScore));
    if (isTooVague) {
      finalScore = Math.floor(Math.random() * (30 - 10 + 1)) + 10; // Low deterministic-ish range 10-30
    }

    // Insights adapted to score - deterministic
    let insight = "";
    if (isTooVague) {
      insight = "Your idea is too vague or unclear. Try adding a topic, audience, or specific goal to get better results.";
    } else if (finalScore < 45) {
      insight = "This idea is too generic or short. Try adding specific details or a target audience to make it more compelling.";
    } else if (finalScore < 75) {
      insight = "Great start! This topic has potential, but it could be strengthened by adding data, numbers, or a more unique perspective.";
    } else {
      insight = "Excellent! This idea is specific, structured, and has a clear target audience. It's ready for production.";
    }

    // Dynamic Expansion Logic - Natural and Angle-Based
    const expansionAngles = [
      { name: "tutorial", options: [`The Ultimate Guide: How to master ${coreTopic}`, `Step-by-step ${coreTopic} for beginners`, `A practical guide to ${coreTopic} without the fluff`] },
      { name: "productivity", options: [`Save 5 hours a week with ${coreTopic}`, `Review: The most efficient ${coreTopic} workflow`, `Optimizing ${coreTopic} for maximum results`] },
      { name: "mistakes", options: [`7 Fatal mistakes people make with ${coreTopic}`, `Why most people fail at ${coreTopic}`, `Stop doing this if you want ${coreTopic} success`] },
      { name: "storytelling", options: [`The story of how I almost quit ${coreTopic}`, `The emotional journey behind my ${coreTopic} project`, `How ${coreTopic} changed my entire outlook`] },
      { name: "recommendations", options: [`5 Best tools you need for ${coreTopic}`, `A list of free resources for learning ${coreTopic}`, `Top 3 ${coreTopic} strategies for this year`] },
      { name: "comparison", options: [`${coreTopic} vs Traditional Methods: Which wins?`, `An honest comparison: ${coreTopic} vs the alternatives`, `Why I chose ${coreTopic} over everything else`] }
    ];

    // Select 3 angles deterministically based on input
    const seed = inputIdea.length;
    const selectedExpansions: string[] = [];
    
    if (isTooVague) {
      selectedExpansions.push("Try adding a specific niche (e.g., 'for designers')", "Include a specific goal (e.g., 'to save time')", "Use a specific topic (e.g., 'about AI usage')");
    } else {
      for (let i = 0; i < 3; i++) {
         const angleIdx = (seed + i * 2) % expansionAngles.length;
         const angle = expansionAngles[angleIdx];
         // Pick a specific option within the angle
         const optionIdx = (seed + i) % angle.options.length;
         selectedExpansions.push(angle.options[optionIdx]);
      }
    }

    // Suggestion logic
    const suggestions: string[] = [];
    if (isTooVague) {
      suggestions.push("Focus on one specific problem you want to solve.", "Think about who exactly this content is for.", "Try using at least 5-7 words to describe your idea.");
    } else {
      if (wordCount < 5) suggestions.push("Add more context to make your idea clearer and more actionable.");
      if (!hasNumbers) suggestions.push("Use numbers (e.g., '5 ways', 'in 10 minutes') to increase click-through rates.");
      if (!hasAudience) suggestions.push("Define a more specific target audience to make the content more relevant.");
      if (isVague) suggestions.push("Avoid vague words and use more descriptive, impactful terminology.");
      if (wordCount > 15) suggestions.push("The title is a bit long; try summarizing it to make it more memorable.");
      if (finalCategories.includes("Storytelling") && !lowerIdea.includes("i ") && !lowerIdea.includes("my ")) {
         suggestions.push("Use a first-person perspective to strengthen the narrative element.");
      }
    }

    if (suggestions.length === 0) {
      suggestions.push("The structure of this idea is already strong and specific.");
    }

    return {
      id: Date.now().toString(),
      originalIdea: inputIdea,
      score: finalScore,
      insight: insight,
      categories: finalCategories,
      suggestions: suggestions.slice(0, 3),
      expansions: selectedExpansions,
      isTooVague: isTooVague,
      timestamp: new Date().toLocaleString('en-US', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const handleAnalyze = async (specificIdea?: string) => {
    const targetIdea = typeof specificIdea === 'string' ? specificIdea : idea;
    if (!targetIdea.trim()) return;
    
    if (typeof specificIdea === 'string') {
      setIdea(specificIdea);
    }

    setResult(null);
    setIsLoading(true);
    try {
      const analysis = await analyzeIdea(targetIdea);
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

  // Analytics Calculation
  const analytics = useMemo(() => {
    if (history.length === 0) return null;

    const totalScore = history.reduce((sum, item) => sum + item.score, 0);
    const avgScore = Math.round(totalScore / history.length);
    
    // Category Frequency
    const catMap: Record<string, number> = {};
    history.forEach(item => {
      item.categories.forEach(cat => {
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
    });
    
    const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCats[0]?.[0] || 'N/A';
    const totalUniqueCats = Object.keys(catMap).length;
    
    const highestScoreItem = [...history].sort((a, b) => b.score - a.score)[0];

    // Smart Insight Engine Logic
    let insightMessage = "Keep saving ideas to unlock smart data-driven insights. Try adding your first idea to get personalized growth tips.";
    let insightIcon = Lightbulb;

    if (history.length >= 4) {
      // Split history into two halves to detect trends
      const midpoint = Math.ceil(history.length / 2);
      const recentIdeas = history.slice(0, midpoint);
      const previousIdeas = history.slice(midpoint);

      const recentAvg = Math.round(recentIdeas.reduce((sum, h) => sum + h.score, 0) / recentIdeas.length);
      const previousAvg = Math.round(previousIdeas.reduce((sum, h) => sum + h.score, 0) / previousIdeas.length);
      const scoreDiff = recentAvg - previousAvg;

      // Category specific performance
      const catAverages: Record<string, { sum: number, count: number }> = {};
      history.forEach(h => {
        h.categories.forEach(cat => {
          if (!catAverages[cat]) catAverages[cat] = { sum: 0, count: 0 };
          catAverages[cat].sum += h.score;
          catAverages[cat].count += 1;
        });
      });

      const sortedCatStats = Object.entries(catAverages)
        .map(([name, stats]) => ({ name, avg: Math.round(stats.sum / stats.count) }))
        .sort((a, b) => b.avg - a.avg);

      if (scoreDiff > 5) {
        insightMessage = `Your thinking style is becoming much more structured, raising your average score from ${previousAvg} to ${recentAvg}. This evolution suggests you're finding a clearer content "voice." Keep this momentum by applying this level of detail to every new idea.`;
        insightIcon = TrendingUp;
      } else if (scoreDiff < -5) {
        insightMessage = `Your recent ideas feel a bit broader than your earlier work, causing your scores to dip. It looks like you're exploring new ground—try grounding these thoughts in one specific problem to recover your high standards.`;
        insightIcon = Activity;
      } else if (sortedCatStats.length > 1 && sortedCatStats[0].avg > sortedCatStats[sortedCatStats.length - 1].avg + 15) {
        insightMessage = `Your ${sortedCatStats[0].name} ideas are performing much better than your ${sortedCatStats[sortedCatStats.length - 1].name} concepts. This suggests your natural expertise in ${sortedCatStats[0].name} resonates more with your current style. Try focusing your next few ideas here.`;
        insightIcon = Trophy;
      } else {
        insightMessage = `You've established a very consistent thinking pattern across your saved ideas. To break through to the next level, try bringing the specificity of your ${sortedCatStats[0]?.name || 'Technology'} ideas into a completely new niche.`;
        insightIcon = BarChart3;
      }
    } else if (history.length > 0) {
      insightMessage = "Add at least 4 ideas so I can analyze your unique thinking style and provide personalized growth tips based on your data.";
      insightIcon = Search;
    }

    return {
      total: history.length,
      avgScore,
      topCategory,
      highestScore: highestScoreItem.score,
      highestScoreTitle: highestScoreItem.originalIdea,
      totalUniqueCats,
      insightMessage,
      insightIcon
    };
  }, [history]);

  const viewFromHistory = (item: IdeaAnalysis) => {
    setResult(item);
    setIdea(item.originalIdea);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
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
            <p className="text-sm text-slate-500">Input your content idea and let MindTrack analyze its potential.</p>
          </div>
          
          <div className="glass-card p-6 space-y-4">
            <textarea
              className="input-field"
              placeholder="Type your content idea here (e.g., 5 AI strategies for college students)..."
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
                  <div className={`flex items-center gap-2 text-sm font-medium ${result.isTooVague ? 'text-slate-400' : 'text-emerald-600'}`}>
                    {result.isTooVague ? (
                      <>
                        <RefreshCcw className="w-4 h-4 animate-spin-slow" />
                        Awaiting more context
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Ready for expansion
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Analysis */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Content Category Analysis</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.categories.map((cat, idx) => (
                    <motion.span
                      key={cat}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + (idx * 0.1) }}
                      className="px-4 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      {cat}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Idea Improvement Suggestions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Idea Improvement Suggestions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.suggestions.map((suggestion, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (idx * 0.1) }}
                      className="p-3 bg-white border border-slate-100 rounded-xl flex items-start gap-3 shadow-sm hover:border-amber-200 transition-colors"
                    >
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      <p className="text-xs font-medium text-slate-600 leading-relaxed">{suggestion}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Expansion Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800">Idea Expansion</h3>
                  {!result.isTooVague && (
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Derived Variations</span>
                  )}
                </div>
                
                {result.isTooVague ? (
                  <div className="p-8 text-center glass-card bg-slate-50/50 border-dashed">
                    <p className="text-slate-500 text-sm italic">Add more detail before generating idea expansions.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {result.expansions.map((exp, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ 
                          opacity: { delay: idx * 0.1 },
                          x: { delay: idx * 0.1 }
                        }}
                        onClick={() => handleAnalyze(exp)}
                        className="glass-card p-4 flex items-center justify-between group hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
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
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Analytics Dashboard */}
        <AnimatePresence>
          {history.length > 0 && analytics && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pt-12 border-t border-slate-200"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-800">Idea Analytics Dashboard</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: "Total Ideas", value: analytics.total, icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
                  { label: "Avg. Score", value: analytics.avgScore, icon: PieChart, color: "text-indigo-500", bg: "bg-indigo-50" },
                  { label: "Top Category", value: analytics.topCategory, icon: Tag, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { label: "High Score", value: analytics.highestScore, icon: Trophy, color: "text-amber-500", bg: "bg-amber-50" },
                  { label: "Total Cats", value: analytics.totalUniqueCats, icon: Layers, color: "text-purple-500", bg: "bg-purple-50" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-4 space-y-3 hover:shadow-md transition-shadow cursor-default"
                  >
                    <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-lg font-black text-slate-800 truncate">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Progress & Weekly Insight Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Your Idea Progress */}
                <div className="glass-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      Your Idea Progress
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Live Update</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
                        <span>Weekly Avg Score</span>
                        <span className="text-indigo-600">{analytics.avgScore}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          className="bg-indigo-600 h-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${analytics.avgScore}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Trophy className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Top Idea of Week</p>
                          <p className="text-sm font-bold text-slate-700 truncate">{analytics.highestScoreTitle}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Insight Message */}
                <div className="glass-card p-6 bg-gradient-to-br from-indigo-600 to-violet-700 text-white space-y-4 border-none shadow-indigo-100 shadow-xl overflow-hidden relative">
                  <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute bottom-[-20%] left-[-10%] w-24 h-24 bg-white/5 rounded-full blur-xl" />
                  
                  <div className="flex items-center gap-2 opacity-80">
                    <History className="w-4 h-4" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Weekly Insight</h3>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/20 shadow-lg">
                      <analytics.insightIcon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-lg font-medium leading-relaxed">
                      {analytics.insightMessage}
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-100/60">
                      <span className="w-1 h-1 rounded-full bg-indigo-200 animate-pulse" />
                      Dynamic content analysis active
                    </div>
                  </div>
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
              <p className="text-slate-400 text-sm italic">No saved ideas yet. Start by analyzing one!</p>
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
