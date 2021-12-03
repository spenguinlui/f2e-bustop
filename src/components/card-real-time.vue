<template>
  <div class="real-time-block">
    <div class="time-btn"
      :class="{
        disable: data.StopStatus != 0 || !data.EstimateTime,
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
</template>

<script>

export default {
  props: ['data']
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .real-time-block {
    @include flex-row-space-between-center;
    width: 100%;
    padding: 8px 16px;
    .time-btn {
      @include btn;
      @include btn-outline(primary);
      @include font-caption(bold);
      width: 73px;
      padding: 8px 11px;
      margin-right: 12px;
      &.disable {
        @include btn-outline(disabled);
      }
      &.colser {
        @include btn-outline(alert);
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

</style>