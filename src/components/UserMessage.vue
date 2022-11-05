<template>
    <div>
        <div>{{message}}</div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    export default {
        name: "UserMessage",
        components:{
            
        },
        computed: {
            ...mapState(["message"]),
        },
        methods:{

        }
    }
</script>

<style scoped>

</style>