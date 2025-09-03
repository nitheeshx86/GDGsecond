import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const TaskInput = ({ onAddTodo }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    
    try {
      // Replace this with your actual Gemini API call
      const parsedData = await callGeminiAPI(input);
      
      const newTodo = {
        id: Date.now(),
        ...parsedData
      };
      
      onAddTodo(newTodo);
      setInput('');
    } catch (error) {
      console.error('Error parsing task:', error);
      // Fallback to mock parsing if API fails
      const mockParsedData = simulateGeminiAPI(input);
      const newTodo = {
        id: Date.now(),
        ...mockParsedData
      };
      onAddTodo(newTodo);
      setInput('');
    } finally {
      setIsLoading(false);
    }
  };

  // Your actual Gemini API call function
  const callGeminiAPI = async (text) => {
    const GEMINI_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    const prompt = `You are a task extraction assistant. 
Given a natural language sentence, extract the key details and return ONLY a valid JSON object with the following fields:
{
  "title": string,
  "time": string | null,
  "venue": string | null,
  "category": "work" | "school" | "chores" | "project"
}
Rules:
- "title" = short 2–6 word summary of the activity.
- "time" = capture any mentioned time (e.g. "9pm", "14:30", "tomorrow 8am"), or null if missing.
- "venue" = extract location (e.g. "AB1-324", "office", "home"), or null if missing.
- "category" = classify task based on context:
  - work → meetings, office, job-related
  - school → classes, exams, assignments
  - chores → errands, groceries, cleaning, personal tasks
  - project → software projects, hackathons, coding tasks
Return only JSON. Do not include explanations or extra text.

Text to parse: "${text}"`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
      throw new Error('API call failed');
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON response
    return JSON.parse(generatedText);
  };

  // Mock function for demo purposes (remove this when using real API)
  const simulateGeminiAPI = (text) => {
    const lowerText = text.toLowerCase();
    
    // Extract time patterns
    const timeMatch = text.match(/(\d{1,2}(?::\d{2})?(?:am|pm)|tomorrow|today|\d{1,2}(?::\d{2})?)/i);
    const time = timeMatch ? timeMatch[0] : null;
    
    // Extract venue patterns (room numbers, locations)
    const venueMatch = text.match(/(?:in|at|room)\s+([A-Z0-9-]+|\w+(?:\s+\w+)*)/i) || 
                     text.match(/([A-Z]+\d+-\d+)/);
    const venue = venueMatch ? venueMatch[1] || venueMatch[0] : null;
    
    // Determine category
    let category = 'project';
    if (lowerText.includes('meeting') || lowerText.includes('office') || lowerText.includes('work')) {
      category = 'work';
    } else if (lowerText.includes('class') || lowerText.includes('exam') || lowerText.includes('assignment') || lowerText.includes('school')) {
      category = 'school';
    } else if (lowerText.includes('grocery') || lowerText.includes('clean') || lowerText.includes('chore')) {
      category = 'chores';
    }
    
    // Extract title (remove time and venue information)
    let title = text
      .replace(/(?:in|at|room)\s+[A-Z0-9-]+/gi, '')
      .replace(/\d{1,2}(?::\d{2})?(?:am|pm)/gi, '')
      .replace(/tomorrow|today/gi, '')
      .trim();
    
    // Shorten title to 2-6 words
    const words = title.split(' ').filter(word => word.length > 0);
    title = words.slice(0, 6).join(' ') || 'New Task';
    
    return { title, time, venue, category };
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="I am having a meeting about python dependencies in AB1-324 at 9pm"
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-8 py-4 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>
        
        <p className="text-white/40 text-sm mt-3 text-center">
          Try: "Meeting about project review in conference room A at 2pm" or "Buy groceries at the store"
        </p>
      </div>
    </div>
  );
};

export default TaskInput;