import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import Bandeirinhas from '../components/Bandeirinhas';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Claim() {
  const { token } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | already | error
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!user) { navigate(`/login`); return; }
    api.post(`/wallet/claim/${token}`)
      .then(r => { setResult(r.data); setStatus('success'); })
      .catch(err => {
        if (err.response?.data?.already_claimed) { setStatus('already'); }
        else { setResult(err.response?.data); setStatus('error'); }
      });
  }, [token, user]);

  return (
    <div className="min-h-screen bg-junina flex flex-col">
      <Bandeirinhas />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm animate-pop">

          {status === 'loading' && (
            <div className="card-junina p-10 text-center">
              <LoadingSpinner size="lg" text="Verificando ponto..."/>
            </div>
          )}

          {status === 'success' && (
            <div className="card-junina p-8 text-center" style={{border:'2px solid rgba(199,154,59,0.4)'}}>
              <div className="text-6xl mb-4 animate-bounce-in">🪙</div>
              <h2 className="font-display text-2xl font-bold mb-2" style={{color:'#4B1E6D'}}>Moedas coletadas!</h2>
              <p className="text-4xl font-black mb-1" style={{color:'#C79A3B'}}>+{result?.points}</p>
              <p className="text-sm mb-1" style={{color:'rgba(58,31,20,0.5)'}}>em {result?.campaign}</p>
              <div className="my-4 py-3 rounded-xl" style={{background:'rgba(199,154,59,0.1)'}}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{color:'#C79A3B'}}>Saldo atual</p>
                <p className="text-3xl font-black" style={{color:'#4B1E6D'}}>{result?.balance} 🪙</p>
              </div>
              <button onClick={() => navigate('/')} className="btn-primary">Ver minha carteira</button>
            </div>
          )}

          {status === 'already' && (
            <div className="card-junina p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="font-display text-xl font-bold mb-2" style={{color:'#4B1E6D'}}>Já coletado!</h2>
              <p className="text-sm mb-5" style={{color:'rgba(58,31,20,0.5)'}}>Você já coletou as moedas deste ponto anteriormente.</p>
              <button onClick={() => navigate('/')} className="btn-primary">Ver minha carteira</button>
            </div>
          )}

          {status === 'error' && (
            <div className="card-junina p-8 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="font-display text-xl font-bold mb-2" style={{color:'#C21874'}}>Ponto inativo</h2>
              <p className="text-sm mb-5" style={{color:'rgba(58,31,20,0.5)'}}>{result?.error || 'Este ponto não está disponível no momento.'}</p>
              <button onClick={() => navigate('/')} className="btn-primary">Voltar</button>
            </div>
          )}
        </div>
      </div>
      <Bandeirinhas />
    </div>
  );
}
