<template>
  <div class="btn-filter" :class="{ bus: isCB }" @click="selectBlockShow = !selectBlockShow">
    <button type="button"><i class="fas fa-sort-amount-down"></i>{{ isBike ? "排序" : "篩選" }}</button>
    <ul class="filter-select-block" v-if="isBike" v-show="selectBlockShow">
      <li class="filter-select" @click.prevent.stop="sortBikeByDistace">距離較近</li>
      <li class="filter-select" @click.prevent.stop="sortBikeByRent">可借車數</li>
      <li class="filter-select" @click.prevent.stop="sortBikeByReturn">可還車數</li>
    </ul>
    <SelectCityBlock v-if="isCB" v-show="selectBlockShow"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import SelectCityBlock from "./select-city-block.vue";

export default {
  data() {
    return {
      selectBlockShow: false
    }
  },
  computed: {
    ...mapGetters(['isCB', 'isBike'])
  },
  methods: {
    sortBikeByDistace() {
      this.$store.commit("SORT_BY_DISTANCE");
      this.selectBlockShow = false;
    },
    sortBikeByRent() {
      this.$store.commit("SORT_BY_RENT");
      this.selectBlockShow = false;
    },
    sortBikeByReturn() {
      this.$store.commit("SORT_BY_RETURN");
      this.selectBlockShow = false;
    }
  },
  components: {
    SelectCityBlock
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .btn-filter {
    @include btn;
    @include font-button(bold);
    @include icon-m($icon-ma);
    color: $primary-400;
    background-color: $grey-100;
    padding: .5rem .6875rem;
    position: relative;
    overflow: visible;
    &.bus {
      display: none;
    }
    .filter-select-block {
      @include flex-column-center-center;
      @include posi(a);
      top: -7.5rem;
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

  @include screen-up {
    .btn-filter {
      @include font-button(bold);
      @include icon-m($tag-ma);
      padding: 1.2vh 1em;
      &.bus {
        display: block;
      }
      .filter-select-block {
        top: 40px;
        padding: 11px;
        top: 2.5rem;
        &:hover, &focus {
          color: $primary-400;
          background: $grey-100;
        }
      }
    }
  }

</style>