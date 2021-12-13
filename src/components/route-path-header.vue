<template>
  <div class="route-path-header">
    <div class="route-path-header-block">
      <div class="left-block"
        :class="{ active: isGoDirection }"
        @click="checkGoAndBackRoute(true)">往{{ targetRoute.destinationStop }}</div>
      <div class="right-block"
        :class="{ active: !isGoDirection }"
        @click="checkGoAndBackRoute(false)">往{{ targetRoute.departureStop }}</div>
    </div>
    <div class="route-path-header-prgress-bar">
      <div class="route-path-header-prgress-bar-fill" :style="`width: ${refreshTime * 20}%`"></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      refreshTime: 5
    }
  },
  computed: {
    ...mapGetters(['isGoDirection', 'targetRoute'])
  },
  methods: {
    checkGoAndBackRoute(toggle) {
      this.$store.commit("CHECK_OUT_ROUTE_DIRCTION", toggle);

      // 資料不變，但切換要顯示的資料
      this.$store.dispatch("map/removeOtherLayers");
      this.$store.dispatch("map/setBusStopDataOnMap");
      this.$store.dispatch("map/setBusRouteDataOnMap");
      this.$store.dispatch("map/setBusRealTimeOnMap");
    },
    refreshInterval() {
      return setInterval(() => {
        if (this.refreshTime <= 0) {
          this.$store.dispatch("refreshRouteDetail");
          this.refreshTime = 5;
        } else {
          this.refreshTime -- ;
        }
      }, 1000);
    }
  },
  created() {
    this.refreshInterval();
  },
  beforeDestroy() {
    clearInterval(this.refreshInterval);
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .route-path-header {
    @include flex-column-center-center;
    &-block {
      @include flex-row-center-center;
      @include font-button(bold);
      width: 100%;
      background-color: $primary-200;
      padding: .5rem 0;
      .left-block, .right-block {
        @include flex-row-center-center;
        @include flex-col(6);
        cursor: pointer;
        color: $grey-100;
        &.active {
          color: $primary-500;
        }
      }
      .right-block {
        border-left: 1px solid $grey-100;
      }
    }
    &-prgress-bar {
      width: 100%;
      height: 5px;
      &-fill {
        transition: all 1s linear;
        height: 100%;
        background-color: $primary-400;
        opacity: .6;
      }
    }
  }

  @include screen-up {
    .route-path-header {
      &-block {
        @include font-content(bold);
        padding: .75rem 0;
      }
    }
  }
</style>