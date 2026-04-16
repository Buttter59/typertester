// TyperTester Global JS
(function(){
  var t = localStorage.getItem('tt_theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
})();

function toggleTheme() {
  var cur = document.documentElement.getAttribute('data-theme');
  var next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('tt_theme', next);
}

// Audio engine
var _AC = null;
function _getAC() { if (!_AC) _AC = new (window.AudioContext || window.webkitAudioContext)(); return _AC; }
function sfx(t) {
  try {
    var ac = _getAC(); if (ac.state === 'suspended') ac.resume(); var n = ac.currentTime;
    if (t === 'btn') {
      var o = ac.createOscillator(), g = ac.createGain(); o.connect(g); g.connect(ac.destination);
      o.frequency.setValueAtTime(620, n); o.frequency.exponentialRampToValueAtTime(480, n+.06);
      g.gain.setValueAtTime(.04, n); g.gain.exponentialRampToValueAtTime(.001, n+.1); o.start(n); o.stop(n+.11);
    } else if (t === 'key') {
      var b = ac.createBuffer(1, Math.floor(ac.sampleRate*.05), ac.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random()*2-1)*Math.exp(-i/(ac.sampleRate*.008))*.14;
      var s = ac.createBufferSource(), g2 = ac.createGain(), f = ac.createBiquadFilter();
      f.type='bandpass'; f.frequency.value=3200; f.Q.value=1.2;
      s.buffer=b; s.connect(f); f.connect(g2); g2.connect(ac.destination); g2.gain.setValueAtTime(.4, n); s.start(n);
    } else if (t === 'err') {
      var o2 = ac.createOscillator(), g3 = ac.createGain(); o2.type='triangle'; o2.connect(g3); g3.connect(ac.destination);
      o2.frequency.setValueAtTime(160, n); o2.frequency.exponentialRampToValueAtTime(90, n+.12);
      g3.gain.setValueAtTime(.05, n); g3.gain.exponentialRampToValueAtTime(.001, n+.14); o2.start(n); o2.stop(n+.15);
    } else if (t === 'word') {
      var o3 = ac.createOscillator(), g4 = ac.createGain(); o3.type='sine'; o3.connect(g4); g4.connect(ac.destination);
      o3.frequency.setValueAtTime(880, n); o3.frequency.exponentialRampToValueAtTime(1060, n+.04);
      g4.gain.setValueAtTime(.04, n); g4.gain.exponentialRampToValueAtTime(.001, n+.12); o3.start(n); o3.stop(n+.13);
    } else if (t === 'wrong') {
      var o4 = ac.createOscillator(), g5 = ac.createGain(); o4.type='square'; o4.connect(g5); g5.connect(ac.destination);
      o4.frequency.setValueAtTime(200, n); g5.gain.setValueAtTime(.025, n);
      g5.gain.exponentialRampToValueAtTime(.001, n+.07); o4.start(n); o4.stop(n+.08);
    }
  } catch(e) {}
}
window.snd = sfx;

document.addEventListener('DOMContentLoaded', function() {
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    if (a.getAttribute('href') === path || (path==='' && a.getAttribute('href')==='index.html')) a.classList.add('active');
  });
  var ham = document.getElementById('hamburger');
  var navLinks = document.querySelector('.nav-links');
  if (ham && navLinks) ham.addEventListener('click', function(){ navLinks.classList.toggle('open'); });
  document.querySelectorAll('.theme-toggle').forEach(function(btn){ btn.addEventListener('click', toggleTheme); });
  document.querySelectorAll('a.btn-primary,a.btn-secondary,a.play-nav-btn').forEach(function(btn){
    btn.addEventListener('click', function(){ sfx('btn'); });
  });
});
