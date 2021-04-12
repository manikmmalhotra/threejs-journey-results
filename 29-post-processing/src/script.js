import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import * as dat from 'dat.gui';

/**
 * Base
 */

// Debug
const gui = new dat.GUI({ width: 350 });

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const textureLoader = new THREE.TextureLoader();

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      child.material.envMapIntensity = 5;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  '/textures/environmentMaps/0/px.jpg',
  '/textures/environmentMaps/0/nx.jpg',
  '/textures/environmentMaps/0/py.jpg',
  '/textures/environmentMaps/0/ny.jpg',
  '/textures/environmentMaps/0/pz.jpg',
  '/textures/environmentMaps/0/nz.jpg'
]);
environmentMap.encoding = THREE.sRGBEncoding;

scene.background = environmentMap;
scene.environment = environmentMap;

/**
 * Models
 */
gltfLoader.load('/models/DamagedHelmet/glTF/DamagedHelmet.gltf', (gltf) => {
  gltf.scene.scale.set(2, 2, 2);
  gltf.scene.rotation.y = Math.PI * 0.5;
  scene.add(gltf.scene);

  updateAllMaterials();
});

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, -2.25);
scene.add(directionalLight);

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

  // Update Composer
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  effectComposer.setSize(sizes.width, sizes.height);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(4, 1, -4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Post Processing
 */
let renderTargetClass = null;
if (renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2) {
  renderTargetClass = THREE.WebGLMultisampleRenderTarget;
} else {
  renderTargetClass = THREE.WebGLRenderTarget;
}
const renderTarget = new renderTargetClass(800, 600, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  encoding: THREE.sRGBEncoding
});

// Composer
const effectComposer = new EffectComposer(renderer, renderTarget);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
effectComposer.setSize(sizes.width, sizes.height);

// Passes
const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

const dotScreenPass = new DotScreenPass();
dotScreenPass.enabled = false;
effectComposer.addPass(dotScreenPass);

const glitchPass = new GlitchPass();
glitchPass.enabled = false;
effectComposer.addPass(glitchPass);

const unrealBloomPass = new UnrealBloomPass();
unrealBloomPass.enabled = false;
unrealBloomPass.strength = 0.3;
unrealBloomPass.radius = 1;
unrealBloomPass.treshold = 0.6;

effectComposer.addPass(unrealBloomPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.enabled = false;
effectComposer.addPass(rgbShiftPass);

// Tint Pass
const TintShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTint: { value: null }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vUv = uv;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 uTint;
    varying vec2 vUv;    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      color.rgb += uTint;
      gl_FragColor = color;
     
    }
  `
};

const tintPass = new ShaderPass(TintShader);
tintPass.material.uniforms.uTint.value = new THREE.Vector3(0.11, 0.2, 0.3);
tintPass.enabled = false;
effectComposer.addPass(tintPass);

// Displacement Pass
const DisplacementShader = {
  uniforms: {
    tDiffuse: { value: null },
    uNormalMap: { value: null }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vUv = uv;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D uNormalMap;
    varying vec2 vUv;    
    void main() {
      vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;      
      vec2 newUv = vUv + normalColor.xy * 0.1;
      vec4 color = texture2D(tDiffuse, newUv);
      vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));
      float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);
      color.rgb += lightness * 0.2;
      gl_FragColor = color;
     
    }
  `
};

const displacementPass = new ShaderPass(DisplacementShader);
displacementPass.material.uniforms.uNormalMap.value = textureLoader.load(
  '/textures/interfaceNormalMap.png'
);
displacementPass.enabled = true;
effectComposer.addPass(displacementPass);

// SMAA pass for Anti-aliasing, always last
if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
  const smaaPass = new SMAAPass();
  effectComposer.addPass(smaaPass);
}

/**
 * GUI settings
 */

// DotScreen Pass
gui.add(dotScreenPass, 'enabled').name('Dot-screen Pass');

// Glitch Pass, followed by 'goWild' conditional checkbox
gui
  .add(glitchPass, 'enabled')
  .onChange((value) => {
    if (value) {
      glitchPassFolder.domElement.hidden = false;
      glitchPassFolder.closed = false;
    } else {
      glitchPassFolder.domElement.hidden = true;
    }
  })
  .name('Glitch Pass');

const glitchPassFolder = gui.addFolder('Glitch Pass');
glitchPassFolder.domElement.hidden = true;

glitchPassFolder.add(glitchPass, 'goWild').name('Go Wild?');

//RGB Shift Bass
gui.add(rgbShiftPass, 'enabled').name('RGB Shift Pass');

// Bloom Pass
gui
  .add(unrealBloomPass, 'enabled')
  .name('Unreal Bloom Pass')
  .onChange((value) => {
    if (value) {
      bloomPassFolder.domElement.hidden = false;
      bloomPassFolder.closed = false;
    } else {
      bloomPassFolder.domElement.hidden = true;
    }
  });

const bloomPassFolder = gui.addFolder('Unreal Bloom Pass');
bloomPassFolder.domElement.hidden = true;
bloomPassFolder.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001);
bloomPassFolder.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001);
bloomPassFolder.add(unrealBloomPass, 'treshold').min(0).max(1).step(0.001);

const customFolder = gui.addFolder('custom');
customFolder.closed = false;

// Tint Pass
customFolder
  .add(tintPass, 'enabled')
  .name('Tint Pass')
  .onChange((value) => {
    if (value) {
      tintPassFolder.domElement.hidden = false;
      tintPassFolder.closed = false;
    } else {
      tintPassFolder.domElement.hidden = true;
    }
  });

const tintPassFolder = customFolder.addFolder('Tint Pass');
tintPassFolder.domElement.hidden = true;
tintPassFolder
  .add(tintPass.material.uniforms.uTint.value, 'x')
  .min(-1)
  .max(1)
  .step(0.001)
  .name('red');
tintPassFolder
  .add(tintPass.material.uniforms.uTint.value, 'y')
  .min(-1)
  .max(1)
  .step(0.001)
  .name('green');
tintPassFolder
  .add(tintPass.material.uniforms.uTint.value, 'z')
  .min(-1)
  .max(1)
  .step(0.001)
  .name('blue');

customFolder.add(displacementPass, 'enabled').name('Displacement Pass');
/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  // Update controls
  controls.update();

  // Render
  effectComposer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
