/**
 * flame.js — GPU particle system for the eternal flame
 */
import * as THREE from 'three';

const PARTICLE_COUNT = 200;

export function createFlame(scene) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);
  const lifetimes = new Float32Array(PARTICLE_COUNT);
  const sizes = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    resetParticle(positions, velocities, lifetimes, sizes, i);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Flame texture from canvas
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 200, 50, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 120, 20, 0.8)');
  gradient.addColorStop(0.7, 'rgba(255, 60, 0, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 30, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.PointsMaterial({
    map: texture,
    size: 0.3,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
    vertexColors: false,
    color: 0xffaa33,
  });

  const particles = new THREE.Points(geometry, material);
  particles.position.set(0, 1.15, 0);
  scene.add(particles);

  // Ember particles (small rising sparks)
  const emberCount = 50;
  const emberGeo = new THREE.BufferGeometry();
  const emberPos = new Float32Array(emberCount * 3);
  const emberVel = new Float32Array(emberCount * 3);
  const emberLife = new Float32Array(emberCount);

  for (let i = 0; i < emberCount; i++) {
    resetEmber(emberPos, emberVel, emberLife, i);
  }

  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));

  const emberMat = new THREE.PointsMaterial({
    color: 0xffcc44,
    size: 0.04,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const embers = new THREE.Points(emberGeo, emberMat);
  embers.position.set(0, 1.15, 0);
  scene.add(embers);

  return {
    particles,
    embers,
    update(dt) {
      updateFlame(positions, velocities, lifetimes, sizes, dt);
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.size.needsUpdate = true;

      updateEmbers(emberPos, emberVel, emberLife, dt);
      emberGeo.attributes.position.needsUpdate = true;
    },
  };
}

function resetParticle(pos, vel, life, sizes, i) {
  const i3 = i * 3;
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 0.15;

  pos[i3] = Math.cos(angle) * radius;
  pos[i3 + 1] = Math.random() * 0.1;
  pos[i3 + 2] = Math.sin(angle) * radius;

  vel[i3] = (Math.random() - 0.5) * 0.15;
  vel[i3 + 1] = 0.5 + Math.random() * 1.0;
  vel[i3 + 2] = (Math.random() - 0.5) * 0.15;

  life[i] = Math.random();
  sizes[i] = 0.1 + Math.random() * 0.25;
}

function updateFlame(pos, vel, life, sizes, dt) {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    life[i] -= dt * (0.8 + Math.random() * 0.4);

    if (life[i] <= 0) {
      resetParticle(pos, vel, life, sizes, i);
      continue;
    }

    pos[i3] += vel[i3] * dt;
    pos[i3 + 1] += vel[i3 + 1] * dt;
    pos[i3 + 2] += vel[i3 + 2] * dt;

    // Fade and shrink as they rise
    sizes[i] *= 0.995;
    vel[i3] *= 0.98;
    vel[i3 + 2] *= 0.98;
  }
}

function resetEmber(pos, vel, life, i) {
  const i3 = i * 3;
  pos[i3] = (Math.random() - 0.5) * 0.3;
  pos[i3 + 1] = Math.random() * 0.5;
  pos[i3 + 2] = (Math.random() - 0.5) * 0.3;

  vel[i3] = (Math.random() - 0.5) * 0.3;
  vel[i3 + 1] = 0.8 + Math.random() * 1.5;
  vel[i3 + 2] = (Math.random() - 0.5) * 0.3;

  life[i] = 1.0 + Math.random() * 2.0;
}

function updateEmbers(pos, vel, life, dt) {
  for (let i = 0; i < pos.length / 3; i++) {
    const i3 = i * 3;
    life[i] -= dt;

    if (life[i] <= 0) {
      resetEmber(pos, vel, life, i);
      continue;
    }

    pos[i3] += vel[i3] * dt;
    pos[i3 + 1] += vel[i3 + 1] * dt;
    pos[i3 + 2] += vel[i3 + 2] * dt;

    // Wind drift
    vel[i3] += (Math.random() - 0.5) * 0.1 * dt;
    vel[i3 + 2] += (Math.random() - 0.5) * 0.1 * dt;
  }
}
