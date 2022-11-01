<template>
  <div>
    <canvas id="canvas">
    </canvas>
  </div>
</template>

<script>
import io from "socket.io-client"
import board from "../assets/board.jpg"
import * as BABYLON from 'babylonjs';
import { ArcRotateCamera } from "@babylonjs/core"
import { Engine } from '@babylonjs/core/Engines/engine'
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial"
  export default {
    name: 'GameBoard',
    data() {
      return {
        socket: {},
        board : board
      }
    },
    created() {
      //this.socket = io("https://game-test-birds-eye.herokuapp.com", { })
      this.socket = io("http://localhost:3000", { })
      console.log(this.socket)
    },
    mounted() {
      this.socket.on('position', data => {
          console.log(data)
      })

     this.createScene()
    },
    methods : {
      createScene() {
        // Get the canvas element from the DOM.
        const canvas = document.getElementById("canvas");

        // Associate a Babylon Engine to it.
        const engine = new Engine(canvas);

        // Create our first scene.
        var scene = new Scene(engine);

        // This creates and positions a free camera (non-mesh)
        const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 12, new BABYLON.Vector3(16, 16, 11.5));

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new HemisphericLight("light1", new Vector3(1, 1, 1), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 1.5;


        // Our built-in 'ground' shape.
        var ground = CreateGround("ground1", { width: 6, height: 6, subdivisions: 2 }, scene);

        let mat = new StandardMaterial("mat", scene);
        let texture = new BABYLON.Texture(this.board, scene);
        mat.diffuseTexture = texture;

        ground.material = mat


        // var options = {
        //     width: 20,
        //     height: .2,
        //     depth: 20,
        // };

        // var box = BABYLON.MeshBuilder.CreateBox('box', options, scene);
        // box.material = mat;

        scene.clearColor = new BABYLON.Color3(.56,.57,.58)
        // Render every frame
        engine.runRenderLoop(() => {
          scene.render();
        });
      },
      moveStart(direction) {
        this.socket.emit("moveStart", direction);
      }
    }
  }
</script>

<style scoped>
  canvas{
    width:90%;
    border:1px solid black;
  }
</style>
