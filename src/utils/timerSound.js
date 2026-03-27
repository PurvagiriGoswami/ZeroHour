export function playTimerEndBeep() { 
   try { 
     const ctx = new (window.AudioContext || window.webkitAudioContext)(); 
     const osc = ctx.createOscillator(); 
     const gain = ctx.createGain(); 
     osc.connect(gain); 
     gain.connect(ctx.destination); 
     osc.frequency.value = 880; 
     osc.type = 'sine'; 
     gain.gain.setValueAtTime(0.4, ctx.currentTime); 
     gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8); 
     osc.start(); 
     osc.stop(ctx.currentTime + 0.8); 
   } catch (e) { 
     console.warn('Audio not available:', e); 
   } 
   if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]); 
 } 
