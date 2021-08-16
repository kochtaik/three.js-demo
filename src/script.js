import "./style.css";
import * as THREE from "three";
import { InteractionManager } from "three.interactive";
import * as TWEEN from "@tweenjs/tween.js";

const card1Container = document.querySelector(".card1");
const WIDTH = 300;
const HEIGHT = 400;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 200);

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(WIDTH, HEIGHT);
card1Container.appendChild(renderer.domElement);

const interactionManager = new InteractionManager(
  renderer,
  camera,
  renderer.domElement
);

/* geometry & materials */

const box = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshPhongMaterial({ color: 0x29d8ff });
const cube = new THREE.Mesh(box, material);

cube.addEventListener("mouseover", (e) => {
  e.stopPropagation();
  zoomIn();
});

cube.addEventListener("mouseout", (e) => {
  e.stopPropagation();
  zoomOut();
});

interactionManager.add(cube);
scene.add(cube);
camera.position.z = 10;

/* light */
const pointLight1 = new THREE.PointLight(0xffffff, 1.5);
pointLight1.position.set(2.6, 2.2, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 1);
pointLight2.position.set(-1.8, 2.2, 5);
scene.add(pointLight2);

/* rotation */

function animate(time) {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
  interactionManager.update();
  TWEEN.update(time);
}
animate();

/* callback for event listeners */

function zoomIn() {
  const currentZoom = { value: camera.zoom };
  const finalZoom = { value: 1.2 };

  new TWEEN.Tween(currentZoom)
    .to(finalZoom, 300)
    .onUpdate(() => {
      camera.zoom = currentZoom.value;
      camera.updateProjectionMatrix();
    })
    .start();
}

function zoomOut() {
  const currentZoom = { value: camera.zoom };
  const finalZoom = { value: 1 };

  new TWEEN.Tween(currentZoom)
    .to(finalZoom, 300)
    .onUpdate(() => {
      camera.zoom = currentZoom.value;
      camera.updateProjectionMatrix();
    })
    .start();
}
