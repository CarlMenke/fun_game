import Vuex from "vuex"

export default Vuex.createStore({
  state () {
    return {
      game: null,
      name: '',
      player: {},
      socket: {}
    }
  },
  actions: {

  },
  mutations: {
    updateGame(state, payload){
      state.game = payload
    },
    updateName(state, payload){
      state.name = payload
    },
    updatePlayer(state, payload){
      state.player = payload
    },
    updateSocket(state, payload){
      state.socket = payload
    }
  },
  getters: {
    getGame: (state) => () => {
      return state.game
    },
    getPlayer: (state) => () => {
      return state.player
    },
    getSocket: (state) => () => {
      return state.socket
    }
  }
})