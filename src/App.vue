<template>
  <div id="app">
    <NavBar />
    <Map />
    <footer>
      <div class="footer-container">
        <div class="footer-left">Released 2021 ©</div>
        <div class="footer-right">問題回報</div>
      </div>
    </footer>
  </div>
</template>

<script>
import Map from './pages/map.vue';
import NavBar from './components/navbar.vue';

export default {
  name: 'App',
  components: {
    Map,
    NavBar
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
} */

  footer {
    width: 100vw;
    height: $footer-m-h;
    position: absolute;
    left: 0;
    bottom: 0;
    background-color: $primary-300;
    z-index: $footer;
    @include flex-row-center-center;
    .footer-container {
      @include flex-row-space-between-center;
      color: $grey-100;
      @include font-overline(500);
      width: 55%;
    }
    @include screen-up {
      height: $footer-h;
      .footer-container {
        @include font-content(500);
        width: 30%;
      }
    }
  }
</style>
