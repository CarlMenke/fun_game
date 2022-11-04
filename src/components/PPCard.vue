<template>
    <div class="ppcard">
        <div class="production-container">
            <img class="commodity-small" v-for="(commodity, index) in card.production" :src="commodity.imageLink" :key="index"/>
        </div>
        <div class="price-container">
            <img class="commodity-small" v-for="(commodity, index) in card.price" :src="commodity.imageLink" :key="index" />
        </div>
    </div>
</template>

<script>
export default {
    name: "PPCard",
    props:{
        card:Object
    },
}
</script>

<style>
    .ppcard{
        width:12vw;
        height:25vh;
        border:1px solid black; 
        margin:5px;
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
    .commodity-small{
        width:20px;
        height:20px;
    }
</style>