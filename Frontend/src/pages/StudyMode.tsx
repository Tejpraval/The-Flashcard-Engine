import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { API_URL } from '../config';
import { X, Sparkles } from 'lucide-react';

const StudyMode: React.FC<{ id: string, token: string }> = ({ id, token }) => {
  const [, setLocation] = useLocation();
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showHint, setShowHint] = useState(false); // Delight factor

  useEffect(() => {
    const fetchStudyCards = async () => {
      try {
        const res = await fetch(`${API_URL}/study/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        setCards(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudyCards();
  }, [id, token]);

  const handleReview = useCallback(async (grade: number) => {
    const currentCard = cards[currentIndex];
    
    // Optimistic UI advance
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFlipped(false);
      setShowHint(false);
    } else {
      setSessionComplete(true);
    }

    try {
      await fetch(`${API_URL}/study/review`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ cardId: currentCard._id, grade })
      });
    } catch (err) {
      console.error(err);
    }
  }, [cards, currentIndex, token]);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionComplete || loading) return;

      if (!flipped && e.code === 'Space') {
        e.preventDefault();
        setFlipped(true);
      } else if (flipped) {
        if (e.key === '1') handleReview(1);
        if (e.key === '2') handleReview(2);
        if (e.key === '3') handleReview(3);
        if (e.key === '4') handleReview(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipped, handleReview, sessionComplete, loading]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Preparing your optimal study path...</div>;

  if (cards.length === 0 || sessionComplete) {
    return (
      <div className="container animate-fade-in" style={{ marginTop: '100px', textAlign: 'center', maxWidth: '600px' }}>
        <Sparkles size={64} className="text-gradient" style={{ margin: '0 auto 24px' }} />
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>Session Complete!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Great job! You've successfully reviewed all due cards for this deck. Your progress is saved.
        </p>
        <button className="btn-primary" onClick={() => setLocation('/dashboard')}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  const card = cards[currentIndex];

  const handleHintRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real scenario, this would call another Gemini endpoint like `/api/cards/:id/hint`
    // to dynamically generate a hint. For simplicity here we just show the first few words or a generic hint.
    setShowHint(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '24px', backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px' }}>
        <button 
          onClick={() => setLocation(`/deck/${id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}
        >
          <X size={24} /> Cancel Session
        </button>
        <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      {/* Main Card Area */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', perspective: '1000px' }}>
        <div 
          onClick={() => !flipped && setFlipped(true)}
          style={{ 
            width: '100%', 
            maxWidth: '600px', 
            height: '400px',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: flipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
            cursor: flipped ? 'default' : 'pointer'
          }}
        >
          {/* Card Front */}
          <div 
            className="glass-panel"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', position: 'absolute', top: '24px' }}>
              {card.topic}
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 600 }}>{card.question}</h2>
            
            <div style={{ position: 'absolute', bottom: '24px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {!showHint ? (
                  <button onClick={handleHintRequest} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--info)' }}>
                     <Sparkles size={16}/> Explain Simpler / Hint
                  </button>
              ) : (
                  <div style={{ color: 'var(--info)', fontSize: '14px', fontStyle: 'italic' }}>
                    Hint: Think about definitions relating to {card.tags?.[0] || 'the core subject'}.
                  </div>
              )}
              <div style={{ opacity: 0.5 }}>Click or press Spacebar to show answer</div>
            </div>
          </div>

          {/* Card Back */}
          <div 
            className="glass-panel"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateX(180deg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--accent-primary)',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 400 }}>{card.answer}</h2>
          </div>
        </div>
      </div>

      {/* Assessment Controls */}
      <div style={{ height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: flipped ? 1 : 0, pointerEvents: flipped ? 'auto' : 'none', transition: 'opacity 0.3s ease', gap: '16px' }}>
         <button onClick={() => handleReview(1)} style={{ padding: '16px 24px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--danger)', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            Again<span style={{ fontSize: '12px', opacity: 0.6 }}>(1)</span>
         </button>
         <button onClick={() => handleReview(2)} style={{ padding: '16px 24px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--warning)', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            Hard<span style={{ fontSize: '12px', opacity: 0.6 }}>(2)</span>
         </button>
         <button onClick={() => handleReview(3)} style={{ padding: '16px 24px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--success)', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            Good<span style={{ fontSize: '12px', opacity: 0.6 }}>(3)</span>
         </button>
         <button onClick={() => handleReview(4)} style={{ padding: '16px 24px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--info)', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            Easy<span style={{ fontSize: '12px', opacity: 0.6 }}>(4)</span>
         </button>
      </div>

    </div>
  );
};

export default StudyMode;
