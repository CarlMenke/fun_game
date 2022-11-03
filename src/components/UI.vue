<template>
    <div >
        <PlayerStats :player="player"></PlayerStats>
        <PP :cards="player.productionCards"></PP>
    </div>
</template>

<script>
import PP from './PP.vue';
import PlayerStats from './PlayerStats.vue';
export default {
    name: "UI",
    components:{
        PP,
        PlayerStats
    },
    props:{
        player:Object
    }
}
</script>

<style scoped>

</style>