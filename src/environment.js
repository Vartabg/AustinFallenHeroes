/**
 * environment.js — Sky gradient, ground plane, fog, and lighting
 */
import * as THREE from 'three';

export function createEnvironment(scene) {
  // -- Fog (lighter to let light carry)
  scene.fog = new THREE.FogExp2(0x080812, 0.012);

  // -- Ambient light (strong enough to read names)
  const ambient = new THREE.AmbientLight(0x3a3a5e, 2.5);
  scene.add(ambient);

  // -- Directional light (moonlight from above-right)
  const moon = new THREE.DirectionalLight(0x6688cc, 1.2);
  moon.position.set(10, 25, -5);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.camera.far = 60;
  moon.shadow.camera.left = -20;
  moon.shadow.camera.right = 20;
  moon.shadow.camera.top = 20;
  moon.shadow.camera.bottom = -20;
  scene.add(moon);

  // -- Warm point light (flame glow — wider reach)
  const flameLight = new THREE.PointLight(0xc9a654, 4.0, 25, 1.2);
  flameLight.position.set(0, 2, 0);
  scene.add(flameLight);

  // -- Secondary warm fill from the flame
  const flameFill = new THREE.PointLight(0xff6600, 1.5, 18, 1.5);
  flameFill.position.set(0, 0.5, 0);
  scene.add(flameFill);

  // -- Front fill (illuminates wall faces directly)
  const frontFill = new THREE.PointLight(0xd4c8b0, 2.5, 35, 1.2);
  frontFill.position.set(0, 5, 8);
  scene.add(frontFill);

  // -- Ground plane
  const groundGeo = new THREE.CircleGeometry(50, 64);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.9,
    metalness: 0.1,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  scene.add(ground);

  // -- Inner ground (polished granite circle around flame)
  const innerGeo = new THREE.CircleGeometry(3, 64);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.3,
    metalness: 0.5,
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  inner.rotation.x = -Math.PI / 2;
  inner.position.y = 0.01;
  inner.receiveShadow = true;
  scene.add(inner);

  // -- Sky gradient (hemisphere light + background)
  const hemi = new THREE.HemisphereLight(0x1a1a4e, 0x2a2520, 0.8);
  scene.add(hemi);

  // Gradient background
  scene.background = new THREE.Color(0x05050a);

  // -- Star field
  const starCount = 2000;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.5; // upper hemisphere only
    const r = 80 + Math.random() * 40;
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.cos(phi) + 10;
    starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.15,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // -- Moon (glowing sphere in the sky)
  const moonGeo = new THREE.SphereGeometry(2, 32, 32);
  const moonOrbMat = new THREE.MeshBasicMaterial({
    color: 0xd4d0c8,
    transparent: true,
    opacity: 0.8,
  });
  const moonOrb = new THREE.Mesh(moonGeo, moonOrbMat);
  moonOrb.position.set(30, 50, -60);
  scene.add(moonOrb);

  // Moon glow (additive sprite)
  const glowGeo = new THREE.SphereGeometry(4, 16, 16);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x4466aa,
    transparent: true,
    opacity: 0.08,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.copy(moonOrb.position);
  scene.add(glow);

  // -- Ambient dust motes (tiny floating particles near ground)
  const dustCount = 200;
  const dustGeo = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 20;
    dustPositions[i * 3 + 1] = Math.random() * 4;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xc9a654,
    size: 0.03,
    transparent: true,
    opacity: 0.3,
    sizeAttenuation: true,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  return { flameLight, flameFill, stars, dust };
}
