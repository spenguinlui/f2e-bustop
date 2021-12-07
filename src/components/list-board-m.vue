<template>
  <div class="list-board-m" v-if="!isBike" v-show="!isRouteDetail">
    <div class="search-container">
      <SearchBar />
    </div>

    <div class="searching-img-container" v-show="busDataList.length === 0">
      <img src="../assets/images/searching.png" alt="搜尋無結果圖片">
      <div class="text">點選下面的鍵盤搜尋公車吧！</div>
    </div>

    <div class="cards-container">
      <template v-if="!isBike && busDataList.length > 0">
        <CardRotue v-for="data in busDataList" :data="data" :key="data.RouteUID"/>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CardRotue from "./card-route.vue";
import SearchBar from "./search-bar.vue";

export default {
  computed: {
    ...mapGetters([
      'busDataList',
      'isBike', 'isCB', 'isICB', 'isRouteDetail'
      ])
  },
  components: {
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
      height: 100%;
      padding: 12px 20px;
      padding-bottom: 50vh;
      overflow: auto;
    }
  }

  @include screen-up {
    .list-board-m {
      display: none;
    }
  }

</style>