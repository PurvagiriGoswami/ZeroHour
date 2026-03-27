import { describe, it, expect } from 'vitest'; 
 // These functions need to be exported from spacedRepetition.js
 // Let's check the file first to see if they exist or need to be added/renamed.
 import { getNextDueDate, isOverdue, advanceRound } from './spacedRepetition'; 
 
 describe('getNextDueDate', () => { 
   it('R1 schedules +1 day', () => { 
     const t = { round: 1, lastRevisedAt: '2026-03-26' }; 
     expect(getNextDueDate(t)).toBe('2026-03-27'); 
   }); 
   it('R2 schedules +3 days', () => { 
     const t = { round: 2, lastRevisedAt: '2026-03-26' }; 
     expect(getNextDueDate(t)).toBe('2026-03-29'); 
   }); 
   it('R3 schedules +7 days', () => { 
     const t = { round: 3, lastRevisedAt: '2026-03-26' }; 
     expect(getNextDueDate(t)).toBe('2026-04-02'); 
   }); 
   it('R4+ schedules +15 days', () => { 
     const t = { round: 4, lastRevisedAt: '2026-03-26' }; 
     expect(getNextDueDate(t)).toBe('2026-04-10'); 
   }); 
 }); 
 
 describe('isOverdue', () => { 
   it('returns true for past due date', () => { 
     expect(isOverdue({ round: 1, lastRevisedAt: '2020-01-01' })).toBe(true); 
   }); 
   it('returns false for future due date', () => { 
     const today = new Date().toISOString().split('T')[0]; 
     expect(isOverdue({ round: 1, lastRevisedAt: today })).toBe(false); 
   }); 
 }); 
 
 describe('advanceRound', () => { 
   it('increments round and updates lastRevisedAt to today', () => { 
     const today = new Date().toISOString().split('T')[0]; 
     const result = advanceRound({ round: 2, lastRevisedAt: '2026-01-01' }); 
     expect(result.round).toBe(3); 
     expect(result.lastRevisedAt).toBe(today); 
   }); 
   it('R4 stays at R4 (does not advance beyond max)', () => { 
     const result = advanceRound({ round: 4, lastRevisedAt: '2026-01-01' }); 
     expect(result.round).toBe(4); 
   }); 
 }); 
