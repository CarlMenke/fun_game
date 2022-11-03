import Vuex from "vuex"
import Vue from 'vue'
import ui from './modules/ui'

Vue.use(Vuex)

export default new Vuex.Store({
    modules:{
        ui
    }
})