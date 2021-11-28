<template>
  <div class="card-route-container">
    <div class="card-route-msg">
      <div class="left-block">
        <div class="bus-number">{{ data.RouteName.Zh_tw }}</div>
        <div class="city-tag" v-if="isCityBus">{{ data.City }}</div>
        <div class="near-stop" v-if="isCityBus"><i class="fas fa-map-marker-alt"></i>{{ data.DepartureStopNameZh }}</div>
      </div>
      <div class="right-block" @click="goRuteDetail('0')"><i class="fas fa-angle-right"></i></div>
    </div>
    <div class="card-route-content">
      <div class="star-stop">{{ data.DepartureStopNameZh }}</div>
      <div class="line"></div>
      <div class="end-stop">{{ data.DestinationStopNameZh }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: ['data'],
  computed: {
    ...mapGetters(['isCityBus', 'isInterCityBus'])
  },
  methods: {
    goRuteDetail(index) {
      if (this.isCityBus) {
        this.$store.dispatch("getRouteDetail", { busType: 'cityBus', index });
      } else {
        this.$store.dispatch("getRouteDetail", { busType: 'interCityBus', index });
      }
    }
  },
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .card-route-container {
    width: 100%;
    padding: 12px 20px;
    background-color: $grey-100;
    border-radius: $normal-bora;
    margin-bottom: 20px;
    @include flex-column-center-center;
    .card-route-msg {
      @include flex-row-space-between-center;
      width: 100%;
      .left-block {
        @include flex-row-center-center;
        .bus-number {
          @include font-h5(bold);
          color: $grey-600;
          margin-right: 8px;
        }
        .city-tag {
          @include btn(8px);
          @include btn-filled($primary-400);
          @include font-overline(bold);
          padding: 4px 6px;
          margin-right: 10px;
        }
        .near-stop {
          @include font-overline(500);
          @include icon-m(6px);
          color: $grey-500;
        }
      }
      .right-block {
        font-size: 18px;
        color: $grey-500;
        cursor: pointer;
      }
    }
    .card-route-content {
      @include flex-row-space-between-center;
      @include font-button(500);
      width: 100%;
      color: $grey-500;
      margin-top: 8px;
      .line {
        flex-grow: 1;
        border-top: 1px solid #767676;
        margin: 0 14px;
        position: relative;
        &::before {
          content: ".";
          position: absolute;
          left: -3px;
          font-size: 25px;
          top: -15.516px;
        }
        &::after {
          content: ".";
          position: absolute;
          right: -3px;
          font-size: 25px;
          top: -15.516px;
        }
      }
    }
  }

  @include screen-up {
    .card-route-container {
      border-radius: 0;
      border-bottom: 1px solid $grey-300;
      padding: 32px 0;
      margin: 0;
      .card-route-msg {
        .left-block {
          .bus-number {
            @include font-h4(bold);
          }
          .city-tag {
            @include font-caption(bold);
          }
          .near-stop {
            @include font-caption(500);
          }
        }
        .right-block {
          font-size: 20px;
        }
      }
      .card-route-content {

      }
    }
  }

</style>