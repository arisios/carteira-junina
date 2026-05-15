import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import Bandeirinhas from '../components/Bandeirinhas';
import LoadingSpinner from '../components/LoadingSpinner';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:3007';
const fmtDate = (d) => new Date(d).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name:'', description:'', points:'1', budget:'' });
  const [saving, setSaving] = useState(false);

  const fetchStats = useCallback(async (silent=false) => {
    if (!silent) setLoading(true);
    try { const { data } = await api.get('/admin/stats'); setStats(data); }
    catch { if (!silent) toast.error('Erro ao carregar'); }
    finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); const t = setInterval(() => fetchStats(true), 10000); return () => clearInterval(t); }, [fetchStats]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/campaigns', { name: form.name, description: form.description, points: parseInt(form.points), budget: form.budget ? parseInt(form.budget) : null });
      toast.success('Ponto criado!');
      setModal(false); setForm({ name:'', description:'', points:'1', budget:'' });
      fetchStats(true);
    } catch (err) { toast.error(err.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (camp) => {
    await api.patch(`/admin/campaigns/${camp.id}`, { active: !camp.active });
    fetchStats(true);
  };

  const deleteCamp = async (camp) => {
    if (!confirm(`Excluir "${camp.name}"?`)) return;
    await api.delete(`/admin/campaigns/${camp.id}`);
    toast.success('Excluído'); fetchStats(true);
  };

  if (loading) return <div className="min-h-screen bg-junina flex items-center justify-center"><LoadingSpinner size="lg" text="Carregando..."/></div>;

  return (
    <div className="min-h-screen bg-junina flex flex-col">
      <Bandeirinhas />
      <header className="px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold" style={{color:'#4B1E6D'}}>Admin · Carteira</h1>
            <p className="text-xs" style={{color:'#C79A3B'}}>@{user?.instagram || user?.name}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModal(true)} className="text-xs px-3 py-1.5 rounded-lg font-bold text-white" style={{background:'linear-gradient(135deg,#C79A3B,#D96C2F)'}}>+ Novo Ponto</button>
            <button onClick={logout} className="text-xs font-medium px-2 py-1.5 rounded-lg" style={{color:'#6F2DA8'}}>Sair</button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-8">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {emoji:'👥', label:'Usuários', value: stats?.totalUsers || 0},
              {emoji:'🪙', label:'Emitidas', value: stats?.totalEmitted || 0},
              {emoji:'📡', label:'Claims', value: stats?.totalClaims || 0},
            ].map(s => (
              <div key={s.label} className="card-junina p-4 text-center">
                <span className="text-2xl block mb-1">{s.emoji}</span>
                <p className="text-2xl font-black" style={{color:'#4B1E6D'}}>{s.value}</p>
                <p className="text-xs" style={{color:'#C79A3B'}}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Pontos NFC */}
          <div className="card-junina p-4">
            <h2 className="font-display font-bold mb-3" style={{color:'#4B1E6D'}}>Pontos NFC ({stats?.campaigns?.length || 0})</h2>
            {stats?.campaigns?.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl block mb-2">📡</span>
                <p style={{color:'rgba(58,31,20,0.4)'}}>Nenhum ponto criado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.campaigns?.map(c => (
                  <div key={c.id} className="rounded-xl p-4" style={{background: c.active ? 'rgba(0,124,145,0.06)' : 'rgba(58,31,20,0.04)', border:`1.5px solid ${c.active ? 'rgba(0,124,145,0.2)' : 'rgba(58,31,20,0.1)'}`}}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background: c.active?'rgba(0,124,145,0.15)':'rgba(58,31,20,0.08)', color: c.active?'#007C91':'rgba(58,31,20,0.4)'}}>
                            {c.active ? '🟢 Ativo' : '⚫ Inativo'}
                          </span>
                          <span className="font-black text-sm" style={{color:'#C79A3B'}}>+{c.points} 🪙</span>
                        </div>
                        <p className="font-bold text-sm" style={{color:'#3A1F14'}}>{c.name}</p>
                        {c.description && <p className="text-xs" style={{color:'rgba(58,31,20,0.5)'}}>{c.description}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => toggleActive(c)} className="text-xs px-2 py-1 rounded-lg font-medium" style={{background: c.active?'rgba(58,31,20,0.06)':'rgba(0,124,145,0.1)', color: c.active?'rgba(58,31,20,0.5)':'#007C91'}}>
                          {c.active ? 'Desativar' : 'Ativar'}
                        </button>
                        <button onClick={() => deleteCamp(c)} className="text-xs px-2 py-1 rounded-lg font-medium" style={{background:'rgba(194,24,116,0.08)',color:'#C21874'}}>🗑</button>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs" style={{color:'rgba(58,31,20,0.4)'}}>
                      <span>📡 {c.spent} coletados</span>
                      {c.budget && <span>💰 orçamento: {c.budget} ({c.remaining} restam)</span>}
                    </div>
                    <div className="mt-2 p-2 rounded-lg text-xs font-mono break-all" style={{background:'rgba(58,31,20,0.04)', color:'rgba(58,31,20,0.4)'}}>
                      token: {c.nfc_token}
                    </div>
                    <a href={`${window.location.origin.replace('admin','')}/coletar/${c.nfc_token}`}
                      className="block text-xs mt-1 font-medium" style={{color:'#007C91'}} target="_blank">
                      🔗 Link de coleta
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top usuários */}
          {stats?.topUsers?.length > 0 && (
            <div className="card-junina p-4">
              <h2 className="font-display font-bold mb-3" style={{color:'#4B1E6D'}}>Top Carteiras 🏆</h2>
              <div className="space-y-2">
                {stats.topUsers.map((u, i) => (
                  <div key={u.user_id} className="flex items-center justify-between py-1.5 px-3 rounded-xl" style={{background:'rgba(199,154,59,0.06)'}}>
                    <span className="text-sm font-semibold" style={{color:'#3A1F14'}}>#{i+1} usuário #{u.user_id}</span>
                    <span className="font-black text-sm" style={{color:'#C79A3B'}}>{u.balance} 🪙</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Últimos claims */}
          {stats?.recentClaims?.length > 0 && (
            <div className="card-junina p-4">
              <h2 className="font-display font-bold mb-3" style={{color:'#4B1E6D'}}>Últimas coletas</h2>
              <div className="space-y-1.5">
                {stats.recentClaims.map(cl => (
                  <div key={cl.id} className="flex items-center justify-between py-1.5 px-3 rounded-xl" style={{background:'rgba(58,31,20,0.03)'}}>
                    <div>
                      <p className="text-xs font-semibold" style={{color:'#3A1F14'}}>Usuário #{cl.user_id} · {cl.campaign_name}</p>
                      <p className="text-xs" style={{color:'rgba(58,31,20,0.4)'}}>{fmtDate(cl.created_at)}</p>
                    </div>
                    <span className="font-bold text-xs" style={{color:'#C79A3B'}}>+{cl.points} 🪙</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal criar ponto */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(75,30,109,0.5)',backdropFilter:'blur(4px)'}}
          onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div className="card-junina p-6 w-full max-w-sm animate-pop">
            <h3 className="font-display text-lg font-bold mb-4" style={{color:'#4B1E6D'}}>Novo Ponto NFC</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{color:'#4B1E6D'}}>Nome do ponto</label>
                <input className="input-junina" placeholder="Ex: Barraca do Milho" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required autoFocus />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{color:'#4B1E6D'}}>Descrição (opcional)</label>
                <input className="input-junina" placeholder="Ex: Visite a barraca para coletar" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{color:'#C79A3B'}}>🪙 Pontos</label>
                  <input type="number" min="1" className="input-junina" value={form.points} onChange={e=>setForm(f=>({...f,points:e.target.value}))} required />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{color:'#4B1E6D'}}>Orçamento (opt)</label>
                  <input type="number" min="1" className="input-junina" placeholder="ilimitado" value={form.budget} onChange={e=>setForm(f=>({...f,budget:e.target.value}))} />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 text-sm">Cancelar</button>
                <button type="submit" className="btn-primary flex-1 text-sm" disabled={saving}>
                  {saving ? <LoadingSpinner size="sm"/> : 'Criar Ponto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Bandeirinhas />
    </div>
  );
}
