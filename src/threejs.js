import * as THREE from "three";
import scenesData from "./scenesData";
import * as dat from "dat.gui";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

function main() {
  const scenes = scenesData.map((sceneInfo) => {
    const { sceneId, sceneObjects } = sceneInfo;
    const wrapperElement = document.querySelector(sceneId);
    const scene = createScene(wrapperElement);
    const group = new THREE.Group();

    sceneObjects.forEach((sceneObject) => {
      const { mesh, position, rotation } = sceneObject;

      if (position) {
        mesh.position.set(position.x || 0, position.y || 0, position.z || 0);
      }

      if (rotation) {
        mesh.rotation.set(rotation.x || 0, rotation.y || 0, rotation.z || 0);
      }

      group.add(mesh);
    });
    scene.scene.add(group);

    scene.wrapperElement.addEventListener("mouseover", () => {
      createMoveAnimation(
        scene.scene,
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1)
      );
    });

    requestAnimationFrame(render);

    return scene;
  });

  function createMoveAnimation(mesh, start, end) {
    mesh.userData.mixer = new THREE.AnimationMixer(mesh);

    const track = new THREE.VectorKeyframeTrack(
      ".position",
      [0, 1],
      [start.x, start.y, start.z, end.x, end.y, end.z]
    );
    const animationClip = new THREE.AnimationClip(null, 15, [track]);
    const animationAction = mesh.userData.mixer.clipAction(animationClip);
    animationAction.setLoop(THREE.LoopOnce);
    animationAction.play();
    mesh.userData.clock = new THREE.Clock();
    animationObjects.push(mesh);
  }

  function createScene(wrapperElement) {
    const canvas = wrapperElement.querySelector("canvas");
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas,
    });

    renderer.setSize(300, 300);
    wrapperElement.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const fov = 75;
    const aspect = canvas.width / canvas.height;
    const near = 0.1;
    const far = 200;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 4;
    camera.lookAt(0, 0, 0);

    /* LIGHT */
    const lightColor = 0xffffff;
    const intensity = 1;
    const directionalLight = new THREE.DirectionalLight(lightColor, intensity);
    directionalLight.position.set(-1, 2, 4);
    scene.add(directionalLight);

    const light = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(light);

    return { scene, camera, wrapperElement, renderer };
  }

  function render(time) {
    requestAnimationFrame(render);

    animationObjects.forEach((mesh) => {
      if (mesh.userData.clock && mesh.userData.mixer) {
        mesh.userData.mixer.update(mesh.userData.clock.getDelta());
      }
    });

    scenes.forEach((scene) => {
      scene.scene.rotation.y += 0.002;
      scene.renderer.render(scene.scene, scene.camera);
    });
  }

  function resetSize() {
    scenes.forEach((scene) => {
      const { renderer, wrapperElement, camera } = scene;

      renderer.setSize(wrapperElement.clientWidth, wrapperElement.clientHeight);
      camera.aspect = wrapperElement.clientWidth / wrapperElement.clientHeight;
      camera.updateProjectionMatrix();
    });
  }

  window.addEventListener("resize", resetSize);
  // resetSize();
}

main();
