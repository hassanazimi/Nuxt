import Vuex from 'vuex'
import data from '@/api/data.json'
import users from '@/api/users.json'
import { SET_POSTS, SET_TOKEN, REGISTER, CLEAR_TOKEN } from './types'

/**
 * Classic Mode
 *
 * 1. You dispatch an action
 * 2. You commit to mutation inside actions
 */

export default () => {
  return new Vuex.Store({
    // DTATA
    state: {
      loadedPosts: [],
      posts: [],
      token: null, // cookie || localStorage
    },

    // UPDATE THE STATE:
    mutations: {
      // 3. update the state
      [SET_POSTS](state, posts) {
        state.loadedPosts = posts
      },

      [SET_TOKEN](state, token) {
        // JWT:
        // 1. send the credentials to the server
        // 2. server checks if they are OK
        // 3. if OK then server gives you a token (if not OK then server gives you an error which you need to show)
        // 4. you save the token in the `localStorage`
        // 5. make a middleware which send the stored token for every request.
        // 6. if middleware token === your `localStorage` token then you have access if not then don't.
        state.token = token
      },

      [REGISTER](state, credentials) {
        console.log('Registering', credentials)
      },

      [CLEAR_TOKEN](state) {
        state.token = null
        this.$cookies.remove('jwt')
        if (process.client) {
          localStorage.removeItem('token')
        }
      },
    },

    // COMMIT TO MUTATIONS:
    actions: {
      nuxtServerInit(vuexContext, context) {
        // process
        // context.req
        // context.res
        return new Promise((resolve) => {
          setTimeout(() => {
            vuexContext.commit(SET_POSTS, data)
            resolve()
          }, 2000)
        })
      },

      // 2. commit to mutaitin getPosts
      async setPosts({ commit }, posts) {
        await commit(SET_POSTS, posts)
      },

      async register({ commit }, credentials) {
        await commit(REGISTER, credentials)
      },

      async login(context, credentials) {
        // AXIOS CALL
        const user = users[0]
        const username = user.username
        const password = user.password

        if (
          credentials.username === username &&
          credentials.password === password
        ) {
          await context.commit(SET_TOKEN, user.token)
          if (process.client) {
            await localStorage.setItem('token', user.token)
          }
          await this.$cookies.set('jwt', user.token)
        }
      },

      async initAuth({ commit }, request) {
        let token
        if (request) {
          if (!request.headers.cookie) {
            return
          }
          const jwt = request.headers.cookie
            .split(';')
            .find((c) => c.trim().startsWith('jwt='))
          if (!jwt) {
            return
          }
          token = jwt.split('=')[1]
        } else {
          if (process.client) {
            token = localStorage.getItem('token')
          }
          // NOTE: expiry date:
          if (!token /* || new Date() > expiryDate */) {
            return
          }
        }
        await commit(SET_TOKEN, token)
      },

      async logout({ commit }) {
        await commit(CLEAR_TOKEN)
      },
    },

    // GET THE STATE:
    getters: {
      // 4. make a getter
      loadedPosts(state) {
        return state.loadedPosts
      },

      isAuthenticated(state) {
        return state.token
      },
    },
  })
}
