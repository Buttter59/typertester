// ── TyperTester Features Module ──

var TTFeatures = (function() {

// ── ACHIEVEMENTS ──
var ACHIEVEMENT_DEFS = [
  { id: 'first_test',   icon: '🎯', name: 'First Test',        desc: 'Complete your first typing test',                  check: function(s,h){ return h.length >= 1; } },
  { id: 'wpm_40',       icon: '⚡', name: 'Average Breaker',   desc: 'Type above the global average (40 WPM)',           check: function(s){ return s.w >= 40; } },
  { id: 'wpm_60',       icon: '🚀', name: 'First 60 WPM',      desc: 'Reach 60 words per minute',                        check: function(s){ return s.w >= 60; } },
  { id: 'wpm_80',       icon: '🔥', name: 'Speed Demon',       desc: 'Reach 80 words per minute',                        check: function(s){ return s.w >= 80; } },
  { id: 'wpm_100',      icon: '💯', name: 'Triple Digits',     desc: 'Hit 100 WPM — professional level',                 check: function(s){ return s.w >= 100; } },
  { id: 'wpm_120',      icon: '⭐', name: 'Elite Typist',      desc: 'Reach 120 WPM — top 1%',                           check: function(s){ return s.w >= 120; } },
  { id: 'acc_100',      icon: '🎖️', name: 'Flawless',          desc: 'Complete a test with 100% accuracy',               check: function(s){ return s.a === 100 && s.c >= 20; } },
  { id: 'acc_98_fast',  icon: '💎', name: 'Precision & Speed', desc: 'Score 98%+ accuracy at 70+ WPM',                   check: function(s){ return s.a >= 98 && s.w >= 70; } },
  { id: 'streak_5',     icon: '📅', name: 'Dedicated',         desc: 'Complete 5 tests in a session',                    check: function(s,h){ return h.length >= 5; } },
  { id: 'streak_10',    icon: '🏆', name: 'Committed',         desc: 'Complete 10 tests in a session',                   check: function(s,h){ return h.length >= 10; } },
  { id: 'hard_pass',    icon: '📚', name: 'Scholar',           desc: 'Complete a Hard difficulty test',                  check: function(s){ return s.d === 'hard' && s.c >= 10; } },
  { id: 'extreme_pass', icon: '🧠', name: 'Intellectual',      desc: 'Complete an Extreme difficulty test',              check: function(s){ return s.d === 'extreme' && s.c >= 10; } },
  { id: 'long_test',    icon: '⏱️', name: 'Marathon Typist',   desc: 'Complete a 5-minute test',                         check: function(s){ return s.dur >= 300 && s.c >= 20; } },
  { id: 'improve',      icon: '📈', name: 'Getting Better',    desc: 'Beat your previous best on the same difficulty',   check: function(s,h){ var prev=h.slice(1).filter(function(r){return r.d===s.d;}); return prev.length>0 && s.w>Math.max.apply(null,prev.map(function(r){return r.w;})); } },
  { id: 'consistency',  icon: '🎵', name: 'Consistency King',  desc: 'Score 85%+ consistency on a 60s+ test',            check: function(s){ return s.cons >= 85 && s.dur >= 60; } },
  { id: 'custom_text',  icon: '✍️', name: 'Own Words',          desc: 'Complete a test using custom text',                check: function(s){ return s.mode === 'custom'; } },
  { id: 'multilang',    icon: '🌍', name: 'Polyglot',           desc: 'Complete a test in a non-English language',        check: function(s){ return s.lang && s.lang !== 'en'; } },
];

function getUnlocked() {
  try { return JSON.parse(localStorage.getItem('tt_achievements') || '[]'); } catch(e) { return []; }
}
function saveUnlocked(list) {
  try { localStorage.setItem('tt_achievements', JSON.stringify(list)); } catch(e) {}
}
function checkAchievements(currentScore, history) {
  var unlocked = getUnlocked();
  var newlyUnlocked = [];
  ACHIEVEMENT_DEFS.forEach(function(def) {
    if (!unlocked.includes(def.id) && def.check(currentScore, history)) {
      unlocked.push(def.id);
      newlyUnlocked.push(def);
    }
  });
  if (newlyUnlocked.length) saveUnlocked(unlocked);
  return newlyUnlocked;
}
function renderAchievements(containerId) {
  var el = document.getElementById(containerId); if (!el) return;
  var unlocked = getUnlocked();
  el.innerHTML = ACHIEVEMENT_DEFS.map(function(d) {
    var got = unlocked.includes(d.id);
    return '<div class="badge-card' + (got ? ' unlocked' : '') + '">' +
      '<div class="badge-icon">' + (got ? d.icon : '🔒') + '</div>' +
      '<div class="badge-name">' + d.name + '</div>' +
      '<div class="badge-desc">' + d.desc + '</div>' +
      '</div>';
  }).join('');
}

// ── KEYBOARD HEATMAP ──
function drawHeatmap(canvasId, mistyped) {
  var canvas = document.getElementById(canvasId); if (!canvas) return;
  var ROWS = [
    ['`','1','2','3','4','5','6','7','8','9','0','-','='],
    ['q','w','e','r','t','y','u','i','o','p','[',']','\\'],
    ['a','s','d','f','g','h','j','k','l',';',"'"],
    ['z','x','c','v','b','n','m',',','.','/',' ']
  ];
  var dpr = window.devicePixelRatio || 1;
  var W = canvas.parentElement.clientWidth;
  if (W < 10) W = 300;
  var KS = Math.floor(W / 14);
  var H = KS * 4 + KS * 0.6 * 3 + 20;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  var ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
  var maxCount = Math.max(1, Math.max.apply(null, Object.values(mistyped).concat([0])));
  var isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  ROWS.forEach(function(row, ri) {
    var offsets = [0, 0.5, 0.75, 1];
    var off = offsets[ri] * KS;
    row.forEach(function(key, ki) {
      var x = off + ki * (KS + 2), y = ri * (KS + 4);
      var count = mistyped[key] || 0;
      var heat = count / maxCount;
      var r = Math.round((isDark?30:240) + heat * (239 - (isDark?30:240)));
      var g = Math.round((isDark?30:238) + heat * (83 - (isDark?30:238)));
      var b = Math.round((isDark?30:232) + heat * (80 - (isDark?30:232)));
      ctx.fillStyle = 'rgb('+r+','+g+','+b+')';
      ctx.beginPath(); ctx.roundRect(x, y, KS, KS, 3); ctx.fill();
      if (count > 0) {
        ctx.strokeStyle = 'rgba(239,83,80,' + Math.min(0.8, heat + 0.2) + ')';
        ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.fillStyle = heat > 0.5 ? '#fff' : (isDark ? 'rgba(200,200,200,0.7)' : 'rgba(60,60,60,0.8)');
      ctx.font = Math.max(8, KS * 0.34) + 'px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(key === ' ' ? '⎵' : key.toUpperCase(), x + KS/2, y + KS/2);
    });
  });
  // Legend
  var lgW = 100, lgH = 8, lgX = W - lgW - 6, lgY = H - 14;
  var lg = ctx.createLinearGradient(lgX, 0, lgX + lgW, 0);
  lg.addColorStop(0, isDark ? 'rgb(30,30,30)' : 'rgb(240,238,232)');
  lg.addColorStop(1, 'rgb(239,83,80)');
  ctx.fillStyle = lg; ctx.beginPath(); ctx.roundRect(lgX, lgY, lgW, lgH, 2); ctx.fill();
  ctx.fillStyle = 'rgba(128,128,128,0.5)'; ctx.font = '8px monospace';
  ctx.textAlign = 'left'; ctx.fillText('few', lgX, lgY - 2);
  ctx.textAlign = 'right'; ctx.fillText('most', lgX + lgW, lgY - 2);
}

// ── PROGRESS CHART ──
function drawProgressChart(canvasId, records) {
  var canvas = document.getElementById(canvasId); if (!canvas) return;
  var box = canvas.parentElement;
  var dpr = window.devicePixelRatio || 1;
  var W = box.clientWidth || 400, H = box.clientHeight || 200;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  var ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
  var data = records.slice().reverse().slice(-30);
  if (data.length < 2) {
    ctx.fillStyle = 'rgba(128,128,128,0.3)'; ctx.font = '12px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Play more tests to see your progress', W/2, H/2); return;
  }
  var pad = {t:20, r:40, b:36, l:8};
  var cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  var vals = data.map(function(d){ return d.w; });
  var maxV = Math.max.apply(null, vals.concat([20]));
  var yMax = Math.ceil(maxV / 10) * 10 + 10;
  var xS = function(i){ return pad.l + (i / (data.length - 1)) * cw; };
  var yS = function(v){ return pad.t + ch - (v / yMax) * ch; };
  for (var y = 0; y <= yMax; y += 10) {
    var yp = yS(y);
    ctx.strokeStyle = 'rgba(128,128,128,0.07)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, yp); ctx.lineTo(W - pad.r, yp); ctx.stroke();
    ctx.fillStyle = 'rgba(128,128,128,0.3)'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
    ctx.fillText(y, W - pad.r + 4, yp + 3);
  }
  var ma = data.map(function(_, i, a){
    var sl = a.slice(Math.max(0, i-4), i+1);
    return sl.reduce(function(s,v){ return s+v.w; }, 0) / sl.length;
  });
  ctx.beginPath(); ctx.strokeStyle = 'rgba(249,168,37,0.3)'; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]);
  ma.forEach(function(v, i){ i===0 ? ctx.moveTo(xS(i), yS(v)) : ctx.lineTo(xS(i), yS(v)); }); ctx.stroke(); ctx.setLineDash([]);
  var pts = data.map(function(d, i){ return {x: xS(i), y: yS(d.w), d: d}; });
  var grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ch);
  grad.addColorStop(0, 'rgba(249,168,37,0.15)'); grad.addColorStop(1, 'rgba(249,168,37,0)');
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
  for (var i = 1; i < pts.length - 1; i++) {
    var mx = (pts[i].x + pts[i+1].x)/2, my = (pts[i].y + pts[i+1].y)/2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
  }
  ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
  ctx.lineTo(pts[pts.length-1].x, pad.t + ch); ctx.lineTo(pts[0].x, pad.t + ch);
  ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
  ctx.beginPath(); ctx.strokeStyle = '#f9a825'; ctx.lineWidth = 2.5;
  ctx.moveTo(pts[0].x, pts[0].y);
  for (var i2 = 1; i2 < pts.length - 1; i2++) {
    var mx2 = (pts[i2].x + pts[i2+1].x)/2, my2 = (pts[i2].y + pts[i2+1].y)/2;
    ctx.quadraticCurveTo(pts[i2].x, pts[i2].y, mx2, my2);
  }
  ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y); ctx.stroke();
  var diffC = function(d){ return d==='easy'?'#4caf50':d==='normal'?'#42a5f5':d==='hard'?'#ff9800':'#ef5350'; };
  pts.forEach(function(p){ ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI*2); ctx.fillStyle = diffC(p.d.d); ctx.fill(); });
  var bestIdx = vals.indexOf(Math.max.apply(null, vals));
  ctx.fillStyle = 'rgba(249,168,37,0.9)'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
  ctx.fillText('▲ best', xS(bestIdx), yS(vals[bestIdx]) - 16);
  var dateStep = Math.max(1, Math.floor(data.length / 6));
  data.forEach(function(d, i){ if (i % dateStep === 0) { ctx.fillStyle = 'rgba(128,128,128,0.35)'; ctx.font = '8px monospace'; ctx.textAlign = 'center'; ctx.fillText(d.dt || '', xS(i), H - pad.b + 14); } });
}

// ── RECOMMENDATIONS ──
function getRecommendations(score) {
  var recs = [];
  if (score.a < 90) recs.push({ icon: '🎯', title: 'Focus on accuracy first', body: 'Your accuracy is below 90%. Slow down by 20% and prioritize hitting every key correctly. Speed follows accuracy — never the reverse.' });
  if (score.cons < 70) recs.push({ icon: '🎵', title: 'Work on consistency', body: 'Your speed varied a lot this test. Aim for a steady rhythm instead of bursting then slowing. Try to type each word at the same pace.' });
  if (score.w < 40) recs.push({ icon: '⌨️', title: 'Learn touch typing', body: 'If you are not using all 10 fingers on the home row, this is your biggest unlock. Check the Hand Guide on our Learn page.' });
  if (score.w >= 40 && score.w < 60) recs.push({ icon: '📖', title: 'Try Normal difficulty', body: 'You are ready to move beyond easy words. Normal passages will challenge your vocabulary and build real-world fluency.' });
  if (score.w >= 60 && score.w < 80) recs.push({ icon: '🔄', title: 'Drill your weak keys', body: 'At your speed, a few problem keys are your bottleneck. Check your heatmap to find which letters you mistype most.' });
  if (score.w >= 80 && score.w < 100) recs.push({ icon: '🚀', title: 'Increase difficulty', body: 'You are ready for Hard or Extreme passages. Complex vocabulary will push your fingers into less familiar territory.' });
  if (score.w >= 100) recs.push({ icon: '⭐', title: 'Try longer tests', body: 'At 100+ WPM, stamina matters. Try the 2-minute or 5-minute tests to ensure your speed holds up over time.' });
  if (score.e > 5 && score.a < 95) recs.push({ icon: '👀', title: 'Look ahead while typing', body: 'Many errors come from hesitating at word boundaries. Train yourself to read 1-2 words ahead while your fingers handle the current one.' });
  if (score.dur < 30) recs.push({ icon: '⏱️', title: 'Use longer time limits', body: 'Short tests only measure burst speed. Try 60 seconds or longer — they reveal your real working speed and build endurance.' });
  if (score.d === 'easy' && score.w > 50) recs.push({ icon: '📚', title: 'Level up your difficulty', body: 'You are scoring well on Easy. Challenge yourself with Normal or Hard to ensure your skills transfer to real writing.' });
  return recs.slice(0, 3);
}

// Public API
return {
  ACHIEVEMENT_DEFS: ACHIEVEMENT_DEFS,
  getUnlocked: getUnlocked,
  checkAchievements: checkAchievements,
  renderAchievements: renderAchievements,
  drawHeatmap: drawHeatmap,
  drawProgressChart: drawProgressChart,
  getRecommendations: getRecommendations
};

})();

window.TTFeatures = TTFeatures;
