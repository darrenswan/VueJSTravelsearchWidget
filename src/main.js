import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

var apptoken = ''
var widgetid = ''
var selectedCurrency = ''
Vue.prototype.$apptoken = function() { return apptoken; }
Vue.prototype.$widgetid = function() { return widgetid; }
Vue.prototype.$selectedCurrency = function() { return selectedCurrency; }

//new Vue({
//  router,
//  vuetify,
//  el: 'travelbooking',
//  render(h) {
//    return h(App, {
//      props: {
//        apptoken: this.$el.attributes.apptoken && this.$el.attributes.apptoken.value.length >= 38 && this.$el.attributes.apptoken.value.indexOf(':') > 1 ? this.$el.attributes.apptoken.value : '',
//        widgetid: this.$el.attributes.widgetid && this.$el.attributes.widgetid.value.length >= 1 ? this.$el.attributes.widgetid.value : ''
//      }
//    })
//  }
//})

new Vue({
  router,
  vuetify,
  beforeMount() {
    apptoken = this.$el.attributes.apptoken && this.$el.attributes.apptoken.value.length >= 38 && this.$el.attributes.apptoken.value.indexOf(':') > 1 ? this.$el.attributes.apptoken.value : ''
    widgetid = this.$el.attributes.widgetid && this.$el.attributes.widgetid.value.length >= 1 ? this.$el.attributes.widgetid.value : ''
    selectedCurrency = this.$el.attributes.currency && this.$el.attributes.currency.value.length == 3 ? this.$el.attributes.currency.value : 'GBP'
  },
  render: h => h(App)
}).$mount('travelbooking')
