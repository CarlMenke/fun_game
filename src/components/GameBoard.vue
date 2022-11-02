<template>
  <div>
    <canvas id="canvas">
    </canvas>
    <section >
      <div class="flexrow">
        <div class="flex-item"> wheat price: </div> 
        <div class="flex-item"> wood price: </div> 
        <div class="flex-item"> iron price: </div> 
        <div class="flex-item"> coal price: </div> 
        <div class="flex-item"> goods price: </div> 
        <div class="flex-item"> luxury price: </div> 
      </div>
      <div class="flexrow">
        <div class="flex-item"> railroad Next up: </div>
        <div class="flex-item"> railroad available One: </div> 
        <div class="flex-item"> railroad available Two: </div> 
      </div>
      <div class="flexrow">
        <div class="flex-item"> town Next up: </div>
        <div class="flex-item"> town avaiable: </div>
      </div>
      <div class="flexrow">
        <div class="flex-item"> building Next up: </div>
        <div class="flex-item"> building one: </div> 
        <div class="flex-item"> building Two: </div> 
        <div class="flex-item"> building Three: </div> 
        <div class="flex-item"> building four: </div> 
      </div>
    </section>
  </div>
</template>

<script>
import io from "socket.io-client"
import board from "../assets/board.jpg"
import * as BABYLON from 'babylonjs';
import "babylonjs-loaders"
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
        board : board,
        game : {}
      }
    },
    created() {
      //this.socket = io("https://game-test-birds-eye.herokuapp.com", { })
      this.socket = io("http://localhost:3000", { })
      console.log(this.socket)
    },
    async mounted() {
      this.socket.on('position', data => {
          console.log(data)
      })

     this.createScene()
    },
    methods : {
      async createScene() {
        const canvas = document.getElementById("canvas");
        const engine = new Engine(canvas);

        var scene = new Scene(engine);
        scene.clearColor = new BABYLON.Color3(.56,.57,.58)

        const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, -6, new BABYLON.Vector3(0, 100, -100));
        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);
        camera.inputs.attached.mousewheel.wheelPrecision = 16
        camera.upperBetaLimit = (Math.PI / 2) * 0.99;

        var light = new HemisphericLight("light1", new Vector3(1, 1, 1), scene);
        light.intensity = 1.25;

        //move the light with the camera
        // scene.registerBeforeRender(function () {
        //   light.position = camera.position;
        // });

        var ground = CreateGround("ground1", { width: 100, height: 100, subdivisions: 2 }, scene);
        let mat = new StandardMaterial("mat", scene);
        let texture = new BABYLON.Texture(this.board, scene);
        mat.diffuseTexture = texture;
        ground.material = mat
        
        const stls = await BABYLON.SceneLoader.ImportMeshAsync(
          "card",
          "card.stl",
          "",
          scene
        )

        const card = stls.meshes[0]
        card.scaling.setAll(.12)
        card._position._x = -39.3
        card._position._y = .25
        card._position._z = -14
        

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
  .flexrow{
    display: flex ; 
    flex: row nowrap;
  }
  .flex-item{
    margin: 10px;
  }
</style>
