/**
 * flags.js — Prominent American flags flanking the memorial
 * Repositioned for clear visibility from default camera angle
 */
import * as THREE from 'three';

const FLAG_WIDTH = 2.4;
const FLAG_HEIGHT = 1.4;
const POLE_HEIGHT = 6.5;
const POLE_RADIUS = 0.04;
const SEGMENTS_X = 40;
const SEGMENTS_Y = 20;

/**
 * Create two American flags prominently visible from the default camera
 */
export function createFlags(scene) {
  const flags = [];

  // Position flags in FRONT of the wall ends, angled toward the viewer
  const positions = [
    { x: -6.5, z: -2.5, rotY: 0.4 },   // Left flag
    { x: 6.5, z: -2.5, rotY: -0.4 },    // Right flag
  ];

  positions.forEach(({ x, z, rotY }) => {
    const flag = createFlagUnit(x, z, rotY);
    scene.add(flag.group);
    flags.push(flag);

    // Spotlight on each flag
    const spot = new THREE.SpotLight(0xfff5e0, 1.5, 12, Math.PI / 6, 0.4);
    spot.position.set(x, POLE_HEIGHT + 2, z + 2);
    spot.target.position.set(x, POLE_HEIGHT - 1, z);
    scene.add(spot);
    scene.add(spot.target);
  });

  return {
    flags,
    update(time) {
      flags.forEach((f) => f.update(time));
    },
  };
}

function createFlagUnit(x, z, rotY) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotY;

  // -- Pole (taller, brushed metal)
  const poleGeo = new THREE.CylinderGeometry(POLE_RADIUS, POLE_RADIUS + 0.01, POLE_HEIGHT, 12);
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x9a9080,
    roughness: 0.25,
    metalness: 0.85,
  });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = POLE_HEIGHT / 2;
  pole.castShadow = true;
  group.add(pole);

  // -- Gold eagle finial
  const finialGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const finialMat = new THREE.MeshStandardMaterial({
    color: 0xc9a654,
    roughness: 0.15,
    metalness: 0.95,
  });
  const finial = new THREE.Mesh(finialGeo, finialMat);
  finial.position.y = POLE_HEIGHT + 0.08;
  group.add(finial);

  // -- Pole base (stone pedestal)
  const baseGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 8);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x3a3a3a,
    roughness: 0.7,
    metalness: 0.3,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.2;
  group.add(base);

  // -- Wreath at base (torus)
  const wreathGeo = new THREE.TorusGeometry(0.3, 0.06, 8, 16);
  const wreathMat = new THREE.MeshStandardMaterial({
    color: 0x2d5a27,
    roughness: 0.9,
    metalness: 0.0,
  });
  const wreath = new THREE.Mesh(wreathGeo, wreathMat);
  wreath.position.y = 0.06;
  wreath.rotation.x = -Math.PI / 2;
  group.add(wreath);

  // -- Flag cloth (larger, more segments)
  const flagGeo = new THREE.PlaneGeometry(FLAG_WIDTH, FLAG_HEIGHT, SEGMENTS_X, SEGMENTS_Y);
  const flagTexture = createAmericanFlagTexture();
  const flagMat = new THREE.MeshStandardMaterial({
    map: flagTexture,
    side: THREE.DoubleSide,
    roughness: 0.75,
    metalness: 0.0,
  });
  const flag = new THREE.Mesh(flagGeo, flagMat);
  flag.position.set(FLAG_WIDTH / 2 + 0.05, POLE_HEIGHT - FLAG_HEIGHT / 2 - 0.1, 0);
  flag.castShadow = true;
  group.add(flag);

  const originalPositions = flagGeo.attributes.position.array.slice();

  return {
    group,
    flag,
    geometry: flagGeo,
    originalPositions,
    update(time) {
      const positions = flagGeo.attributes.position;
      const pos = positions.array;

      for (let i = 0; i < positions.count; i++) {
        const ix = i * 3;
        const origX = originalPositions[ix];
        const origY = originalPositions[ix + 1];

        const t = (origX / FLAG_WIDTH + 0.5);
        const amplitude = t * t * 0.12;
        const speed = 2.2;

        pos[ix + 2] =
          amplitude * Math.sin(3.0 * t * Math.PI + time * speed) +
          amplitude * 0.4 * Math.sin(6.0 * t * Math.PI + time * speed * 1.4) +
          amplitude * 0.2 * Math.sin(9.0 * t * Math.PI + time * speed * 0.6);

        pos[ix + 1] = origY - t * t * 0.04;
      }

      positions.needsUpdate = true;
      flagGeo.computeVertexNormals();
    },
  };
}

function createAmericanFlagTexture() {
  const canvas = document.createElement('canvas');
  const w = 1140;
  const h = 600;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const stripeH = h / 13;

  for (let i = 0; i < 13; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#B22234' : '#FFFFFF';
    ctx.fillRect(0, i * stripeH, w, stripeH);
  }

  const cantonW = w * 0.4;
  const cantonH = stripeH * 7;
  ctx.fillStyle = '#3C3B6E';
  ctx.fillRect(0, 0, cantonW, cantonH);

  ctx.fillStyle = '#FFFFFF';
  const starDx = cantonW / 12;
  const starDy = cantonH / 10;
  const starSize = Math.min(starDx, starDy) * 0.4;

  for (let row = 0; row < 9; row++) {
    const cols = row % 2 === 0 ? 6 : 5;
    const offsetX = row % 2 === 0 ? starDx : starDx * 2;
    for (let col = 0; col < cols; col++) {
      drawStar(ctx, offsetX + col * starDx * 2, starDy + row * starDy, starSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function drawStar(ctx, cx, cy, r) {
  const spikes = 5;
  const innerR = r * 0.4;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const radius = i % 2 === 0 ? r : innerR;
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
}
