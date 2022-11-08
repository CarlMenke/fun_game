<template>
    <div>
        <h2 v-if="message">{{message}}</h2>
        <div v-if="game"> 
            <div v-if="game.messageFeed.length >= 2" class="message">
                {{game.messageFeed[game.messageFeed.length-2]}}
            </div>
            <div v-if="game.messageFeed.length  >= 1" class="message">
                {{game.messageFeed[game.messageFeed.length-1]}}
            </div>
        </div> 
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    export default {
        name: "UserMessage",
        components:{
            
        },
        computed: {
            ...mapState(["message", "game"]),
        },
        methods:{

        }
    }
</script>

<style scoped>

</style>