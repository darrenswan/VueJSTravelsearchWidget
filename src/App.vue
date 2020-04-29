<template>
  <v-app id="travelsearchApp">
    <v-content>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
#travelsearchApp {
  font-family: Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #222;
  margin: 5px;
  text-align: left;
  position: static;
}
</style>
