import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import * as dat from "dat.gui";
const gui = new dat.GUI();
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

async function loadModel(url) {
  const loader = new FBXLoader();
  const model = await loader.loadAsync(url);
  return model;
}

async function loadTexture(url) {
  const loader = new THREE.TextureLoader();
  return await loader.loadAsync(url);
}

function applyTexture(model, texture) {
  model.traverse((child) => {
    if (child.isMesh) {
      child.material.map = texture;
      child.material.needsUpdate = true;
    }
  });
}

async function main() {
  const wrapperElement = document.querySelector("#shape-3d");
  const canvas = wrapperElement.querySelector("canvas");
  const scene = new THREE.Scene();
  const clock = new THREE.Clock();
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas,
  });

  renderer.setSize(600, 300);
  wrapperElement.appendChild(renderer.domElement);

  const near = 0.01;
  const far = 2000;
  const camera = new THREE.OrthographicCamera();
  camera.near = near;
  camera.far = far;
  camera.position.z = 200;
  camera.lookAt(0, 0, 0);
  scene.add(camera);
  const ctrl = new OrbitControls(camera, renderer.domElement);

  /* LIGHT */
  const lightColor = 0x000000;
  const intensity = 1;
  const directionalLight = new THREE.DirectionalLight(lightColor, intensity);
  directionalLight.position.set(-1, 2, 4);
  scene.add(directionalLight);

  const light = new THREE.AmbientLight(0xffffff, 1.7);
  scene.add(light);

  /* SHADERS AND TEXTURES */
  let m = new THREE.ShaderMaterial({
    uniforms: {
      t1: { value: null },
      t2: { value: null },
      transition: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D t1;
      uniform sampler2D t2;
      uniform float transition;
      varying vec2 vUv;
      void main(){
        vec4 tex1 = texture2D(t1, vUv);
        vec4 tex2 = texture2D(t2, vUv);
        
        gl_FragColor = mix(tex1, tex2, transition);
      
      }
    `,
  });
  const textures = await Promise.all([
    loadTexture("Textures/01_Boxes_Color_01.png"),
    loadTexture("Textures/02_Laptop_Color_01.png"),
    loadTexture("Textures/03_Beard_Color_01.png"),
    loadTexture("Textures/04_Watch_Color_01.png"),
  ]);

  /* GEOMETRY, MESH */

  const group = new THREE.Object3D();
  const model = await loadModel("Object_002.fbx");

  const idx = 9;
  gui.add(model.children[idx].position, "x", -25, 30, 0.1);
  gui.add(model.children[idx].position, "y", -25, 30, 0.1);
  gui.add(model.children[idx].position, "z", -25, 30, 0.1);

  // gui.add(model.children[idx].rotation, "x", -3, 3, 0.001);
  // gui.add(model.children[idx].rotation, "y", -3, 3, 0.001);
  // gui.add(model.children[idx].rotation, "z", -3, 3, 0.001);

  model.scale.set(1, 1, 1);
  model.rotation.set(-1.718, 0.2, -0.287);
  model.traverse((child) => {
    child.material = m;
  });
  m.uniforms.t1.value = textures[0];

  group.add(model);
  scene.add(group);
  console.log("uniforms:", model);
  resetSize();

  // const idx = 9;
  // gui.add(model.children[idx].position, "x", -25, 35, 0.001);
  // gui.add(model.children[idx].position, "y", -25, 35, 0.001);
  // gui.add(model.children[idx].position, "z", -25, 35, 0.001);
  // gui.add(model.children[idx].rotation, "x", -3, 3, 0.001);
  // gui.add(model.children[idx].rotation, "y", -3, 3, 0.001);
  // gui.add(model.children[idx].rotation, "z", -3, 3, 0.001);

  function getCurrentAnimationFrame(mixer, frameRate) {
    return Math.floor(mixer.time * frameRate);
  }

  function render() {
    // if (mixer) {
    //   mixer.update(clock.getDelta());
    // }

    const viewSize = 80;
    const aspect = wrapperElement.clientWidth / wrapperElement.clientHeight;
    const left = (-aspect * viewSize) / 2;
    const right = (aspect * viewSize) / 2;
    const top = viewSize / 2;
    const bottom = -viewSize / 2;

    camera.left = left;
    camera.right = right;
    camera.top = top;
    camera.bottom = bottom;
    camera.updateProjectionMatrix();
    requestAnimationFrame(render);
    TWEEN.update();
    renderer.render(scene, camera);
  }

  requestAnimationFrame(render);

  function resetSize() {
    renderer.setSize(wrapperElement.clientWidth, wrapperElement.clientHeight);
    camera.aspect = wrapperElement.clientWidth / wrapperElement.clientHeight;
    camera.updateProjectionMatrix();
  }

  let lastTextureIdx = 0;
  function animate(model, coords, textureIdx) {
    coords.forEach((coord, idx) => {
      const { position, rotation, scale } = coord;
      const mesh = model.children[idx];

      new TWEEN.Tween(mesh.position)
        .to(position, 600)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate((obj) => {
          mesh.position.x = obj.x;
          mesh.position.y = obj.y;
          mesh.position.z = obj.z;
        })
        .start();

      new TWEEN.Tween(mesh.rotation)
        .to(rotation, 600)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate((obj) => {
          mesh.rotation.x = obj.x;
          mesh.rotation.y = obj.y;
          mesh.rotation.z = obj.z;
        })
        .start();

      new TWEEN.Tween(mesh.scale)
        .to(scale, 600)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate((obj) => {
          mesh.scale.x = obj.x;
          mesh.scale.y = obj.y;
          mesh.scale.z = obj.z;
        })
        .start();

      new TWEEN.Tween({ value: 0 })
        .to({ value: 1 }, 600)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate((obj) => {
          m.uniforms.transition.value = obj.value;

          lastTextureIdx =
            textureIdx + 1 === textures.length ? 0 : textureIdx + 1;
          m.uniforms.t1.value = textures[textureIdx];
          m.uniforms.t2.value = textures[lastTextureIdx];
        })
        .start();
    });
  }

  function transformToLaptop() {
    const model = scene.children[3].children[0];
    const coords = [
      {
        position: {
          x: -1.643,
          y: -0.34,
          z: -0.348,
        },
        rotation: {
          x: 0.3,
          y: 0,
          z: 0,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
      },
      {
        position: {
          x: -6.64,
          y: 3.931,
          z: 11.612,
        },
        rotation: {
          x: -1.09,
          y: 0,
          z: 0,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
      },
      {
        position: {
          x: 8.5,
          y: 5.68,
          z: 6.62,
        },
        rotation: {
          x: -1.09,
          y: 0,
          z: 0,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
      },
      {
        position: {
          x: 10.886,
          y: 1.67,
          z: 15.84,
        },
        rotation: {
          x: -1.09,
          y: 0,
          z: 0,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
      },
      {
        position: {
          x: 6.01,
          y: 1.67,
          z: 15.84,
        },
        rotation: {
          x: -1.09,
          y: 0,
          z: 0,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
      },
      {
        position: {
          x: 20.137,
          y: -1.486,
          z: 0.79,
        },
        rotation: {
          x: 0.4,
          y: 0,
          z: 3.101,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
      },
      {
        position: {
          x: 23.172,
          y: -3.003,
          z: 0.79,
        },
        rotation: {
          x: 0.4,
          y: 0,
          z: 3.101,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
      },
      {
        position: {
          x: 20.995,
          y: -3.6838,
          z: -2.24,
        },
        rotation: {
          x: 0.4,
          y: 0,
          z: 3.101,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
      },
      {
        position: {
          x: -1.643,
          y: -5.28,
          z: 0.44,
        },
        rotation: {
          x: 0.3,
          y: 0,
          z: 0,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
      },
      {
        position: {
          x: -1.643,
          y: 2.261,
          z: 11.771,
        },
        rotation: {
          x: 5.2,
          y: 0,
          z: 0,
        },
        scale: {
          x: 0.799,
          y: 0.751,
          z: 0.751,
        },
      },
    ];

    animate(model, coords, 1);
  }

  function transformToHead() {
    const model = scene.children[3].children[0];

    const coords = [
      {
        position: {
          x: -1.2411,
          y: 1.67781,
          z: 10.854,
        },
        rotation: {
          x: 5.2,
          y: 3.15,
          z: 0,
        },
        scale: {
          x: 0.648,
          y: 1,
          z: 4.855,
        },
      },
      {
        position: {
          x: -1.1,
          y: -1.047,
          z: -1.427,
        },
        rotation: {
          x: -1.1,
          y: 0,
          z: 0,
        },
        scale: {
          x: 1.10493,
          y: 0.825474,
          z: 2.92459,
        },
      },
      {
        position: {
          x: 0.973404,
          y: -5.22,
          z: -1.427,
        },
        rotation: {
          x: 5.2,
          y: 0,
          z: 0,
        },
        scale: {
          x: 0.822,
          y: 0.822,
          z: 0.822,
        },
      },
      {
        position: {
          x: -7.333,
          y: -7.875,
          z: 12.177,
        },
        rotation: {
          x: -1,
          y: 0,
          z: -1.6,
        },
        scale: {
          x: 0.644548,
          y: 0.644548,
          z: 0.644548,
        },
      },
      {
        position: {
          x: 4.589,
          y: -9.501,
          z: 14.886,
        },
        rotation: {
          x: -1,
          y: 0,
          z: 2,
        },
        scale: {
          x: 0.644548,
          y: 0.644548,
          z: 0.644548,
        },
      },
      {
        position: {
          x: -7.1,
          y: -6.6,
          z: 11.635,
        },
        rotation: {
          x: 5.2,
          y: 0,
          z: 0,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
      },
      {
        position: {
          x: 3.2,
          y: -7.333,
          z: 11.093,
        },
        rotation: {
          x: 5.2,
          y: 0,
          z: 0,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
      },
      {
        position: {
          x: 2.422,
          y: -5.707,
          z: -0.288,
        },
        rotation: {
          x: 0.25,
          y: -0.5,
          z: -4.8,
        },
        scale: {
          x: 0.505542,
          y: 0.505542,
          z: 0.871954,
        },
      },
      {
        position: {
          x: -1.644,
          y: -7.875,
          z: 7.841,
        },
        rotation: {
          x: -1,
          y: 1.55,
          z: 1.5,
        },
        scale: {
          x: 1.32895,
          y: 1.32895,
          z: 1.32895,
        },
      },
      {
        position: {
          x: 0.047562,
          y: 4.60216,
          z: 9.55863,
        },
        rotation: {
          x: -1.1,
          y: 0,
          z: 0,
        },
        scale: {
          x: 0.977232,
          y: 0.547808,
          z: 1.23371,
        },
      },
    ];

    animate(model, coords, 2);
  }

  function transformToClock() {
    const model = scene.children[3].children[0];
    const coords = [
      {
        position: {
          x: -1.64383,
          y: 0.228757,
          z: 5.28703,
        },
        rotation: {
          x: 5.2,
          y: 0,
          z: 0,
        },
        scale: {
          x: 0.644548,
          y: 0.903546,
          z: 4.54075,
        },
      },
      {
        position: {
          x: -1.8,
          y: -3.476,
          z: 3.569,
        },
        rotation: {
          x: 5.2,
          y: 0,
          z: 0,
        },
        scale: {
          x: 1.18383,
          y: 1.18383,
          z: 1.18383,
        },
      },
      {
        position: {
          x: -1.508,
          y: -5.644,
          z: 2.5,
        },
        rotation: {
          x: 5.2,
          y: 0,
          z: 0.8,
        },
        scale: {
          x: 0.438536,
          y: 0.438536,
          z: 1.61637,
        },
      },
      {
        position: {
          x: -5.102,
          y: -7.27,
          z: 4.111,
        },
        rotation: {
          x: -1.1,
          y: -3.15,
          z: -2.1,
        },
        scale: {
          x: 0.265885,
          y: 0.672354,
          z: 0.476595,
        },
      },
      {
        position: {
          x: 0.317,
          y: -7.27,
          z: 4.653,
        },
        rotation: {
          x: -1.1,
          y: -3.15,
          z: -0.5,
        },
        scale: {
          x: 0.550458,
          y: 0.614926,
          z: 0.614926,
        },
      },
      {
        position: {
          x: -1.51396,
          y: -1.309,
          z: -5.644,
        },
        rotation: {
          x: 5.2,
          y: 0,
          z: 0,
        },
        scale: {
          x: 1,
          y: 1.37673,
          z: 1,
        },
      },
      {
        position: {
          x: -1.72945,
          y: -9.438,
          z: 9.53,
        },
        rotation: {
          x: 5.2,
          y: 0,
          z: 0,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
      },
      {
        position: {
          x: 7.23237,
          y: -6.186,
          z: 3.027,
        },
        rotation: {
          x: 5.218,
          y: -3.137,
          z: -1.56,
        },
        scale: {
          x: 0.444825,
          y: 0.444825,
          z: 0.694605,
        },
      },
      {
        position: {
          x: -10.9391,
          y: -6.186,
          z: 3.027,
        },
        rotation: {
          x: 5.218,
          y: -3.137,
          z: 0,
        },
        scale: {
          x: 0.444825,
          y: 0.444825,
          z: 0.779416,
        },
      },
      {
        position: {
          x: -1.508,
          y: -7.27,
          z: 1.943,
        },
        rotation: {
          x: -6.574,
          y: -1.542,
          z: 0.787,
        },
        scale: {
          x: 0.143052,
          y: 0.102308,
          z: 0.69133,
        },
      },
    ];

    animate(model, coords, 3);
  }

  function transformToKey() {
    const model = scene.children[3].children[0];
    const coords = [
      {
        position: {
          x: -5.04504,
          y: -6.5476,
          z: 6.22609,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: 0,
        },
        scale: {
          x: 0.588059,
          y: 0.184107,
          z: 0.588059,
        },
      },
      {
        position: {
          x: 6.67409,
          y: -8.553,
          z: 9.285,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: 0,
        },
        scale: {
          x: 0.588059,
          y: 0.197907,
          z: 0.588059,
        },
      },
      {
        position: {
          x: -9.30809,
          y: -7.812,
          z: 8.5,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: 0,
        },
        scale: {
          x: 0.26552,
          y: 0.26552,
          z: 0.26552,
        },
      },
      {
        position: {
          x: -11.8237,
          y: -7.812,
          z: 8.5,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: 0,
        },
        scale: {
          x: 0.26552,
          y: 0.26552,
          z: 0.26552,
        },
      },
      {
        position: {
          x: -7.63179,
          y: -7.224,
          z: 7.62202,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: 0,
        },
        scale: {
          x: 0.26552,
          y: 0.26552,
          z: 0.26552,
        },
      },
      {
        position: {
          x: -6.75757,
          y: -7.558,
          z: 8.21152,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: 0,
        },
        scale: {
          x: 0.26552,
          y: 0.26552,
          z: 0.26552,
        },
      },
      {
        position: {
          x: -5.27103,
          y: -7.424,
          z: 7.9806,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: 0,
        },
        scale: {
          x: 0.26552,
          y: 0.26552,
          z: 0.26552,
        },
      },
      {
        position: {
          x: -4.34218,
          y: -7.894,
          z: 8.71392,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: 0,
        },
        scale: {
          x: 0.172214,
          y: 0.172214,
          z: 0.172214,
        },
      },
      {
        position: {
          x: 10.535,
          y: -6.40745,
          z: 6.14807,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: 0,
        },
        scale: {
          x: 0.385325,
          y: 0.510971,
          z: 0.588059,
        },
      },
      {
        position: {
          x: 6.64902,
          y: -4.5,
          z: 3.263,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: 0,
        },
        scale: {
          x: 0.390663,
          y: 0.180604,
          z: 0.588059,
        },
      },
    ];

    animate(model, coords, 0);
  }

  function transformToDiffuse() {
    const model = scene.children[3].children[0];
    const coords = [
      {
        position: {
          x: -12.8616,
          y: 1.36221,
          z: 15.0288,
        },
        rotation: {
          x: -0.83,
          y: -0.95,
          z: 2.28,
        },
        scale: {
          x: 0.2167,
          y: 0.214109,
          z: 0.801044,
        },
      },
      {
        position: {
          x: 1.63808,
          y: -12.3717,
          z: 10.3175,
        },
        rotation: {
          x: -1.278,
          y: 0.18,
          z: 2.57,
        },
        scale: {
          x: 0.350148,
          y: 0.350148,
          z: 1.15987,
        },
      },
      {
        position: {
          x: -8.50502,
          y: 14.843,
          z: -4.85441,
        },
        rotation: {
          x: -0.79,
          y: -2.38,
          z: -0.871,
        },
        scale: {
          x: 0.504008,
          y: 0.504008,
          z: 1.01523,
        },
      },
      {
        position: {
          x: -7.40335,
          y: 3.53504,
          z: 6.65661,
        },
        rotation: {
          x: -0.03,
          y: 0.4,
          z: 0.59,
        },
        scale: {
          x: 0.786844,
          y: 0.786844,
          z: 0.786844,
        },
      },
      {
        position: {
          x: 1.31747,
          y: -11.2397,
          z: -4.93537,
        },
        rotation: {
          x: -0.46,
          y: 0.726,
          z: 0.647,
        },
        scale: {
          x: 0.786844,
          y: 0.786844,
          z: 0.786844,
        },
      },
      {
        position: {
          x: -16.8596,
          y: -7.37059,
          z: 6.73281,
        },
        rotation: {
          x: 0.89,
          y: 3.22,
          z: 1.49,
        },
        scale: {
          x: 0.786844,
          y: 0.786844,
          z: 0.786844,
        },
      },
      {
        position: {
          x: 0.033524,
          y: 10.3101,
          z: 1.62192,
        },
        rotation: {
          x: 0.203,
          y: 3.463,
          z: 3.081,
        },
        scale: {
          x: 0.786844,
          y: 0.786844,
          z: 0.786844,
        },
      },
      {
        position: {
          x: 5.54391,
          y: 0.111866,
          z: 4.94325,
        },
        rotation: {
          x: 0.33,
          y: 3.583,
          z: 1.399,
        },
        scale: {
          x: 0.592079,
          y: 0.592079,
          z: 0.592079,
        },
      },
      {
        position: {
          x: -4.01846,
          y: -2.3623,
          z: 15.996,
        },
        rotation: {
          x: -1.571,
          y: -0.03,
          z: 1.834,
        },
        scale: {
          x: 0.786844,
          y: 0.786844,
          z: 0.786844,
        },
      },
      {
        position: {
          x: -15.4416,
          y: 12.5648,
          z: 0.535152,
        },
        rotation: {
          x: -2.157,
          y: -1.12,
          z: -1.352,
        },
        scale: {
          x: 0.285722,
          y: 0.380631,
          z: 0.908647,
        },
      },
    ];

    animate(model, coords, 0);
  }

  function transformToHeart() {
    const model = scene.children[3].children[0];
    let coords = [
      {
        position: {
          x: 6.35621,
          y: -2.9,
          z: 0.5,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: 0.5,
        },
        scale: {
          x: 0.713097,
          y: 1.00379,
          z: 1.25406,
        },
      },
      {
        position: {
          x: -1.537,
          y: -1, // -8
          z: 3, // - 13
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: 0.5,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
      },
      {
        position: {
          x: 0.499,
          y: -4.7,
          z: 8.241,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: 0.5,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
      },
      {
        position: {
          x: -9.823,
          y: -0.7,
          z: 1.3,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: 2.064,
        },
        scale: {
          x: 1.08425,
          y: 0.895151,
          z: 3.06777,
        },
      },
      {
        position: {
          x: -3.5,
          y: 5.6,
          z: -8.7,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: -1.083,
        },
        scale: {
          x: 1.02173,
          y: 0.93,
          z: 3.06777,
        },
      },
      {
        position: {
          x: 14.194,
          y: -4.6,
          z: 5,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: 0.5,
        },
        scale: {
          x: 3.2305,
          y: 5.09126,
          z: 1.45874,
        },
      },
      {
        position: {
          x: -6.204,
          y: -3.7,
          z: 10.5,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: 0.5,
        },
        scale: {
          x: 4.93694,
          y: 2.00856,
          z: 1.93136,
        },
      },
      {
        position: {
          x: -5.676,
          y: 3.4,
          z: -5.2,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: -1.083,
        },
        scale: {
          x: 0.722927,
          y: 0.923,
          z: 3.06777,
        },
      },
      {
        position: {
          x: -7.5,
          y: 1.5,
          z: -2,
        },
        rotation: {
          x: 2.15,
          y: 0,
          z: 0.5,
        },
        scale: {
          x: 0.895151,
          y: 0.678276,
          z: 3.06777,
        },
      },
      {
        position: {
          x: 2.791,
          y: -6.3,
          z: 4.2,
        },
        rotation: {
          x: -1.003,
          y: 0,
          z: -0.5,
        },
        scale: {
          x: 0.226513,
          y: 0.692257,
          z: 1.73212,
        },
      },
    ];

    animate(model, coords, 1);
  }

  window.addEventListener("resize", resetSize);

  const laptopBtn = document.querySelector("#laptop");
  const headBtn = document.querySelector("#head");
  const clockBtn = document.querySelector("#clock");
  const keyBtn = document.querySelector("#key");
  const diffuseBtn = document.querySelector("#diffuse");
  const heartBtn = document.querySelector("#heart");

  laptopBtn.addEventListener("click", () => transformToLaptop());
  headBtn.addEventListener("click", () => transformToHead());
  clockBtn.addEventListener("click", () => transformToClock());
  keyBtn.addEventListener("click", () => transformToKey());
  diffuseBtn.addEventListener("click", () => transformToDiffuse());
  heartBtn.addEventListener("click", () => transformToHeart());
}

main();
