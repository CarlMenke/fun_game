<template>
    <div>
        <div v-for="(card,cardIndex) in player?.productionCards" :key="cardIndex" class="ppcard">
            <div class="producIion-container">
                <img class="commodity-small" v-for="(commodity, commodityIndex) in card?.production" :src="commodity?.imageLink" :key="commodityIndex"/>
            </div>
            <div class="price-container">
                <img class="commodity-small" v-for="(commodity, commodityIndex) in card?.price" :src="commodity?.imageLink" :key="commodityIndex" />
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex"
export default {
    name: "PPCard",
    computed:{
        ...mapState(["player"])
    },
    mounted () {
        console.log(this.player)
    }
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