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
    <MobileOrientation v-if="isHorizontal"/>
  </div>
</template>

<script>
import Map from "./pages/map.vue";
import NavBar from "./components/navbar.vue";
import LandingPage from "./pages/landing-page-m.vue";
import ListBoard from "./components/list-board.vue";
import ListBoardMobile from "./components/list-board-m.vue";
import KeyboardMobile from "./components/key-board-m.vue";
import MobileOrientation from "./pages/mobile-orientation.vue";

export default {
  name: "App",
  data() {
    return {
      isHorizontal: false
    }
  },
  components: {
    Map,
    NavBar,
    LandingPage,
    ListBoard,
    ListBoardMobile,
    KeyboardMobile,
    MobileOrientation
  },
  methods: {
    // 手機模式是否橫放
    orientationchange() {
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;
      if (width < height) {
        this.isHorizontal = true;
      } else {
        this.isHorizontal = false;
      }
    },
    // 得到瀏覽器實際 vh 高度 (扣掉手機瀏覽器 header、nav)
    getRealVH() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
  },
  created() {
    this.getRealVH();
  },
  mounted() {
    window.addEventListener("orientationchange", this.orientationchange, false);
  },
  beforeDestroyed(){
    window.removeEventListener("orientationchange", this.orientationchange, false);
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .footer {
    @include flex-row-center-center;
    @include heightvh($footer-m-h);
    width: 100%;
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
