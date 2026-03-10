/**
 * flags.js — American flags flanking the memorial wall
 * Canvas-rendered flag texture + animated waving via vertex displacement
 */
import * as THREE from 'three';

const FLAG_WIDTH = 1.8;
const FLAG_HEIGHT = 1.0;
const POLE_HEIGHT = 5.0;
const POLE_RADIUS = 0.035;
const SEGMENTS_X = 32;
const SEGMENTS_Y = 16;

/**
 * Create two American flags flanking the memorial wall
 */
export function createFlags(scene) {
  const flags = [];

  // Place flags at the ends of the wall arc
  // Wall arc is 0.7π centered at π, so edges at π ± 0.35π
  const wallRadius = 8;
  const arcHalf = Math.PI * 0.35;

  const positions = [
    { angle: Math.PI - arcHalf - 0.15, side: 1 },  // Left end
    { angle: Math.PI + arcHalf + 0.15, side: -1 },  // Right end
  ];

  positions.forEach(({ angle, side }) => {
    const x = Math.sin(angle) * (wallRadius + 0.8);
    const z = -Math.cos(angle) * (wallRadius + 0.8);
    const flag = createFlagUnit(x, z, angle, side);
    scene.add(flag.group);
    flags.push(flag);
  });

  return {
    flags,
    update(time) {
      flags.forEach((f) => f.update(time));
    },
  };
}

/**
 * Create a single flag unit (pole + flag cloth)
 */
function createFlagUnit(x, z, angle, side) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // -- Pole
  const poleGeo = new THREE.CylinderGeometry(POLE_RADIUS, POLE_RADIUS, POLE_HEIGHT, 8);
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x8a8070,
    roughness: 0.3,
    metalness: 0.8,
  });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = POLE_HEIGHT / 2;
  pole.castShadow = true;
  group.add(pole);

  // -- Pole finial (gold ball on top)
  const finialGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const finialMat = new THREE.MeshStandardMaterial({
    color: 0xc9a654,
    roughness: 0.2,
    metalness: 0.9,
  });
  const finial = new THREE.Mesh(finialGeo, finialMat);
  finial.position.y = POLE_HEIGHT + 0.06;
  group.add(finial);

  // -- Flag cloth
  const flagGeo = new THREE.PlaneGeometry(FLAG_WIDTH, FLAG_HEIGHT, SEGMENTS_X, SEGMENTS_Y);
  const flagTexture = createAmericanFlagTexture();
  const flagMat = new THREE.MeshStandardMaterial({
    map: flagTexture,
    side: THREE.DoubleSide,
    roughness: 0.8,
    metalness: 0.0,
  });
  const flag = new THREE.Mesh(flagGeo, flagMat);

  // Position at top of pole, extending to the side
  flag.position.set(side * FLAG_WIDTH / 2, POLE_HEIGHT - FLAG_HEIGHT / 2 - 0.05, 0);

  // Rotate to face outward from the wall
  group.rotation.y = -(angle - Math.PI);

  group.add(flag);

  // Store original positions for waving
  const originalPositions = flagGeo.attributes.position.array.slice();

  return {
    group,
    flag,
    geometry: flagGeo,
    originalPositions,
    side,
    update(time) {
      const positions = flagGeo.attributes.position;
      const pos = positions.array;

      for (let i = 0; i < positions.count; i++) {
        const ix = i * 3;
        const origX = originalPositions[ix];
        const origY = originalPositions[ix + 1];

        // Normalized distance from pole (0 at pole, 1 at far edge)
        const t = (origX / FLAG_WIDTH + 0.5);

        // Wave amplitude increases with distance from pole
        const amplitude = t * t * 0.08;
        const frequency = 3.0;
        const speed = 2.0;

        // Combine multiple sine waves for realistic ripple
        pos[ix + 2] =
          amplitude * Math.sin(frequency * t * Math.PI + time * speed) +
          amplitude * 0.5 * Math.sin(frequency * 2 * t * Math.PI + time * speed * 1.3) +
          amplitude * 0.3 * Math.sin(frequency * 3 * t * Math.PI + time * speed * 0.7);

        // Slight droop at far edge
        pos[ix + 1] = origY - t * t * 0.03;
      }

      positions.needsUpdate = true;
      flagGeo.computeVertexNormals();
    },
  };
}

/**
 * Render the American flag onto a canvas texture
 */
function createAmericanFlagTexture() {
  const canvas = document.createElement('canvas');
  const w = 760;
  const h = 400;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const stripeH = h / 13;

  // -- 13 stripes (red and white alternating)
  for (let i = 0; i < 13; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#B22234' : '#FFFFFF';
    ctx.fillRect(0, i * stripeH, w, stripeH);
  }

  // -- Blue canton
  const cantonW = w * 0.4;
  const cantonH = stripeH * 7;
  ctx.fillStyle = '#3C3B6E';
  ctx.fillRect(0, 0, cantonW, cantonH);

  // -- Stars (simplified 5x4 + 4x3 offset pattern → 50 stars approximation)
  ctx.fillStyle = '#FFFFFF';
  const starRows = 9;
  const starCols = 11;
  const starDx = cantonW / (starCols + 1);
  const starDy = cantonH / (starRows + 1);
  const starSize = Math.min(starDx, starDy) * 0.35;

  for (let row = 0; row < starRows; row++) {
    const cols = row % 2 === 0 ? 6 : 5;
    const offsetX = row % 2 === 0 ? starDx : starDx * 1.5;
    for (let col = 0; col < cols; col++) {
      const cx = offsetX + col * starDx * 2;
      const cy = starDy + row * starDy;
      drawStar(ctx, cx, cy, starSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Draw a 5-pointed star
 */
function drawStar(ctx, cx, cy, r) {
  const spikes = 5;
  const innerR = r * 0.4;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const radius = i % 2 === 0 ? r : innerR;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}
