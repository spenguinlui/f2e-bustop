<template>
  <div class="real-time-block">
    <div class="time-btn"
      :class="{
        disable: data.StopStatus != 0 && !data.EstimateTime,
        colser: data.EstimateTime < 300 }">
      {{ !data.EstimateTime ? data.IsLastBus ? '末班已過' : '尚未發車' : (data.EstimateTime > 180) ? `${Math.floor(data.EstimateTime / 60)} 分` : '即將到站' }}
    </div>
    <div class="stop-name">{{ data.StopName.Zh_tw }}</div>
    <div class="sinal"></div>
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
    .sinal {

    }
  }

</style>