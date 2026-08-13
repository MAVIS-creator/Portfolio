/* KLYVEX Journey — Three.js 3D Interactive Tech Journey Engine
   A synthwave/cyberpunk side-scrolling experience showing Akintunde's developer evolution.
   Technologies: Three.js, procedural geometry, keyframe animation. */

(function () {
  'use strict';

  // ===== MILESTONE DATA =====
  const MILESTONES = [
    { year: '2020', tech: 'HTML5', icon: '🏗️', color: 0xe34f26, desc: 'The Foundation — Structure, semantics, and the first lines of code that started everything.', detail: 'Built my first web pages, learned about tags, forms, and how the browser renders content.' },
    { year: '2021', tech: 'CSS3', icon: '🎨', color: 0x38bdf8, desc: 'Styling, Layouts & Visual Aesthetics — Making things look beautiful.', detail: 'Mastered Flexbox, Grid, animations, and responsive design. Fell in love with making interfaces.' },
    { year: '2022', tech: 'JavaScript', icon: '⚡', color: 0xfacc15, desc: 'DOM Logic & Client-Side Interactivity — Bringing pages to life.', detail: 'Event listeners, async/await, fetch API, canvas games, and dynamic manipulation of everything.' },
    { year: '2023', tech: 'PHP', icon: '🔧', color: 0xa78bfa, desc: 'Server-Side Scripting — Building backends, MySQL, and the QUANTYX architecture.', detail: 'PDO MySQL, REST APIs, authentication systems, CSRF protection, rate limiting, and admin dashboards.' },
    { year: '2023', tech: 'Python', icon: '🐍', color: 0xfacc15, desc: 'Systems Automation, Scripting & Security Tools — The versatile weapon.', detail: 'Automation scripts, security research tools, AI orchestration services, and data processing pipelines.' },
    { year: '2024', tech: 'Node.js & React', icon: '⚛️', color: 0x61dafb, desc: 'Modern Full-Stack Applications — Component-driven architecture.', detail: 'React components, TypeScript, hooks, Phaser 3 game integration, Tailwind CSS, and modern tooling.' },
    { year: '2025', tech: 'Supabase & PostgreSQL', icon: '🗄️', color: 0x3ecf8e, desc: 'Real-Time Databases & Authentication — Production-grade data layers.', detail: 'Supabase auth, database migrations, row-level security, real-time subscriptions, and email authentication.' },
    { year: '2026', tech: 'Vercel & Multi-Model AI', icon: '🚀', color: 0xf8db00, desc: 'Cloud Deployment & AI-Native Intelligence — The KLYVEX vision.', detail: 'Groq, Gemini, OpenRouter model routing, AI orchestration, cloud deployment, and building the future.' }
  ];

  const TRACK_SPACING = 18;
  const TOTAL_LENGTH = MILESTONES.length * TRACK_SPACING;

  let scene, camera, renderer, clock;
  let character, characterMixer;
  let currentMilestoneIndex = 0;
  let targetX = 0;
  let autoWalk = true;
  let autoWalkSpeed = 0.012;
  let milestonePopupVisible = false;

  // ===== INITIALIZE THREE.JS SCENE =====
  function init() {
    const container = document.getElementById('journeyCanvas');
    if (!container) return;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030508, 0.012);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 6, 14);
    camera.lookAt(0, 2, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x030508);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    clock = new THREE.Clock();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1a1a3e, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfacc15, 0.8);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x38bdf8, 1.2, 50);
    blueLight.position.set(-5, 8, 5);
    scene.add(blueLight);

    const yellowLight = new THREE.PointLight(0xfacc15, 0.8, 40);
    yellowLight.position.set(5, 6, -3);
    scene.add(yellowLight);

    // Build the world
    createSynthwaveGround();
    createStarField();
    createTrackPath();
    createMilestonePillars();
    createCharacter();

    // Event listeners
    window.addEventListener('resize', onResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Start
    animate();
  }

  // ===== SYNTHWAVE GRID GROUND =====
  function createSynthwaveGround() {
    // Grid floor
    const gridHelper = new THREE.GridHelper(200, 100, 0xfacc15, 0x0a1628);
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x050810,
      roughness: 0.9,
      metalness: 0.1,
      transparent: true,
      opacity: 0.95
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  // ===== STAR FIELD =====
  function createStarField() {
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 800;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = Math.random() * 40 + 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 150;

      // Blue or yellow stars
      if (Math.random() > 0.5) {
        colors[i * 3] = 0.22; colors[i * 3 + 1] = 0.74; colors[i * 3 + 2] = 0.97; // sky blue
      } else {
        colors[i * 3] = 0.98; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.08; // yellow
      }
    }

    starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starsMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);
  }

  // ===== TRACK PATH (GLOWING NEON LINE) =====
  function createTrackPath() {
    const points = [];
    for (let i = -10; i <= TOTAL_LENGTH + 10; i += 0.5) {
      points.push(new THREE.Vector3(i, 0.05, 0));
    }

    const trackGeo = new THREE.BufferGeometry().setFromPoints(points);
    const trackMat = new THREE.LineBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.4,
      linewidth: 2
    });
    const track = new THREE.Line(trackGeo, trackMat);
    scene.add(track);

    // Second track line (blue, offset)
    const points2 = points.map(p => new THREE.Vector3(p.x, 0.05, p.z + 0.3));
    const track2Geo = new THREE.BufferGeometry().setFromPoints(points2);
    const track2Mat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25
    });
    const track2 = new THREE.Line(track2Geo, track2Mat);
    scene.add(track2);
  }

  // ===== MILESTONE PILLARS =====
  function createMilestonePillars() {
    MILESTONES.forEach((m, idx) => {
      const x = idx * TRACK_SPACING;

      // Pillar base
      const pillarGeo = new THREE.CylinderGeometry(0.15, 0.25, 4, 8);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: m.color,
        emissive: m.color,
        emissiveIntensity: 0.3,
        metalness: 0.7,
        roughness: 0.3
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(x, 2, -2);
      pillar.castShadow = true;
      scene.add(pillar);

      // Glowing sphere on top
      const sphereGeo = new THREE.SphereGeometry(0.5, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: m.color,
        emissive: m.color,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.9
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(x, 4.3, -2);
      scene.add(sphere);

      // Point light for glow effect
      const glow = new THREE.PointLight(m.color, 0.6, 8);
      glow.position.set(x, 4.5, -2);
      scene.add(glow);

      // Year platform
      const platGeo = new THREE.BoxGeometry(2.5, 0.15, 1.5);
      const platMat = new THREE.MeshStandardMaterial({
        color: 0x0b111e,
        emissive: m.color,
        emissiveIntensity: 0.1,
        metalness: 0.5,
        roughness: 0.5
      });
      const platform = new THREE.Mesh(platGeo, platMat);
      platform.position.set(x, 0.08, 0);
      platform.receiveShadow = true;
      scene.add(platform);
    });
  }

  // ===== PROCEDURAL 3D CHARACTER =====
  function createCharacter() {
    character = new THREE.Group();

    // Body (torso)
    const bodyGeo = new THREE.BoxGeometry(0.6, 1.0, 0.4);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x1e3a8a, emissiveIntensity: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.8;
    body.castShadow = true;
    character.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.3, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xd4a574 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.6;
    head.castShadow = true;
    character.add(head);

    // Eyes (yellow glow)
    const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 1.0 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.1, 2.65, 0.25);
    character.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.1, 2.65, 0.25);
    character.add(rightEye);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a });

    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.5, 1.65, 0);
    leftArm.name = 'leftArm';
    character.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.5, 1.65, 0);
    rightArm.name = 'rightArm';
    character.add(rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.22, 0.8, 0.22);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });

    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.15, 0.9, 0);
    leftLeg.name = 'leftLeg';
    character.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.15, 0.9, 0);
    rightLeg.name = 'rightLeg';
    character.add(rightLeg);

    // Shoes (yellow)
    const shoeGeo = new THREE.BoxGeometry(0.25, 0.12, 0.35);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 0.2 });

    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-0.15, 0.44, 0.05);
    leftShoe.name = 'leftShoe';
    character.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0.15, 0.44, 0.05);
    rightShoe.name = 'rightShoe';
    character.add(rightShoe);

    character.position.set(-5, 0, 0);
    scene.add(character);
  }

  // ===== WALK ANIMATION =====
  function animateCharacter(time) {
    if (!character) return;

    const walkCycle = Math.sin(time * 6);
    const armSwing = Math.sin(time * 6) * 0.4;

    // Leg swing
    character.children.forEach(child => {
      if (child.name === 'leftLeg' || child.name === 'leftShoe') {
        child.rotation.x = walkCycle * 0.35;
      }
      if (child.name === 'rightLeg' || child.name === 'rightShoe') {
        child.rotation.x = -walkCycle * 0.35;
      }
      if (child.name === 'leftArm') {
        child.rotation.x = -armSwing;
      }
      if (child.name === 'rightArm') {
        child.rotation.x = armSwing;
      }
    });

    // Subtle body bob
    character.position.y = Math.abs(Math.sin(time * 12)) * 0.08;
  }

  // ===== CONTROLS =====
  let keysPressed = {};

  function onKeyDown(e) {
    keysPressed[e.key] = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      autoWalk = false;
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      autoWalk = false;
    }
    if (e.key === ' ') {
      e.preventDefault();
      showCurrentMilestone();
    }
    if (e.key === 'Escape') {
      hideMilestonePopup();
    }
  }

  function onKeyUp(e) {
    keysPressed[e.key] = false;
  }

  function updateMovement(delta) {
    let moveSpeed = 8 * delta;

    if (autoWalk && !milestonePopupVisible) {
      targetX += autoWalkSpeed;
      character.position.x += (targetX - character.position.x) * 0.05;
    } else {
      if (keysPressed['ArrowRight'] || keysPressed['d'] || keysPressed['D']) {
        targetX += moveSpeed;
      }
      if (keysPressed['ArrowLeft'] || keysPressed['a'] || keysPressed['A']) {
        targetX -= moveSpeed;
      }
      character.position.x += (targetX - character.position.x) * 0.08;
    }

    // Clamp
    targetX = Math.max(-5, Math.min(TOTAL_LENGTH + 5, targetX));

    // Update camera to follow
    camera.position.x += (character.position.x - camera.position.x) * 0.05;
    camera.lookAt(character.position.x, 2, 0);

    // Check milestone proximity
    checkMilestoneProximity();
  }

  // ===== MILESTONE PROXIMITY =====
  function checkMilestoneProximity() {
    for (let i = 0; i < MILESTONES.length; i++) {
      const mx = i * TRACK_SPACING;
      const dist = Math.abs(character.position.x - mx);
      if (dist < 2) {
        if (currentMilestoneIndex !== i) {
          currentMilestoneIndex = i;
          updateHUD(i);
        }
        return;
      }
    }
  }

  function updateHUD(idx) {
    const m = MILESTONES[idx];
    const yearEl = document.getElementById('hudYear');
    const techEl = document.getElementById('hudTech');
    const descEl = document.getElementById('hudDesc');
    const progressEl = document.getElementById('journeyProgressFill');

    if (yearEl) yearEl.textContent = m.year;
    if (techEl) techEl.textContent = m.icon + ' ' + m.tech;
    if (descEl) descEl.textContent = m.desc;
    if (progressEl) {
      const pct = ((idx + 1) / MILESTONES.length) * 100;
      progressEl.style.width = pct + '%';
    }
  }

  function showCurrentMilestone() {
    const m = MILESTONES[currentMilestoneIndex];
    const popup = document.getElementById('milestonePopup');
    const popupYear = document.getElementById('popupYear');
    const popupTech = document.getElementById('popupTech');
    const popupDesc = document.getElementById('popupDesc');
    const popupDetail = document.getElementById('popupDetail');

    if (popup) {
      popupYear.textContent = m.year;
      popupTech.textContent = m.icon + ' ' + m.tech;
      popupDesc.textContent = m.desc;
      popupDetail.textContent = m.detail;
      popup.classList.remove('hidden');
      milestonePopupVisible = true;
    }
  }

  function hideMilestonePopup() {
    const popup = document.getElementById('milestonePopup');
    if (popup) {
      popup.classList.add('hidden');
      milestonePopupVisible = false;
    }
  }

  // ===== RESIZE =====
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ===== MAIN ANIMATION LOOP =====
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    animateCharacter(elapsed);
    updateMovement(delta);

    renderer.render(scene, camera);
  }

  // ===== PUBLIC API =====
  window.JourneyEngine = {
    init: init,
    showMilestone: showCurrentMilestone,
    hideMilestone: hideMilestonePopup,
    toggleAutoWalk: function () {
      autoWalk = !autoWalk;
      const btn = document.getElementById('autoWalkBtn');
      if (btn) btn.textContent = autoWalk ? '⏸ Pause Auto-Walk' : '▶ Resume Auto-Walk';
    },
    goToMilestone: function (idx) {
      if (idx >= 0 && idx < MILESTONES.length) {
        targetX = idx * TRACK_SPACING;
        autoWalk = false;
        currentMilestoneIndex = idx;
        updateHUD(idx);
      }
    }
  };

})();
