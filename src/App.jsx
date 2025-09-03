import React, { useState, useEffect } from 'react';
import { Plus, Clock, MapPin, X, Check, Sun, Moon } from 'lucide-react';


const SmartTodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTodos = localStorage.getItem('smartTodos');
    const savedDarkMode = localStorage.getItem('smartTodosDarkMode');
    
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (error) {
        console.error('Error loading todos from localStorage:', error);
      }
    }
    
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('smartTodos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('smartTodosDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const GEMINI_API_KEY = 'AIzaSyBKe2u-zUb7FCExb0tjqm2JlRUHB5q---I';
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  const categories = [
    { id: 'all', label: 'All Tasks', color: 'category-gray', count: todos.length },
    { id: 'work', label: 'Work', color: 'category-blue', count: todos.filter(t => t.category === 'work').length },
    { id: 'school', label: 'School', color: 'category-green', count: todos.filter(t => t.category === 'school').length },
    { id: 'chores', label: 'Chores', color: 'category-yellow', count: todos.filter(t => t.category === 'chores').length },
    { id: 'project', label: 'Projects', color: 'category-purple', count: todos.filter(t => t.category === 'project').length }
  ];

  const extractTaskWithGemini = async (text) => {
    const prompt = `You are a task extraction assistant. Given a natural language sentence, extract the key details and return ONLY a valid JSON object with the following fields: { "title": string, "time": string | null, "venue": string | null, "category": "work" | "school" | "chores" | "project" } Rules: - "title" = short 2–6 word summary of the activity. - "time" = capture any mentioned time (e.g. "9pm", "14:30", "tomorrow 8am"), or null if missing. - "venue" = extract location (e.g. "AB1-324", "office", "home"), or null if missing. - "category" = classify task based on context: - work → meetings, office, job-related - school → classes, exams, assignments - chores → errands, groceries, cleaning, personal tasks - project → software projects, hackathons, coding tasks Return only JSON. Do not include explanations or extra text.

Text: "${text}"`;

    try {
      if (GEMINI_API_KEY === 'AIzaSyBKe2u-zUb7FCExb0tjqm2JlRUHB5q---I') {
        // Demo mode without API
        return {
          title: text.length > 30 ? text.substring(0, 30) + '...' : text,
          time: text.includes('pm') || text.includes('am') ? text.match(/\d{1,2}(?::\d{2})?\s*[ap]m/i)?.[0] || null : null,
          venue: text.match(/[A-Z]{2,3}\d+-\d+/) ? text.match(/[A-Z]{2,3}\d+-\d+/)[0] : null,
          category: text.toLowerCase().includes('meeting') ? 'work' : 
                   text.toLowerCase().includes('class') || text.toLowerCase().includes('exam') ? 'school' :
                   text.toLowerCase().includes('project') || text.toLowerCase().includes('code') ? 'project' : 'chores'
        };
      }

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return {
        title: text.length > 30 ? text.substring(0, 30) + '...' : text,
        time: null,
        venue: null,
        category: 'work'
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      const extractedTask = await extractTaskWithGemini(inputText);
      const newTodo = {
        id: Date.now(),
        ...extractedTask,
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      setTodos(prev => [...prev, newTodo]);
      setInputText('');
    } catch (error) {
      console.error('Error processing task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const filteredTodos = activeFilter === 'all' 
    ? todos 
    : todos.filter(todo => todo.category === activeFilter);

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : 'category-gray';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const themeColors = isDarkMode ? {
    bg: '#111827',
    cardBg: '#1f2937',
    headerBg: '#1f2937',
    sidebarBg: '#1f2937',
    inputBg: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    textMuted: '#9ca3af',
    border: '#374151',
    shadow: 'rgba(0, 0, 0, 0.3)'
  } : {
    bg: '#f9fafb',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    sidebarBg: '#ffffff',
    inputBg: '#ffffff',
    text: '#1f2937',
    textSecondary: '#4b5563',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    shadow: 'rgba(0, 0, 0, 0.1)'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: themeColors.bg, 
      fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        /* Matrix Background Styles */
        .matrix-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000;
          z-index: -1;
          overflow: hidden;
        }

        .matrix-pattern {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .matrix-column {
          position: absolute;
          top: -100%;
          width: 20px;
          height: 100%;
          font-size: 16px;
          line-height: 18px;
          font-weight: bold;
          animation: fall linear infinite;
          white-space: nowrap;
        }

        .matrix-column::before {
          content: "SELECT ME SELECT ME SELECT ME SELECT ME SELECT ME";
          position: absolute;
          top: 0;
          left: 0;
          background: linear-gradient(
            to bottom,
            #ffffff 0%,
            #ffffff 5%,
            #00ff41 10%,
            #00ff41 20%,
            #00dd33 30%,
            #00bb22 40%,
            #009911 50%,
            #007700 60%,
            #005500 70%,
            #003300 80%,
            rgba(0, 255, 65, 0.5) 90%,
            transparent 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          writing-mode: vertical-lr;
          letter-spacing: 1px;
        }

        /* Add all the nth-child rules and @keyframes from your CSS here */

        @keyframes fall {
          0% {
            transform: translateY(-10%);
            opacity: 1;
          }
          100% {
            transform: translateY(200%);
            opacity: 0;
          }
        }
        .menu-button {
          padding: 0.5rem;
          border: none;
          background: transparent;
          border-radius: 0.5rem;
          cursor: pointer;
        }
        .menu-button:hover {
          background-color: ${isDarkMode ? '#374151' : '#f3f4f6'};
        }
        .todo-card {
          background: ${themeColors.cardBg};
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px 0 ${themeColors.shadow};
          border: 1px solid ${themeColors.border};
          margin-bottom: 1rem;
        }
        .todo-card:hover {
          box-shadow: 0 10px 15px -3px ${themeColors.shadow};
        }
        .checkbox-button {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          border: 2px solid ${isDarkMode ? '#6b7280' : '#d1d5db'};
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-top: 0.25rem;
        }
        .checkbox-button:hover {
          border-color: #10b981;
          background-color: ${isDarkMode ? '#064e3b' : '#f0fdf4'};
        }
        .checkbox-button.completed {
          background-color: #10b981;
          border-color: #10b981;
        }
        .delete-button {
          padding: 0.5rem;
          border: none;
          background: transparent;
          color: ${themeColors.textMuted};
          border-radius: 0.5rem;
          cursor: pointer;
        }
        .delete-button:hover {
          color: #ef4444;
          background-color: ${isDarkMode ? '#7f1d1d' : '#fef2f2'};
        }
        .add-button {
          padding: 1rem 2rem;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-size: 1.125rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }
        .add-button:hover:not(:disabled) {
          background-color: #1d4ed8;
        }
        .add-button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }
        .input-field {
          width: 100%;
          padding: 1rem 1.5rem;
          font-size: 1.125rem;
          border: 2px solid ${themeColors.border};
          border-radius: 0.75rem;
          outline: none;
          background-color: ${themeColors.inputBg};
          color: ${themeColors.text};
        }
        .input-field:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
        }
        .input-field:disabled {
          opacity: 0.6;
        }
        .input-field::placeholder {
          color: ${themeColors.textMuted};
        }
        .category-gray { background-color: ${isDarkMode ? '#374151' : '#f3f4f6'}; color: ${isDarkMode ? '#d1d5db' : '#374151'}; }
        .category-blue { background-color: ${isDarkMode ? '#1e3a8a' : '#dbeafe'}; color: ${isDarkMode ? '#93c5fd' : '#1e40af'}; }
        .category-green { background-color: ${isDarkMode ? '#166534' : '#dcfce7'}; color: ${isDarkMode ? '#86efac' : '#166534'}; }
        .category-yellow { background-color: ${isDarkMode ? '#92400e' : '#fef3c7'}; color: ${isDarkMode ? '#fbbf24' : '#92400e'}; }
        .category-purple { background-color: ${isDarkMode ? '#7c2d12' : '#e9d5ff'}; color: ${isDarkMode ? '#c084fc' : '#7c2d12'}; }
        .category-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .sidebar-button {
          width: 100%;
          text-align: left;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 2px solid transparent;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          background: transparent;
          margin-bottom: 0.5rem;
          color: ${themeColors.text};
        }
        .sidebar-button:hover {
          background-color: ${isDarkMode ? '#374151' : '#f9fafb'};
        }
        .sidebar-button.active {
          background-color: ${isDarkMode ? '#1e3a8a' : '#eff6ff'};
          color: ${isDarkMode ? '#93c5fd' : '#1d4ed8'};
          border-color: ${isDarkMode ? '#3b82f6' : '#bfdbfe'};
          box-shadow: 0 4px 6px -1px ${themeColors.shadow};
        }
        .spinner {
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid white;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .demo-warning {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background-color: ${isDarkMode ? '#451a03' : '#fffbeb'};
          border: 1px solid ${isDarkMode ? '#92400e' : '#fbbf24'};
          border-radius: 0.5rem;
        }
        .completed-text {
          text-decoration: line-through;
          color: ${themeColors.textMuted};
        }
        .theme-toggle {
          position: fixed;
          top: 1rem;
          right: 1rem;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          border: none;
          background-color: #2563eb;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }
        .theme-toggle:hover {
          background-color: #1d4ed8;
        }
      `}</style>

      {/* Matrix Background */}
      <div className="matrix-container">
        <div className="matrix-pattern">
          {Array.from({ length: 40 }, (_, i) => (
            <div key={i} className="matrix-column"></div>
          ))}
        </div>
      </div>

      {/* Sidebar - Always Open */}
      <aside style={{
        width: '320px',
        height: '100vh',
        backgroundColor: themeColors.sidebarBg,
        borderRight: `1px solid ${themeColors.border}`,
        padding: '1.5rem',
        position: 'sticky',
        top: 0
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          color: themeColors.text, 
          marginBottom: '2rem' 
        }}>
          Task Categories
        </h2>
        <nav>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`sidebar-button ${activeFilter === category.id ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className={`category-badge ${category.color}`} style={{ marginRight: '1rem' }}>
                  {category.label}
                </span>
              </div>
              <span style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                {category.id === 'all' ? todos.length : todos.filter(t => t.category === category.id).length}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          backgroundColor: themeColors.headerBg,
          boxShadow: `0 1px 3px 0 ${themeColors.shadow}`,
          borderBottom: `1px solid ${themeColors.border}`,
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            color: themeColors.text, 
            letterSpacing: '-0.025em' 
          }}>
            2do for the lazies
          </h1>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '2rem', paddingBottom: '10rem', overflow: 'auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: themeColors.text, 
              marginBottom: '0.5rem' 
            }}>
              {categories.find(c => c.id === activeFilter)?.label || 'All Tasks'}
            </h2>
            <p style={{ color: themeColors.textSecondary, fontSize: '1.125rem' }}>
              {filteredTodos.length} {filteredTodos.length === 1 ? 'task' : 'tasks'} 
              {filteredTodos.filter(t => !t.completed).length > 0 && 
                ` • ${filteredTodos.filter(t => !t.completed).length} pending`
              }
            </p>
          </div>

          {/* Todo List */}
          <div>
            {filteredTodos.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '4rem' }}>
                <div style={{ 
                  width: '5rem', 
                  height: '5rem', 
                  backgroundColor: themeColors.border, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1.5rem' 
                }}>
                  <Plus size={32} style={{ color: themeColors.textMuted }} />
                </div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: themeColors.textSecondary, 
                  marginBottom: '0.5rem' 
                }}>
                  No tasks yet
                </h3>
                <p style={{ color: themeColors.textMuted }}>
                  Add your first task using natural language below!
                </p>
              </div>
            ) : (
              filteredTodos.map(todo => (
                <div
                  key={todo.id}
                  className="todo-card"
                  style={{ opacity: todo.completed ? 0.6 : 1 }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`checkbox-button ${todo.completed ? 'completed' : ''}`}
                    >
                      {todo.completed && <Check size={14} style={{ color: 'white' }} />}
                    </button>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <h3 style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: '600',
                          color: todo.completed ? themeColors.textMuted : themeColors.text
                        }} className={todo.completed ? 'completed-text' : ''}>
                          {todo.title}
                        </h3>
                        <span className={`category-badge ${getCategoryColor(todo.category)}`}>
                          {todo.category}
                        </span>
                      </div>
                      
                      {(todo.time || todo.venue) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: themeColors.textSecondary }}>
                          {todo.time && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Clock size={16} style={{ color: '#3b82f6' }} />
                              <span style={{ fontWeight: '500' }}>{todo.time}</span>
                            </div>
                          )}
                          {todo.venue && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <MapPin size={16} style={{ color: '#8b5cf6' }} />
                              <span style={{ fontWeight: '500' }}>{todo.venue}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="delete-button"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        {/* Fixed Input Form */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '320px',
          right: 0,
          backgroundColor: themeColors.inputBg,
          borderTop: `1px solid ${themeColors.border}`,
          boxShadow: `0 -4px 6px -1px ${themeColors.shadow}`,
          zIndex: 20,
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your task naturally... (e.g., 'Meeting about Python dependencies in AB1-324 at 9pm')"
                className="input-field"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !inputText.trim()}
              className="add-button"
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                <Plus size={22} />
              )}
              {isLoading ? 'Processing...' : 'Add Task'}
            </button>
          </div>
          {GEMINI_API_KEY === 'AIzaSyBKe2u-zUb7FCExb0tjqm2JlRUHB5q---I' && (
            <div className="demo-warning">
              <p style={{ color: isDarkMode ? '#fbbf24' : '#92400e', fontWeight: '500', margin: 0 }}>
                <strong>Trust Mode:</strong> Please don't steal my gemini api. pls.
                <br />
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="theme-toggle"
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  );
};

export default SmartTodoApp;