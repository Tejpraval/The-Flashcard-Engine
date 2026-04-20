import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { API_URL } from '../config';
import { Upload, Play, ArrowLeft } from 'lucide-react';

const DeckView: React.FC<{ id: string, token: string }> = ({ id, token }) => {
  const [, setLocation] = useLocation();
  const [deck, setDeck] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDeck = async () => {
    try {
      const res = await fetch(`${API_URL}/decks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      setDeck(data.deck);
      setCards(Array.isArray(data.cards) ? data.cards : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeck();
  }, [id, token]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
      const res = await fetch(`${API_URL}/decks/${id}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        await fetchDeck();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading Deck...</div>;
  if (!deck) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Deck not found.</div>;

  return (
    <div className="container animate-fade-in" style={{ marginTop: '24px' }}>
      <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', marginBottom: '24px' }} onClick={() => setLocation('/dashboard')}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>{deck.name}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {cards.length} Flashcards in this deck.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => setLocation(`/study/${id}`)}
            disabled={cards.length === 0}
          >
            <Play size={18} /> Start Study Session
          </button>
          
          <button 
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload size={18} /> {uploading ? 'Processing AI...' : 'Upload PDF & Generate Cards'}
          </button>
          <input 
            type="file" 
            accept="application/pdf" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Cards List</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {cards.map((card, index) => (
          <div key={card._id} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
             <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
               <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{index + 1}.</div>
               <div style={{ flex: 1 }}>
                 <div style={{ fontWeight: 600, marginBottom: '4px' }}>{card.question}</div>
                 <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{card.answer}</div>
               </div>
               {card.level && (
                  <span style={{ fontSize: '12px', background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px' }}>
                    Diff: {card.difficulty}
                  </span>
               )}
             </div>
          </div>
        ))}
        {cards.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            This deck is empty. Upload a PDF to automatically generate smart flashcards!
          </div>
        )}
      </div>

    </div>
  );
};

export default DeckView;
