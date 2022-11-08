<template>
    <div class = "ui-test">
        <form v-if="player.currBidder"  @submit="handleAuctionRound">
            <input v-model="bidValueInput" placeholder="Bid Value..."/>
            <button type="submit">Bid</button>
            <button @click="handleDropOutAuction">Out</button>
            <div>Current Bid: {{game.bid}}</div>
        </form>
    </div>
</template>

<script>
    import { mapState, mapGetters, mapMutations } from 'vuex'
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
            ...mapState(["game", "player", "socket", "message"]),
            ...mapGetters(["getGame", "getSocket"])
        },
        methods:{
            ...mapMutations(["updateMessage"]),
            handleAuctionRound(e){
                e.preventDefault()
                let game = this.getGame()
                if(parseInt(this.bidValueInput) <= game.players[game.turnIndex].money){
                    game.payload = parseInt(this.bidValueInput)
                    game.action = "AUCTION_ROUND"
                    this.getSocket().emit("ACTION", game)
                    this.bidValueInput = ""
                }else{
                    this.updateMessage("Invalid Bid")
                }
            },
            handleDropOutAuction(e){
                e.preventDefault()
                let game = this.getGame()
                game.action = "AUCTION_OUT"
                game.messageFeed.push(`${game.players[game.auctionIndex].name} dropped out of the bid.`)
                this.getSocket().emit("ACTION", game)
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