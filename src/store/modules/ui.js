

const state = {
    //key value pairs used for maintaing global state
}

const getters = {
    //functions used to get information from the state
}

const actions = {
    async fetchTodos({commit}) {
        const response = await axios.get('https://jsonplaceholder.typicode.com/todos')
        commit('setTodos', response.data)
    }
}

const mutations = {
    setTodos:(state, todos) => (state.todos = todos),
}

export default {
    state,
    getters,
    actions, 
    mutations
}