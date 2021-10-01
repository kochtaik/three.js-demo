import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import * as dat from "dat.gui";
const gui = new dat.GUI();
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { radians, distance, map } from "./helpers";
import gsap from "gsap";

class Main {
  constructor() {}

  async setup() {
    this.raycaster = new THREE.Raycaster();
    this.controls = null;
    this.wrapperEl = document.querySelector("#shape-3d");
    this.width = this.wrapperEl.clientWidth;
    this.height = this.wrapperEl.clientHeight;
    this.mouse3D = new THREE.Vector2();
  }

  onMouseMove({ clientX, clientY }) {
    this.mouse3D.x = (clientX / this.width) * 2 - 1;
    this.mouse3D.y = -(clientY / this.height) * 2 + 1;
  }

  createScene() {
    this.scene = new THREE.Scene();

    const canvas = this.wrapperEl.querySelector("canvas");
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas,
    });

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  createCamera() {
    const viewSize = 80;
    const aspect = this.width / this.height;
    const left = (-aspect * viewSize) / 2;
    const right = (aspect * viewSize) / 2;
    const top = viewSize / 2;
    const bottom = -viewSize / 2;
    const near = 0.01;
    const far = 4000;

    this.camera = new THREE.OrthographicCamera(
      left,
      right,
      top,
      bottom,
      near,
      far
    );
    this.camera.position.set(0, 65, 400);
    // this.camera.rotation.x = -1.57;
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);
  }

  addLight() {
    const light = new THREE.AmbientLight(0xffffff, 1.7);
    this.scene.add(light);
  }

  addFloor() {
    // var sceneSize = new THREE.Box3().setFromObject(this.scene).getSize();
    const geometry = new THREE.PlaneGeometry(200, 200);
    const material = new THREE.ShadowMaterial({ opacity: 0.3 });

    this.floor = new THREE.Mesh(geometry, material);
    this.floor.position.y = 0;
    this.floor.receiveShadow = true;
    this.floor.rotateX(-Math.PI / 2);

    this.scene.add(this.floor);
  }

  async loadModel() {
    this.model = await loadModel("Object_001.fbx");
    /* save initial position */
    this.model.traverse((mesh) => {
      mesh.userData.initialRotation = {
        x: mesh.rotation.x,
        y: mesh.rotation.y,
        z: mesh.rotation.z,
      };
    });

    /* add textures */
    const texture = await loadTexture("Object_01.png");
    applyTexture(this.model, texture);

    this.scene.add(this.model);
  }

  draw() {
    this.raycaster.setFromCamera(this.mouse3D, this.camera);

    if (!this.model) return;
    const intersects = this.raycaster.intersectObjects([this.floor]);
    if (!intersects.length) return;

    const { x, z } = intersects[0].point;
    console.log(this.model);

    this.model.children.forEach((mesh) => {
      const mouseDistance = distance(
        x,
        z,
        mesh.position.x + this.model.position.x,
        mesh.position.z + this.model.position.z
      );
      console.log(mouseDistance);
      const maxPositionY = 6;
      const minPositionY = 0;
      const startDistance = 10;
      const endDistance = 0;

      const y = map(
        mouseDistance,
        startDistance,
        endDistance,
        minPositionY,
        maxPositionY
      );

      /* Y-POSITION */
      gsap.to(mesh.position, {
        duration: 1.8,
        y: y < 1 ? 1 : y,
      });

      const scaleFactor = mesh.position.y / 4;
      const scale = scaleFactor < 1 ? 1 : scaleFactor;

      gsap.to(mesh.scale, {
        duration: 1.8,
        ease: Expo.easeOut,
        x: scale,
        y: scale,
        z: scale,
      });

      /* ROTATION */
      const targetRotation = {
        x: map(
          mesh.position.y,
          -1,
          1,
          radians(270),
          mesh.userData.initialRotation.x
        ),
        y: map(
          mesh.position.y,
          -1,
          1,
          radians(45),
          mesh.userData.initialRotation.y
        ),
        z: map(
          mesh.position.y,
          -1,
          1,
          radians(-90),
          mesh.userData.initialRotation.z
        ),
      };

      gsap.to(mesh.rotation, {
        duration: 2,
        ease: Expo.easeOut,
        x: targetRotation.x,
        y: targetRotation.y,
        z: targetRotation.z,
      });

      // new TWEEN.Tween(mesh.rotation)
      //   .to(targetRotation, .3)
      //   .easing(TWEEN.Easing.Exponential.Out)
      //   .onUpdate(({ x, y, z }) => {
      //     mesh.rotation.x = x;
      //     mesh.rotation.y = y;
      //     mesh.rotation.z = z;
      //   })
      //   .start();
    });
  }

  animate() {
    this.draw();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(this));

    if (this.controls) {
      this.controls.update();
    }
  }

  onResize() {
    this.width = this.wrapperEl.clientWidth;
    this.height = this.wrapperEl.clientHeight;

    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  init() {
    this.setup();
    this.createScene();
    this.createCamera();
    this.loadModel();
    this.addFloor();
    this.addLight();
    this.animate();

    window.addEventListener("resize", this.onResize.bind(this));

    this.wrapperEl.addEventListener(
      "mousemove",
      this.onMouseMove.bind(this),
      false
    );
    this.onMouseMove({ clientX: 0, clientY: 0 });
  }
}

const sceneConfig = new Main();
sceneConfig.init();

// sceneConfig.controls = new OrbitControls(
//   sceneConfig.camera,
//   sceneConfig.wrapperEl.querySelector("canvas")
// );
/* THREE.JS VARIABLES */
// let model;

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
