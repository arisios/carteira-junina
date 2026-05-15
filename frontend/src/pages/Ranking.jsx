import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Bandeirinhas from '../components/Bandeirinhas';
import LoadingSpinner from '../components/LoadingSpinner';

const MEDALS = ['🥇','🥈','🥉'];

export default function Ranking() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = () => api.get('/wallet/ranking').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
    fetch();
    const t = setInterval(fetch, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-junina flex flex-col">
      <Bandeirinhas />
      <header className="px-4 py-3">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <h1 className="font-display text-xl font-bold" style={{color:'#4B1E6D'}}>🏆 Ranking</h1>
          <button onClick={() => navigate('/')} className="text-sm font-medium" style={{color:'#6F2DA8'}}>← Voltar</button>
        </div>
      </header>

      <main className="flex-1 px-4 pb-8">
        <div className="max-w-sm mx-auto">
          {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="lg" text="Carregando ranking..."/></div>
          ) : !data?.ranking?.length ? (
            <div className="card-junina p-10 text-center">
              <span className="text-5xl block mb-3">🪙</span>
              <p style={{color:'rgba(58,31,20,0.4)'}}>Nenhuma moeda coletada ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.ranking.map((u, i) => (
                <div key={i} className="card-junina p-4 flex items-center gap-3"
                  style={{border: i < 3 ? `2px solid rgba(199,154,59,${0.5 - i*0.15})` : undefined}}>
                  <span className="text-2xl w-8 text-center">{MEDALS[i] || `${i+1}º`}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{color:'#3A1F14'}}>{u.name}</p>
                    {u.instagram && <p className="text-xs" style={{color:'rgba(58,31,20,0.4)'}}>@{u.instagram}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg" style={{color:'#C79A3B'}}>{u.balance}</p>
                    <p className="text-xs" style={{color:'rgba(58,31,20,0.4)'}}>moedas</p>
                  </div>
                </div>
              ))}
              <p className="text-center text-xs pt-2" style={{color:'rgba(58,31,20,0.3)'}}>
                Atualizado às {new Date(data.updated_at).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}
              </p>
            </div>
          )}
        </div>
      </main>
      <Bandeirinhas />
    </div>
  );
}
