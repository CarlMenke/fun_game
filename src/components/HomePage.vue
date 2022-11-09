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
    <LoadScene/>
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
        <div class="flex-item" @click="handleBuyTown"> town avaiable: {{game.avaiableTown.specificType}}{{game.avaiableTown.specificPrice}} </div>
      </div>
      <div class="flexrow">
        <div class="flex-item" v-for="(building, buildingIndex) in game.shownBuildings" :key="buildingIndex"  @click="handleBuyBuilding(buildingIndex)"> building {{buildingIndex}}: {{building.name}}</div> 
      </div>
    </section>
    <button v-if="!gameRunning && game ? game.players.length > 1 : false && game.players[game.turnIndex].name === player.name" @click="handleStartGame()">START GAME</button>
  </div>
</template>

<script>
  import io from "socket.io-client"
  import UserMessage from "./UserMessage.vue";
  import UI from "./UI.vue"
  import LoadScene from './LoadScene.vue'
  import { mapState, mapMutations, mapGetters } from "vuex";
  export default {
    name: 'HomePage',
    components:{
      UI,
      UserMessage,
      LoadScene
    },
    data () {
      return {
        scene : null,
        roomId: null,
        canvas: null,
        engine: null,
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
      await this.getSocket().on('gameStarted', async data => {
          this.updateGame(data.game)
          this.updatePlayer(data.game.players.filter((player)=> player.name === this.getPlayer().name)[0])
          this.updateGameRunning(true)
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
            if(game.players[game.turnIndex].name === player.name){
              this.updateMessage(`You must discard ${player.commodies.length - player.commodityMax} commodies.`)
              player.discarding = true
              this.updatePlayer(player)
            }
            break
          default:
        }
      })
    },

    methods : {
      //state methods
      ...mapMutations(["updateGameRunning", "updateGame", "updateName", "updatePlayer", "updateSocket", "updateGameCanStart", "updateMessage"]),

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
        let player = this.getPlayer()
        let game = this.getGame()
        if(
            game.players[game.turnIndex].name === player.name 
            && !player.discarding 
            && !player.isInAuction 
            && !player.pickingProduceItems 
            && !player.selling
            && !player.buyingTown
            && !player.buyingBuilding
        ){
          if(game.shownRailRoads[railroad].minimumPrice > player.money){
            this.updateMessage("Not Enough Money")
          }else{
            if(!player.inAuction && !player.selling &&!player.pickingProduceItems){
              console.log("here")
              game.payload = railroad
              game.action = "START_AUCTION"
              this.getSocket().emit("ACTION", game)
            }
          }
        }else{
          this.updateMessage("Not Your Turn")
        }
      },

      //selling methods
      handleSellStart(sellingCommodity){
        let player = this.getPlayer()
        let game = this.getGame()
        if(
            game.players[game.turnIndex].name === player.name 
            && !player.discarding 
            && !player.isInAuction 
            && !player.pickingProduceItems 
            && !player.selling
            && !player.buyingTown
            && !player.buyingBuilding
        ){
          if(player.commodies.filter(commodity => {return commodity.name === sellingCommodity}).length !== 0){
            player.selling = true
            game.players[game.turnIndex] = player
            game.sellingCommodity = sellingCommodity
            this.updatePlayer(player)
            this.updateGame(game)
          }else{
            this.updateMessage(`You dont have any ${sellingCommodity}`)
          }
        }else{
          this.updateMessage("Cannot Do That Now")
        }
      },
      handleSell(e){
        e.preventDefault()
        let player = this.getPlayer()
        let game = this.getGame()
        if(
            game.players[game.turnIndex].name === player.name 
            && !player.discarding 
            && !player.isInAuction 
            && !player.pickingProduceItems 
            && player.selling
            && !player.buyingTown
            && !player.buyingBuilding
        ){
          if(parseInt(this.$refs.sellAmountInput.value) <= player.money){
            game.sellAmount = parseInt(this.$refs.sellAmountInput.value) 
            game.action = "SELL"
            this.getSocket().emit("ACTION", game)
          }else{
            this.updateMessage("You Dont Have That Much.")
          }
        }else{
          this.updateMessage("Cannot Do That Now.")
        }
      },

      //town methods
      handleBuyTown(){
        let player = this.getPlayer()
        let game = this.getGame()
        if(
            game.players[game.turnIndex].name === player.name 
            && !player.discarding 
            && !player.isInAuction 
            && !player.pickingProduceItems 
            && !player.selling
            && !player.pickingTownCommodies
            && !player.buyingBuilding
        ){
          console.log("412")
          if(player.commodies.filter(commodity=>{return commodity.name === game.avaiableTown.specificType}).length >= game.avaiableTown.specificPrice){
            console.log("414")
            game.action = "BUY_TOWN_SPECIFIC"
            this.getSocket().emit("ACTION", game)
          }else{
            console.log("418")
            this.updateMessage(`Not Enough ${game.avaiableTown.specificType}. You may purchase with any ${game.avaiableTown.anyPrice} commodies`)
            if(player.commodies.length >= game.avaiableTown.anyPrice){
              console.log("420")
              player.pickingTownCommodies = true
              this.updatePlayer(player)
            }else{
              this.updateMessage(`Not Enough Commodies`)
            }
          }
        }else{
          this.updateMessage("Cannot Do That Now.")
        }
      },

      //building methods
      handleBuyBuilding(index){
        let player = this.getPlayer()
        let game = this.getGame()
        if(
            game.players[game.turnIndex].name === player.name 
            && !player.discarding 
            && !player.isInAuction 
            && !player.pickingProduceItems 
            && !player.selling
            && !player.pickingTownCommodies
            && !player.buyingBuilding
        ){
          if(game.shownBuildings[index].price <= player.money){
            player.buyingBuilding = true
            game.players[game.turnIndex] = player
            game.buildingBuyIndex = index
            game.action = "BUY_BUILDING"
            this.getSocket().emit("ACTION", game)
          }else{
            this.updateMessage("Not Enough Money")
          }
        }else{
          this.updateMessage("Cannot Do That Now")
        }
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
