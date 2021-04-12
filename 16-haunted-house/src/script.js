import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
// Fog
const fog = new THREE.Fog('#262837', 2, 15);
scene.fog = fog;
/**
 * Textures
 */
const loadTextures = (name, textures) => {
  Object.keys(textures).forEach((key) => {
    textures[key] = textureLoader.load(`textures/${name}/${key}.jpg`);
  });
};

const textureLoader = new THREE.TextureLoader();

// Door
const doorTextures = {
  color: null,
  alpha: null,
  ambientOcclusion: null,
  height: null,
  normal: null,
  metalness: null,
  roughness: null
};
loadTextures('door', doorTextures);

// Bricks
const bricksTextures = {
  color: null,
  ambientOcclusion: null,
  normal: null,
  roughness: null
};
loadTextures('bricks', bricksTextures);

// Grass
const grassTextures = {
  color: null,
  ambientOcclusion: null,
  normal: null,
  roughness: null
};
loadTextures('grass', grassTextures);

Object.values(grassTextures).forEach((item) => {
  item.repeat.set(8, 8);
  item.wrapS = THREE.RepeatWrapping;
  item.wrapT = THREE.RepeatWrapping;
});

/**
 * House
 */

// Create Group
const house = new THREE.Group();
scene.add(house);

// Walls
const wallsDimensions = { width: 4, height: 2.5, depth: 4 };
const walls = new THREE.Mesh(
  new THREE.BoxBufferGeometry(wallsDimensions.width, wallsDimensions.height, wallsDimensions.depth),
  new THREE.MeshStandardMaterial({
    map: bricksTextures.color,
    aoMap: bricksTextures.ambientOcclusion,
    normalMap: bricksTextures.normal,
    roughnessMap: bricksTextures.roughness
  })
);
walls.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
);
walls.position.y = wallsDimensions.height / 2;
house.add(walls);

// Roof
const roofDimensions = { width: 3.5, height: 1, depth: 4 };
const roof = new THREE.Mesh(
  new THREE.ConeBufferGeometry(roofDimensions.width, roofDimensions.height, roofDimensions.depth),
  new THREE.MeshStandardMaterial({ color: '#b35f45' })
);
roof.position.y = wallsDimensions.height + roofDimensions.height / 2;
roof.rotation.y = Math.PI * 0.25;
house.add(roof);

// Door
const door = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(2, 2.2, 100, 100),
  new THREE.MeshStandardMaterial({
    map: doorTextures.color,
    transparent: true,
    alphaMap: doorTextures.alpha,
    aoMap: doorTextures.ambientOcclusion,
    displacementMap: doorTextures.height,
    displacementScale: 0.1,
    normalMap: doorTextures.normal,
    metalnessMap: doorTextures.metalness,
    roughnessMap: doorTextures.roughness
  })
);
door.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
);
door.position.y = 1;
door.position.z = wallsDimensions.depth / 2 + 0.01;
house.add(door);

// Bushes
const bushGeometry = new THREE.SphereBufferGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' });

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(0.8, 0.2, 2.2);

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.25, 0.25, 0.25);
bush2.position.set(1.4, 0.1, 2.1);

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(-0.8, 0.1, 2.2);

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.set(0.15, 0.15, 0.15);
bush4.position.set(-1, 0.05, 2.6);
house.add(bush1, bush2, bush3, bush4);

// Graves
const graves = new THREE.Group();
scene.add(graves);

const graveGeometry = new THREE.BoxBufferGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1' });

for (let i = 0; i < 50; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 6;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const randomRotation = Math.random() * 0.2 * (Math.round(Math.random()) ? 1 : -1);

  const grave = new THREE.Mesh(graveGeometry, graveMaterial);

  grave.position.set(x, 0.3, z);
  grave.castShadow = true;
  grave.rotation.set((Math.random() - 0.5) * 0.4, 0, randomRotation);
  graves.add(grave);
}
// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    map: grassTextures.color,
    aoMap: grassTextures.ambientOcclusion,
    normalMap: grassTextures.normal,
    roughnessMap: grassTextures.roughness
  })
);
floor.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12);
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight('#ffffff', 0.5);
moonLight.position.set(4, 5, -2);
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001);
gui.add(moonLight.position, 'x').min(-5).max(5).step(0.001);
gui.add(moonLight.position, 'y').min(-5).max(5).step(0.001);
gui.add(moonLight.position, 'z').min(-5).max(5).step(0.001);
scene.add(moonLight);

// Door light
const doorLight = new THREE.PointLight('#ff7d46', 1, 7);
doorLight.position.set(0, 2.2, 2.7);
scene.add(doorLight);

/**
 * Ghosts
 */

const ghost1 = new THREE.PointLight('#ff00ff', 2, 3);
scene.add(ghost1);
const ghost2 = new THREE.PointLight('#00ffff', 2, 3);
scene.add(ghost2);
const ghost3 = new THREE.PointLight('#ffff00', 2, 3);
scene.add(ghost3);
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#262837');

/**
 * Shadows
 */

const setObjectShadowOptions = (obj, dimensions = 256, cameraFar = 7) => {
  obj.castShadow = true;
  obj.shadow.mapSize.width = dimensions;
  obj.shadow.mapSize.height = dimensions;
  obj.shadow.camera.far = cameraFar;
};

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// moonLight
setObjectShadowOptions(moonLight, 256, 15);

// doorLight
setObjectShadowOptions(doorLight, 256, 15);

// ghosts
setObjectShadowOptions(ghost1);
setObjectShadowOptions(ghost2);
setObjectShadowOptions(ghost3);

walls.castShadow = true;
roof.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;
bush3.castShadow = true;
bush4.castShadow = true;

floor.receiveShadow = true;
/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  const ghost1Angle = elapsedTime * 0.5;
  ghost1.position.x = Math.cos(ghost1Angle) * 4;
  ghost1.position.z = Math.sin(ghost1Angle) * 4;
  ghost1.position.y = Math.sin(elapsedTime * 3);

  const ghost2Angle = -elapsedTime * 0.32;
  ghost2.position.x = Math.cos(ghost2Angle) * 5;
  ghost2.position.z = Math.sin(ghost2Angle) * 5;
  ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

  const ghost3Angle = -elapsedTime * 0.18;
  ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32));
  ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5));
  ghost3.position.y = Math.sin(elapsedTime * 5) + Math.sin(elapsedTime * 2);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
