
// ===== DATA =====
const FRAMES = [
  {name:'Classic Strip', id:'classic'},
  {name:'Rounded',       id:'rounded'},
  {name:'Vintage',       id:'vintage'},
  {name:'Polaroid',      id:'polaroid'},
  {name:'Minimal',       id:'minimal'},
  {name:'Wedding',       id:'wedding'},
  {name:'Birthday',      id:'birthday'},
];

const FILTERS = [
  {name:'Normal',      css:'none'},
  {name:'B&W',         css:'grayscale(1) contrast(1.05)'},
  {name:'Vintage',     css:'sepia(.75) contrast(1.1) brightness(.93)'},
  {name:'Warm Tone',   css:'sepia(.3) saturate(1.5) brightness(1.06) hue-rotate(-5deg)'},
  {name:'Cool Tone',   css:'hue-rotate(25deg) saturate(1.2) brightness(1.05)'},
  {name:'Luxury Gold', css:'sepia(.55) hue-rotate(-25deg) saturate(1.7) brightness(1.12)'},
  {name:'Retro Film',  css:'sepia(.4) contrast(1.25) saturate(.75) brightness(.9)'},
  {name:'Snap Glow',   css:'brightness(1.18) saturate(1.35) contrast(.92)'},
  {name:'Hi Contrast', css:'contrast(1.6) brightness(.93) saturate(1.1)'},
  {name:'Soft Beauty', css:'brightness(1.12) saturate(.85) contrast(.88)'},
  {name:'Neon Party',  css:'saturate(2.2) hue-rotate(55deg) contrast(1.25) brightness(1.1)'},
  {name:'Film Grain',  css:'grayscale(.35) contrast(1.15) sepia(.25) brightness(.95)'},
];

// ===== STATE =====
let currentFrame = 0, currentFilter = 0;
let dialAngle = 0, isDragging = false, lastDialAngle = 0;
let videoStream = null;
let capturedPhotos = [];
let finalStripDataURL = null;
let isShooting = false;
let resultStickers = [];

// ===== INIT =====
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('gone');
  }, 900);
  initFrameButtons();
  initFilterDots();
  initDial();
  drawFrameOnSVG('frameSVG', 460, 345);
  drawMiniPreview();
});

function initFrameButtons() {
  const wrap = document.getElementById('frameScrollEl');
  FRAMES.forEach((f, i) => {
    const btn = document.createElement('button');
    btn.className = 'frame-btn' + (i === 0 ? ' active' : '');
    btn.textContent = f.name;
    btn.onclick = () => selectFrame(i);
    wrap.appendChild(btn);
  });
}

function initFilterDots() {
  const wrap = document.getElementById('filterDotsEl');
  FILTERS.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'fdot' + (i === 0 ? ' on' : '');
    d.title = FILTERS[i].name;
    d.onclick = () => selectFilter(i);
    wrap.appendChild(d);
  });
}

// ===== DIAL =====
function initDial() {
  const dial = document.getElementById('dialEl');
  const getAngle = (e, rect) => {
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const {clientX: x, clientY: y} = e.touches ? e.touches[0] : e;
    return Math.atan2(y - cy, x - cx) * (180 / Math.PI);
  };
  dial.addEventListener('mousedown', e => { isDragging = true; lastDialAngle = getAngle(e, dial.getBoundingClientRect()); });
  dial.addEventListener('touchstart', e => { isDragging = true; lastDialAngle = getAngle(e, dial.getBoundingClientRect()); }, {passive: true});
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const a = getAngle(e, dial.getBoundingClientRect());
    let delta = a - lastDialAngle;
    if (delta > 180) delta -= 360; if (delta < -180) delta += 360;
    dialAngle = (dialAngle + delta + 360) % 360;
    lastDialAngle = a;
    currentFilter = Math.floor((dialAngle / 360) * FILTERS.length) % FILTERS.length;
    updateDialUI(); applyFilter();
  });
  document.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const a = getAngle(e, dial.getBoundingClientRect());
    let delta = a - lastDialAngle;
    if (delta > 180) delta -= 360; if (delta < -180) delta += 360;
    dialAngle = (dialAngle + delta + 360) % 360;
    lastDialAngle = a;
    currentFilter = Math.floor((dialAngle / 360) * FILTERS.length) % FILTERS.length;
    updateDialUI(); applyFilter();
  }, {passive: true});
  document.addEventListener('mouseup', () => isDragging = false);
  document.addEventListener('touchend', () => isDragging = false);
}

function updateDialUI() {
  document.getElementById('dialEl').style.transform = `rotate(${dialAngle}deg)`;
  document.getElementById('filterNameEl').textContent = FILTERS[currentFilter].name;
  document.querySelectorAll('.fdot').forEach((d, i) => {
    d.className = 'fdot' + (i === currentFilter ? ' on' : '');
  });
}

function applyFilter() {
  const v = document.getElementById('videoEl');
  v.style.filter = FILTERS[currentFilter].css;
}

function selectFilter(i) {
  currentFilter = i;
  dialAngle = (i / FILTERS.length) * 360;
  updateDialUI(); applyFilter();
}

// ===== FRAMES =====
function selectFrame(i) {
  currentFrame = i;
  document.querySelectorAll('.frame-btn').forEach((b, j) => {
    b.className = 'frame-btn' + (j === i ? ' active' : '');
  });
  document.getElementById('frameNameLabel').textContent = FRAMES[i].name;
  drawFrameOnSVG('frameSVG', 460, 345);
  drawMiniPreview();
}

function scrollFrames(dir) {
  document.getElementById('frameScrollEl').scrollBy({left: dir * 120, behavior: 'smooth'});
}

function drawFrameOnSVG(svgId, w, h) {
  const svg = document.getElementById(svgId);
  const fid = FRAMES[currentFrame].id;
  let c = '';
  if (fid === 'classic') {
    c = `<rect x="1" y="1" width="${w-2}" height="${h-2}" fill="none" stroke="#1a1a1a" stroke-width="10"/>
         <rect x="7" y="7" width="${w-14}" height="${h-14}" fill="none" stroke="#1a1a1a" stroke-width="2"/>`;
  } else if (fid === 'rounded') {
    c = `<rect x="2" y="2" width="${w-4}" height="${h-4}" rx="20" fill="none" stroke="#1a1a1a" stroke-width="10"/>`;
  } else if (fid === 'vintage') {
    c = `<rect x="1" y="1" width="${w-2}" height="${h-2}" fill="none" stroke="#8B7355" stroke-width="12"/>
         <rect x="10" y="10" width="${w-20}" height="${h-20}" fill="none" stroke="#8B7355" stroke-width="2" stroke-dasharray="8 5"/>
         <text x="${w/2}" y="22" text-anchor="middle" fill="#8B7355" font-size="14" font-family="serif">✦ ✦ ✦</text>`;
  } else if (fid === 'polaroid') {
    c = `<rect x="1" y="1" width="${w-2}" height="${h-2}" fill="none" stroke="#1a1a1a" stroke-width="14"/>
         <line x1="0" y1="${h-42}" x2="${w}" y2="${h-42}" stroke="#1a1a1a" stroke-width="2"/>
         <text x="${w/2}" y="${h-14}" text-anchor="middle" fill="#1a1a1a" font-size="13" font-family="'Caveat',cursive" opacity="0.5">smile!</text>`;
  } else if (fid === 'minimal') {
    const s = 35;
    c = `
      <line x1="0" y1="0" x2="${s}" y2="0" stroke="#1a1a1a" stroke-width="5"/>
      <line x1="0" y1="0" x2="0" y2="${s}" stroke="#1a1a1a" stroke-width="5"/>
      <line x1="${w}" y1="0" x2="${w-s}" y2="0" stroke="#1a1a1a" stroke-width="5"/>
      <line x1="${w}" y1="0" x2="${w}" y2="${s}" stroke="#1a1a1a" stroke-width="5"/>
      <line x1="0" y1="${h}" x2="${s}" y2="${h}" stroke="#1a1a1a" stroke-width="5"/>
      <line x1="0" y1="${h}" x2="0" y2="${h-s}" stroke="#1a1a1a" stroke-width="5"/>
      <line x1="${w}" y1="${h}" x2="${w-s}" y2="${h}" stroke="#1a1a1a" stroke-width="5"/>
      <line x1="${w}" y1="${h}" x2="${w}" y2="${h-s}" stroke="#1a1a1a" stroke-width="5"/>`;
  } else if (fid === 'wedding') {
    c = `<rect x="1" y="1" width="${w-2}" height="${h-2}" fill="none" stroke="#c8a4a4" stroke-width="10"/>
         <rect x="8" y="8" width="${w-16}" height="${h-16}" fill="none" stroke="#c8a4a4" stroke-width="2"/>
         <text x="${w/2}" y="24" text-anchor="middle" fill="#c8a4a4" font-size="16" font-family="serif">♥ ♥ ♥</text>
         <text x="${w/2}" y="${h-8}" text-anchor="middle" fill="#c8a4a4" font-size="16" font-family="serif">♥ ♥ ♥</text>`;
  } else if (fid === 'birthday') {
    c = `<rect x="1" y="1" width="${w-2}" height="${h-2}" fill="none" stroke="#e67e22" stroke-width="10"/>
         <text x="16" y="28" fill="#e67e22" font-size="22">🎉</text>
         <text x="${w-38}" y="28" fill="#e67e22" font-size="22">🎉</text>
         <text x="16" y="${h-8}" fill="#e67e22" font-size="22">⭐</text>
         <text x="${w-38}" y="${h-8}" fill="#e67e22" font-size="22">⭐</text>
         <text x="${w/2}" y="24" text-anchor="middle" fill="#e67e22" font-size="12" font-family="'Special Elite',serif" letter-spacing="3">HAPPY BIRTHDAY</text>`;
  }
  svg.innerHTML = c;
}

function drawMiniPreview() {
  drawFrameOnSVG('miniSVG', 90, 68);
}

// ===== CAMERA =====
async function startBooth() {
  showScreen('s-camera');
  drawFrameOnSVG('frameSVG', 460, 345);
  drawMiniPreview();
  await requestCamera();
}

async function requestCamera() {
  const perm = document.getElementById('permNotice');
  const video = document.getElementById('videoEl');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {facingMode: 'user', width: {ideal: 1280}, height: {ideal: 960}}, audio: false
    });
    videoStream = stream;
    video.srcObject = stream;
    perm.classList.add('hidden');
    video.style.display = 'block';
  } catch (e) {
    perm.classList.remove('hidden');
    video.style.display = 'none';
    setStatus('Camera not available. Upload photos instead.');
  }
}

function handleUpload(e) {
  const files = Array.from(e.target.files).slice(0, 4);
  capturedPhotos = [];
  files.forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = ev => {
      capturedPhotos[i] = ev.target.result;
      updateThumb(i, ev.target.result);
    };
    reader.readAsDataURL(file);
  });
  setTimeout(() => {
    if (capturedPhotos.length > 0) {
      document.getElementById('shotCounter').textContent = `${files.length} / 4`;
      setStatus(`${files.length} photos uploaded!`);
      setTimeout(() => generateAndDeliver(), 600);
    }
  }, 900);
}

function updateThumb(i, dataURL) {
  const th = document.getElementById(`th${i}`);
  if (!th) return;
  th.innerHTML = `<img src="${dataURL}"><div class="shot-num-label" style="display:none">${i+1}</div>`;
  th.classList.add('captured');
}

function resetShooting() {
  capturedPhotos = [];
  isShooting = false;
  for (let i = 0; i < 4; i++) {
    const th = document.getElementById(`th${i}`);
    th.innerHTML = `<div class="shot-num-label">${i+1}</div>`;
    th.classList.remove('captured');
  }
  document.getElementById('shotCounter').textContent = '0 / 4';
  document.getElementById('takeBtn').disabled = false;
  setStatus('Ready — smile! 😊');
}

function setStatus(txt) {
  document.getElementById('statusLine').textContent = txt;
}

// ===== CAPTURE =====
async function takePhotos() {
  if (isShooting) return;
  isShooting = true;
  capturedPhotos = [];
  document.getElementById('takeBtn').disabled = true;
  resetShooting();
  document.getElementById('takeBtn').disabled = true;
  isShooting = true;

  for (let p = 0; p < 4; p++) {
    setStatus(`Get ready for photo ${p + 1}...`);
    for (let c = 3; c >= 1; c--) {
      await countdown(c);
    }
    await doFlash();
    const dataURL = captureFrame();
    capturedPhotos.push(dataURL);
    updateThumb(p, dataURL);
    document.getElementById('shotCounter').textContent = `${p+1} / 4`;
    setStatus(`Photo ${p+1} captured! ${p < 3 ? 'Get ready for next...' : '🎉 Done!'}`);
    if (p < 3) await sleep(1400);
  }

  document.getElementById('takeBtn').disabled = false;
  isShooting = false;
  setStatus('All 4 photos captured! Generating strip...');
  await sleep(500);
  generateAndDeliver();
}

function countdown(n) {
  return new Promise(res => {
    const el = document.getElementById('countdownEl');
    el.textContent = n;
    el.className = 'countdown-big show';
    setTimeout(() => { el.className = 'countdown-big'; res(); }, 870);
  });
}

function doFlash() {
  return new Promise(res => {
    const f = document.getElementById('flashEl');
    f.className = 'flash-layer go';
    playShutterSound();
    setTimeout(() => { f.className = 'flash-layer'; res(); }, 350);
  });
}

function playShutterSound() {
  try {
    const ac = new AudioContext();
    const buf = ac.createBuffer(1, ac.sampleRate * 0.06, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 400);
    }
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.connect(ac.destination);
    src.start();
  } catch(e) {}
}

function captureFrame() {
  const video = document.getElementById('videoEl');
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 480;
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.translate(640, 0); ctx.scale(-1, 1); // mirror
  ctx.filter = FILTERS[currentFilter].css;
  if (video.srcObject && video.readyState >= 2) {
    ctx.drawImage(video, 0, 0, 640, 480);
  } else {
    ctx.fillStyle = '#e4d9c0'; ctx.fillRect(0, 0, 640, 480);
    ctx.restore(); ctx.save();
    ctx.fillStyle = '#aaa'; ctx.font = 'bold 40px serif'; ctx.textAlign = 'center';
    ctx.fillText('📷', 320, 240);
  }
  ctx.restore();
  return canvas.toDataURL('image/jpeg', 0.88);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ===== STRIP GENERATION =====
function generateAndDeliver() {
  if (capturedPhotos.length === 0) return;
  const n = Math.min(capturedPhotos.length, 4);
  const pw = 200, ph = 150, pad = 10, footer = 34;
  const W = pw + pad * 2, H = pad + n * (ph + pad) + footer;

  const canvas = document.getElementById('delCanvas');
  canvas.width = W; canvas.height = H;
  canvas.style.width = W + 'px';
  document.documentElement.style.setProperty('--strip-w', W + 'px');

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2.5;
  ctx.strokeRect(1, 1, W - 2, H - 2);

  const loadImg = src => new Promise((res, rej) => {
    const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = src;
  });

  Promise.all(capturedPhotos.slice(0, n).map(loadImg)).then(images => {
    images.forEach((img, i) => {
      const x = pad, y = pad + i * (ph + pad);
      ctx.save();
      ctx.filter = 'none'; // already baked in
      ctx.drawImage(img, x, y, pw, ph);
      ctx.restore();
      ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 1;
      ctx.strokeRect(x, y, pw, ph);
    });
    // Footer
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 11px "Special Elite", serif';
    ctx.textAlign = 'center';
    ctx.fillText('★  PHOTOBOOTH STUDIO  ★', W / 2, H - 12);

    // Dividers
    for (let i = 0; i < n - 1; i++) {
      const y = pad + (i + 1) * (ph + pad) - pad / 2;
      ctx.setLineDash([3, 3]); ctx.strokeStyle = '#ddd'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
      ctx.setLineDash([]);
    }

    finalStripDataURL = canvas.toDataURL('image/png');

    // Mirror to result canvas
    const rc = document.getElementById('res-canvas');
    rc.width = W; rc.height = H;
    rc.getContext('2d').drawImage(canvas, 0, 0);
    resultStickers = [];

    showDelivery();
  });
}

// ===== DELIVERY =====
function showDelivery() {
  showScreen('s-delivery');
  const wrap = document.getElementById('delStripWrap');
  wrap.classList.remove('visible');
  wrap.style.opacity = 0;

  const timerEl = document.getElementById('deliveryTimer');
  let t = 3;
  timerEl.textContent = `Developing your photos... ${t}`;

  const iv = setInterval(() => {
    t--;
    if (t > 0) {
      timerEl.textContent = `Photos ready in ${t}...`;
    } else {
      clearInterval(iv);
      timerEl.textContent = '📸 Here come your photos!';
      wrap.classList.add('visible');
      setTimeout(() => showScreen('s-result'), 2200);
    }
  }, 1000);
}

// ===== RESULT =====
function addStickerToResult(emoji) {
  const rc = document.getElementById('res-canvas');
  const ctx = rc.getContext('2d');
  const x = 10 + Math.random() * (rc.width - 40);
  const y = 10 + Math.random() * (rc.height - 40);
  ctx.font = '28px serif';
  ctx.fillText(emoji, x, y);
  finalStripDataURL = rc.toDataURL('image/png');
}

function addSticker(emoji) {
  // In camera mode — visual only, for fun
}

function downloadStrip() {
  if (!finalStripDataURL) return;
  const a = document.createElement('a');
  a.href = finalStripDataURL;
  a.download = `photobooth-${Date.now()}.png`;
  a.click();
}

async function shareStrip() {
  if (!finalStripDataURL) return;
  if (navigator.share) {
    try {
      const blob = await (await fetch(finalStripDataURL)).blob();
      const file = new File([blob], 'photostrip.png', {type: 'image/png'});
      await navigator.share({title: 'My PhotoStrip!', text: 'Check out my photostrip! 📸', files: [file]});
      return;
    } catch(e) {}
  }
  downloadStrip();
}

function printStrip() {
  if (!finalStripDataURL) return;
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:flex-start;padding:20px}img{max-width:300px}</style></head><body><img src="${finalStripDataURL}"><script>window.onload=()=>{window.print();window.close()}<\/script></body></html>`);
  w.document.close();
}

// ===== NAVIGATION =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function goBack() {
  if (videoStream) { videoStream.getTracks().forEach(t => t.stop()); videoStream = null; }
  showScreen('s-entrance');
}

function restartBooth() {
  capturedPhotos = []; finalStripDataURL = null; resultStickers = [];
  currentFilter = 0; currentFrame = 0; dialAngle = 0;
  updateDialUI(); applyFilter(); selectFrame(0); resetShooting();
  showScreen('s-camera');
  requestCamera();
}

function showInfo(type) {
  const msgs = {
    faq: 'FAQ: Allow camera access, choose a frame & filter, press Take Photos, then download your strip!',
    about: 'Sketch PhotoBooth Studio — A hand-drawn doodle photobooth experience built with love.',
    contact: 'Contact: hello@sketchphotobooth.studio',
    privacy: 'Privacy: All photos are processed locally in your browser. Nothing is uploaded or stored.',
  };
  alert(msgs[type] || '');
}
