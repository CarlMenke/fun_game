import Vuex from "vuex"

export default Vuex.createStore({
  state () {
    return {
      game: null,
      name: '',
      player: {},
      socket: {},
      gameCanStart: false,
      message:null,
      gameRunning: false
    }
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
    },
    updateGameCanStart(state, payload){
      state.gameCanStart = payload
    },
    updateMessage(state, payload) {
      state.message = payload
    },
    updateGameRunning(state, payload){
      state.gameRunning = payload
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
    },
    getMessage:(state) => () => {
      return state.message
    },
    getGameRunning: (state) => () => {
      return state.gameRunning
    }
  }
})