import React from 'react';
export default function LoadingSpinner({ size = 'md', text }) {
  const s = { sm: 16, md: 28, lg: 44 }[size] || 28;
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div style={{ width: s, height: s, borderRadius: '50%', border: `${size==='sm'?2:3}px solid rgba(199,154,59,0.2)`, borderTopColor: '#C79A3B', animation: 'spin 0.8s linear infinite' }}/>
      {text && <p className="text-sm" style={{ color: '#C79A3B' }}>{text}</p>}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
