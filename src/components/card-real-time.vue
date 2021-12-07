<template>
  <div>
    <div class="buffer-block" v-if="routeBuffer.bufferStartStop === data.StopName.Zh_tw">緩衝區</div>
    <div class="real-time-block">
      <div class="time-btn"
        :class="{
          disable: data.StopStatus != 0 && !data.EstimateTime,
          colser: data.EstimateTime < 300 }">
        {{ !data.EstimateTime ? (data.IsLastBus ? '末班已過' : '尚未發車') : (data.EstimateTime > 180) ? `${Math.floor(data.EstimateTime / 60)} 分` : '即將到站' }}
      </div>
      <div class="stop-name">{{ data.StopName.Zh_tw }}</div>
      <div v-if="data.PlateNumb" class="bus-numb">{{ data.PlateNumb }}</div>
      <div class="sinal" :class="{
        disable: data.StopStatus != 0 || !data.EstimateTime,
        colser: data.EstimateTime < 300 }">
      </div>
    </div>
    <div class="buffer-block" v-if="routeBuffer.bufferEndStop === data.StopName.Zh_tw">緩衝區</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

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
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .real-time-block {
    @include flex-row-space-between-center;
    width: 100%;
    padding: 8px 16px;
    .time-btn {
      @include flex-row-center-center;
      @include font-caption(bold);
      border-radius: $normal-bora;
      min-width: 73px;
      padding: 8px 11px;
      margin-right: 12px;
      color: $primary-400;
      background-color: $grey-100;
      border: 1px solid $primary-300;
      &.disable {
        color: $alert-400;
        background-color: $grey-100;
        border: 1px solid $alert-300;
      }
      &.colser {
        color: $grey-400;
        background-color: $grey-100;
        border: 1px solid $grey-300;
      }
    }
    .stop-name {
      @include font-button(500);
      color: $grey-500;
      flex-grow: 1;
    }
    .bus-numb {
      @include font-overline(500);
      margin-right: 0.5rem;
      padding: 4px;
      border-radius: 4px;
      background-color: $primary-400;
      color: $grey-100;
    }
    .sinal {
      width: 5px;
      height: 5px;
      border-radius: $cycle-bora;
      background-color: $primary-400;
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
  .buffer-block {
    @include flex-row-center-center;
    @include font-caption(500);
    width: 100%;
    border-radius: $normal-bora;
    background-color: $primary-100;
    color: $primary-400;
    padding: 2px 0;
    margin: 10px 0;
  }

  @include screen-up {
    .real-time-block {
      .time-btn {
        @include font-button(bold);
        min-width: 85px;
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