<template>
    <div class = "ui-test">
        <PlayerStats></PlayerStats>
        <PPCard/>
        <AuctionUI v-if="game.auction"/>
        <div v-for="(message,messageIndex) in game.actionFeed" :key="messageIndex"> {{message}}</div> 
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
    .ui-test{
        display:flex;
        flex-flow:row  nowrap;
        justify-content: space-between;
    }
</style>