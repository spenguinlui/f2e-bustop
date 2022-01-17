<template>
  <div class="route-detail">
    <section class="route-detail-block">
      <h2 class="route-detail-title">起迄站</h2>
      <p>{{ detail.DepartureStopNameZh }}—{{ detail.DestinationStopNameZh }}</p>
    </section>
    <section class="route-detail-block">
      <h2 class="route-detail-title">收費方式</h2>
      <p>{{ detail.TicketPriceDescriptionZh }}</p>
      <h3 class="route-detail-subtitle">緩衝區</h3>
      <p>{{ detail.FareBufferZoneDescriptionZh }}</p>
    </section>
    <template v-if="detail.Schedule">
      <section class="route-detail-block">
        <h2 class="route-detail-title">發車時間</h2>
        <h3 class="route-detail-subtitle">平日</h3>
        <p>{{ detail.Schedule.FirstBusTime }}-{{ detail.Schedule.LastBusTime }}</p>
        <h3 class="route-detail-subtitle">假日</h3>
        <p>{{ detail.Schedule.HolidayFirstBusTime }}-{{ detail.Schedule.HolidayLastBusTime }}</p>
      </section>
      <!-- <section class="route-detail-block">
        <h2 class="route-detail-title">發車間距</h2>
        <h3 class="route-detail-subtitle">平日</h3>
        <p>05:00-06:00 每30分一班</p>
        <h3 class="route-detail-subtitle">平日</h3>
        <p>05:00-06:00 每30分一班</p>
      </section> -->
    </template>
    <section class="route-detail-block">
      <div class="route-detail-block-sub" v-for="operator in detail.Operators" :key="operator.OperatorID">
        <h2 class="route-detail-title">業者資訊</h2>
        <h3 class="route-detail-title-2">{{ operator.OperatorName.Zh_tw }}</h3>
        <h4 class="route-detail-subtitle">電話</h4>
        <p class="route-detail-underline">{{ operator.OperatorPhone }}</p>
        <h4 class="route-detail-subtitle">網站</h4>
        <p class="route-detail-underline">{{ operator.OperatorUrl }}</p>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  props: ['detail']
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .route-detail {
    @include font-content;
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 1.5rem 1rem;
    color: $grey-500;
    &-block {
      padding-bottom: .5rem;
      &-sub {
        padding-bottom: .5rem;
      }
    }
    &-title {
      @include font-button(bold);
      width: fit-content;
      background-color: $primary-200;
      color: $primary-500;
      padding: .3em;
    }
    &-title-2 {
      @include font-content(700);
    }
    &-subtitle {
      @include font-button(700);
    }
    &-underline {
      border-bottom: 4px solid $primary-200;
    }
    h2, h3, h4 {
      padding: .3em 0;
    }
  }

</style>