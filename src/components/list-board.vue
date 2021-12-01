<template>
  <!-- 公車&客運 手機版一開始不出現，第二層才出現 -->
  <div class="list-board-container"
    :class="{
      expanding: mobileExpanding,
      hide: isBike ? false : (isCB ? !isCBdetail : !isICBdetail)
      }">
    <div @click="locateCurrentPosition" class="locate-icon"><i class="fas fa-crosshairs"></i></div>
    <div class="list-board-header"
      :class="{ route: isBike ? false : (isCB ? isCBdetail : isICBdetail) }">

      <!-- 單車手機版出現 -->
      <div class="header-expand-btn expand-btn"
        v-show="isBike" @click="mobileExpanding = !mobileExpanding">
        <i class="fas fa-angle-up"></i>
      </div>

      <!-- 公車&客運 手機版出現，單車雙版本皆有 -->
      <SearchBar
        v-show="isBike ? true : isCB ? !isCBdetail : !isICBdetail"
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
        v-show="!isBike ? !isCBdetail && !isICBdetail : false"
        @click="selectBlockShow = !selectBlockShow">
        <div><i class="fas fa-sort-amount-down"></i>篩選</div>
        <SelectCityBlock  v-show="selectBlockShow"/>
      </div>

      <!-- 公車&客運 進入第二層細節才出現  -->
      <div class="route-block"
        v-show="isBike ? false : isCB ? isCBdetail : isICBdetail">
        <!-- 展開 -->
        <div class="expand-btn" @click="mobileExpanding = !mobileExpanding"><i class="fas fa-angle-up"></i></div>
        <!-- 回前一頁 -->
        <div class="back-btn" @click="goBackRouteList"><i class="fas fa-angle-left"></i></div>
        <div class="route-name">{{ targetRoute.routeName }}</div>
        <div class="info"><i class="fas fa-info-circle"></i></div>
      </div>
    </div>

    <!-- 公車&客運 進入第二層細節才出現 -->
    <div class="route-path-block"
      v-show="isBike ? false : isCB ? isCBdetail : isICBdetail">
      <div class="left-block"
        :class="{ active: isCB ? isCBgo : isICBgo }"
        @click="checkGoAndBackRoute(true)">往{{ targetRoute.destinationStop }}</div>
      <div class="right-block"
        :class="{ active: isCB ? !isCBgo : !isICBgo }"
        @click="checkGoAndBackRoute(false)">往{{ targetRoute.departureStop }}</div>
    </div>

    <!-- 公車&客運 桌面版一開始出現 -->
    <div class="searching-img-container"
      v-show="!isBike && (isCB ? CBdataList.length === 0 : ICBdataList.length === 0)" >
      <img src="../assets/images/searching.png" alt="搜尋無結果圖片">
    </div>

    <!-- 公車&客運 桌面版出現 -->
    <div class="cards-container">
      <!-- 路線列表 -->
      <div v-show="isBike ? false : isCB ? !isCBdetail : !isICBdetail">
        <template v-if="isCB && CBdataList.length > 0">
          <template v-for="data in CBdataList">
            <CardRotue :data="data" :key="data.a"/>
          </template>
        </template>
        <template v-if="isICB && ICBdataList.length > 0">
          <template v-for="data in ICBdataList">
            <CardRotue :data="data" :key="data.a"/>
          </template>
        </template>
      </div>

      <!-- 即時路況 -->
      <div v-show="isBike ? false : isCB && isCBdetail">
        <template v-for="(data, index) in (isCBgo ? goCBrouteDetailList : backCBrouteDetailList)">
          <CardRealTime :data="data" :key="index"/>
        </template>
      </div>
      <div v-show="isBike ? false : isICB && isICBdetail">
        <template v-for="(data, index) in (isICBgo ? goICBrouteDetailList : backICBrouteDetailList)">
          <CardRealTime :data="data" :key="index"/>
        </template>
      </div>

      <!-- 單車站點 -->
      <div v-show="isBike">
        <template v-for="data in BikeDataList">
          <CardBike :data="data" :key="data.StationUID"/>
        </template>
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

export default {
  data() {
    return {
      keyword: "",
      selectBlockShow: false,
      sortBlockShow: false,
      routeDetail: false,
      lisboardShow: true,
      mobileExpanding: false,
    }
  },
  computed: {
    ...mapGetters([
      'targetCity', 'searchKeyword',
      'BikeDataList', 'CBdataList', 'ICBdataList',
      'goCBrouteDetailList', 'backCBrouteDetailList', 'goICBrouteDetailList', 'backICBrouteDetailList',
      'isCB', 'isCBdetail', 'isICB', 'isICBdetail', 'isBike', 'isCBgo', 'isICBgo', 'targetRoute'])
  },
  methods: {
    locateCurrentPosition() {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          const currentPosition = { latitude: position.coords.latitude, longitude: position.coords.longitude };
          this.$store.dispatch("map/setCurrentPosition", currentPosition);
        }, () => {
          window.alert("重新定位失敗")
        })
      } else {
        window.alert("重新定位失敗")
      }
    },
    goSearch() {
      if (this.isCB) {
        this.$store.dispatch("getCBdataListWithKeyWord", { city: this.targetCity, keyword: this.searchKeyword });
      } else {
        this.$store.dispatch("getICBdataListWithKeyWord", { city: this.targetCity, keyword: this.searchKeyword });
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
    goBackRouteList() {
      if (this.isCB) { this.$store.commit("CHECK_OUTE_ROUTE_LIST", "CB") }
      if (this.isICB) { this.$store.commit("CHECK_OUTE_ROUTE_LIST", "ICB") }
      this.$store.dispatch("map/focusCurrentPosition");
    },
    checkGoAndBackRoute(toggle) {
      if (this.isCB) { this.$store.commit("CHECK_CB_GO_ROUTE", toggle) }
      if (this.isICB) { this.$store.commit("CHECK_ICB_GO_ROUTE", toggle) }
      this.$store.dispatch("map/removeOtherLayers");
      this.$store.dispatch("map/setCBstopDataOnMap");
      this.$store.dispatch("map/setCBrouteDataOnMap");
    }
  },
  components: {
    SelectCityBlock,
    CardRotue,
    CardRealTime,
    CardBike,
    SearchBar
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  @include pad-m {
    .list-board-container {
      width: 100%;
      height: 180px;
      border-radius: $normal-bora;
      background-color: $grey-100;
      position: absolute;
      left: 0;
      bottom: -10px;
      overflow: visible;
      z-index: $list-board;
      // mobile-pad only
      @include transi(.3s);
      &.hide {
        display: none;
      }
      &.expanding {
        height: 559px;
        .expand-btn {
          transform: rotate(180deg);
        }
      }
      .locate-icon {
        @include flex-row-center-center;
        @include btn-filled($primary-500);
        @include btn($cycle-bora);
        position: absolute;
        top: -68px;
        right: 24px;
        width: 48px;
        height: 48px;
        box-shadow: 4px 4px 20px rgba(118, 118, 118, 0.3);
        font-size: 20px;
        &:hover {
          background-color: $primary-600;
        } 
      }
      .list-board-header {
        @include flex-row-center-center;
        width: 100%;
        height: 70px;
        background-color: $primary-300;
        border-radius: $normal-bora $normal-bora 0 0;
        .header-expand-btn {
          @include font-h4(bold);
          color: $grey-100;
          margin-right: 14px;
          cursor: pointer;
        }
        .btn-filter {
          @include btn;
          @include font-button(bold);
          @include icon-m(4px);
          color: $primary-400;
          background-color: $grey-100;
          padding: $btn-msg-p;
          position: relative;
          overflow: visible;
          .filter-select-block {
            @include flex-column-center-center;
            position: absolute;
            right: 0;
            top: 40px;
            padding: 11px;
            border: 1px solid $primary-400;
            box-shadow: 4px 4px 20px rgba(118, 118, 118, 0.3);;
            border-radius: $normal-bora;
            background: $grey-100;
            width: max-content;
            cursor: pointer;
            .filter-select {
              padding: 8px 0;
              &:nth-child(1), &:nth-child(2) {
                border-bottom: 1px solid $grey-300;
              }
            }
          }
        }
        &.route {
          height: 48px;
          .route-block {
            @include flex-row-space-between-center;
            @include font-content(bold);
            width: 100%;
            color: $grey-100;
            padding: 0 20px;
            .back-btn {
              display: none;
            }
          }
        }
      }
      .route-path-block {
        @include flex-row-center-center;
        @include font-button(bold);
        background-color: $primary-200;
        padding: 8px 0;
        .left-block , .right-block {
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
      .searching-img-container {
        display: none;
      }
      .cards-container {
        $pading-top: 8px;
        width: 100%;
        height: calc(100% - #{$list-board-header-h});
        padding: $pading-top 16px;
        overflow: auto;
        padding-bottom: 20px;
      }
    }
  }

  @include screen-up {
    .list-board-container {
      $top-margin: 34px;
      width: $list-board-w;
      height: calc(100% - #{$nav-bar-h} - #{$footer-h} - (#{$top-margin} * 2));
      border-radius: $normal-bora;
      background-color: $grey-100;
      position: absolute;
      left: 32px;
      top: $nav-bar-h + $top-margin;
      overflow: hidden;
      z-index: $list-board;
      box-shadow: 3px 3px 8px rgba(154, 154, 154, 0.25);
      .locate-icon {
        @include flex-row-center-center;
        @include btn-filled($primary-500);
        @include btn($cycle-bora);
        position: absolute;
        top: 0;
        right: -80px;
        width: 60px;
        height: 60px;
        box-shadow: 4px 4px 20px rgba(118, 118, 118, 0.3);
        font-size: 30px;
        &:hover {
          background-color: $primary-600;
        } 
      }
      .list-board-header {
        @include flex-row-center-center;
        width: 100%;
        height: 84px;
        background-color: $primary-300;
        border-radius: $normal-bora $normal-bora 0 0;
        .header-expand-btn {
          display: none;
        }
        .search-bar {
          @include flex-col(8);
          @include flex-row-space-between-center;
          @include font-button(500);
          border-radius: $normal-bora;
          background-color: $primary-100;
          color: $primary-500;
          padding: 8px 20px;
          margin-right: 12px;
          position: relative;
          > input {
            color: $primary-500;
            background-color: inherit;
            &::placeholder {
              color: $primary-500;
            }
          }
          .search-icon {
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
          }
        }
        .btn-filter {
          @include btn;
          @include font-caption(bold);
          @include icon-m(10px);
          color: $primary-400;
          background-color: $grey-100;
          padding: $btn-msg-p;
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
              padding: 8px 0;
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
          height: 64px;
          .route-block {
            @include flex-row-space-between-center;
            @include font-h4(bold);
            width: 100%;
            color: $grey-100;
            padding: 0 32px;
            .expand-btn {
              display: none;
            }
            .back-btn {
              cursor: pointer;
            }
          }
        }
      }
      .route-path-block {
        @include flex-row-center-center;
        @include font-content(bold);
        background-color: $primary-200;
        padding: 10px 0;
        .left-block , .right-block {
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
      .searching-img-container {
        @include flex-row-center-center;
        width: 100%;
        margin-top: 28px;
        > img {
          width: 253px;
        }
      }
    }
    .cards-container {
      $pading-top: 10px;
      width: 100%;
      height: calc(100% - #{$list-board-header-h} - (#{$pading-top} * 2));
      padding: $pading-top 32px;
      overflow: auto;
    }
  }

</style>