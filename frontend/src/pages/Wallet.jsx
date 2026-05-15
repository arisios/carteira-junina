import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import Bandeirinhas from '../components/Bandeirinhas';
import LoadingSpinner from '../components/LoadingSpinner';

const fmtDate = (d) => new Date(d).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });

export default function Wallet() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/wallet').then(r => setData(r.data)).catch(() => toast.error('Erro ao carregar carteira')).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="min-h-screen bg-junina flex items-center justify-center"><LoadingSpinner size="lg" text="Carregando carteira..."/></div>;

  const { balance = 0, transactions = [] } = data || {};

  return (
    <div className="min-h-screen bg-junina flex flex-col">
      <Bandeirinhas />

      <header className="px-4 py-3">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold" style={{color:'#4B1E6D'}}>Carteira Junina</h1>
            <p className="text-xs" style={{color:'#C79A3B'}}>{user?.name || user?.instagram}</p>
          </div>
          <button onClick={logout} className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{color:'#6F2DA8'}}>Sair</button>
        </div>
      </header>

      <main className="flex-1 px-4 pb-8">
        <div className="max-w-sm mx-auto space-y-4">

          {/* Saldo */}
          <div className="card-junina p-6 text-center animate-pop" style={{border:'2px solid rgba(199,154,59,0.3)'}}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:'rgba(58,31,20,0.4)'}}>Seu saldo</p>
            <div className="flex items-center justify-center gap-3">
              <div className="text-5xl animate-pulse-coin" style={{filter:'drop-shadow(0 4px 8px rgba(199,154,59,0.4))'}}>🪙</div>
              <div>
                <p className="text-6xl font-black" style={{color:'#C79A3B',lineHeight:1}}>{balance}</p>
                <p className="text-sm font-semibold" style={{color:'rgba(58,31,20,0.4)'}}>moedas juninas</p>
              </div>
            </div>
          </div>

          {/* Botão coletar */}
          <button onClick={() => navigate('/coletar')} className="btn-primary py-4 text-lg animate-slide-up">
            📡 Coletar moedas
          </button>

          <button onClick={() => navigate('/ranking')} className="btn-secondary py-3 text-sm">
            🏆 Ver ranking
          </button>

          {/* Histórico */}
          <div className="card-junina p-4">
            <h2 className="font-display font-bold mb-3" style={{color:'#4B1E6D'}}>Histórico</h2>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl block mb-2">🌽</span>
                <p className="text-sm" style={{color:'rgba(58,31,20,0.4)'}}>Nenhuma transação ainda</p>
                <p className="text-xs mt-1" style={{color:'rgba(58,31,20,0.3)'}}>Colete moedas nos pontos do evento!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-2 px-3 rounded-xl" style={{background:'rgba(199,154,59,0.06)'}}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{t.amount > 0 ? '🪙' : '💸'}</span>
                      <div>
                        <p className="text-sm font-semibold" style={{color:'#3A1F14'}}>{t.description}</p>
                        <p className="text-xs" style={{color:'rgba(58,31,20,0.4)'}}>{fmtDate(t.created_at)}</p>
                      </div>
                    </div>
                    <span className="font-black text-sm" style={{color: t.amount > 0 ? '#C79A3B' : '#C21874'}}>
                      {t.amount > 0 ? '+' : ''}{t.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Bandeirinhas />
    </div>
  );
}
