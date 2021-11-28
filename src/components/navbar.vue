<template>
  <div>
    <nav>
      <div class="nav-list-block-m" @click="navBarPopUp = !navBarPopUp"><i class="fas fa-bars"></i></div>
      <div class="nav-brand" @click="checkLandingPage"><img src="../assets/images/logo-g.svg" alt="LOGO 圖片"></div>
      <div class="nav-list-block">
        <div class="nav-list-item" :class="{ active: targetMode.cityBus.currentMode }" @click="toggleCityBus">找公車<i class="fas fa-bus-alt"></i></div>
        <div class="nav-list-item" :class="{ active: targetMode.interCityBus.currentMode }" @click="toggleInterCityBus">找客運<i class="fas fa-road"></i></div>
        <div class="nav-list-item" :class="{ active: targetMode.bike.currentMode }" @click="toggleBike">找單車<i class="fas fa-bicycle"></i></div>
        <div class="nav-list-item disabled">轉乘資訊<i class="fas fa-subway"></i></div>
      </div>
    </nav>
    <div class="nav-popup" :class="{ show: navBarPopUp }">
      <div class="nav-popup-close" @click="navBarPopUp = !navBarPopUp"><i class="fas fa-times"></i></div>
      <div class="nav-popup-list">
        <div class="nav-popup-item" :class="{ active: targetMode.cityBus.currentMode }" @click="toggleCityBus"><i class="fas fa-bus-alt"></i>找公車</div>
        <div class="nav-popup-item" :class="{ active: targetMode.interCityBus.currentMode }" @click="toggleInterCityBus"><i class="fas fa-road"></i>找客運</div>
        <div class="nav-popup-item" :class="{ active: targetMode.bike.currentMode }" @click="toggleBike"><i class="fas fa-bicycle"></i>找單車</div>
        <div class="nav-popup-item disabled"><i class="fas fa-subway"></i>轉乘資訊</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      navBarPopUp: false
    }
  },
  computed: {
    ...mapGetters(['targetMode'])
  },
  methods: {
    checkLandingPage() {
      this.$store.dispatch("map/removeOtherLayers");
      this.$store.commit("TOGGLE_LANDING_APGE", true);
      this.$store.commit("INIT_TARGET_MODE");
    },
    toggleCityBus() {
      this.$store.dispatch("map/removeOtherLayers");
      this.$store.commit("TOGGLE_LANDING_APGE", false);
      this.navBarPopUp = false;
      this.$store.dispatch("updateTargetData", "cityBus");
    },
    toggleInterCityBus() {
      this.$store.dispatch("map/removeOtherLayers");
      this.$store.commit("TOGGLE_LANDING_APGE", false);
      this.navBarPopUp = false;
      this.$store.dispatch("updateTargetData", "interCityBus");
    },
    toggleBike() {
      this.$store.dispatch("map/removeOtherLayers");
      this.$store.commit("TOGGLE_LANDING_APGE", false);
      this.navBarPopUp = false;
      this.$store.dispatch("updateTargetData", "bike");
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  nav {
    @include flex-row-center-center;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: $nav-bar-m-h;
    background: $grey-100;
    padding: 14px 36px;
    .nav-list-block-m {
      font-size: $font-size-h5;
      position: absolute;
      left: 25px;
      top: 14px;
      color: $grey-500;
    }
    .nav-brand {
      height: 100%;
      > img {
        width: 100%;
        height: 100%;
        vertical-align: middle;
      }
    }
    .nav-list-block {
      display: none;
    }
  }
  .nav-popup {
    @include flex-row-center-baseline;
    width: 90vw;
    height: 100vh;
    background-color: $primary-200;
    position: absolute;
    top: 0;
    left: -90vw;
    z-index: $nav-popup;
    &.show {
      left: 0;
    }
    @include transi;
    .nav-popup-close {
      position: absolute;
      left: 24px;
      top: 24px;
      font-size: 24px;
      color: $primary-500;
    }
    .nav-popup-list {
      @include flex-column-center-baseline;
      @include flex-col(8);
      margin-top: 80px;
      .nav-popup-item {
        @include font-h4(bold);
        @include icon-m($option-ma);
        width: 100%;
        padding: 28px 0;
        color: $primary-500;
        &:not(:last-child) {
          border-bottom: 2px solid $primary-300;
        }
        &.disabled {
          color: $primary-300;
        }
        &.active {
          color: $grey-100;
        }
      }
    }
  }

  @include screen-up {
    nav {
      @include flex-row-space-between-center;
      height: $nav-bar-h;
      padding: 20px 36px;
      .nav-list-block-m {
        display: none;
      }
      .nav-list-block {
        @include flex-row-space-between-center;
        .nav-list-item {
          @include btn;
          @include btn-outline-color($primary-500, $grey-100, $primary-500);
          @include icon-m($tag-ma, l);
          &.active {
            border: 3px solid $primary-300;
          }
          border-radius: 63px;
          padding: $btn-nav-p;
          &:not(:last-child) {
            margin-right: $nav-ma;
          }
        }
      }
    }
  }
  @include screen-up {
    .nav-popup {
      display: none;
    }
  }

</style>