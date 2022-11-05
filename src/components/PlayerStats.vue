<template>
    <div v-if="player" class="stats-container">
        <div class="name-money">
            <div class="money margin">{{player.money}}</div>
            <div class="name margin">{{player.name}}</div>
        </div>
        <div class="commodies-railroads">
            <div class="commodies margin">
                Commodies:
                <div v-for="type in player.commodies" :key="type">
                    <img class="image" v-for="commodity in type" :src="require(`../../public/assets/commodies/${commodity.imageLink}`)" :key="commodity.name"/>
                </div>
            </div>
            <div class="railroads margin">
                RailRoads:
                <img class="image" v-for="railroad in player.railroads" :src="require(`../../public/assets/railroads/${railroad.imageLink}`)" :key="railroad.name"/>
            </div>
        </div>
        <div class="buildings-towns">
            <div class="buildings margin">
                Builddings:
                <img class="image" v-for="building in player.buildings" :src="require(`../../public/assets/buildings/${building.imageLink}`)" :key="building.name"/>
            </div>
            <div class="towns margin">
                towns:
                <img class="image" v-for="town in player.towns" :src="require(`../../public/assets/towns/${town.imageLink}`)" :key="town.imageLink"/>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState, mapGetters } from "vuex";
    export default {
        name: "PlayerStats",
        data (){
            return {

            }
        },
        computed: {
        ...mapState(["player"]),
        ...mapGetters(["getPlayer"])
        },
    }
</script>

<style>
    .stats-container{
        display:flex;
        flex-flow:column nowrap;
        background-color:darkgreen;
    }
    .name-money{
        display:flex;
        flex-flow:row nowrap;
    }
    .commodies-railroads{
        display:flex;
        flex-flow:row nowrap;
    }
    .buildings-towns{
        display:flex;
        flex-flow:row nowrap;
    }
    .margin{
        margin:10px;
        border:1px solid black;
    }
    .image{
        width:30px;
        height:50px;
        margin:4px;
        box-shadow: 2px 2px 2px 2px ;
    }
</style>