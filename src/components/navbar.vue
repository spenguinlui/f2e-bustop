<template>
  <div>
    <nav>
      <div class="nav-list-block-m" @click="navBarPopUp = !navBarPopUp"><i class="fas fa-bars"></i></div>
      <div class="nav-brand"><img src="../assets/images/logo-g.svg" alt="LOGO 圖片"></div>
      <div class="nav-list-block">
        <div class="nav-list-item" :class="{ active: targetType === 'city-bus'}" @click="toggleCityBus">找公車<i class="fas fa-bus-alt"></i></div>
        <div class="nav-list-item" :class="{ active: targetType === 'inter-city-bus'}" @click="toggleInterCityBus">找客運<i class="fas fa-road"></i></div>
        <div class="nav-list-item" :class="{ active: targetType === 'bike'}" @click="toggleBike">找單車<i class="fas fa-bicycle"></i></div>
        <div class="nav-list-item disabled">轉乘資訊<i class="fas fa-subway"></i></div>
      </div>
    </nav>
    <div class="nav-popup" :class="{ show: navBarPopUp}">
      <div class="nav-popup-close" @click="navBarPopUp = !navBarPopUp"><i class="fas fa-times"></i></div>
      <div class="nav-popup-list">
        <div class="nav-popup-item" @click="toggleCityBus"><i class="fas fa-bus-alt"></i>找公車</div>
        <div class="nav-popup-item" @click="toggleInterCityBus"><i class="fas fa-road"></i>找客運</div>
        <div class="nav-popup-item" @click="toggleBike"><i class="fas fa-bicycle"></i>找單車</div>
        <div class="nav-popup-item disabled"><i class="fas fa-subway"></i>轉乘資訊</div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      navBarPopUp: false,
      targetType: 'city-bus'
    }
  },
  methods: {
    toggleCityBus() {
      this.navBarPopUp = false;
      this.targetType = 'city-bus';
      console.log("找公車")
    },
    toggleInterCityBus() {
      this.navBarPopUp = false;
      this.targetType = 'inter-city-bus';
      console.log("找客運")
    },
    toggleBike() {
      this.navBarPopUp = false;
      this.targetType = 'bike';
      console.log("找單車")
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  nav {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: $nav-bar-m-h;
    background: $grey-100;
    @include flex-row-center-center;
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
    transition: all .5s ease;
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
        width: 100%;
        padding: 28px 0;
        color: $primary-500;
        &:not(:last-child) {
          border-bottom: 2px solid $primary-300;
        }
        > svg {
          margin-right: $option-ma;
        }
        &.disabled {
          color: $primary-300;
        }
      }
    }
  }

  @include screen-up {
    nav {
      height: $nav-bar-h;
      padding: 20px 36px;
      @include flex-row-space-between-center;
      .nav-list-block-m {
        display: none;
      }
      .nav-list-block {
        @include flex-row-space-between-center;
        .nav-list-item {
          @include btn;
          @include btn-outline-color($primary-500, $grey-100, $primary-500);
          &.active {
            border: 3px solid $primary-300;
          }
          border-radius: 63px;
          padding: $btn-nav-p;
          > svg {
            margin-left: $tag-ma;
          }
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