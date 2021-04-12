import './style.css';
import * as THREE from 'three';

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);
const group = new THREE.Group();
scene.add(group);

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 'pink' })
);

const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 'blue' })
);

const cube3 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 'tomato' })
);

cube1.position.x = -1.5;
cube3.position.x = 1.5;
group.add(cube1, cube2, cube3);

group.position.y = 1;
group.scale.y = 2;
group.rotation.y = 1;

// // Position
// mesh.position.set(0.9, -0.6, 0.5);

// // Scale
// mesh.scale.set(2, 0.5, 0.5);

// // Rotation
// mesh.rotation.reorder('YXZ');
// mesh.rotation.set(Math.PI * 0.25, Math.PI * 0.25, 0);

// Axes Helper
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

/**
 * Sizes
 */
const sizes = {
  width: 800,
  height: 600
};

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);

camera.position.set(0, 0, 3);

scene.add(camera);
// camera.lookAt(mesh.position);
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);
