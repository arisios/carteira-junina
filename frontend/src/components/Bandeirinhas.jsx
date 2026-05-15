import React from 'react';
const COLORS = ['#C21874','#6F2DA8','#C79A3B','#007C91','#D96C2F','#4B1E6D','#C21874','#C79A3B','#6F2DA8'];
export default function Bandeirinhas() {
  return (
    <div className="w-full overflow-hidden flex items-end" style={{height:28}}>
      <svg width="100%" height="28" viewBox="0 0 360 28" preserveAspectRatio="none">
        <line x1="0" y1="4" x2="360" y2="4" stroke="rgba(199,154,59,0.4)" strokeWidth="1.5"/>
        {COLORS.map((c,i) => <polygon key={i} points={`${i*40},4 ${i*40+36},4 ${i*40+18},26`} fill={c} opacity="0.85"/>)}
      </svg>
    </div>
  );
}
