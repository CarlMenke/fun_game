import Vuex from 'vuex'
import Vue from 'vue'
import VueNativeSock from 'vue-native-websocket'
import store from './store'

Vue.use(VueNativeSock, 'ws://localhost:9090', {store:store, format:json, connectManually:true})
Vue.use(Vuex)

const vm = new Vue() 
vm.$connect()
vm.$on.$connect(console.log('connected'))

export default new Vuex.Store({
    state:{
        socket: {
            isConnected: false,
            message: '',
            reconnectError:false
        }
    },
    mutations:{
        SOCKET_ONOPEN (state, event)  {
          Vue.prototype.$socket = event.currentTarget
          state.socket.isConnected = true
        },
        SOCKET_ONCLOSE (state, event)  {
          state.socket.isConnected = false
        },
        SOCKET_ONERROR (state, event)  {
          console.error(state, event)
        },
        // default handler called for all methods
        SOCKET_ONMESSAGE (state, message)  {
          state.socket.message = message
        },
        // mutations for reconnect methods
        SOCKET_RECONNECT(state, count) {
          console.info(state, count)
        },
        SOCKET_RECONNECT_ERROR(state) {
          state.socket.reconnectError = true;
        },
      },
      actions : {
        sendMessage( message ) {
            console.log(message)
        }
      }
})