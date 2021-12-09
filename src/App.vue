<template>
  <div id="app">
    <NavBar />
    <LandingPage />
    <ListBoard />
    <ListBoardMobile />
    <KeyboardMobile />
    <footer class="footer">
      <div class="footer-container">
        <div>Released 2021 by Shiaohan & 阿柳 ©</div>
      </div>
    </footer>
    <Map />
  </div>
</template>

<script>
import Map from "./pages/map.vue";
import NavBar from "./components/navbar.vue";
import LandingPage from "./pages/landing-page-m.vue";
import ListBoard from "./components/list-board.vue";
import ListBoardMobile from "./components/list-board-m.vue";
import KeyboardMobile from "./components/key-board-m.vue";

export default {
  name: "App",
  components: {
    Map,
    NavBar,
    LandingPage,
    ListBoard,
    ListBoardMobile,
    KeyboardMobile
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .footer {
    @include flex-row-center-center;
    width: 100%;
    height: $footer-m-h;
    position: fixed;
    left: 0;
    bottom: 0;
    background-color: $primary-300;
    z-index: $footer;
    &-container {
      @include flex-row-center-center;
      @include font-overline(500);
      color: $grey-100;
      width: 70%;
    }

    @include screen-up {
      height: $footer-h;
      &-container {
        @include font-content(500);
        width: 50%;
      }
    }
  }
</style>
