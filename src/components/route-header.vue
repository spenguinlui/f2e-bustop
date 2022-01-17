<template>
  <div class="route-header" @click="mobileExpand">
    <!-- 展開  切換函式先擺到母元素上比較好按 -->
    <button type="button" class="expand-btn" :class="{ expanding: mobileExpanding}"><i class="fas fa-angle-up"></i></button>
    <!-- 回前一頁 -->
    <button type="button" class="back-btn" @click.prevent.stop="goBackRouteList"><i class="fas fa-angle-left"></i></button>
    <h1 class="route-name">{{ targetRoute.routeName }}</h1>
    <button type="button" class="info" @click="goDetailContent"><i class="fas fa-info-circle"></i></button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: ['mobileExpand', 'mobileExpanding'],
  computed: {
    ...mapGetters(['targetRoute', 'isDetailContent'])
  },
  methods: {
    goBackRouteList() {
      if (this.isDetailContent) {
        this.$store.commit("CHECK_OUT_ROUTE_INFO", false);
      } else {
        this.$store.commit("CLOSE_ROUTE_DETAIL_LIST");
        this.$store.dispatch("map/removeOtherLayers");
        this.$store.dispatch("updateTargetData");
      }
    },
    goDetailContent() {
      this.$store.commit("CHECK_OUT_ROUTE_INFO", true);
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