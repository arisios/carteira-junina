export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: { extend: {
    fontFamily: { display:['Edmund','Georgia','serif'], sans:['"DM Sans"','sans-serif'] },
    animation: {
      'slide-up':'slideUp 0.3s ease-out', 'fade-in':'fadeIn 0.25s ease-out',
      'pop':'pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
      'float':'float 3s ease-in-out infinite', 'bounce-in':'bounceIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275)',
      'pulse-coin':'pulseCoin 1.5s ease-in-out infinite',
    },
    keyframes: {
      slideUp:{from:{opacity:0,transform:'translateY(20px)'},to:{opacity:1,transform:'translateY(0)'}},
      fadeIn:{from:{opacity:0},to:{opacity:1}},
      pop:{from:{transform:'scale(0.8)',opacity:0},to:{transform:'scale(1)',opacity:1}},
      float:{from:{transform:'translateY(0)'},'50%':{transform:'translateY(-8px)'},to:{transform:'translateY(0)'}},
      bounceIn:{from:{transform:'scale(0)',opacity:0},'60%':{transform:'scale(1.2)'},to:{transform:'scale(1)',opacity:1}},
      pulseCoin:{from:{boxShadow:'0 0 0 0 rgba(199,154,59,0.4)'},to:{boxShadow:'0 0 0 16px rgba(199,154,59,0)'}},
    }
  }},
  plugins: [],
}
