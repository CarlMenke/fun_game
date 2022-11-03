<template>
  <div>
    <form @submit="handleCreateGame">
      <input ref="createGameInput"/>
      <button type="submit"> Create Game </button>
    </form>
    <form @submit="handleJoinGame">
      <input ref="joinGameInput"/>
      <button type="submit"> Join Game</button>
    </form>
    <div v-if="this.inGame" >Currenetly in the game: {{this.inGame}}</div>
    <canvas id="canvas">
    </canvas>
    <section >
      <div class="flexrow">
        <div class="flex-item"> wheat price: {{this.game.wheatValue}}</div> 
        <div class="flex-item"> wood price: {{this.game.woodValue}}</div> 
        <div class="flex-item"> iron price: {{this.game.ironValue}}</div> 
        <div class="flex-item"> coal price: {{this.game.coalValue}}</div> 
        <div class="flex-item"> goods price: {{this.game.goodValue}}</div> 
        <div class="flex-item"> luxury price: {{this.game.luxuryValue}}</div> 
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
    <button @click="handleStartGame()">START GAME</button>
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
        game : {},
        scene : null,
        roomId: null,
        canvas: null,
        engine: null,
        stls : null,
        avaiableRooms : [],
        inGame: null
      }
    },
    created() {
      //this.socket = io("https://game-test-birds-eye.herokuapp.com", { })
      this.socket = io("http://localhost:3000", { })

    },
    async mounted() {
      this.canvas = document.getElementById("canvas");
      this.engine = new Engine(this.canvas);
      this.scene = await this.createScene()
      this.engine.runRenderLoop(() => {
          this.scene.render();
        });

      this.socket.on('gameStarted', data => {
          this.game = data
          let position = new BABYLON.Vector3(-24.2,1,-15)
          this.moveModel(position, 1)
      })

      this.socket.on("invalidRoom", ()=>{
        console.log("invalid room")
      })

      this.socket.on("joinedGame", data => {
        this.inGame = data.roomId
      })
    },
    methods : {
      async createScene() {

        var scene = new Scene(this.engine);
        scene.clearColor = new BABYLON.Color3(1,1,1)

        const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, -6, new BABYLON.Vector3(0, 100, -100));
        camera.setTarget(Vector3.Zero());
        camera.attachControl(this.canvas, true);
        camera.inputs.attached.mousewheel.wheelPrecision = 20
        camera.upperBetaLimit = (Math.PI / 2) * 0.99;

        var light = new HemisphericLight("light1", new Vector3(1, 1, 1), scene);
        light.intensity = 1.25;

        var ground = CreateGround("ground1", { width: 100, height: 100, subdivisions: 2 }, scene);
        let mat = new StandardMaterial("mat", scene);
        let texture = new BABYLON.Texture(this.board, scene);
        mat.diffuseTexture = texture;
        ground.material = mat

        this.stls = await BABYLON.SceneLoader.ImportMeshAsync(
          "card",
          "card.stl",
          "",
          scene
        )

        this.stls.meshes[0].actionManager = new BABYLON.ActionManager(scene)
        this.stls.meshes[0].actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            ()=>{this.moveStart("up")}
          )
        )

        this.card = this.stls.meshes[0]
        this.card.scaling.setAll(.12)
        this.card.position = new BABYLON.Vector3(-39,1,-15)

        return scene
      },
      moveStart(direction) {
        console.log('here')
        this.socket.emit("moveStart", direction);
      },
      handleStartGame(){
        const data = {
          roomId : this.roomId
        }
        this.socket.emit("startGame", data )
      },
      moveModel(position){
        
        const frameRate = 10
        let positionX = new BABYLON.Animation("positionX", "position.x", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);  
        let positionY = new BABYLON.Animation("positionY", "position.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);  
        let positionZ = new BABYLON.Animation("positionZ", "position.z", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);  
        let rotationZ = new BABYLON.Animation("rotationZ", "rotation.z", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)

        let xFrames = [
          {
            frame: 0,
            value: this.card.position.x
          },
          {
            frame: frameRate * 1,
            value: position.x
          }
        ]
        let yFrames = [
          {
            frame: 0,
            value: this.card.position.y
          },
          {
            frame: frameRate * .5,
            value: 9
          },
          {
            frame: frameRate * 1,
            value: position.y
          }
        ]
        let zFrames = [
          {
            frame: 0,
            value: this.card.position.z
          },
          {
            frame: frameRate * 1,
            value: position.z
          }
        ]
        let rotationFrames = [
          {
          frame: 0,
          value: 0
          },
          {
          frame: frameRate * 1,
          value: - Math.PI
          }
        ]
          
          positionX.setKeys(xFrames)
          positionY.setKeys(yFrames)
          positionZ.setKeys(zFrames)
          rotationZ.setKeys(rotationFrames)

          this.card.animations.push(positionX)
          this.card.animations.push(positionY)
          this.card.animations.push(positionZ)
          this.card.animations.push(rotationZ)

          this.scene.beginDirectAnimation(this.card,[positionX, positionY, positionZ, rotationZ], 0, frameRate * 1, false)
          console.log(this.card.position)
      },
      handleCreateGame(e){
        e.preventDefault()

        this.roomId = this.$refs.createGameInput.value

        const data = {
          roomId : this.$refs.createGameInput.value
        }
        this.socket.emit("createRoom", data)

        this.$refs.createGameInput.value = ""
      },
      handleJoinGame(e){
        e.preventDefault()

        this.roomId = this.$refs.joinGameInput.value

        const data = {
          roomId : this.$refs.joinGameInput.value
        }
        this.socket.emit("joinRoom", data)

        this.$refs.joinGameInput.value = ""
      }
    }
  }
</script>

<style scoped>
  canvas{
    width:90%;
    border:none;
    outline: none;
  }
  .flexrow{
    display: flex ; 
    flex: row nowrap;
  }
  .flex-item{
    margin: 10px;
  }
</style>
