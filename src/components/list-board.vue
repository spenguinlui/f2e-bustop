<template>
  <!-- 公車&客運 手機版一開始不出現，第二層才出現 -->
  <div class="list-board-container"
    :class="{
      expanding: mobileExpanding,
      hide: isBike ? false : !isRouteDetail }
  ">
    <div @click="locateCurrentPosition" class="locate-icon"><i class="fas fa-crosshairs"></i></div>
    <div class="list-board-header"
      :class="{ route: isBike ? false : isRouteDetail }">

      <!-- 單車手機版出現 -->
      <div class="header-expand-btn expand-btn" :class="{ expanding: mobileExpanding }"
        v-show="isBike" @click="mobileExpanding = !mobileExpanding">
        <i class="fas fa-angle-up"></i>
      </div>

      <!-- 公車&客運 手機版出現，單車雙版本皆有 -->
      <SearchBar
        v-show="isBike ? true : !isRouteDetail"
        :class="{ bike: isBike }"/>

      <!-- 單車雙版本皆有 -->
      <div class="btn-filter"
        v-show="isBike" @click="sortBlockShow = !sortBlockShow">
        <div><i class="fas fa-sort-amount-down"></i>排序</div>
        <div class="filter-select-block" v-show="sortBlockShow">
          <div class="filter-select" @click.prevent.stop="sortBikeByDistace">距離較近</div>
          <div class="filter-select" @click.prevent.stop="sortBikeByRent">可借車數</div>
          <div class="filter-select" @click.prevent.stop="sortBikeByReturn">可還車數</div>
        </div>
      </div>

      <!-- 公車&客運 桌面版才出現 -->
      <div class="btn-filter"
        v-show="isCB && !isRouteDetail"
        @click="selectBlockShow = !selectBlockShow">
        <div><i class="fas fa-sort-amount-down"></i>篩選</div>
        <SelectCityBlock v-show="selectBlockShow"/>
      </div>

      <!-- 公車&客運 進入第二層細節才出現  -->
      <RouteHeader v-if="isBike ? false : isRouteDetail"
        :mobileExpand="mobileExpand" :mobileExpanding="mobileExpanding"/>
    </div>

    <!-- 公車&客運 進入第二層細節才出現 -->
    <RoutePathHeader v-if="isBike ? false : isRouteDetail"/>

    <!-- 公車&客運 桌面版一開始出現 -->
    <div class="searching-img-container"
      v-show="!isBike && busDataList.length === 0" >
      <img src="../assets/images/searching.png" alt="搜尋無結果圖片">
    </div>

    <!-- 公車&客運 桌面版出現 -->
    <div class="cards-container">
      <!-- 路線列表 -->
      <div class="cards" v-show="isBike ? false : !isRouteDetail">
        <template v-if="busDataList.length > 0">
          <CardRotue v-for="data in busDataList" :data="data" :key="data.RouteUID"/>
        </template>
      </div>

      <!-- 即時路況 -->
      <div class="cards" v-show="isBike ? false : isRouteDetail && isGoDirection">
        <CardRealTime v-for="(data, index) in routeGoDetailList" :data="data" :key="index"/>
      </div>
      <div class="cards" v-show="isBike ? false : isRouteDetail && !isGoDirection">
        <CardRealTime v-for="(data, index) in routeBackDetailList" :data="data" :key="index"/>
      </div>

      <!-- 單車站點 -->
      <div class="cards" v-show="isBike">
        <CardBike v-for="data in bikeDataList" :data="data" :key="data.StationUID"/>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import SelectCityBlock from "./select-city-block.vue";
import CardRotue from "./card-route.vue";
import CardRealTime from "./card-real-time.vue";
import CardBike from "./card-bike.vue";
import SearchBar from "./search-bar.vue";
import RouteHeader from "./route-header.vue";
import RoutePathHeader from "./route-path-header.vue";

export default {
  data() {
    return {
      keyword: "",
      selectBlockShow: false,
      sortBlockShow: false,
      mobileExpanding: false,
    }
  },
  computed: {
    ...mapGetters([
      'bikeDataList', 'busDataList', 'routeGoDetailList', 'routeBackDetailList',
      'isCB', 'isICB', 'isBike', 'isRouteDetail', 'isGoDirection'])
  },
  methods: {
    mobileExpand() {
      this.mobileExpanding = !this.mobileExpanding;
    },
    locateCurrentPosition() {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          const currentPosition = { latitude: position.coords.latitude, longitude: position.coords.longitude };
          this.$store.dispatch("getCurrentPostion", currentPosition);
          this.checkGoAndBackRoute(false);
        }, () => {
          window.alert("重新定位失敗");
        })
      } else {
        window.alert("重新定位失敗");
      }
    },
    sortBikeByDistace() {
      this.$store.commit("SORT_BY_DISTANCE");
      this.sortBlockShow = false;
    },
    sortBikeByRent() {
      this.$store.commit("SORT_BY_RENT");
      this.sortBlockShow = false;
    },
    sortBikeByReturn() {
      this.$store.commit("SORT_BY_RETURN");
      this.sortBlockShow = false;
    },
    checkGoAndBackRoute(toggle) {
      this.$store.commit("CHECK_OUT_ROUTE_DIRCTION", toggle);

      // 資料不變，但切換要顯示的資料
      this.$store.dispatch("map/removeOtherLayers");
      this.$store.dispatch("map/setBusStopDataOnMap");
      this.$store.dispatch("map/setBusRouteDataOnMap");
      this.$store.dispatch("map/setBusRealTimeOnMap");
    }
  },
  components: {
    SelectCityBlock,
    CardRotue,
    CardRealTime,
    CardBike,
    SearchBar,
    RouteHeader,
    RoutePathHeader
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  @include pad-m {
    .list-board-container {
      @include transi(.3s);
      @include heightvh(25);
      width: 100%;
      border-radius: $normal-bora $normal-bora 0 0;
      background-color: $grey-100;
      position: absolute;
      left: 0;
      bottom: 0;
      overflow: visible;
      z-index: $list-board;
      &.hide {
        display: none;
      }
      &.expanding {
        @include heightvh(65);
      }
      .locate-icon {
        @include flex-row-center-center;
        @include btn-filled($primary-500);
        @include btn($cycle-bora);
        $locate-icon-size: 12vw;
        width: $locate-icon-size;
        height: $locate-icon-size;
        position: absolute;
        top: calc(-1 *(#{$locate-icon-size} + 5vw));
        right: 5vw;
        box-shadow: 4px 4px 20px rgba(118, 118, 118, 0.3);
        font-size: 1.25rem;
        &:hover {
          background-color: $primary-600;
        } 
      }
      .list-board-header {
        @include flex-row-center-center;
        width: 100%;
        height: #{$list-board-header-h}vh;
        height: calc(var(--vh, 1vh) * #{$list-board-header-h});
        padding: 0px 5vw;
        background-color: $primary-300;
        border-radius: $normal-bora $normal-bora 0 0;
        .header-expand-btn {
          @include font-h4(bold);
          color: $grey-100;
          margin-right: 1rem;
          cursor: pointer;
          &.expanding {
            transform: rotate(180deg);
          }
        }
        .btn-filter {
          @include btn;
          @include font-button(bold);
          @include icon-m($icon-ma);
          color: $primary-400;
          background-color: $grey-100;
          padding: $btn-msg-p;
          position: relative;
          overflow: visible;
          .filter-select-block {
            @include flex-column-center-center;
            @include posi(a);
            top: 2.5rem;
            padding: .4em .8em;
            border: 1px solid $primary-400;
            box-shadow: 4px 4px 20px rgba(118, 118, 118, 0.3);;
            border-radius: $normal-bora;
            background: $grey-100;
            width: max-content;
            cursor: pointer;
            .filter-select {
              padding: .5em 0;
              &:nth-child(1), &:nth-child(2) {
                border-bottom: 1px solid $grey-300;
              }
            }
          }
        }
        &.route {
          @include heightvh(6);
        }
      }
      .searching-img-container {
        display: none;
      }
      .cards-container {
        $pading-top: .5rem;
        width: 100%;
        height: calc(100% - #{$list-board-header-h}vh);
        padding: $pading-top 1rem 0 1rem;
        .cards {
          width: 100%;
          height: 100%;
          overflow: auto;
        }
      }
    }
  }

  @include screen-up {
    .list-board-container {
      $top-margin: 2rem;
      width: $list-board-w;
      height: calc(100% - #{$nav-bar-h} - #{$footer-h} - (#{$top-margin} * 2));
      border-radius: $normal-bora;
      background-color: $grey-100;
      position: absolute;
      left: 2rem;
      top: calc(#{$nav-bar-h} + #{$top-margin});
      overflow: visible;
      z-index: $list-board;
      box-shadow: 3px 3px 8px rgba(154, 154, 154, 0.25);
      .locate-icon {
        @include flex-row-center-center;
        @include btn-filled($primary-500);
        @include btn($cycle-bora);
        $locate-icon-size: 1.875rem;
        position: absolute;
        top: 0;
        right: calc(((#{$locate-icon-size} * 2) + 1.25rem) * -1);
        width: $locate-icon-size * 2;
        height: $locate-icon-size * 2;
        box-shadow: 4px 4px 20px rgba(118, 118, 118, 0.3);
        font-size: $locate-icon-size;
        &:hover {
          background-color: $primary-600;
        } 
      }
      .list-board-header {
        @include flex-row-center-center;
        width: 100%;
        height: 15%;
        background-color: $primary-300;
        border-radius: $normal-bora $normal-bora 0 0;
        .header-expand-btn {
          display: none;
        }
        .btn-filter {
          @include btn;
          @include font-button(bold);
          @include icon-m($tag-ma);
          padding: 1.2vh 1em;
          color: $primary-400;
          background-color: $grey-100;
          position: relative;
          overflow: visible;
          .filter-select-block {
            @include flex-column-center-center;
            position: absolute;
            left: 0;
            top: 40px;
            padding: 11px;
            border: 1px solid $primary-400;
            box-shadow: 4px 4px 20px rgba(118, 118, 118, 0.3);;
            border-radius: $normal-bora;
            background: $grey-100;
            width: max-content;
            cursor: pointer;
            .filter-select {
              padding: .5rem 0;
              &:nth-child(1), &:nth-child(2) {
                border-bottom: 1px solid $grey-300;
              }
            }
            &:hover, &focus {
              color: $primary-400;
              background: $grey-100;
            }
          }
        }
        &.route {
          height: 11%;
        }
      }
      .searching-img-container {
        @include flex-row-center-center;
        width: 100%;
        margin-top: 10vh;
        margin-top: calc(var(--vh, 1vh) * 10);
        > img {
          width: 253px;
        }
      }
    }
    .cards-container {
      $pading-top: .75rem;
      width: 100%;
      height: calc(100% - 10% - 8%);
      padding: $pading-top 2rem;
      .cards {
        @include scroll;
        width: 100%;
        height: 100%;
      }
    }
  }

</style>