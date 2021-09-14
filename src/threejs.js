import * as THREE from "three";
import { gsap } from "gsap";
import * as dat from "dat.gui";
const gui = new dat.GUI();
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

function main() {
  const manager = new THREE.LoadingManager();

  const wrapperElement = document.querySelector("#shape-3d");
  const canvas = wrapperElement.querySelector("canvas");
  const scene = new THREE.Scene();
  const clock = new THREE.Clock();
  const tLoader = new THREE.TextureLoader();
  const textures = [
    tLoader.load("Textures/01_Boxes_Color_01.png"),
    tLoader.load("Textures/02_Laptop_Color_01.png"),
    tLoader.load("Textures/03_Beard_Color_01.png"),
    tLoader.load("Textures/04_Watch_Color_01.png"),
  ];
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

  /* LIGHT */
  const lightColor = 0xffffff;
  const intensity = 1;
  const directionalLight = new THREE.DirectionalLight(lightColor, intensity);
  directionalLight.position.set(-1, 2, 4);
  scene.add(directionalLight);

  const light = new THREE.AmbientLight(0xffffff, 1.7);
  scene.add(light);

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

  /* GEOMETRY */
  let mixer;
  let action;
  let x = -1;
  let y = 0;
  let z = 0.5;

  loadModel().then((model) => {
    // const textureLoader = new THREE.TextureLoader();
    // textures.forEach((textureUrl) => {
    //   textureLoader.loadAsync(textureUrl).then((texture) => {
    //     model.traverse((child) => {
    //       if (child.isMesh) {
    //         console.log(child.material);
    //         child.material.map = texture;
    //         child.material.needsUpdate = true;
    //       }
    //     });
    //   });
    // });
  });

  function loadModel() {
    return new Promise((resolve, reject) => {
      new FBXLoader().load(
        "Object_002.fbx",
        (model) => {
          model.scale.set(4, 4, 4);
          model.position.set(0, 0, 0);

          mixer = new THREE.AnimationMixer(model);
          action = mixer.clipAction(model.animations[0]);

          model.traverse((child) => {
            child.material = m;
          });
          scene.add(model);
          resetSize();

          resolve(model);
        },
        null,
        (e) => {
          console.error(e);
          reject();
        }
      );
    });
  }

  function getCurrentAnimationFrame(mixer, frameRate) {
    return Math.floor(mixer.time * frameRate);
  }

  let counter = 0;

  function startSequence() {
    console.log("started");

    function onUpdate(idx = null) {
      let idx2 = idx + 1 == textures.length ? 0 : idx + 1;
      m.uniforms.t1.value = textures[idx];
      m.uniforms.t2.value = textures[idx2];
    }

    const tl = gsap.timeline({ repeat: -1 });

    tl.clear();
    const anim = tl
      .fromTo(
        m.uniforms.transition,
        { value: 0 },
        {
          value: 1,
          duration: 0.7,
          delay: 4,
          onUpdate: () => onUpdate(0),
        }
      )
      .fromTo(
        m.uniforms.transition,
        { value: 0 },
        {
          value: 1,
          duration: 0.9,
          delay: 0.9,
          onUpdate: () => onUpdate(1),
        }
      )
      .fromTo(
        m.uniforms.transition,
        { value: 0 },
        {
          value: 1,
          duration: 0.9,
          delay: 1.1625,
          onUpdate: () => onUpdate(2),
        }
      )
      .fromTo(
        m.uniforms.transition,
        { value: 0 },
        {
          value: 1,
          duration: 1.1625,
          delay: 0.8,
          onUpdate: () => onUpdate(2),
        }
      )
      .fromTo(
        m.uniforms.transition,
        { value: 0 },
        {
          value: 1,
          duration: 2.275,
          delay: 1.2,
          onUpdate: () => {
            onUpdate(0);
          },
          onComplete: () => {
            anim.restart(true);
          },
        }
      );
  }

  function render() {
    if (mixer) {
      mixer.update(clock.getDelta());
    }
    const model = scene.children[3];
    if (model) {
      model.position.set(0, 0, 0);
      model.rotation.set(x, y, z);
      model.scale.set(1.5, 1.5, 1.5);
    }

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
    renderer.render(scene, camera);
  }

  requestAnimationFrame(render);

  function resetSize() {
    renderer.setSize(wrapperElement.clientWidth, wrapperElement.clientHeight);
    camera.aspect = wrapperElement.clientWidth / wrapperElement.clientHeight;
    camera.updateProjectionMatrix();
  }

  function onClick() {
    action.play();
  }

  window.addEventListener("resize", resetSize);
  canvas.addEventListener("click", onClick);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (action) {
        if (entry.isIntersecting) {
          action.play();
          startSequence();
        } else {
          action.stop();
        }
      }
    });
  });
  observer.observe(wrapperElement);
}

main();
