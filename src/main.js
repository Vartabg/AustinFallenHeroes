/**
 * main.js — Scene setup, render loop, orchestration
 */
import * as THREE from 'three';
import { createEnvironment } from './environment.js';
import { createMemorial } from './memorial.js';
import { createFlame } from './flame.js';
import {
  initInteraction,
  updateInteraction,
  updateControls,
  cinematicIntro,
} from './interaction.js';
import { initDetailPanel, showDetail } from './detail-panel.js';
import { createFlags } from './flags.js';

// --- Load data then init ---
(async function boot() {
  const res = await fetch('./data/heroes.json');
  const heroesData = await res.json();

  // --- Renderer ---
  const canvas = document.getElementById('memorial-canvas');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8;

  // --- Scene ---
  const scene = new THREE.Scene();

  // --- Camera ---
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, 12, 25);

  // --- Build scene ---
  const env = createEnvironment(scene);
  const { nameObjects } = createMemorial(scene, heroesData);
  const flame = createFlame(scene);
  const flags = createFlags(scene);

  // --- Interaction ---
  initDetailPanel();
  const controls = initInteraction(camera, renderer, nameObjects, showDetail);

  // --- Intro overlay ---
  const introOverlay = document.getElementById('intro-overlay');
  const enterBtn = document.getElementById('enter-btn');

  enterBtn.addEventListener('click', () => {
    introOverlay.classList.add('fade-out');
    cinematicIntro(camera, () => {
      // Intro complete — controls are now active
    });
  });

  // --- Render loop ---
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const dt = clock.getDelta();

    // Update flame & flags
    flame.update(dt);
    flags.update(performance.now() * 0.001);

    // Flickering flame light
    const flicker = 1 + Math.sin(performance.now() * 0.01) * 0.1 +
      Math.sin(performance.now() * 0.023) * 0.05;
    env.flameLight.intensity = 2.5 * flicker;
    env.flameFill.intensity = 0.8 * flicker;

    // Update controls & interaction
    updateControls();
    updateInteraction(camera, nameObjects);

    // Subtle star twinkle
    env.stars.material.opacity = 0.5 + Math.sin(performance.now() * 0.001) * 0.1;

    renderer.render(scene, camera);
  }

  animate();

  // --- Resize ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
