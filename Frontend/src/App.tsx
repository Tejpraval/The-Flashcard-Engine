import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DeckView from './pages/DeckView';
import StudyMode from './pages/StudyMode';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { token, login, logout, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  if (!isAuthenticated && location !== '/login') {
    setLocation('/login');
    return null;
  }

  return (
    <div>
      {isAuthenticated && (
        <nav style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div 
            style={{ fontWeight: 800, fontSize: '20px', cursor: 'pointer' }}
            className="text-gradient"
            onClick={() => setLocation('/dashboard')}
          >
            FlashMind
          </div>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={logout}>
            Logout
          </button>
        </nav>
      )}

      <main style={{ paddingBottom: '40px' }}>
        <Switch>
          <Route path="/login">
            {isAuthenticated ? (
               () => { setLocation('/dashboard'); return null; }
            ) : (
               <Login onLogin={login} />
            )}
          </Route>
          
          <Route path="/dashboard">
            <Dashboard token={token!} />
          </Route>
          
          <Route path="/deck/:id">
            {params => <DeckView id={params!.id} token={token!} />}
          </Route>
          
          <Route path="/study/:id">
            {params => <StudyMode id={params!.id} token={token!} />}
          </Route>
          
          <Route path="/">
            {() => { setLocation('/dashboard'); return null; }}
          </Route>
        </Switch>
      </main>
    </div>
  );
};

export default App;
