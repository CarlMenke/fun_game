<template>
    <div class="stats-container">
        <div class="name-money">
            <div class="money">{{player.money}}</div>
            <div class="name">{{player.name}}</div>
        </div>
        <div class="commodies-railroads">
            <div class="commodies">
                <div v-for="type in player.commodies" :key="type">
                    <img v-for="commodity in type" :src="commodity.imageLink" :key="commodity.name"/>
                </div>
            </div>
            <div class="railroads">
                <img v-for="railroad in player.railroads" :src="railroad.imageLink" :key="railroad.name"/>
            </div>
        </div>
        <div class="buildings-towns">
            <div class="buildings">
                <img v-for="building in player.buildings" :src="building.imageLink" :key="building.name"/>
            </div>
            <div class="towns">
                <img v-for="town in player.towns" :src="town.imageLink" :key="town.imageLink"/>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "PlayerStats",
    data (){
        return {

        }
    }
}
</script>

<style>
    .stats-container{
        display:flex;
        flex-flow:column nowrap;
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
</style>