<template>
  <li>
    <div class="buffer-block" v-if="routeBuffer.bufferStartStop === data.StopName.Zh_tw">緩衝區</div>
    <section class="real-time-block">
      <div class="left-block">
        <p class="time-btn" :class="timeBtnClass">{{ timeBtnText }}</p>
        <p class="stop-name">{{ data.StopName.Zh_tw }}</p>
      </div>
      <div class="right-block">
        <p v-if="data.ClosestStop" class="stop-closest">最近</p>
        <p v-if="data.PlateNumb" class="bus-numb">{{ data.PlateNumb }}</p>
        <div class="sinal" :class="timeBtnClass"></div>
      </div>
    </section>
    <div class="buffer-block" v-if="routeBuffer.bufferEndStop === data.StopName.Zh_tw">緩衝區</div>
  </li>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: ['data'],
  computed: {
    ...mapGetters(['isCB', 'isICB', 'isGoDirection', 'targetRoute', 'busDataList', 'routeDataList']),
    routeBuffer() {
      let currentDataList = this.busDataList;
      const thisRoute = currentDataList.find(busData => busData.RouteName.Zh_tw === this.targetRoute.routeName);

      if (thisRoute && thisRoute.FareBufferZoneDescriptionZh) {
        const bufferStr = thisRoute.FareBufferZoneDescriptionZh;
        const bufferStrCenter = bufferStr.indexOf('－') <= 0 ? bufferStr.indexOf('-') : bufferStr.indexOf('－');
        const bufferStartStop = bufferStr.slice(0, bufferStrCenter);
        const bufferEndStop = bufferStr.slice(bufferStrCenter + 1, bufferStr.length);
        if (this.isGoDirection) {
          return { bufferStartStop: bufferStartStop, bufferEndStop: bufferEndStop }
        } else {
          return { bufferStartStop: bufferEndStop, bufferEndStop: bufferStartStop }
        }
      } else {
        return { bufferStartStop: '', bufferEndStop: '' }
      }
    },
    timeBtnClass() {
      const { EstimateTime, StopStatus } = this.data;
      if (EstimateTime !== undefined && EstimateTime < 300) {
        return "colser";
      } else if (StopStatus != 0) {
        return "disable";
      } else {
        return "";
      }
    },
    timeBtnText() {
      const { EstimateTime, IsLastBus } = this.data;
      if (EstimateTime !== undefined) {
        if (EstimateTime === 0) {
          return "進站中";
        } else {
          return EstimateTime > 180 ? `${Math.floor(EstimateTime / 60)} 分` : "即將到站";
        }
      } else {
        return IsLastBus ? "末班已過" : "尚未發車";
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .real-time-block {
    @include flex-row-space-between-center;
    width: 100%;
    padding: .5rem 0;
    .left-block {
      @include flex-row-center-center;
      max-width: 60%;
      flex-grow: 1;
      .time-btn {
        @include flex-row-center-center;
        @include font-caption(bold);
        border-radius: $normal-bora;
        min-width: 6.6em;
        padding: .7em 1em;
        margin-right: 3%;
        color: $primary-400;
        background-color: $grey-100;
        border: 1px solid $primary-300;
        &.disable {
          color: $grey-400;
          background-color: $grey-100;
          border: 1px solid $grey-300;
        }
        &.colser {
          color: $alert-400;
          background-color: $grey-100;
          border: 1px solid $alert-300;
        }
      }
      .stop-name {
        @include font-button(500);
        @include ellipsis-text;
        color: $grey-500;
        flex-grow: 1;
      }
    }
    .right-block {
      @include flex-row-center-center;
      .bus-numb, .stop-closest {
        @include font-overline(500);
        margin-right: 1rem;
        padding: .5em;
        border-radius: $normal-bora;
      }
      .bus-numb {
        background-color: $primary-400;
        color: $grey-100;
      }
      .stop-closest {
        border: 1px solid $primary-400;
        background-color: $grey-100;
        color: $primary-400;
      }
      .sinal {
        $sinal-size: 5px;
        width: $sinal-size;
        height: $sinal-size;
        border-radius: $cycle-bora;
        background-color: $primary-400;
        margin-right: calc(#{$sinal-size} / 2);
        box-shadow: 0px 0px 0px 2px lighten($primary-400, 30%);
        &.disable {
          background-color: $grey-400;
          box-shadow: 0px 0px 0px 2px lighten($grey-400, 30%);
        }
        &.colser {
          background-color: $alert-400;
          box-shadow: 0px 0px 0px 2px lighten($alert-400, 30%);
        }
      }
    }
  }
  .buffer-block {
    @include flex-row-center-center;
    @include font-caption;
    width: 100%;
    border-radius: $normal-bora;
    background-color: $primary-100;
    color: $primary-400;
    padding: .3em 0;
    margin: .5rem 0;
  }

  @include screen-up {
    .real-time-block {
      .time-btn {
        @include font-button(bold);
      }
      .stop-name {
        @include font-content(500);
      }
      .bus-numb {
        @include font-overline(500);
      }
    }
  }

</style>