import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";

export default [
  {
    sceneId: "#composition1",
    sceneObjects: [
      {
        mesh: new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshPhongMaterial({ color: 0xf2f2f2, shininess: 15 })
        ),
        position: {
          x: 0,
          y: 0,
          z: 0,
        },
        rotation: {
          x: 0.7,
          y: -0.2,
          z: -0.9,
        },
      },
      {
        mesh: new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 64, 64),
          new THREE.MeshPhongMaterial({ color: 0x009045 })
        ),
        position: {
          x: 0.3,
          y: -0.4,
          z: -0.4,
        },
      },
      {
        mesh: new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshPhongMaterial({
            color: 0xf2f2f2,
            shininess: 15,
          })
        ),
        position: {
          x: 1.5,
          y: -1,
          z: -0.7,
        },
        rotation: {
          x: 1,
          y: 1.3,
          z: -0.9,
        },
      },
    ],
  },
  {
    sceneId: "#composition2",
    sceneObjects: [
      {
        mesh: new THREE.Mesh(
          new THREE.SphereGeometry(1, 164, 64),
          new THREE.MeshPhongMaterial({
            color: 0x6e6673,
            wireframe: true,
            shininess: 57,
          })
        ),
      },
    ],
  },
  {
    sceneId: "#composition3",
    sceneObjects: [
      {
        mesh: new THREE.Mesh(
          new THREE.TorusGeometry(1, 0.3, 30, 90, 6.3),
          new THREE.MeshPhongMaterial({
            color: 0x313dff,
            shininess: 57,
            specular: 0x5b5b5b,
          })
        ),
      },
      {
        mesh: new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 164, 63),
          new THREE.MeshPhongMaterial({
            color: 0xff0000,
            shininess: 57,
            specular: 0x5b5b5b,
          })
        ),
        // position: {
        //   z: -1,
        // },
      },
    ],
  },
];
