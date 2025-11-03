'use client';

import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Busy Chat Assistant</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4 h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500">Start a conversation...</p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-4 p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-100 dark:bg-blue-900 ml-auto max-w-[80%]'
                    : 'bg-gray-100 dark:bg-gray-700 mr-auto max-w-[80%]'
                }`}
              >
                <p className="font-semibold text-xs mb-1">
                  {msg.role === 'user' ? 'You' : 'Assistant'}
                </p>
                <p>{msg.content}</p>
              </div>
            ))
          )}
          {loading && (
            <div className="text-gray-500 animate-pulse">Assistant is typing...</div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
