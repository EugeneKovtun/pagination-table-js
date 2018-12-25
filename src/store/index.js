import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

import data from '../data'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    posts: []
  },
  mutations: {
    set(state, payload){
      state.posts = payload
    },
    editPost(state, payload){
      console.log(payload)

      let id = payload[1]
      for(let key in state.posts) {
        if(state.posts[key][id] == payload[id]){
          delete payload[1]
          state.posts[key] = payload
        }
      }
    }
  },
  actions: {
    getNotes({ commit }) {
      commit('set', data)
    },
    async getNotesFromJson({commit}, a) {
      await axios(a)
        .then(response => {
          commit('set', response.data)
        })
        .catch(error => {
          console.log(error);
        });
    }
  },
  getters: {
    getAd(state) {
      return state.posts
    }
  }
})
