<template>
    <div>
        <PPCard :v-for="card in cards" :card="cards"/>
    </div>
</template>

<script>
    import PPCard from './PPCard.vue';
    export default {
        name: "PP",
        components:{
            PPCard
        },
        props: {
            cards:Array
        },
        data () {
            return {
                
            }
        }
    }
</script>

<style scoped>

</style>