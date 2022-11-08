<template>
    <div class = "ui-test">
        <PlayerStats></PlayerStats>
        <PPCard/>
        <AuctionUI v-if="game.auction"/>
    </div>
</template>

<script>
    import PlayerStats from './PlayerStats.vue';
    import PPCard from './PPCard.vue';
    import AuctionUI from './AuctionUI.vue';
    import { mapState } from 'vuex'
    export default {
        name: "UI",
        components:{
            PlayerStats,
            PPCard,
            AuctionUI
        },
        computed:{
            ...mapState(["player", "game"])
        }
    }
</script>

<style >
    .messagefeed-container{
        display:flex;
        flex-flow:column nowrap; 
    }
    .ui-test{
        display:flex;
        flex-flow:row  nowrap;
        justify-content: space-between;
    }
    .message{
        margin:5px
    }
</style>