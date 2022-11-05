<template>
    <div class = "ui-test">
        <form v-if="player.currBidder"  @submit="handleAuctionRound">
            <input v-model="bidValueInput" placeholder="Bid Value..."/>
            <button type="submit">Bid</button>
            <button @click="handleDropOutAuction">Out</button>
        </form>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    import { ref } from 'vue'
    const bidValueInput = ref('')
    export default {
        name: "AuctionUI",
        components:{
            
        },
        data () {
            return {
                bidValueInput:bidValueInput
            }
        },
        computed:{
            ...mapState(["game", "player", "socket"]),
            ...mapGetters(["getGame", "getSocket"])
        },
        methods:{
            handleAuctionRound(e){
                e.preventDefault()
                let game = this.getGame()
                if(parseInt(this.bidValueInput) <= game.players[game.turnIndex].money){
                    const data ={
                        game : game,
                        newBid : parseInt(this.bidValueInput)
                    }
                    this.getSocket().emit("auctionRound", data)
                }else{
                    this.updateMessage("Invalidn Bid")
                }
            }
        }
    }
</script>

<style >
    .ui-test{
        display:flex;
        flex-flow:row  nowrap;
        justify-content: space-between;
    }
</style>