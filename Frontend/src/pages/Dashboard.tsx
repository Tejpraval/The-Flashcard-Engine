import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { API_URL } from '../config';
import { FileUp, BookOpen, Flame, Plus } from 'lucide-react';

interface Deck {
  _id: string;
  name: string;
  tags: string[];
  createdAt: string;
}

const Dashboard: React.FC<{ token: string }> = ({ token }) => {
  const [, setLocation] = useLocation();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Create deck state
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [decksRes, progRes] = await Promise.all([
        fetch(`${API_URL}/decks`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/study/progress`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const decksData = await decksRes.json();
      const progData = await progRes.json();
      
      if (decksRes.status === 401 || progRes.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      setDecks(Array.isArray(decksData) ? decksData : []);
      setProgress(progData);
    } catch (err) {
      console.error('Error fetching dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    
    try {
      const res = await fetch(`${API_URL}/decks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newDeckName })
      });
      const data = await res.json();
      setDecks([data, ...decks]);
      setNewDeckName('');
      setIsCreating(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading your mind palace...</div>;

  return (
    <div className="container animate-fade-in" style={{ marginTop: '40px' }}>
      
      {/* Progress Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
           <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '16px', borderRadius: 'var(--radius-full)', color: 'var(--warning)' }}>
              <Flame size={32} />
           </div>
           <div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Daily Streak</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{progress?.user?.streak || 0} Days</div>
           </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
           <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: 'var(--radius-full)', color: 'var(--success)' }}>
              <BookOpen size={32} />
           </div>
           <div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Upcoming Reviews</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{progress?.dueReviews || 0} Cards</div>
           </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Your Decks</h2>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsCreating(true)}>
          <Plus size={18} /> New Deck
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateDeck} className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px' }}>
           <input 
             autoFocus
             type="text" 
             className="input-field" 
             placeholder="E.g., Quantum Physics Ch. 3" 
             value={newDeckName}
             onChange={(e) => setNewDeckName(e.target.value)}
           />
           <button type="submit" className="btn-primary">Create</button>
           <button type="button" className="btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {decks.map(deck => (
          <div 
            key={deck._id}
            className="glass-panel" 
            style={{ padding: '24px', transition: 'transform var(--transition-fast)', cursor: 'pointer' }}
            onClick={() => setLocation(`/deck/${deck._id}`)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{deck.name}</h3>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {deck.tags?.length ? deck.tags.join(', ') : 'No tags'}
            </div>
            <div style={{ marginTop: '16px', color: 'var(--accent-primary)', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Open Deck &rarr;
            </div>
          </div>
        ))}
        {decks.length === 0 && !isCreating && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', color: 'var(--text-secondary)' }}>
            <FileUp size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>No decks found. Create a new deck to get started and upload your PDFs!</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
