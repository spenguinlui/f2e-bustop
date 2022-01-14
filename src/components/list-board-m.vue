<template>
  <div class="list-board-m" v-if="!isBike" v-show="!isRouteDetail">
    <section class="search-container">
      <SearchBar />
    </section>

    <section class="searching-img-container" v-show="busDataList.length === 0">
      <img src="../assets/images/searching.png" alt="搜尋無結果圖片">
      <p class="text">點選下面的鍵盤搜尋公車吧！</p>
    </section>

    <section class="cards-container">
      <template v-if="!isBike && busDataList.length > 0">
        <CardRotue v-for="data in busDataList" :data="data" :key="data.RouteUID"/>
      </template>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CardRotue from "./card-route.vue";
import SearchBar from "./search-bar.vue";

export default {
  computed: {
    ...mapGetters(['busDataList', 'isBike', 'isRouteDetail'])
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
    @include flex-column-flex-start-center;
    @include heightvh(calc(100 - #{$nav-bar-m-h} - #{$footer-m-h}));
    width: 100vw;
    margin-top: #{$nav-bar-m-h}vh;
    margin-top: calc(var(--vh, 1vh) * #{$nav-bar-m-h});
    margin-bottom: #{$footer-m-h}vh;
    margin-bottom: calc(var(--vh, 1vh) * #{$footer-m-h});
    background-color: $primary-100;
    .search-container {
      margin-top: 1vh;
      padding: 1vh 6vw;
      width: 100%;
    }
    .searching-img-container {
      @include flex-column-center-center;
      width: 60%;
      padding-top: 4vh;
      > img {
        width: 100%;
      }
      .text {
        @include font-caption(500);
        color: $grey-500;
        margin-top: .5rem;
      }
    }
    .cards-container {
      @include scroll;
      width: 100%;
      height: 100%;
      padding: 1vh 6vw;
      padding-bottom: 40vh;
      padding-bottom: calc(var(--vh, 1vh) * 40);
    }
  }

  @include screen-up {
    .list-board-m {
      display: none;
    }
  }

</style>