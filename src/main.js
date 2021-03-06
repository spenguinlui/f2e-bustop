import Vue from 'vue';
import App from './App.vue';

import Vuex from 'vuex';
import { storeObject } from './store/index';

import 'leaflet/dist/leaflet.css';

import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';

Vue.use(Vuex);
const store = new Vuex.Store(storeObject);

Vue.config.productionTip = false;

Vue.prototype.$bus = new Vue();

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
