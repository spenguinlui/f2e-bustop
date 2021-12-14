<template>
  <div class="route-header" @click="mobileExpand">
    <!-- 展開  切換函式先擺到母元素上比較好按 -->
    <div class="expand-btn" :class="{ expanding: mobileExpanding}"><i class="fas fa-angle-up"></i></div>
    <!-- 回前一頁 -->
    <div class="back-btn" @click.prevent.stop="goBackRouteList"><i class="fas fa-angle-left"></i></div>
    <div class="route-name">{{ targetRoute.routeName }}</div>
    <div class="info"><i class="fas fa-info-circle"></i></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: ['mobileExpand', 'mobileExpanding'],
  computed: {
    ...mapGetters(['targetRoute'])
  },
  methods: {
    goBackRouteList() {
      this.$store.commit("CLOSE_ROUTE_DETAIL_LIST");
      this.$store.dispatch("map/removeOtherLayers");
      this.$store.dispatch("updateTargetData");
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";
  
  .route-header {
    @include flex-row-space-between-center;
    @include font-content(bold);
    width: 100%;
    color: $grey-100;
    .expand-btn {
      display: block;
      &.expanding {
        transform: rotate(180deg);
      }
    }
    .back-btn {
      display: none;
      margin-right: 1rem;
    }
  }

  @include screen-up {
    .route-header {
      @include font-h4(bold);
      padding: 0 10%;
      .expand-btn {
        display: none;
      }
      .back-btn {
        display: block;
        cursor: pointer;
      }
    }
  }
</style>