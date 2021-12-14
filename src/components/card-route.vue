<template>
  <div class="card-route" @click="goRuteDetail">
    <div class="card-route-msg">
      <div class="left-block">
        <div class="bus-number">{{ data.RouteName.Zh_tw }}</div>
      </div>
      <div class="right-block">
        <div class="city-tag" v-if="isCB">{{ cityZh }}</div>
        <i class="fas fa-angle-right"></i>
      </div>
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
import citysHash from "../json/cityshash.json";

export default {
  props: ['data'],
  computed: {
    ...mapGetters(['isCB']),
    cityZh() {
      return citysHash[this.data.City].cityName;
    }
  },
  methods: {
    goRuteDetail() {
      const { RouteName, DepartureStopNameZh, DestinationStopNameZh } = this.data;
      const targetRoute = {
        routeName: RouteName.Zh_tw,
        departureStop: DepartureStopNameZh,
        destinationStop: DestinationStopNameZh
      }

      this.$store.dispatch("map/removeOtherLayers");
      this.$store.dispatch("getRouteDetail", targetRoute);
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .card-route {
    width: 100%;
    padding: 1rem 6%;
    background-color: $grey-100;
    border-radius: $normal-bora;
    margin-bottom: 1.2rem;
    @include flex-column-center-center;
    &-msg {
      @include flex-row-space-between-center;
      width: 100%;
      .left-block {
        @include flex-row-center-center;
        .bus-number {
          @include font-h5(bold);
          @include ellipsis-text;
          max-width: 55vw;
          color: $grey-600;
          margin-right: .5rem;
        }
      }
      .right-block {
        @include flex-row-center-center;
        font-size: 1.125rem;
        color: $grey-500;
        cursor: pointer;
        .city-tag {
          @include btn(1.5em);
          @include btn-filled($primary-400);
          @include font-overline(bold);
          padding: .5em 1em;
          margin-right: .7rem;
        }
      }
    }
    &-content {
      @include flex-row-space-between-center;
      @include font-button(500);
      width: 100%;
      color: $grey-500;
      margin-top: .5rem;
      .line {
        flex-grow: 1;
        border-top: 1px solid #767676;
        margin: 0 .8rem;
      }
    }
  }

  @include screen-up {
    .card-route {
      border-radius: 0;
      border-bottom: 1px solid $grey-300;
      padding: 2rem 0;
      margin: 0;
      &-msg {
        .left-block {
          .bus-number {
            @include font-h4(bold);
            max-width: 17rem;
          }
        }
        .right-block {
          .city-tag {
            @include font-caption(bold);
          }
          font-size: 1.25rem;
        }
      }
    }
  }

</style>