<template>
  <div class="list-board-m" v-if="!isBike" v-show="isCityBus ? !isCityBusDetail : !isInterCityBusDetail">
    <div class="search-container">
      <div class="search-bar">
        <input v-model="searchKeyword" @keyup.enter="goSearch" type="text" placeholder="搜尋公車路線及站牌">
        <div class="search-icon" @click="goSearch"><i class="fas fa-search"></i></div>
      </div>
    </div>

    <div class="searching-img-container" v-show="dataList.length === 0">
      <img src="../assets/images/searching.png" alt="搜尋無結果圖片">
      <div class="text">點選下面的鍵盤搜尋公車吧！</div>
    </div>

    <div class="cards-container">
      <template v-for="data in dataList">
        <CardRotue :data="data" :key="data.a"/>
      </template>
    </div>
    <KeyboardMobile />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import KeyboardMobile from "./key-board-m.vue";
import CardRotue from "./card-route.vue";

export default {
  computed: {
    ...mapGetters(['searchKeyword', 'targetMode', 'dataList', 'isBike', 'isCityBus', 'isCityBusDetail', 'isInterCityBusDetail'])
  },
  methods: {
    goSearch() {
      console.log("搜尋")
    }
  },
  components: {
    KeyboardMobile,
    CardRotue
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
      .search-bar {
        @include flex-col(11);
        @include flex-row-space-between-center;
        @include font-caption(500);
        border-radius: 61px;
        background-color: $grey-100;
        color: $grey-500;
        padding: 8px 20px;
        position: relative;
        > input {
          color: $grey-500;
          background-color: inherit;
          &::placeholder {
            color: $grey-300;
          }
        }
        .search-icon {
          font-size: 16px;
          font-weight: bold; 
        }
      }
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