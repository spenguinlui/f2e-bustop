<template>
  <div class="card-route-container" @click="goRuteDetail">
    <div class="card-route-msg">
      <div class="left-block">
        <div class="bus-number">{{ data.RouteName.Zh_tw }}</div>
        <div class="city-tag" v-if="isCB">{{ cityZh }}</div>
        <div class="near-stop" v-if="isCB"><i class="fas fa-map-marker-alt"></i>{{ data.DepartureStopNameZh }}</div>
      </div>
      <div class="right-block"><i class="fas fa-angle-right"></i></div>
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
    ...mapGetters(['isCB', 'isICB']),
    cityZh() {
      switch (this.data.City) {
        case "Taipei": return "臺北市"
        case "Keelung": return "基隆市"
        case "NewTaipei": return "新北市"
        case "Taoyuan": return "桃園市"
        case "Hsinchu": return "新竹市"
        case "HsinchuCounty": return "新竹縣"
        case "MiaoliCounty": return "苗栗縣"
        case "Taichung": return "臺中市"
        case "ChanghuaCounty": return "彰化縣"
        case "NantouCounty": return "南投縣"
        case "YunlinCounty": return "雲林縣"
        case "Chiayi": return "嘉義市"
        case "ChiayiCounty": return "嘉義縣"
        case "Tainan": return "臺南市"
        case "Kaohsiung": return "高雄市"
        case "PingtungCounty": return "屏東縣"
        case "YilanCounty": return "宜蘭縣"
        case "HualienCounty": return "花蓮縣"
        case "TaitungCounty": return "臺東縣"
        case "KinmenCounty": return "金門縣"
        case "PenghuCounty": return "澎湖縣"
        case "LienchiangCounty": return "連江縣"
        default: return this.data.City
      }
    }
  },
  methods: {
    goRuteDetail() {
      const dataType = this.isCB ? "CB" : "ICB";
      const { RouteName, DepartureStopNameZh, DestinationStopNameZh } = this.data;
      // 切換模式
      this.$store.commit("CHECK_OUTE_ROUTE_DETAIL", dataType);
      this.$store.commit("UPDATE_TARGET_ROUTE", {
        routeName: RouteName.Zh_tw,
        departureStop: DepartureStopNameZh,
        destinationStop: DestinationStopNameZh
      });
      // 改動資料
      this.$store.dispatch("map/removeOtherLayers");
      this.$store.dispatch("getRouteDetail", RouteName.Zh_tw);
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
          @include ellipsis-text;
          max-width: 150px;
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