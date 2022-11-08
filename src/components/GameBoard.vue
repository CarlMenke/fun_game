<template>
  <div>
    <UserMessage/>
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
      <div v-if="player.selling">
            <form @submit="handleSell">
              <input ref="sellAmountInput"/>
              <button type="submit">sell</button>
            </form>
        </div>
      <div class="flexrow">
        <div @click="handleSellStart('wheat')" class="flex-item" > wheat price: {{game.commodityValues.wheat}}</div> 
        <div @click="handleSellStart('wood')" class="flex-item" > wood price: {{game.commodityValues.wood}}</div> 
        <div @click="handleSellStart('iron')" class="flex-item" > iron price: {{game.commodityValues.iron}}</div> 
        <div @click="handleSellStart('coal')" class="flex-item" > coal price: {{game.commodityValues.coal}}</div> 
        <div @click="handleSellStart('goods')" class="flex-item" > goods price: {{game.commodityValues.goods}}</div> 
        <div @click="handleSellStart('luxury')" class="flex-item" > luxury price: {{game.commodityValues.luxury}}</div> 
      </div>
      <div class="flexrow">
        <div class="flex-item" v-for="(railroad, railRoadIndex) in game.shownRailRoads" :key="railRoadIndex" @click="handleStartAuction(railRoadIndex)" > railroad {{railRoadIndex}}: {{railroad.name}}</div> 
      </div>
      <div class="flexrow">
        <div class="flex-item"> town avaiable: {{game.avaiableTown.specificType}}{{game.avaiableTown.specificPrice}} </div>
      </div>
      <div class="flexrow">
        <div class="flex-item" v-for="(building, buildingIndex) in game.shownBuildings" :key="buildingIndex"> building {{buidlingIndex}}: {{building.name}}</div> 
      </div>
    </section>
    <button v-if="!gameRunning && game ? game.players.length > 1 : false && game.players[game.turnIndex].name === player.name" @click="handleStartGame()">START GAME</button>
  </div>
</template>

<script>
  import io from "socket.io-client"
  import board from "../../public/assets/board.jpg"
  import UserMessage from "./UserMessage.vue";
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
      UI,
      UserMessage
    },
    data () {
      return {
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
      ...mapState(["gameRunning", "game", "name", "socket", "player", "gameCanStart", "message"]),
      ...mapGetters(["getGame", "getPlayer", "getSocket", "getGameRunning"])
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

      await this.getSocket().on('gameStarted', async data => {
          this.updateGame(data.game)
          console.log(data.game.players.filter((player)=> player.name === this.getPlayer().name)[0])
          this.updatePlayer(data.game.players.filter((player)=> player.name === this.getPlayer().name)[0])
          console.log(this.getGame())
          console.log(this.getPlayer())
          let position = new BABYLON.Vector3(-24.2,1,-15)
          this.updateGameRunning(true)
          this.moveModel(position, 1)
      })

      await this.getSocket().on("invalidRoom", ()=>{
        console.log("invalid room")
      })

      await this.getSocket().on("playerJoined", async () => {
        const data = {
          game: this.getGame(),
          roomId: this.roomId
        }
        await this.getSocket().emit("welcomePlayer", data)
      })

      await this.getSocket().on("joinedRoom", data => {
        this.updateGame(data.game)
        this.gameId = data.roomId
        this.makingName = true;
      })

      await this.getSocket().on("updateGame", data => {
        this.updateGame(data.game)
        this.updatePlayer(data.game.players.filter(player => player.name === this.getPlayer().name)[0])
      })

      await this.getSocket().on("updatePlayer", data => {
        this.updatePlayer(data.player)
      })

      await this.getSocket().on("gameStartedQuery", (data) => {
        const bool = this.getGame().turnIndex
        data.bool = bool
        this.getSocket().emit("gameStartedQueryResponse", data)
      })

      await this.getSocket().on("emitMessage", message => {
        this.updateMessage(message)
      })

      await this.getSocket().on("UPDATE_GAME", game => {

        console.log("GAME:", game)
        console.log("PLAYER:", game.players.filter(player => player.name === this.getPlayer().name)[0])
        
        let thisPlayer = game.players.filter(player => player.name === this.getPlayer().name)[0]
        
        this.updateGame(game)
        this.updatePlayer(thisPlayer)
        this.updateMessage(game.message)

        let player = this.getPlayer()
        switch(game.action){
          case "DISCARD":
            this.updateMessage(`You must discard ${player.commodies.length - player.commodityMax} commodies.`)
            player.discarding = true
            this.updatePlayer(player)
            break
          default:
        }
      })
    },

    methods : {

      //state methods
      ...mapMutations(["updateGameRunning", "updateGame", "updateName", "updatePlayer", "updateSocket", "updateGameCanStart", "updateMessage"]),

      //babylon animation methods
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

      //pre game methods
      async handleStartGame(){
        const data = {
          game: this.getGame(),
          roomId : this.roomId
        }
        await this.getSocket().emit("startGame", data )
      },
      async handleCreateGame(e){
        e.preventDefault()
        if(this.$refs.createGameInput.value !== ""){
          this.roomId = this.$refs.createGameInput.value
          const data = {
            roomId : this.$refs.createGameInput.value
          }
          await this.getSocket().emit("createRoom", data)
          this.$refs.createGameInput.value = ""
          this.makingName = false; 
        }
      },
      async handleJoinGame(e){
        e.preventDefault()
        this.roomId = this.$refs.joinGameInput.value
        const data = {
          roomId : this.$refs.joinGameInput.value
        }
        await this.getSocket().emit("joinRoom", data)
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
        await this.getSocket().emit("addNameToGame", data)
        this.$refs.addNameToGame.value = ""
        this.makingName = false;
      },

      //railroad methods
      handleStartAuction(railroad){
        if(this.getGame().players[this.getGame().turnIndex].name === this.getPlayer().name){
          if(this.getGame().shownRailRoads[railroad].minimumPrice > this.getPlayer().money){
            this.updateMessage("Not Enough Money")
          }else{
            console.log("here")
            let game =  this.getGame()
            game.payload = railroad
            game.action = "START_AUCTION"
            this.getSocket().emit("ACTION", game)
          }
        }else{
          this.updateMessage("Not Your Turn")
        }
      },

      //selling methods
      handleSellStart(sellingCommodity){
        console.log(this.getPlayer().commodies.filter(commodity => {return commodity.name === sellingCommodity}).length)
        if(this.getGame().players[this.getGame().turnIndex].name === this.getPlayer().name){
          if(this.getPlayer().commodies.filter(commodity => {return commodity.name === sellingCommodity}).length !== 0){
            let player = this.getPlayer()
            let game = this.getGame()
            player.selling = true
            game.players[game.turnIndex] = player
            game.sellingCommodity = sellingCommodity
            this.updatePlayer(player)
            this.updateGame(game)
          }else{
            this.updateMessage(`You dont have any ${sellingCommodity}`)
          }
        }else{
          this.updateMessage("Not Your Turn")
        }
      },
      handleSell(e){
        e.preventDefault()
        if(this.getGame().players[this.getGame().turnIndex].name === this.getPlayer().name){
          let game = this.getGame()
          game.sellAmount = parseInt(this.$refs.sellAmountInput.value)
          game.action = "SELL"
          this.getSocket().emit("ACTION", game)
        }else{
          this.updateMessage("Not Your Turn")
        }
      },

    }
  }

  //when a player tries to join a room, we also need to check if the game associated with that room is active.
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
