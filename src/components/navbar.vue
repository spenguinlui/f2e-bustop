<template>
  <nav>
    <section class="nav">
      <button type="button" class="nav-list-m" @click="navBarPopUp = !navBarPopUp"><i class="fas fa-bars"></i></button>
      <div class="nav-brand" @click="checkLandingPage"><img src="../assets/images/logo-g.svg" alt="LOGO 圖片"></div>
      <ul class="nav-list">
        <li class="nav-list-item" :class="{ active: isCB }" @click="toggleCityBus">找公車<i class="fas fa-bus-alt"></i></li>
        <li class="nav-list-item" :class="{ active: isICB }" @click="toggleInterCityBus">找客運<i class="fas fa-road"></i></li>
        <li class="nav-list-item" :class="{ active: isBike }" @click="toggleBike">找單車<i class="fas fa-bicycle"></i></li>
        <li class="nav-list-item disabled">轉乘資訊<i class="fas fa-subway"></i></li>
      </ul>
      <button type="button" class="bus-goback"
        v-show="isRouteDetail && !isBike && !landingPageShow"
        @click="goBackRouteList"
      ><i class="fas fa-angle-left"></i></button>
    </section>
    <section class="nav-popup" :class="{ show: navBarPopUp }">
      <button type="button" class="nav-popup-close" @click="navBarPopUp = !navBarPopUp"><i class="fas fa-times"></i></button>
      <ul class="nav-popup-list">
        <li class="nav-popup-list-item" :class="{ active: isCB }" @click="toggleCityBus"><i class="fas fa-bus-alt"></i>找公車</li>
        <li class="nav-popup-list-item" :class="{ active: isICB }" @click="toggleInterCityBus"><i class="fas fa-road"></i>找客運</li>
        <li class="nav-popup-list-item" :class="{ active: isBike }" @click="toggleBike"><i class="fas fa-bicycle"></i>找單車</li>
        <li class="nav-popup-list-item disabled"><i class="fas fa-subway"></i>轉乘資訊</li>
      </ul>
    </section>
  </nav>
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
    ...mapGetters(['landingPageShow', 'isCB', 'isICB', 'isBike', 'isRouteDetail', 'isDetailContent'])
  },
  methods: {
    checkLandingPage() {
      this.$store.dispatch("map/removeOtherLayers");
      this.$store.commit("INIT_TARGET_MODE");
      this.$store.commit("TOGGLE_LANDING_APGE", true);
      this.$store.dispatch("map/focusCurrentPosition");
      this.$store.dispatch("updateTargetData");
    },
    toggleCityBus() {
      this.toggleMethod();
      this.$store.dispatch("checkOutTargetType", "CB");
    },
    toggleInterCityBus() {
      this.toggleMethod();
      this.$store.dispatch("checkOutTargetType", "ICB");
    },
    toggleBike() {
      this.toggleMethod();
      this.$store.dispatch("checkOutTargetType", "Bike");
    },
    toggleMethod() {
      this.navBarPopUp = false;
      this.$store.commit("INIT_TARGET_MODE");
      this.$store.dispatch("map/removeOtherLayers");
      this.$store.dispatch("map/focusCurrentPosition");
    },
    goBackRouteList() {
      if (this.isDetailContent) {
        this.$store.commit("CHECK_OUT_ROUTE_INFO", false);
      } else {
        this.$store.commit("CLOSE_ROUTE_DETAIL_LIST");
        this.$store.dispatch("map/focusCurrentPosition");
        this.$store.dispatch("updateTargetData");
      }
    },
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .nav {
    @include flex-row-center-center;
    @include posi(f);
    $padding: .8rem 1.5rem;
    width: 100vw;
    $nav-bar-m-vh: calc(var(--vh, 1vh) * #{$nav-bar-m-h});
    height: #{$nav-bar-m-h}vh;
    height: $nav-bar-m-vh;
    background: $grey-100;
    padding: $padding;
    z-index: $nav-bar;
    &-list-m {
      @include flex-row-center-center;
      @include posi(a);
      width: #{$nav-bar-m-h}vh;
      width: $nav-bar-m-vh;
      height: #{$nav-bar-m-h}vh;
      height: $nav-bar-m-vh;
      font-size: 3.5vh;
      color: $grey-500;
    }
    &-brand {
      height: 100%;
      cursor: pointer;
      > img {
        width: 100%;
        height: 100%;
        vertical-align: middle;
      }
    }
    &-list {
      display: none;
    }
    .bus-goback {
      @include flex-row-center-center;
      @include btn($cycle-bora);
      $btn-offset: 1rem;
      $btn-size: 2em;

      position: absolute;
      top: calc(#{$nav-bar-m-h}vh + #{$btn-offset});
      left: $btn-offset;
      width: $btn-size;
      height: $btn-size;
      box-shadow: 3px 3px 8px rgba(154, 154, 154, 0.25);
      background-color: $grey-100;
      color: $grey-500;
    }
  }
  .nav-popup {
    @include flex-row-center-baseline;
    @include posi(a);
    @include transi;
    $pop-up-w: 90vw;

    left: -1 * $pop-up-w;
    width: $pop-up-w;
    height: 100%;
    background-color: $primary-200;
    z-index: $nav-popup;
    &.show {
      left: 0;
    }
    &-close {
      @include posi(a);
      $close-size: 1.5rem;
      padding: $close-size;
      font-size: $close-size;
      color: $primary-500;
    }
    &-list {
      @include flex-column-center-baseline;
      @include flex-col(8);
      margin-top: 20%;
      &-item {
        @include font-h4(bold);
        @include icon-m($option-ma);
        width: 100%;
        padding: 1.75rem 0;
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
    .nav {
      @include flex-row-space-between-center;
      height: $nav-bar-h;
      padding: 1.25rem 2.25rem;
      &-list-m {
        display: none;
      }
      &-list {
        @include flex-row-space-between-center;
        &-item {
          @include btn;
          @include btn-outline-color($primary-500, $grey-100, $primary-500);
          @include icon-m($tag-ma, l);
          border-radius: $oval-bora;
          padding: .6rem 1.6rem;
          &.active {
            border: 3px solid $primary-300;
          }
          &:not(:last-child) {
            margin-right: $nav-ma;
          }
        }
      }
      .bus-goback {
        display: none;
      }
    }
    .nav-popup {
      display: none;
    }
  }

</style>