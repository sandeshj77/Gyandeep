
import React from 'react';
import { Plus, Trash2, Edit, Save, Upload, Search, Settings, List, Users, BarChart3, X, Check, BookOpen, Trash, FileDown, FileUp, ChevronDown, Sparkles, Wand2, ArrowLeft, Clock, ToggleLeft, ToggleRight, Hash } from 'lucide-react';
import { Question, QuizSettings, Difficulty, UserProfile } from '../types';
import { generateAIQuestions } from '../services/geminiService';

interface AdminPanelProps {
  questions: Question[];
  categories: any[];
  currentSettings: QuizSettings;
  onSettingsChange: (settings: QuizSettings) => void;
  onQuestionsChange: (questions: Question[]) => void;
  onCategoriesChange: (cats: any[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  questions, categories, currentSettings, onSettingsChange, onQuestionsChange, onCategoriesChange 
}) => {
  const [activeAdminTab, setActiveAdminTab] = React.useState<'questions' | 'categories' | 'manage_quizzes' | 'ai' | 'users' | 'settings'>('questions');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isEditingQuestion, setIsEditingQuestion] = React.useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // AI Generator State
  const [aiTopic, setAiTopic] = React.useState('');
  const [aiCount, setAiCount] = React.useState(5);
  const [aiDifficulty, setAiDifficulty] = React.useState<Difficulty>('Medium');
  const [isGenerating, setIsGenerating] = React.useState(false);

  // User Stats State
  const [registeredUsers, setRegisteredUsers] = React.useState<UserProfile[]>([]);

  const [currentQuestion, setCurrentQuestion] = React.useState<Partial<Question>>({
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'Easy'
  });

  React.useEffect(() => {
    // Load mock users from localStorage
    const savedUsers = localStorage.getItem('gd_all_users');
    if (savedUsers) setRegisteredUsers(JSON.parse(savedUsers));
  }, [activeAdminTab]);

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Delete this question?')) {
      onQuestionsChange(questions.filter(q => q.id !== id));
    }
  };

  const handleClearAll = () => {
    if (confirm('ARE YOU SURE? This will delete EVERY question in the database!')) {
      onQuestionsChange([]);
    }
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.question || !currentQuestion.category) return;

    let updatedQuestions;
    if (currentQuestion.id) {
      updatedQuestions = questions.map(q => q.id === currentQuestion.id ? (currentQuestion as Question) : q);
    } else {
      const newQuestion = { ...currentQuestion, id: Date.now().toString() } as Question;
      updatedQuestions = [...questions, newQuestion];
    }
    
    onQuestionsChange(updatedQuestions);
    setIsEditingQuestion(false);
    setCurrentQuestion({ options: ['', '', '', ''], correctAnswer: 0, difficulty: 'Easy' });
  };

  const handleAddCategory = () => {
    const name = prompt('Category Name (Nepali or English):');
    if (name) {
      const id = name.toLowerCase().replace(/\s+/g, '_').substring(0, 15);
      const icon = prompt('Category Icon (Emoji):', '📚') || '📚';
      onCategoriesChange([...categories, { id, name, icon, enabled: true, maxQuestions: currentSettings.questionsPerQuiz }]);
    }
  };

  const handleUpdateCategory = (id: string, updates: any) => {
    const updated = categories.map(cat => cat.id === id ? { ...cat, ...updates } : cat);
    onCategoriesChange(updated);
  };

  const handleAIQuestionsGenerate = async () => {
    if (!aiTopic) return;
    setIsGenerating(true);
    try {
      const newBatch = await generateAIQuestions(aiTopic, aiCount, aiDifficulty);
      onQuestionsChange([...questions, ...newBatch]);
      alert(`Successfully generated and added ${newBatch.length} questions about ${aiTopic}!`);
      setAiTopic('');
      setActiveAdminTab('questions');
    } catch (err) {
      alert("AI Generation failed. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        const newQuestions: Question[] = [];
        const startIdx = lines[0].toLowerCase().includes('question') ? 1 : 0;

        for (let i = startIdx; i < lines.length; i++) {
          const parts = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          if (!parts || parts.length < 6) continue;

          const clean = parts.map(p => p.replace(/^"|"$/g, '').trim());
          const [question, op1, op2, op3, op4, correct, category, difficulty, explanation, hint] = clean;

          newQuestions.push({
            id: Math.random().toString(36).substr(2, 9),
            question: question,
            options: [op1, op2, op3, op4] as [string, string, string, string],
            correctAnswer: parseInt(correct) || 0,
            category: (category || 'gk').toLowerCase(),
            difficulty: (difficulty as Difficulty) || 'Medium',
            explanation: explanation || '',
            hint: hint || ''
          });
        }

        if (newQuestions.length > 0) {
          onQuestionsChange([...questions, ...newQuestions]);
          alert(`Import Successful: ${newQuestions.length} questions added.`);
        }
      } catch (err) {
        alert("Error parsing CSV.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const downloadCsvTemplate = () => {
    const header = "question,option1,option2,option3,option4,correctAnswerIndex,category,difficulty,explanation,hint\n";
    const example = "\"Who is the PM of Nepal?\",\"A\",\"B\",\"C\",\"D\",0,gk,Easy,\"Explanation...\",\"Hint...\"\n";
    const blob = new Blob([header + example], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gyandeep_import.csv';
    a.click();
  };

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex gap-2 overflow-x-auto no-scrollbar">
        {(['questions', 'categories', 'manage_quizzes', 'ai', 'users', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveAdminTab(tab)}
            className={`flex-1 min-w-[120px] px-6 py-3 rounded-xl text-sm font-black capitalize transition-all ${
              activeAdminTab === tab ? 'bg-blue-700 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab === 'ai' ? 'AI Generator' : tab === 'users' ? 'Learner Base' : tab === 'manage_quizzes' ? 'Manage Quizzes' : tab}
          </button>
        ))}
      </div>

      {activeAdminTab === 'questions' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">MCQ Database</h2>
              <p className="text-slate-500 text-sm">Managing {questions.length} questions in the system.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleCsvUpload} />
              <button onClick={downloadCsvTemplate} className="bg-slate-50 text-slate-600 px-4 py-3 rounded-2xl font-bold border-2 border-slate-200 hover:bg-white transition-all"><FileDown size={18} /></button>
              <button onClick={() => fileInputRef.current?.click()} className="bg-slate-50 text-blue-700 px-6 py-3 rounded-2xl font-bold border-2 border-blue-100 hover:bg-white transition-all"><FileUp size={18} /> CSV</button>
              <button onClick={handleClearAll} className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold border-2 border-red-100 hover:bg-white transition-all"><Trash size={18} /> Wipe</button>
              <button onClick={() => { setIsEditingQuestion(true); setCurrentQuestion({ options: ['', '', '', ''], correctAnswer: 0, difficulty: 'Easy' }); }} className="bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-800 transition-all"><Plus size={18} /> New Question</button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-4 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search in questions database..."
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="px-6 py-4">Question</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questions.filter(q => q.question.toLowerCase().includes(searchTerm.toLowerCase())).map(q => (
                  <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 max-w-md truncate">{q.question}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 capitalize font-medium">{q.category.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => { setCurrentQuestion(q); setIsEditingQuestion(true); }} className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeAdminTab === 'categories' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Exam Categories</h2>
            <button onClick={handleAddCategory} className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
              <Plus size={18} /> New Category
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white p-6 rounded-3xl border-2 border-slate-100 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 leading-tight">{cat.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">ID: {cat.id}</span>
                  </div>
                </div>
                <button onClick={() => onCategoriesChange(categories.filter(c => c.id !== cat.id))} className="text-red-500 p-3 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeAdminTab === 'manage_quizzes' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Quiz Management</h2>
            <p className="text-slate-500 text-sm">Control quiz status and per-topic question limits.</p>
          </div>
          
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="px-6 py-4">Quiz Topic</th>
                  <th className="px-6 py-4">Available Qs</th>
                  <th className="px-6 py-4">Question Limit</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map(cat => {
                  const count = questions.filter(q => q.category === cat.id).length;
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{cat.icon}</span>
                          <span className="font-bold text-slate-800">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                          {count} Questions
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Hash size={14} className="text-slate-400" />
                          <input 
                            type="number"
                            min="1"
                            max={count || 50}
                            className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold outline-none focus:bg-white focus:border-blue-500"
                            value={cat.maxQuestions || currentSettings.questionsPerQuiz}
                            onChange={(e) => handleUpdateCategory(cat.id, { maxQuestions: parseInt(e.target.value) })}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleUpdateCategory(cat.id, { enabled: cat.enabled === false ? true : false })}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                            cat.enabled !== false 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {cat.enabled !== false ? <><ToggleRight size={18} /> Active</> : <><ToggleLeft size={18} /> Disabled</>}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeAdminTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Learner Community</h2>
            <p className="text-slate-500 text-sm">Monitoring engagement and preparation time.</p>
          </div>
          
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Exam Goal</th>
                  <th className="px-6 py-4">Accuracy</th>
                  <th className="px-6 py-4">Time Spent</th>
                  <th className="px-6 py-4">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registeredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">No users registered in the system yet.</td>
                  </tr>
                ) : (
                  registeredUsers.map(u => (
                    <tr key={u.email} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} className="w-8 h-8 rounded-full bg-slate-100" />
                          <div>
                            <div className="font-bold text-slate-800">{u.name}</div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{u.examPreference}</span>
                      </td>
                      <td className="px-6 py-4 font-black text-blue-600">{u.accuracy}%</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <Clock size={14} /> {u.timeSpent || 0}m
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                        {u.lastActive ? new Date(u.lastActive).toLocaleString() : 'Never'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeAdminTab === 'ai' && (
        <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-6">
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-xl text-center">
            <div className="bg-indigo-100 text-indigo-700 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Sparkles size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">AI Question Generator</h2>
            <p className="text-slate-500 mb-8">Let Gemini create custom Loksewa/Banking questions in seconds.</p>
            
            <div className="space-y-6 text-left">
              <div>
                <label className="block text-sm font-black text-slate-600 mb-2">Topic / Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g. Nepal History, Rivers of Nepal, Computer Basics..."
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white focus:border-blue-600 transition-all outline-none"
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-slate-600 mb-2">Difficulty</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white outline-none"
                    value={aiDifficulty}
                    onChange={e => setAiDifficulty(e.target.value as Difficulty)}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-600 mb-2">Question Count</label>
                  <input 
                    type="number" 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white outline-none"
                    value={aiCount}
                    onChange={e => setAiCount(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <button 
                onClick={handleAIQuestionsGenerate}
                disabled={isGenerating || !aiTopic}
                className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all disabled:opacity-50"
              >
                {isGenerating ? 'Waving Magic Wand...' : <><Wand2 size={24} /> Generate with AI</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeAdminTab === 'settings' && (
        <div className="bg-white p-10 rounded-3xl border-2 border-slate-100 shadow-xl max-w-xl mx-auto animate-in slide-in-from-bottom-6">
          <h2 className="text-2xl font-black text-slate-800 mb-8 border-b pb-4">Global Quiz Rules</h2>
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">Questions Per Session</label>
              <input 
                type="number" 
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                value={currentSettings.questionsPerQuiz}
                onChange={e => onSettingsChange({...currentSettings, questionsPerQuiz: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">Time Limit (Sec/Question)</label>
              <input 
                type="number" 
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                value={currentSettings.timeLimitPerQuestion}
                onChange={e => onSettingsChange({...currentSettings, timeLimitPerQuestion: parseInt(e.target.value)})}
              />
            </div>
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
              <span className="font-bold text-slate-800">Show Countdown Timer</span>
              <button 
                onClick={() => onSettingsChange({...currentSettings, showTimer: !currentSettings.showTimer})}
                className={`w-14 h-7 rounded-full transition-colors ${currentSettings.showTimer ? 'bg-blue-600' : 'bg-slate-300'} relative shadow-inner`}
              >
                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${currentSettings.showTimer ? 'translate-x-7' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isEditingQuestion && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveQuestion} className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 border border-slate-200">
            <div className="flex justify-between items-center mb-8">
              <button 
                type="button" 
                onClick={() => setIsEditingQuestion(false)} 
                className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                <ArrowLeft size={18} /> Back to Database
              </button>
              <h3 className="text-2xl font-black text-slate-800">{currentQuestion.id ? 'Edit MCQ' : 'New MCQ'}</h3>
              <button type="button" onClick={() => setIsEditingQuestion(false)} className="p-3 hover:bg-slate-100 rounded-full transition-all"><X /></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Question Text (Nepali/English)</label>
                <textarea 
                  required
                  placeholder="Enter the question narrative..."
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all h-28"
                  value={currentQuestion.question || ''}
                  onChange={e => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Category</label>
                  <select 
                    required
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none cursor-pointer"
                    value={currentQuestion.category || ''}
                    onChange={e => setCurrentQuestion({...currentQuestion, category: e.target.value})}
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-11 text-slate-400 pointer-events-none" size={16} />
                </div>
                <div className="relative">
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Difficulty</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none cursor-pointer"
                    value={currentQuestion.difficulty}
                    onChange={e => setCurrentQuestion({...currentQuestion, difficulty: e.target.value as Difficulty})}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-11 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-black uppercase text-slate-400 ml-1 tracking-widest">Options</label>
                {currentQuestion.options?.map((opt, i) => (
                  <div key={i} className="flex gap-3">
                    <input 
                      required
                      type="text" 
                      placeholder={`Option ${String.fromCharCode(65+i)}`}
                      className={`flex-1 px-5 py-3 border-2 rounded-2xl outline-none font-medium transition-all ${currentQuestion.correctAnswer === i ? 'border-green-500 bg-green-50 text-green-900' : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-blue-600'}`}
                      value={opt}
                      onChange={e => {
                        const next = [...(currentQuestion.options || [])];
                        next[i] = e.target.value;
                        setCurrentQuestion({...currentQuestion, options: next as [string, string, string, string]});
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: i})}
                      className={`px-5 py-3 rounded-2xl border-2 font-black text-xs uppercase transition-all ${currentQuestion.correctAnswer === i ? 'bg-green-600 border-green-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-600'}`}
                    >
                      {currentQuestion.correctAnswer === i ? <Check size={18} /> : 'Correct'}
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Detailed Explanation</label>
                <input 
                  type="text" 
                  placeholder="Explain why this answer is correct..."
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  value={currentQuestion.explanation || ''}
                  onChange={e => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-700 text-white py-5 rounded-3xl font-black text-lg mt-8 shadow-xl hover:bg-blue-800 transition-all active:scale-[0.98]">
              Save MCQ Record
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
