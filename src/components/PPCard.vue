<template>
    <div class="ppcard">
        <div class="production-container">
            <img v-for="commodity in card.production" :src="commodity.imageLink" :key="commodity.imageLink"/>
        </div>
        <div class="price-container">
            <img v-for="commodity in card.price" :src="commodity.imageLink" :key="commodity.imageLink" />
        </div>
    </div>
</template>

<script>
export default {
    name: "PPCard",
    props:{
        card:Object
    }
}
</script>

<style>
    .ppcard{
        width:12vw;
        height:25vh;
        position:relative
    }
    .production-container{
        display:flex;
        flex-flow:row wrap;
        justify-content: space-around;
        align-items: space-around;
        height:50%
    }
    .price-container{
        display:flex;
        flex-flow:row wrap;
        justify-content: space-around;
        align-items: space-around;
        height:50%
    }
</style>