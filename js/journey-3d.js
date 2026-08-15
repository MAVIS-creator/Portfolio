/* KLYVEX Journey: 3D Cyber Core & Checkpoint Portal Engine
   An immersive Three.js 3D experience tracing Akintunde's tech evolution.
   Features a floating 3D Cyber Core, glowing checkpoint gateways, particle stars, and smooth scroll/drag navigation. */

(function () {
  'use strict';

  // ===== TECH MILESTONES DATA =====
  const MILESTONES = [
    { year: '2020', tech: 'HTML5', icon: '🏗️', color: 0xe34f26, hexColor: '#e34f26', desc: 'The Foundation: Web semantics, structure, and the first lines of code.', detail: 'Learned HTML standards, DOM hierarchy, forms, semantic markup, and built my first interactive web pages.' },
    { year: '2021', tech: 'CSS3', icon: '🎨', color: 0x38bdf8, hexColor: '#38bdf8', desc: 'Visual Design & Motion: Layouts, Flexbox, Grid, animations & micro-interactions.', detail: 'Mastered modern CSS architecture, responsive breakpoints, custom properties, glassmorphism, and keyframe animations.' },
    { year: '2022', tech: 'JavaScript', icon: '⚡', color: 0xeab308, hexColor: '#eab308', desc: 'DOM Logic & Dynamic Interactivity: Bringing applications to life.', detail: 'Async/await, ES6+ features, fetch API, client-side state management, canvas rendering, and event-driven architecture.' },
    { year: '2023', tech: 'PHP', icon: '🔧', color: 0xa5b4fc, hexColor: '#a5b4fc', desc: 'Server-Side Engineering & REST APIs: PDO MySQL, authentication & backend systems.', detail: 'Built structured PHP backends, PDO database abstraction layers, CSRF protection, rate-limiting DDoS firewalls, and admin control panels.' },
    { year: '2023', tech: 'Python', icon: '🐍', color: 0xeab308, hexColor: '#eab308', desc: 'Systems Scripting, Automation & AI Orchestration: The versatile powerhouse.', detail: 'Automation scripts, security analysis tools, data processing pipelines, and building FastAPI orchestrators for multi-model AI routing.' },
    { year: '2024', tech: 'Node.js & React', icon: '⚛️', color: 0x61dafb, hexColor: '#61dafb', desc: 'Modern Full-Stack Applications: Component architecture & Phaser 3 game engine.', detail: 'React functional components, custom hooks, TypeScript, Phaser 3 arcade physics integration, and scalable app architectures.' },
    { year: '2025', tech: 'Supabase & Postgres', icon: '🗄️', color: 0x3ecf8e, hexColor: '#3ecf8e', desc: 'Real-Time Databases & Authentication: Enterprise-grade persistence.', detail: 'Supabase real-time subscriptions, row-level security policies, PostgreSQL schemas, email authentication, and password reset flows.' },
    { year: '2026', tech: 'AI Orchestration & KLYVEX', icon: '🚀', color: 0xf59e0b, hexColor: '#f59e0b', desc: 'Multi-Model AI & The KLYVEX Vision: Building AI-native gaming intelligence.', detail: 'Groq (instant speed), Gemini (deep reasoning), OpenRouter routing, context management, and full-stack AI platform development.' }
  ];

  const TRACK_SPACING = 22;
  const TOTAL_LENGTH = (MILESTONES.length - 1) * TRACK_SPACING;

  let scene, camera, renderer, clock;
  let cyberCore, coreInnerWire, coreLight;
  let checkpoints = [];
  let currentMilestoneIndex = 0;
  let scrollProgress = 0; // 0 to 1
  let targetProgress = 0;
  let autoPlay = true;
  let popupVisible = false;

  // Touch / Mouse Drag Tracking
  let isDragging = false;
  let previousMouseX = 0;

  // ===== INITIALIZE THREE.JS SCENE =====
  function init() {
    const container = document.getElementById('journeyCanvas');
    if (!container) return;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030508, 0.008);

    // Camera
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300);
    camera.position.set(0, 5, 14);
    camera.lookAt(0, 2, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x030508);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    clock = new THREE.Clock();

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0x0d1527, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    dirLight.position.set(15, 25, 15);
    scene.add(dirLight);

    const goldLight = new THREE.DirectionalLight(0xeab308, 0.4);
    goldLight.position.set(-15, 10, -10);
    scene.add(goldLight);

    // Build Sci-Fi Environment
    createStarfield();
    createCyberTrack();
    createCheckpointPortals();
    createCyberCore();

    // Event Listeners
    window.addEventListener('resize', onResize);
    window.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('keydown', onKeyDown);

    // Start Engine
    animate();
    updateHUD(0);
  }

  // ===== STARFIELD & COSMIC DUST =====
  function createStarfield() {
    const starCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 220;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80 + 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 220;

      // Theme colors: cyan-blue, electric blue, amber gold
      const rand = Math.random();
      if (rand > 0.6) {
        colors[i * 3] = 0.22; colors[i * 3 + 1] = 0.74; colors[i * 3 + 2] = 0.97; // sky blue
      } else if (rand > 0.3) {
        colors[i * 3] = 0.92; colors[i * 3 + 1] = 0.7; colors[i * 3 + 2] = 0.03; // amber gold
      } else {
        colors[i * 3] = 0.15; colors[i * 3 + 1] = 0.39; colors[i * 3 + 2] = 0.92; // royal blue
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
  }

  // ===== CYBER GRID TRACK =====
  function createCyberTrack() {
    // Grid ground plane
    const grid = new THREE.GridHelper(300, 150, 0x38bdf8, 0x0a1628);
    grid.position.y = -0.05;
    grid.material.opacity = 0.22;
    grid.material.transparent = true;
    scene.add(grid);

    // Glowing main track line
    const points = [];
    for (let x = -20; x <= TOTAL_LENGTH + 20; x += 1) {
      points.push(new THREE.Vector3(x, 0.05, 0));
    }
    const trackGeo = new THREE.BufferGeometry().setFromPoints(points);
    const trackMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, opacity: 0.6, transparent: true });
    scene.add(new THREE.Line(trackGeo, trackMat));

    // Parallel gold track lines
    const pointsL = points.map(p => new THREE.Vector3(p.x, 0.05, -1.2));
    const pointsR = points.map(p => new THREE.Vector3(p.x, 0.05, 1.2));
    const sideMat = new THREE.LineBasicMaterial({ color: 0xeab308, opacity: 0.35, transparent: true });
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsL), sideMat));
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsR), sideMat));
  }

  // ===== CHECKPOINT GATEWAY PORTALS =====
  function createCheckpointPortals() {
    MILESTONES.forEach((m, idx) => {
      const x = idx * TRACK_SPACING;

      const group = new THREE.Group();
      group.position.set(x, 0, 0);

      // Sci-Fi Arch Gateway (Torus / Ring Frame)
      const ringGeo = new THREE.TorusGeometry(3.2, 0.08, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: m.color,
        emissive: m.color,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 3.5;
      group.add(ring);

      // Rotating Outer Octahedron / Crystal at Center of Arch
      const crystalGeo = new THREE.OctahedronGeometry(1.0, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: m.color,
        emissive: m.color,
        emissiveIntensity: 0.7,
        wireframe: true
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 3.5;
      crystal.name = 'crystal';
      group.add(crystal);

      // Solid inner core crystal
      const coreGeo = new THREE.OctahedronGeometry(0.5, 0);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: m.color,
        emissiveIntensity: 0.9,
        transparent: true,
        opacity: 0.8
      });
      const innerCore = new THREE.Mesh(coreGeo, coreMat);
      innerCore.position.y = 3.5;
      group.add(innerCore);

      // Platform Pad under Gateway
      const padGeo = new THREE.CylinderGeometry(2.0, 2.4, 0.2, 8);
      const padMat = new THREE.MeshStandardMaterial({
        color: 0x0b111e,
        emissive: m.color,
        emissiveIntensity: 0.2,
        metalness: 0.6
      });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.y = 0.1;
      group.add(pad);

      // Point Light illuminating Checkpoint
      const pLight = new THREE.PointLight(m.color, 0.8, 12);
      pLight.position.set(0, 3.5, 0);
      group.add(pLight);

      scene.add(group);
      checkpoints.push({ group, crystal, light: pLight, color: m.color });
    });
  }

  // ===== FLOATING 3D CYBER CORE (REPLACES BLOCKY MAN) =====
  function createCyberCore() {
    cyberCore = new THREE.Group();

    // Outer wireframe Icosahedron
    const outerGeo = new THREE.IcosahedronGeometry(1.1, 1);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x2563eb,
      emissiveIntensity: 0.6,
      wireframe: true
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    cyberCore.add(outerMesh);

    // Inner glowing core sphere
    const innerGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.9
    });
    coreInnerWire = new THREE.Mesh(innerGeo, innerMat);
    cyberCore.add(coreInnerWire);

    // Orbiting Ring 1
    const ring1Geo = new THREE.TorusGeometry(1.4, 0.03, 12, 32);
    const ring1Mat = new THREE.MeshStandardMaterial({ color: 0xeab308, emissive: 0xeab308, emissiveIntensity: 0.8 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.name = 'ring1';
    cyberCore.add(ring1);

    // Orbiting Ring 2
    const ring2Geo = new THREE.TorusGeometry(1.6, 0.02, 12, 32);
    const ring2Mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.8 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.name = 'ring2';
    cyberCore.add(ring2);

    // Core Point Light
    coreLight = new THREE.PointLight(0x38bdf8, 1.5, 15);
    cyberCore.add(coreLight);

    cyberCore.position.set(0, 3.5, 0);
    scene.add(cyberCore);
  }

  // ===== NAVIGATION & SCROLL HANDLERS =====
  function onWheel(e) {
    e.preventDefault();
    autoPlay = false;
    const delta = e.deltaY * 0.0008;
    targetProgress = Math.max(0, Math.min(1, targetProgress + delta));
  }

  function onMouseDown(e) {
    isDragging = true;
    previousMouseX = e.clientX;
    autoPlay = false;
  }

  function onMouseMove(e) {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMouseX;
    previousMouseX = e.clientX;
    targetProgress = Math.max(0, Math.min(1, targetProgress - deltaX * 0.0015));
  }

  function onMouseUp() { isDragging = false; }

  function onTouchStart(e) {
    if (e.touches.length > 0) {
      previousMouseX = e.touches[0].clientX;
      autoPlay = false;
    }
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      const deltaX = e.touches[0].clientX - previousMouseX;
      previousMouseX = e.touches[0].clientX;
      targetProgress = Math.max(0, Math.min(1, targetProgress - deltaX * 0.002));
    }
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      autoPlay = false;
      targetProgress = Math.min(1, targetProgress + 1 / (MILESTONES.length - 1));
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      autoPlay = false;
      targetProgress = Math.max(0, targetProgress - 1 / (MILESTONES.length - 1));
    }
    if (e.key === ' ') {
      e.preventDefault();
      showMilestonePopup();
    }
    if (e.key === 'Escape') {
      hideMilestonePopup();
    }
  }

  // ===== UPDATE SCENE & ANIMATION LOOP =====
  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Auto-walk slow progress if active
    if (autoPlay && !popupVisible) {
      targetProgress += 0.0004;
      if (targetProgress > 1) targetProgress = 0;
    }

    // Smooth lerp progress
    scrollProgress += (targetProgress - scrollProgress) * 0.08;
    const currentX = scrollProgress * TOTAL_LENGTH;

    // Move Cyber Core
    if (cyberCore) {
      cyberCore.position.x = currentX;
      cyberCore.position.y = 3.5 + Math.sin(time * 2.5) * 0.3; // Floating bob
      cyberCore.rotation.y = time * 0.8;
      cyberCore.rotation.z = time * 0.4;

      const ring1 = cyberCore.getObjectByName('ring1');
      const ring2 = cyberCore.getObjectByName('ring2');
      if (ring1) ring1.rotation.z = time * 1.5;
      if (ring2) ring2.rotation.x = time * 1.2;
    }

    // Camera follow smoothly
    camera.position.x += (currentX - camera.position.x) * 0.08;
    camera.position.y = 5.2 + Math.sin(time * 1.5) * 0.15;
    camera.lookAt(currentX + 1.5, 3.2, 0);

    // Rotate Checkpoint Crystals
    checkpoints.forEach((cp, idx) => {
      if (cp.crystal) {
        cp.crystal.rotation.y = time * (1 + idx * 0.2);
        cp.crystal.rotation.x = time * 0.5;
      }
    });

    // Check closest milestone
    const activeIdx = Math.round(scrollProgress * (MILESTONES.length - 1));
    if (activeIdx !== currentMilestoneIndex) {
      currentMilestoneIndex = activeIdx;
      updateHUD(activeIdx);
    }

    renderer.render(scene, camera);
  }

  // ===== HUD & POPUP MANAGEMENT =====
  function updateHUD(idx) {
    const m = MILESTONES[idx];
    const hudYear = document.getElementById('hudYear');
    const hudTech = document.getElementById('hudTech');
    const hudDesc = document.getElementById('hudDesc');
    const fill = document.getElementById('journeyProgressFill');

    if (hudYear) hudYear.textContent = m.year;
    if (hudTech) {
      hudTech.innerHTML = `<span style="color: ${m.hexColor}">${m.icon} ${m.tech}</span>`;
    }
    if (hudDesc) hudDesc.textContent = m.desc;
    if (fill) {
      const pct = (idx / (MILESTONES.length - 1)) * 100;
      fill.style.width = pct + '%';
    }

    // Highlight active chip
    const chips = document.querySelectorAll('.milestone-chip');
    chips.forEach((c, i) => {
      if (i === idx) {
        c.classList.add('border-sky-400', 'bg-sky-950/80', 'text-sky-300');
      } else {
        c.classList.remove('border-sky-400', 'bg-sky-950/80', 'text-sky-300');
      }
    });
  }

  function showMilestonePopup() {
    const m = MILESTONES[currentMilestoneIndex];
    const popup = document.getElementById('milestonePopup');
    const popupYear = document.getElementById('popupYear');
    const popupTech = document.getElementById('popupTech');
    const popupDesc = document.getElementById('popupDesc');
    const popupDetail = document.getElementById('popupDetail');

    if (popup) {
      popupYear.textContent = m.year + ' MILESTONE';
      popupYear.style.color = m.hexColor;
      popupTech.textContent = m.icon + ' ' + m.tech;
      popupDesc.textContent = m.desc;
      popupDetail.textContent = m.detail;
      popup.classList.remove('hidden');
      popupVisible = true;
    }
  }

  function hideMilestonePopup() {
    const popup = document.getElementById('milestonePopup');
    if (popup) {
      popup.classList.add('hidden');
      popupVisible = false;
    }
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ===== PUBLIC API EXPOSED TO HUD BUTTONS =====
  window.JourneyEngine = {
    init: init,
    showMilestone: showMilestonePopup,
    hideMilestone: hideMilestonePopup,
    toggleAutoPlay: function () {
      autoPlay = !autoPlay;
      const btn = document.getElementById('autoWalkBtn');
      if (btn) btn.textContent = autoPlay ? '⏸ Pause Auto-Scroll' : '▶ Resume Auto-Scroll';
    },
    goToMilestone: function (idx) {
      if (idx >= 0 && idx < MILESTONES.length) {
        targetProgress = idx / (MILESTONES.length - 1);
        autoPlay = false;
        currentMilestoneIndex = idx;
        updateHUD(idx);
      }
    }
  };

})();
