<template>
  <div>
      <UI v-if="gameRunning"></UI>
    <form v-if="!gameId" @submit="handleCreateGame">
      <input ref="createGameInput"/>
      <button type="submit"> Create Game </button>
    </form>
    <form v-if="makingName" @submit="handleAddNameToGame">
      <div>Please Enter Your Name</div>
      <input ref="addNameToGame"/>
      <button type="submit"> Enter </button>
    </form>
    <form v-if="!gameId" @submit="handleJoinGame">
      <input ref="joinGameInput"/>
      <button type="submit"> Join Game </button>
    </form>
    <div v-if="gameId" >Currenetly in the game: {{gameId}}</div>
    <canvas id="canvas">
    </canvas>
    <section v-if="gameRunning">
      <div class="flexrow">
        <div class="flex-item" v-for="commodity in game.commodies" :key="commodity.name"> {{commodity.name}} price: {{commodity.value}}</div> 
      </div>
      <div class="flexrow">
        <div class="flex-item"> railroad available One: {{game.avaiableRailRoadOne.name}}</div> 
        <div class="flex-item"> railroad available Two: {{game.avaiableRailRoadTwo.name}} </div> 
      </div>
      <div class="flexrow">
        <div class="flex-item"> town avaiable: {{game.avaiableTown.specificType}}{{game.avaiableTown.specificPrice}} </div>
      </div>
      <div class="flexrow">
        <div class="flex-item"> building one: {{game.avaiableBuildingOne.name}}</div> 
        <div class="flex-item"> building Two: {{game.avaiableBuildingTwo.name}}</div> 
        <div class="flex-item"> building Three: {{game.avaiableBuildingThree.name}}</div> 
        <div class="flex-item"> building four: {{game.avaiableBuildingFour.name}}</div> 
      </div>
    </section>
    <button v-if="!gameRunning && game ? game.players.length > 1 : false" @click="handleStartGame()">START GAME</button>
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
  import UI from "./UI.vue"
  import { mapState, mapMutations, mapGetters } from "vuex";
  export default {
    name: 'GameBoard',
    components:{
      UI
    },
    data () {
      return {
        gameRunning: false,
        socket: {},
        board : board,
        scene : null,
        roomId: null,
        canvas: null,
        engine: null,
        stls : null,
        gameId: null,
        makingName: false
      }
    },
    computed: {
      ...mapState(["game", "name", "socket", "player"]),
      ...mapGetters(["getGame", "getPlayer", "getSocket"])
    },
    created() {
      //this.socket = io("https://game-test-birds-eye.herokuapp.com", { })
      this.updateSocket(io("http://localhost:3000", { }))

    },
    async mounted() {
      this.canvas = document.getElementById("canvas");
      this.engine = new Engine(this.canvas);
      this.scene = await this.createScene()
      this.engine.runRenderLoop(() => {
        this.scene.render();
      });

      this.getSocket().on('gameStarted', data => {
          this.updateGame(data.game)
          this.updatePlayer(data.game.players.filter((player)=> player.name === this.getPlayer().name)[0])
          console.log(this.getGame())
          console.log(this.getPlayer())
          let position = new BABYLON.Vector3(-24.2,1,-15)
          this.gameRunning = true
          this.moveModel(position, 1)
      })

      this.getSocket().on("invalidRoom", ()=>{
        console.log("invalid room")
      })

      this.getSocket().on("playerJoined", () => {
        const data = {
          game: this.getGame(),
          roomId: this.roomId
        }
        this.getSocket().emit("welcomePlayer", data)
      })

      this.getSocket().on("joinedRoom", data => {
        this.updateGame(data.game)
        this.gameId = data.roomId
        this.makingName = true;
      })

      this.getSocket().on("updateGame", data => {
        this.updateGame(data.game)
        this.updatePlayer(data.game.players.filter(player => player.name === this.getPlayer().name)[0])
      })

      this.getSocket().on("updatePlayer", data => {
        this.updatePlayer(data.player)
      })
    },
    methods : {
      ...mapMutations(["updateGame", "updateName", "updatePlayer", "updateSocket"]),
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

        this.stls = await BABYLON.SceneLoader.ImportMeshAsync("card", "card.stl","", scene)
        this.card = this.stls.meshes[0]
        this.card.scaling.setAll(.12)
        this.card.position = new BABYLON.Vector3(-39,1,-15)
        this.card.actionManager = new BABYLON.ActionManager(scene)
        this.card.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            ()=>{this.moveStart("up")}
          )
        )
        return scene
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
      moveStart(direction) {
        this.getSocket().emit("moveStart", direction);
      },
      handleStartGame(){
        const data = {
          game: this.getGame(),
          roomId : this.roomId
        }
        this.getSocket().emit("startGame", data )
      },
      handleCreateGame(e){
        e.preventDefault()
        this.roomId = this.$refs.createGameInput.value
        const data = {
          roomId : this.$refs.createGameInput.value
        }
        this.getSocket().emit("createRoom", data)
        this.$refs.createGameInput.value = ""
        this.makingName = false;
      },
      handleJoinGame(e){
        e.preventDefault()
        this.roomId = this.$refs.joinGameInput.value
        const data = {
          roomId : this.$refs.joinGameInput.value
        }
        this.getSocket().emit("joinRoom", data)
        this.$refs.joinGameInput.value = ""
        this.makingName = false;
      },
      async handleAddNameToGame(e) {
        e.preventDefault()
        this.updateName(this.$refs.addNameToGame.value) 
        const data = {
          name : this.$refs.addNameToGame.value,
          roomId: this.roomId,
          game: this.getGame()
        }
        this.getSocket().emit("addNameToGame", data)
        this.$refs.addNameToGame.value = ""
        this.makingName = false;
      }
    }
  }
</script>

<style scoped>
  canvas{
    width:100%;
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
