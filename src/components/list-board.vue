<template>
  <!-- 公車&客運 手機版一開始不出現，第二層才出現 -->
  <div class="list-board-container"
    :class="{
      expanding: mobileExpanding,
      hide: isBike ? false : !isRouteDetail }
  ">
    <div @click="locateCurrentPosition" class="locate-icon"><i class="fas fa-crosshairs"></i></div>
    <header class="list-board-header"
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
      <BtnFilter v-show="isBike && !isRouteDetail"/>

      <!-- 公車&客運 桌面版才出現 -->
      <BtnFilter v-show="isCB && !isRouteDetail"/>

      <!-- 公車&客運 進入第二層細節才出現  -->
      <RouteHeader v-if="isBike ? false : isRouteDetail"
        :mobileExpand="mobileExpand" :mobileExpanding="mobileExpanding"/>
    </header>

    <!-- 公車&客運 進入第二層細節才出現 -->
    <RoutePathHeader v-if="isBike ? false : isRouteDetail"/>

    <!-- 公車&客運 桌面版一開始出現 -->
    <section class="searching-img-container"
      v-show="!isBike && busDataList.length === 0" >
      <img src="../assets/images/searching.png" alt="搜尋無結果圖片">
    </section>

    <!-- 公車&客運 桌面版出現 -->
    <section class="cards-container" :class="{ route: isBike ? false : isRouteDetail }">
      <!-- 路線列表 -->
      <ul class="cards" v-show="isBike ? false : !isRouteDetail">
        <template v-if="busDataList.length > 0">
          <CardRotue v-for="data in busDataList" :data="data" :key="data.RouteUID"/>
        </template>
      </ul>

      <!-- 單車站點 -->
      <ul class="cards" v-show="isBike">
        <CardBike v-for="data in bikeDataList" :data="data" :key="data.StationUID"/>
      </ul>

      <!-- 公車&客運 第二層細節 -->
      <!-- 即時路況 -->
      <ul class="cards" v-show="isBike ? false : isRouteDetail && isGoDirection && !isDetailContent">
        <CardRealTime v-for="(data, index) in routeGoDetailList" :data="data" :key="index"/>
      </ul>
      <ul class="cards" v-show="isBike ? false : isRouteDetail && !isGoDirection && !isDetailContent">
        <CardRealTime v-for="(data, index) in routeBackDetailList" :data="data" :key="index"/>
      </ul>
      <!-- 路線詳細資訊 -->

      <template v-if="isBike ? false : isRouteDetail && isDetailContent">
        <RouteDetail :detail="routeDetail"/>
      </template>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CardRotue from "./card-route.vue";
import CardRealTime from "./card-real-time.vue";
import CardBike from "./card-bike.vue";
import SearchBar from "./search-bar.vue";
import RouteHeader from "./route-header.vue";
import RoutePathHeader from "./route-path-header.vue";
import BtnFilter from "./btn-filter.vue";
import RouteDetail from "./route-detail.vue";

export default {
  data() {
    return {
      mobileExpanding: false,
    }
  },
  computed: {
    routeDetail() {
      if (this.routeDataList) {
        return this.routeDataList[0].Data;
      } else {
        return {};
      }
    },
    ...mapGetters([
      'bikeDataList', 'busDataList', 'routeDataList','routeGoDetailList', 'routeBackDetailList',
      'isCB', 'isBike', 'isRouteDetail', 'isGoDirection', 'isDetailContent'])
  },
  methods: {
    mobileExpand() {
      this.mobileExpanding = !this.mobileExpanding;
    },
    locateCurrentPosition() {
      this.$bus.$emit("get-position");
    }
  },
  components: {
    CardRotue,
    CardRealTime,
    CardBike,
    SearchBar,
    RouteHeader,
    RoutePathHeader,
    BtnFilter,
    RouteDetail
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  @include pad-m {
    .list-board-container {
      @include transi(.3s);
      @include posi(a);
      width: 100%;
      height: 100%;
      border-radius: $normal-bora $normal-bora 0 0;
      background-color: $grey-100;
      top: 70vh;
      top: calc(var(--vh, 1vh) * 70);
      overflow: visible;
      z-index: $list-board;
      &.hide {
        display: none;
      }
      &.expanding {
        top: 30vh;
        top: calc(var(--vh, 1vh) * 30);
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
        padding: .5rem 5vw;
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
      }
      .searching-img-container {
        display: none;
      }
      .cards-container {
        $pading-top: .5rem;
        width: 100%;
        height: 100%;
        padding: $pading-top 1rem 0 1rem;
        .cards, .content {
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
        height: $list-board-header-h;
        padding: 0 5%;
        background-color: $primary-300;
        border-radius: $normal-bora $normal-bora 0 0;
        .header-expand-btn {
          display: none;
        }
        &.route {
          height: $route-list-board-header-h;
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
      height: calc(100% - #{$list-board-header-h});
      padding: $pading-top 2rem;
      &.route {
        height: calc(100% - #{$route-list-board-header-h} - #{$route-path-header-h} - #{$route-path-header-bar-h});
      }
      .cards {
        @include scroll;
        width: 100%;
        height: 100%;
      }
    }
  }

</style>