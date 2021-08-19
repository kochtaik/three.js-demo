import * as THREE from "three";
import { Interaction } from "three.interaction";
import * as TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

function main() {
  const canvas = document.getElementById("c");
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });

  function createScene(el) {
    const scene = new THREE.Scene();

    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 200;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 4;
    camera.lookAt(0, 0, 0);

    /* LIGHT */
    const lightColor = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(lightColor, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    /* INTERACTION MANAGER */
    const interactionManager = new Interaction(renderer, scene, camera);

    return { scene, camera, el, interactionManager };
  }

  function createCube() {
    const sceneDetails = createScene(document.querySelector("#cube"));
    const geometry = new THREE.BoxGeometry(1.7, 1.7, 1.7);
    const material = new THREE.MeshPhongMaterial({ color: 0x29d8ff });
    const mesh = new THREE.Mesh(geometry, material);

    sceneDetails.scene.add(mesh);
    sceneDetails.mesh = mesh;
    return sceneDetails;
  }

  function createSphere() {
    const sceneDetails = createScene(document.querySelector("#sphere"));
    const geometry = new THREE.SphereGeometry(1.2, 164, 64);
    const material = new THREE.MeshPhongMaterial({
      color: 0x6e6673,
      wireframe: true,
      shininess: 57,
    });
    const mesh = new THREE.Mesh(geometry, material);

    sceneDetails.scene.add(mesh);
    sceneDetails.mesh = mesh;

    return sceneDetails;
  }

  function createTorus() {
    const sceneDetails = createScene(document.querySelector("#torus"));
    const torusGeometry = new THREE.TorusGeometry(1, 0.3, 30, 90, 6.3);
    const torusMaterial = new THREE.MeshPhongMaterial({
      color: 0x313dff,
      shininess: 57,
      specular: 0x5b5b5b,
    });
    const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);

    const sphereGeometry = new THREE.SphereGeometry(0.5, 164, 63);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      shininess: 57,
      specular: 0x5b5b5b,
    });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.z = -1;

    document.querySelector("#torus").addEventListener("mouseover", (e) => {
      console.log("mouseover");
      e.stopPropagation();

      const currentSpherePosition = { value: -1 };
      const finalSpherePosition = { value: 1 };

      new TWEEN.Tween(currentSpherePosition)
        .to(finalSpherePosition, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          console.log("fired");
          sphereMesh.position.z = finalSpherePosition.value;
        })
        .start();
    });

    document.querySelector("#torus").addEventListener("mouseout", (e) => {
      console.log("mouseout");
      const currentSpherePosition = { value: 1 };
      const finalSpherePosition = { value: -1 };

      new TWEEN.Tween(currentSpherePosition)
        .to(finalSpherePosition, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          sphereMesh.position.z = finalSpherePosition.value;
        })
        .start();
    });
    const group = new THREE.Group();
    group.add(torusMesh, sphereMesh);

    sceneDetails.scene.add(group);
    sceneDetails.mesh = group;
    console.log(torusMesh);

    return sceneDetails;
  }
  const cube = createCube();
  const sphere = createSphere();
  const torus = createTorus();

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(sceneDetails, time) {
    const { scene, camera, el, interactionManager } = sceneDetails;
    const { left, right, top, bottom, width, height } =
      el.getBoundingClientRect();

    const isOffscreen =
      bottom < 0 ||
      top > renderer.domElement.clientHeight ||
      right < 0 ||
      left > renderer.domElement.clientWidth;

    // if (isOffscreen) {
    //   return;
    // }

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
    renderer.setScissor(left, positiveYUpBottom, width, height);
    renderer.setViewport(left, positiveYUpBottom, width, height);

    renderer.render(scene, camera);
  }

  function updateScreen(time) {
    requestAnimationFrame(updateScreen);
    TWEEN.update(time);

    resizeRendererToDisplaySize(renderer);

    renderer.setScissorTest(false);
    renderer.clear(true, true);
    renderer.setScissorTest(true);

    cube.mesh.rotation.y += 0.01;
    sphere.mesh.rotation.y += 0.01;
    torus.mesh.rotation.y += 0.01;

    render(cube, time);
    render(sphere, time);
    render(torus, time);
  }
  requestAnimationFrame(updateScreen);
}

main();
