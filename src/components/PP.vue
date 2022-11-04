<template>
    <div>
        <PPCard v-for="(card,index) in player.productionCards" :card="card" :key="index"/>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import PPCard from './PPCard.vue';
    export default {
        name: "PP",
        components:{
            PPCard
        },
        data () {
            return {
                
            }
        },
        computed: {
            ...mapState(["player"])
        }
    }
</script>

<style scoped>

</style>