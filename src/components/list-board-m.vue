<template>
  <div class="list-board-m" v-if="!isBike" v-show="isCityBus ? !isCityBusDetail : !isInterCityBusDetail">
    <div class="search-container">
      <SearchBar />
    </div>

    <div class="searching-img-container" v-show="isCityBus ? cityBusDataList.length === 0 : interCityBusDataList.length === 0">
      <img src="../assets/images/searching.png" alt="搜尋無結果圖片">
      <div class="text">點選下面的鍵盤搜尋公車吧！</div>
    </div>

    <div class="cards-container">
      <template v-if="isCityBus && cityBusDataList.length > 0">
        <template v-for="data in cityBusDataList">
          <CardRotue :data="data" :key="data.RouteUID"/>
        </template>
      </template>
      <template v-if="isInterCityBus && interCityBusDataList.length > 0">
        <template v-for="data in interCityBusDataList">
          <CardRotue :data="data" :key="data.RouteUID"/>
        </template>
      </template>
    </div>
    <KeyboardMobile />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import KeyboardMobile from "./key-board-m.vue";
import CardRotue from "./card-route.vue";
import SearchBar from "./search-bar.vue";

export default {
  computed: {
    ...mapGetters([
      'targetMode', 'cityBusDataList', 'interCityBusDataList',
      'isBike', 'isCityBus', 'isCityBusDetail', 'isInterCityBus', 'isInterCityBusDetail'
      ])
  },
  components: {
    KeyboardMobile,
    CardRotue,
    SearchBar
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .list-board-m {
    width: 100vw;
    height: 100vh;
    background-color: $primary-100;
    padding-top: $nav-bar-m-h;
    @include flex-column-flex-start-center;
    .search-container {
      padding: 8px 20px;
      width: 100%;
    }
    .searching-img-container {
      @include flex-column-center-center;
      width: 60%;
      padding-top: 34px;
      > img {
        width: 100%;
      }
      .text {
        @include font-caption(500);
        color: $grey-500;
        margin-top: 8px;
      }
    }
    .cards-container {
      width: 100%;
      height: 50vh;
      padding: 12px 20px;
      padding-bottom: 10vh;
      overflow: auto;
    }
  }

  @include screen-up {
    .list-board-m {
      display: none;
    }
  }

</style>