<template>
  <div class="search-bar" :class="{ icb: isICB }" @click="$refs.inputEl.focus()">
    <input v-model="localKeyword" ref="inputEl" type="text" 
      :placeholder="isBike ? '搜尋站點與鄰近地點' : '搜尋公車路線及站牌'"
    >
    <div class="search-icon" @click.prevent.stop="goSearch"><i class="fas fa-search"></i></div>
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
    ...mapGetters(['targetCity', 'searchKeyword', 'isCB', 'isICB', 'isBike'])
  },
  methods: {
    goSearch() {
      this.$store.dispatch("getBusDataWithKeyword");
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .search-bar {
    @include flex-col(11);
    @include flex-row-space-between-center;
    @include font-caption(500);
    border-radius: $oval-bora;
    background-color: $grey-100;
    color: $grey-500;
    padding: 1.2vh 1.5em;
    position: relative;
    > input {
      color: $grey-500;
      background-color: inherit;
      &::placeholder {
        color: $grey-300;
      }
    }
    .search-icon {
      font-size: 1rem;
      font-weight: bold; 
    }
    &.bike {
      @include flex-col(6);
      margin-right: .75rem;
      background-color: $primary-100;
      color: $primary-500;
    }
  }

  @include screen-up {
    .search-bar {
      @include flex-col(8);
      @include flex-row-space-between-center;
      @include font-button(500);
      border-radius: $normal-bora;
      margin-right: .8rem;
      > input {
        color: $primary-500;
        background-color: inherit;
        &::placeholder {
          color: $primary-500;
        }
      }
      &.icb {
        @include flex-col(10);
      }
      &.bike {
        @include flex-col(8);
      }
      .search-icon {
        font-size: .875rem;
        font-weight: bold; 
        cursor: pointer;
      }
    }
  }
</style>