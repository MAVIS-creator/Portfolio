/* Master JavaScript Engine - Akintunde Dolapo Elisha (MAVIS / BK) Portfolio */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initParticleCanvas();
  initSimulators();
  initTerminalEngine();
  initCopyEmail();
  initScrollAnimations();
});

/* 1. Mobile Navigation & Active Links */
function initNavbar() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const menuContainer = document.getElementById('mobileMenu');
  
  if (toggleBtn && menuContainer) {
    toggleBtn.addEventListener('click', () => {
      menuContainer.classList.toggle('hidden');
    });
  }

  // Highlight Active Link based on current URL path
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('nav-link-active');
    }
  });
}

/* 2. Background Particle Grid Canvas (Blue + Yellow Particles) */
function initParticleCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor(width / 22), 65);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      size: Math.random() * 2.2 + 1,
      color: Math.random() > 0.4 ? 'rgba(250, 204, 21, ' : 'rgba(56, 189, 248, '
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color + '0.7)';
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 115) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(250, 204, 21, ${0.12 * (1 - dist / 115)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}

/* 3. Interactive Project Simulators */
function initSimulators() {
  // SHA-256 Hash Chain Simulator
  const hashInput = document.getElementById('simStudentName');
  const hashOutput = document.getElementById('simHashResult');

  if (hashInput && hashOutput) {
    let currentPrev = "0000a89f3c71b209e84b";
    
    hashInput.addEventListener('input', async () => {
      const val = hashInput.value || "Student Record";
      const combined = currentPrev + val + Date.now();
      const hashStr = await computeSha256(combined);
      hashOutput.textContent = hashStr;
    });
  }

  // VaultGuard Sandbox
  const scanBtn = document.getElementById('simScanBtn');
  const scanOutput = document.getElementById('simScanOutput');

  if (scanBtn && scanOutput) {
    scanBtn.addEventListener('click', () => {
      scanOutput.innerHTML = `<span class="text-yellow-400">[AUDIT]</span> Initializing system integrity verification...<br>`;
      scanBtn.disabled = true;

      const steps = [
        '<span class="text-sky-400">[1/4]</span> Auditing system process memory & handles...',
        '<span class="text-yellow-400">[2/4]</span> Scanning startup persistence registry entries...',
        '<span class="text-emerald-400">[3/4]</span> USB Immunization shield: ACTIVE',
        '<span class="badge-security-red"><span class="dot-pulse"></span> SYSTEM AUDIT CLEAN: 0 Threats Detected</span>'
      ];

      steps.forEach((step, idx) => {
        setTimeout(() => {
          scanOutput.innerHTML += `${step}<br>`;
          if (idx === steps.length - 1) scanBtn.disabled = false;
        }, (idx + 1) * 750);
      });
    });
  }

  // Geo-Fence Tester
  const testFenceBtn = document.getElementById('simFenceBtn');
  const fenceOutput = document.getElementById('simFenceResult');

  if (testFenceBtn && fenceOutput) {
    testFenceBtn.addEventListener('click', () => {
      const lat = (8.4799 + (Math.random() - 0.5) * 0.01).toFixed(4);
      const lng = (4.5418 + (Math.random() - 0.5) * 0.01).toFixed(4);
      fenceOutput.innerHTML = `
        <div class="p-3 bg-slate-900/90 rounded border border-yellow-500/40 text-xs font-mono">
          <p class="text-slate-300">GPS Coords: <span class="text-yellow-400">${lat}° N, ${lng}° E</span></p>
          <p class="text-slate-300">Geofence Radius: <span class="text-sky-400">500m (LAUTECH Campus)</span></p>
          <p class="mt-1 font-semibold text-emerald-400">✅ LINK VALIDATED: Token Expires in 14m 59s</p>
        </div>
      `;
    });
  }
}

async function computeSha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/* 4. MAVIS-CLI Terminal Engine */
function initTerminalEngine() {
  const termInput = document.getElementById('termInput');
  const termHistory = document.getElementById('termHistory');

  if (!termInput || !termHistory) return;

  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = termInput.value.trim().toLowerCase();
      termInput.value = '';
      executeCommand(cmd, termHistory);
    }
  });
}

function executeCommand(cmd, historyElem) {
  const line = document.createElement('div');
  line.className = 'mb-2';
  line.innerHTML = `<span class="text-yellow-400">mavis@lautech:~$</span> <span class="text-white">${escapeHtml(cmd)}</span>`;
  historyElem.appendChild(line);

  const res = document.createElement('div');
  res.className = 'mb-4 text-slate-300 text-sm font-mono leading-relaxed';

  switch (cmd) {
    case 'help':
      res.innerHTML = `
        <p class="text-yellow-400 mb-1 font-bold">Available MAVIS-CLI Commands:</p>
        <p>• <span class="text-sky-400">about</span>      - Print Akintunde Dolapo Elisha bio & details</p>
        <p>• <span class="text-sky-400">projects</span>   - List flagship security & software builds</p>
        <p>• <span class="text-sky-400">skills</span>     - Display tech stack (HTML5, CSS3, JS, PHP, Python, React, Node, Supabase, Postgres)</p>
        <p>• <span class="text-sky-400">exploring</span>  - AI x Gaming x Cybersecurity vision</p>
        <p>• <span class="text-sky-400">security</span>   - View VaultGuard & Attendance integrity status</p>
        <p>• <span class="text-sky-400">clear</span>      - Clear terminal screen</p>
        <p>• <span class="text-sky-400">contact</span>    - Show contact details, email & social channels</p>
      `;
      break;
    case 'about':
      res.innerHTML = `
        <p class="text-yellow-400 font-semibold">Akintunde Dolapo Elisha (BK / MAVIS)</p>
        <p>21-year-old Nigerian computer nerd, cybersecurity student (400 Level @ LAUTECH), developer & experimenter.</p>
        <p class="text-sky-400 mt-1">"I build software, cybersecurity tools, and experiments."</p>
      `;
      break;
    case 'projects':
      res.innerHTML = `
        <p class="text-yellow-400 font-semibold mb-1">Flagship Projects:</p>
        <p>1. <span class="text-sky-400 font-bold">VaultGuard 360</span> - Windows Security & Remediation Suite</p>
        <p>2. <span class="text-sky-400 font-bold">Blockchain Attendance</span> - SHA-256 & Device Fingerprinting</p>
        <p>3. <span class="text-sky-400 font-bold">HIGH Q SOLID ACADEMY</span> - highqsolidacademy.com</p>
        <p>4. <span class="text-yellow-400 font-bold">QUANTYX Platform</span> - AI Gaming Intelligence (Code Private)</p>
        <p>5. <span class="text-sky-400 font-bold">Geo-Fence Link Generator</span> - Location-Aware JWT Security</p>
        <p>6. <span class="text-sky-400 font-bold">Mind Control / MindGrid</span> - Klyvex Intelligence Prototype</p>
      `;
      break;
    case 'skills':
      res.innerHTML = `
        <p class="text-yellow-400 font-bold">Core Stack & Languages:</p> HTML5, CSS3, JavaScript, PHP, Python, React, Node.js, Supabase, PostgreSQL, Git<br>
        <p class="text-sky-400 mt-1">Specialties:</p> Web Security, SHA-256 Hash Chains, Device Fingerprinting, Multi-Model AI, Automation scripts.
      `;
      break;
    case 'exploring':
      res.innerHTML = `
        <p class="text-yellow-400 font-bold">AI × Gaming × Software × Cybersecurity</p>
        <p class="text-slate-300">Building next-level intelligent software systems. Keep the mystery.</p>
      `;
      break;
    case 'security':
      res.innerHTML = `
        <span class="badge-security-red"><span class="dot-pulse"></span> SYSTEM AUDIT: PROTECTED</span><br>
        <span class="text-emerald-400 mt-1 inline-block">SHA-256 Chain Integrity: VERIFIED | VaultGuard Shields: ACTIVE</span>
      `;
      break;
    case 'clear':
      historyElem.innerHTML = '';
      return;
    case 'contact':
      res.innerHTML = `
        <p>Email: <span class="text-yellow-400">akintunde.dolapo1@gmail.com</span></p>
        <p>GitHub: <span class="text-sky-400">github.com/MAVIS-creator</span></p>
        <p>X (Twitter): <span class="text-yellow-400">@Klyvex</span></p>
        <p>Instagram: <span class="text-pink-400">@adetayoibk</span></p>
      `;
      break;
    case '':
      return;
    default:
      res.innerHTML = `<span class="text-red-400">Command not found: "${escapeHtml(cmd)}". Type <span class="text-yellow-400">help</span> for commands.</span>`;
  }

  historyElem.appendChild(res);
  historyElem.scrollTop = historyElem.scrollHeight;
}

/* 5. Copy Email Helper */
function initCopyEmail() {
  const copyBtn = document.getElementById('copyEmailBtn');
  const copyToast = document.getElementById('copyToast');

  if (copyBtn && copyToast) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('akintunde.dolapo1@gmail.com');
      copyToast.classList.remove('hidden');
      setTimeout(() => copyToast.classList.add('hidden'), 2500);
    });
  }
}

/* 6. Scroll Fade-In-Out Animation Observer */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in-on-scroll');
  
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('fade-in-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-visible');
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => observer.observe(el));
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
