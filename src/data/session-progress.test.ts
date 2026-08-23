import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateProgressStats } from './session-progress';
import { TrainingSession } from './session-types';

const session = (id:string,date:string,art:TrainingSession['martialArt'],primary:string,additional:string[],minutes:number):TrainingSession=>({id,date,martialArt:art,primaryFocus:primary,additionalFocuses:additional,durationMinutes:minutes,startTime:null,endTime:null,notes:null,scheduledOccurrenceId:null,createdAt:`${date}T00:00:00.000Z`,updatedAt:`${date}T00:00:00.000Z`});
const data=[session('1','2026-08-03','Karate','Kata',['Kihon'],60),session('2','2026-08-05','BJJ','Rolling',['Drilling'],90),session('3','2026-08-05','Kobudo','Bo',['Sai'],45),session('4','2026-07-27','BJJ','Technique',['Rolling'],30),session('5','2026-07-20','Karate','Kumite',[],50),session('6','2026-06-29','Karate','Bunkai',[],40)];
test('discipline duration, days and sessions use selected data',()=>{const stats=calculateProgressStats(data,'thisMonth',new Date(2026,7,8));assert.deepEqual(stats.byArt,{Karate:60,BJJ:90,Kobudo:45});assert.equal(stats.totalMinutes,195);assert.equal(stats.trainingDays,2);assert.equal(stats.completedSessions,3);});
test('current and best weekly streaks count consecutive active weeks',()=>{const stats=calculateProgressStats(data,'allTime',new Date(2026,7,8));assert.equal(stats.currentWeeklyStreak,3);assert.equal(stats.bestWeeklyStreak,3);});
test('primary and additional focuses count once per session',()=>{const stats=calculateProgressStats(data,'thisMonth',new Date(2026,7,8));assert.equal(stats.focusOccurrences.Karate.Kata,1);assert.equal(stats.focusOccurrences.Karate.Kihon,1);assert.equal(stats.focusOccurrences.BJJ.Rolling,1);assert.equal(stats.focusOccurrences.BJJ.Drilling,1);assert.equal(stats.focusOccurrences.Kobudo.Bo,1);assert.equal(stats.focusOccurrences.Kobudo.Sai,1);});
test('Rolling time includes only primary Rolling sessions',()=>{const stats=calculateProgressStats(data,'allTime',new Date(2026,7,8));assert.equal(stats.focusOccurrences.BJJ.Rolling,2);assert.equal(stats.primaryRollingMinutes,90);});
test('monthly totals include zero months and actual minutes',()=>{const stats=calculateProgressStats(data,'allTime',new Date(2026,7,8));assert.deepEqual(stats.monthlyTotals.map(item=>item.minutes),[0,0,0,40,80,195]);});
