<template>
    <div class="row" >
        <div v-for="(card,cardIndex) in player.productionCards" :key="cardIndex" class="ppcard" @click="handleProduce(cardIndex)">
            <div class="production-container">
                <img 
                    class="commodity-small" 
                    v-for="(commodity, commodityIndex) in card.production" 
                    :key="commodityIndex" 
                    :src="require(`../../public/assets/commodies/${commodity.imageLink}`)" 
                />
            </div>
            <div class="price-container">
                <img 
                    class="commodity-small" 
                    v-for="(commodity, commodityIndex) in card.price" 
                    :key="commodityIndex" 
                    :src="require(`../../public/assets/commodies/${commodity.imageLink}`)"
                />
            </div>
        </div>
        <div v-if="player.pickingProduceItems">
            <div class="production-container">
                Choose {{player.productionMax}} commodies to produce.
                <img 
                    class="commodity-small" 
                    v-for="(commodity, commodityIndex) in player.productionCards[player.producingIndex].production" 
                    @click="handleUpdateProducingArray(commodityIndex)" 
                    :src="require(`../../public/assets/commodies/${commodity.imageLink}`)" 
                    :key="commodityIndex"
                />
            </div>
        </div>
        <div v-if="player.discarding">
            <div class="production-container">
                Choose {{player.commodies.length - player.commodityMax}} commodies to discard:
                <img 
                    class="commodity-small" 
                    v-for="(commodity, commodityIndex) in player.commodies" 
                    @click="handleDiscard(commodityIndex)" 
                    :src="require(`../../public/assets/commodies/${commodity.imageLink}`)" 
                    :key="commodityIndex"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from "vuex"
export default {
    name: "PPCard",
    computed:{
        ...mapState(["player", "socket", "game"]),
        ...mapGetters(["getPlayer", "getSocket", "getGame"])
    },
    mounted () {

    },
    methods: {
        ...mapMutations(["updatePlayer", "updateSocket", "updateGame", "updateMessage"]),
        handleProduce(index){
            let player = this.getPlayer()
            let game = this.getGame()
            console.log(player.producingArray.length)
            if(
                game.players[game.turnIndex].name === player.name 
                && !player.discarding 
                && !player.isInAuction 
                && player.producingArray.length === 0
                && !player.selling
            ){
                player.pickingProduceItems = true
                player.producingIndex = index
                this.updatePlayer(player)
            }else{
                this.updateMessage("Cannot do that now.")
            }
        },
        handleUpdateProducingArray(index){
            if(this.getGame().players[this.getGame().turnIndex].name === this.getPlayer().name){
                let player = {...this.getPlayer()}
                player.producingArray.push(...player.productionCards[player.producingIndex].production.splice(index,1))
                console.log("PLAYER:", player)
                if(player.producingArray.length === player.productionMax){
                    player.pickingProduceItems = false
                    let game = this.getGame()
                    game.players[game.turnIndex] = player
                    this.updatePlayer(player)
                    game.action = "PRODUCE"
                    game.payload = player.producingIndex
                    this.getSocket().emit("ACTION", game)
                }
            }else{
                this.updateMessage("Not Your Turn")
            }
        },
        handleDiscard(index){
            let player = this.getPlayer()
            player.commodies.splice(index,1)
            this.updatePlayer(player)

            let game = this.getGame()
            game.players[game.turnIndex] = player
            this.updateGame(game)

            if(player.commodies.length === player.commodityMax){
                player.discarding = false
                this.updatePlayer(player)

                let game = this.getGame()
                game.players[game.turnIndex] = player
                this.updateGame(game)

                game.action = "NEXT_TURN"
                this.getSocket().emit("ACTION", game)
            }
        }
    }
}
</script>

<style>
    .ppcard{
        width:5vw;
        height:10vh;
        border:1px solid black; 
        margin:5px;
    }
    .production-container{
        display:flex;
        flex-flow:row wrap;
        justify-content: space-around;
        align-items: space-around;
        height:50%;
        border:1px solid black
    }
    .price-container{
        display:flex;
        flex-flow:row wrap;
        justify-content: space-around;
        align-items: space-around;
        height:50%
    }
    .commodity-small{
        width:20px;
        height:20px;
    }
    .row {
        display: flex;
        flex-flow:row nowrap
    }
</style>