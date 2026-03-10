/**
 * memorial.js — Curved granite wall with inscribed names
 * Names are rendered as 3D text on curved panels grouped by conflict
 */
import * as THREE from 'three';

const CONFLICT_COLORS = {
  'Operation Iraqi Freedom': 0xc9a654,        // Gold
  'Operation Enduring Freedom': 0x7a9ec9,     // Steel blue
  "Operation Freedom's Sentinel": 0xa07ac9,   // Purple
};

const WALL_RADIUS = 8;
const WALL_HEIGHT = 3.2;
const WALL_THICKNESS = 0.25;

/**
 * Create the memorial wall — curved granite panel with hero name plates
 */
export function createMemorial(scene, heroes) {
  const group = new THREE.Group();
  const nameObjects = []; // { mesh, hero } for raycasting

  // -- Curved wall (arc segment)
  const wallArc = Math.PI * 0.7; // 126 degrees of arc
  const wallSegments = 64;
  const wallGeo = new THREE.CylinderGeometry(
    WALL_RADIUS,
    WALL_RADIUS,
    WALL_HEIGHT,
    wallSegments,
    1,
    true,
    -wallArc / 2 + Math.PI,
    wallArc
  );
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x3a3a3a,
    roughness: 0.7,
    metalness: 0.3,
    side: THREE.DoubleSide,
  });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.y = WALL_HEIGHT / 2;
  wall.castShadow = true;
  wall.receiveShadow = true;
  group.add(wall);

  // -- Wall cap (top ledge)
  const capGeo = new THREE.CylinderGeometry(
    WALL_RADIUS + 0.08,
    WALL_RADIUS + 0.08,
    0.1,
    wallSegments,
    1,
    true,
    -wallArc / 2 + Math.PI,
    wallArc
  );
  const capMat = new THREE.MeshStandardMaterial({
    color: 0x4a4a4a,
    roughness: 0.4,
    metalness: 0.5,
    side: THREE.DoubleSide,
  });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = WALL_HEIGHT + 0.05;
  group.add(cap);

  // -- Base step
  const baseGeo = new THREE.CylinderGeometry(
    WALL_RADIUS + 0.3,
    WALL_RADIUS + 0.4,
    0.2,
    wallSegments,
    1,
    true,
    -wallArc / 2 + Math.PI,
    wallArc
  );
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.8,
    metalness: 0.2,
    side: THREE.DoubleSide,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.1;
  group.add(base);

  // -- Inscription: "IN HONOR OF THOSE WHO GAVE ALL"
  const titlePlate = createTextPlate(
    'IN HONOR OF THOSE WHO GAVE ALL',
    0xc9a654,
    0.18,
    0.006
  );
  if (titlePlate) {
    // Position at top center of the wall (inner face)
    titlePlate.position.set(0, WALL_HEIGHT - 0.25, -(WALL_RADIUS - 0.13));
    group.add(titlePlate);
  }

  // -- Place hero names on the wall
  const sorted = [...heroes].sort((a, b) => {
    // Group by conflict, then by date
    if (a.conflict !== b.conflict) return a.conflict.localeCompare(b.conflict);
    return a.date_of_death.localeCompare(b.date_of_death);
  });

  const totalNames = sorted.length;
  const startAngle = Math.PI - wallArc / 2 + 0.15;
  const endAngle = Math.PI + wallArc / 2 - 0.15;
  const angleRange = endAngle - startAngle;

  // Layout: 2 columns
  const cols = 2;
  const rows = Math.ceil(totalNames / cols);
  const rowHeight = (WALL_HEIGHT - 1.2) / rows;
  const colAngleOffset = angleRange / (cols + 1);

  sorted.forEach((hero, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);

    const angle = startAngle + colAngleOffset * (col + 1);
    const y = WALL_HEIGHT - 0.7 - row * rowHeight;
    const x = Math.sin(angle) * (WALL_RADIUS - 0.12);
    const z = -Math.cos(angle) * (WALL_RADIUS - 0.12);

    const conflictColor = CONFLICT_COLORS[hero.conflict] || 0xc9a654;

    // Name plate (clickable box)
    const plateW = 2.2;
    const plateH = rowHeight * 0.7;
    const plateGeo = new THREE.PlaneGeometry(plateW, plateH);
    const plateMat = new THREE.MeshStandardMaterial({
      color: conflictColor,
      transparent: true,
      opacity: 0.0, // invisible — just for raycasting
      side: THREE.DoubleSide,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(x, y, z);
    plate.lookAt(0, y, 0);
    plate.rotateY(Math.PI); // Face outward toward camera
    plate.userData = { hero, isNamePlate: true };
    group.add(plate);
    nameObjects.push({ mesh: plate, hero });

    // Visual name text (canvas texture)
    const textMesh = createNameMesh(hero, conflictColor, plateW, plateH);
    if (textMesh) {
      textMesh.position.set(x, y, z);
      textMesh.lookAt(0, y, 0);
      textMesh.rotateY(Math.PI); // Face outward toward camera
      // Offset slightly in front of the wall (toward camera)
      const dir = new THREE.Vector3(x, y, z).normalize();
      textMesh.position.add(dir.multiplyScalar(0.05));
      group.add(textMesh);
    }
  });

  // -- Flame pedestal (centered)
  const pedestalGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.0, 8);
  const pedestalMat = new THREE.MeshStandardMaterial({
    color: 0x3a3530,
    roughness: 0.5,
    metalness: 0.6,
  });
  const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
  pedestal.position.y = 0.5;
  pedestal.castShadow = true;
  group.add(pedestal);

  // Bowl on top
  const bowlGeo = new THREE.SphereGeometry(0.35, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const bowlMat = new THREE.MeshStandardMaterial({
    color: 0x4a4540,
    roughness: 0.4,
    metalness: 0.7,
    side: THREE.DoubleSide,
  });
  const bowl = new THREE.Mesh(bowlGeo, bowlMat);
  bowl.rotation.x = Math.PI;
  bowl.position.y = 1.05;
  group.add(bowl);

  scene.add(group);
  return { group, nameObjects };
}

/**
 * Create a text plate using canvas texture
 */
function createTextPlate(text, color, height, letterSpacing) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1024;
  canvas.height = 128;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `bold ${Math.floor(canvas.height * 0.6)}px "Cinzel", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Gold color
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;

  const aspect = canvas.width / canvas.height;
  const geo = new THREE.PlaneGeometry(height * aspect, height);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  return new THREE.Mesh(geo, mat);
}

/**
 * Create a name mesh with rank and name using canvas texture
 */
function createNameMesh(hero, color, width, height) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const scale = 2; // retina
  canvas.width = 512 * scale;
  canvas.height = 128 * scale;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Name (larger)
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;

  ctx.font = `bold ${28 * scale}px "Cinzel", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.95)`;
  ctx.fillText(hero.name.toUpperCase(), canvas.width / 2, 15 * scale);

  // Rank + Branch (smaller, below)
  ctx.font = `${14 * scale}px "Inter", sans-serif`;
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
  ctx.fillText(`${hero.rank} · ${hero.branch}`, canvas.width / 2, 55 * scale);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;

  const geo = new THREE.PlaneGeometry(width, height);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  return new THREE.Mesh(geo, mat);
}

/**
 * Highlight a name plate on hover
 */
export function highlightName(mesh, highlight) {
  if (!mesh?.material) return;
  if (highlight) {
    mesh.material.opacity = 0.15;
    mesh.material.emissive = new THREE.Color(0xc9a654);
    mesh.material.emissiveIntensity = 0.2;
  } else {
    mesh.material.opacity = 0.0;
    mesh.material.emissiveIntensity = 0;
  }
}
