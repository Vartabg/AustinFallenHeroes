/**
 * interaction.js — Raycasting, orbit controls, cinematic intro
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { highlightName } from './memorial.js';

let controls;
let raycaster;
let mouse;
let hoveredMesh = null;
let onSelectCallback = null;

/**
 * Initialize interaction system
 */
export function initInteraction(camera, renderer, nameObjects, onSelect) {
  onSelectCallback = onSelect;
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2(-999, -999);

  // Orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 3;
  controls.maxDistance = 20;
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
  controls.minPolarAngle = 0.3;
  controls.target.set(0, 1.5, 0);
  controls.enabled = false; // Disabled during intro

  // Mouse events
  const canvas = renderer.domElement;
  canvas.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  canvas.addEventListener('click', () => {
    if (hoveredMesh && hoveredMesh.userData.hero) {
      onSelectCallback(hoveredMesh.userData.hero);
    }
  });

  // Touch support
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      mouse.x = (t.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(t.clientY / window.innerHeight) * 2 + 1;
    }
  });

  canvas.addEventListener('touchend', () => {
    if (hoveredMesh && hoveredMesh.userData.hero) {
      onSelectCallback(hoveredMesh.userData.hero);
    }
    mouse.set(-999, -999);
  });

  // Cursor style
  canvas.style.cursor = 'grab';

  return controls;
}

/**
 * Perform raycasting each frame
 */
export function updateInteraction(camera, nameObjects) {
  if (!raycaster) return;

  raycaster.setFromCamera(mouse, camera);
  const plates = nameObjects.map((n) => n.mesh);
  const intersects = raycaster.intersectObjects(plates);

  // Unhover previous
  if (hoveredMesh) {
    highlightName(hoveredMesh, false);
    hoveredMesh = null;
  }

  if (intersects.length > 0) {
    hoveredMesh = intersects[0].object;
    highlightName(hoveredMesh, true);
    document.body.style.cursor = 'pointer';
  } else {
    document.body.style.cursor = '';
  }
}

/**
 * Cinematic fly-in animation
 */
export function cinematicIntro(camera, onComplete) {
  const startPos = new THREE.Vector3(0, 12, 25);
  const endPos = new THREE.Vector3(0, 3.5, 12);
  const duration = 3000; // ms
  const startTime = performance.now();

  camera.position.copy(startPos);
  camera.lookAt(0, 1.5, 0);

  function animate(now) {
    const t = Math.min((now - startTime) / duration, 1);
    // Smooth ease-out cubic
    const ease = 1 - Math.pow(1 - t, 3);

    camera.position.lerpVectors(startPos, endPos, ease);
    camera.lookAt(0, 1.5, 0);

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      if (controls) {
        controls.enabled = true;
        controls.update();
      }
      onComplete();
    }
  }

  requestAnimationFrame(animate);
}

/**
 * Update controls (call each frame)
 */
export function updateControls() {
  if (controls?.enabled) {
    controls.update();
  }
}
