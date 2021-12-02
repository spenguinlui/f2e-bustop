<template>
  <div class="search-bar">
    <input v-model="localKeyword"
      @keyup.enter="goSearch" type="text" 
      :placeholder="isBike ? '搜尋站點與鄰近地點' : '搜尋公車路線及站牌'"
    >
    <div class="search-icon" @click="goSearch"><i class="fas fa-search"></i></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    localKeyword: {
      get() {
        return this.searchKeyword;
      },
      set(word) {
        this.$store.commit("UPDATE_KEYWORD", word);
        this.goSearch();
      }
    },
    ...mapGetters(['targetCity', 'searchKeyword', 'isCB', 'isBike'])
  },
  methods: {
    goSearch() {
      if (this.isCB) this.$store.dispatch("getCBdataListWithKeyWord", { city: this.targetCity, keyword: this.searchKeyword });
      if (this.isICB) this.$store.dispatch("getICBdataListWithKeyWord", { city: this.targetCity, keyword: this.searchKeyword });
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  @include screen-up {
    .search-bar {
      @include flex-col(8);
      @include flex-row-space-between-center;
      @include font-caption(500);
      border-radius: $normal-bora;
      background-color: $primary-100;
      color: $primary-500;
      padding: 6px 16px;
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
        font-size: 14px;
        font-weight: bold; 
      }
    }
  }

  @include pad-m {
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
      &.bike {
        @include flex-col(6);
        margin-right: 12px;
        background-color: $primary-100;
        color: $primary-500;
      }
    }
  }
</style>