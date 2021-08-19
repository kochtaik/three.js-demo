import * as THREE from "three";
import { Interaction } from "three.interaction";
import scenesData from "./scenesData";
import * as dat from "dat.gui";

function main() {
  const canvas = document.getElementById("c");
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  /* uncomment to leverage gui debugger */
  // const gui = new dat.GUI();

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

    const interaction = new Interaction(renderer, scene, camera);
    return { scene, camera, el, interaction };
  }

  function createComposition(shapesData, elementId) {
    const group = new THREE.Group();
    const container = document.getElementById(elementId);
    const sceneDetails = createScene(container);

    shapesData.forEach((shapeData) => {
      if (!shapeData.mesh) {
        throw new Error("Missing mesh");
      }
      const { mesh, position, rotation } = shapeData;

      if (position) {
        mesh.position.set(
          shapeData.position.x || 0,
          shapeData.position.y || 0,
          shapeData.position.z || 0
        );
      }

      if (rotation) {
        mesh.rotation.set(
          shapeData.rotation.x || 0,
          shapeData.rotation.y || 0,
          shapeData.rotation.z || 0
        );
      }

      group.add(mesh);
    });

    sceneDetails.scene.add(group);
    sceneDetails.mesh = group;

    return sceneDetails;
  }

  const compositions = scenesData.map((scene) =>
    createComposition(scene.sceneData, scene.sceneId)
  );

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

  function render(sceneDetails) {
    const { scene, camera, el } = sceneDetails;
    const { left, bottom, width, height } = el.getBoundingClientRect();

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
    renderer.setScissor(left, positiveYUpBottom, width, height);
    renderer.setViewport(left, positiveYUpBottom, width, height);

    renderer.render(scene, camera);
  }

  function updateScreen(time) {
    requestAnimationFrame(updateScreen);
    resizeRendererToDisplaySize(renderer);

    renderer.setScissorTest(false);
    renderer.clear(true, true);
    renderer.setScissorTest(true);

    compositions.forEach((scene) => {
      scene.mesh.rotation.y += 0.01;
      render(scene);
    });
  }
  requestAnimationFrame(updateScreen);
}

main();
