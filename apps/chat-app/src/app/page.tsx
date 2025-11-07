'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

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
      } else if (response.status === 401) {
        router.push('/login');
      } else {
        // Handle other error responses and provide user feedback
        const errorMsg = data?.error || 'An error occurred. Please try again later.';
        setMessages([...newMessages, { role: 'assistant', content: errorMsg }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Busy Chat Assistant</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              Welcome, {session.user?.email || session.user?.name || 'User'}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
        
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
