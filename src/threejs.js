import * as THREE from "three";
import { InteractionManager } from "three.interactive";
import * as TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class Object3d {
  constructor(width = 400, height = 300, container = document.body) {
    this.sizes = {
      width: width,
      height: height,
    };

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.container = container;
    this.interactionManager = null;
    this.cube = null;
    this.isRenderingAllowed = false;
  }

  start() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      200
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.container.appendChild(this.renderer.domElement);

    new OrbitControls(this.camera, this.renderer.domElement);

    this.interactionManager = new InteractionManager(
      this.renderer,
      this.camera,
      this.renderer.domElement
    );

    this.setupCube();
    this.setupLight();
    window.addEventListener("resize", this.onDocumentResize.bind(this));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        console.log(entry);
        if (entry.isIntersecting) {
          console.log("in viewport");
          this.isRenderingAllowed = true;
          return animate();
        }
        this.isRenderingAllowed = false;
      });
    }).observe(this.container);

    const animate = (time) => {
      if (!this.isRenderingAllowed) return;
      requestAnimationFrame(animate);
      this.cube.rotation.x += 0.01;
      this.cube.rotation.y += 0.01;

      this.renderer.render(this.scene, this.camera);
      this.interactionManager.update();
      TWEEN.update(time);
    };

    animate();
  }

  setupCube() {
    const box = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({ color: 0x29d8ff });
    this.cube = new THREE.Mesh(box, material);

    this.cube.addEventListener("mouseover", (e) => {
      e.stopPropagation();
      this.zoomIn();
    });

    this.cube.addEventListener("mouseout", (e) => {
      e.stopPropagation();
      this.zoomOut();
    });

    this.interactionManager.add(this.cube);
    this.scene.add(this.cube);
    this.camera.position.z = 4;
  }

  setupLight() {
    const pointLight1 = new THREE.PointLight(0xffffff, 1.5);
    pointLight1.position.set(2.6, 2.2, 5);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 1);
    pointLight2.position.set(-1.8, 2.2, 5);
    this.scene.add(pointLight2);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.scene.add(directionalLight);
  }

  zoomIn() {
    const currentZoom = { value: this.camera.zoom };
    const finalZoom = { value: 1.2 };

    new TWEEN.Tween(currentZoom)
      .to(finalZoom, 300)
      .onUpdate(() => {
        this.camera.zoom = currentZoom.value;
        this.camera.updateProjectionMatrix();
      })
      .start();
  }

  zoomOut() {
    const currentZoom = { value: this.camera.zoom };
    const finalZoom = { value: 1 };

    new TWEEN.Tween(currentZoom)
      .to(finalZoom, 300)
      .onUpdate(() => {
        this.camera.zoom = currentZoom.value;
        this.camera.updateProjectionMatrix();
      })
      .start();
  }

  onDocumentResize() {
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.camera.aspect =
      this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
  }
}

window.addEventListener("load", () => {
  const container = document.querySelector(".card1");
  const object3d = new Object3d(container.clientWidth, 300, container);
  object3d.start();
});
