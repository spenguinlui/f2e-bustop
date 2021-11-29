<template>
  <div class="landing-page-container" v-if="landingPageShow">
    <div class="landing-page-weater">
      <div class="weater-icon"><i class="fas fa-sun"></i></div>
      <div class="weater-detail">
        <div class="detail-tags">
          <div class="tag-block">
            <div class="tag">台北市</div>
            <div class="date-text">11/20</div>
          </div>
          <div class="tag-block">
            <div class="tag">更換縣市</div>
            <div class="change"><i class="fas fa-redo-alt"></i></div>
          </div>
        </div>
        <div class="detail-values">
          <div class="temperature">
            <div class="temperature-max">30°C</div>
            <div class="temperature-min">| 22°C</div>
          </div>
          <div class="rain-rate"><i class="fas fa-cloud-showers-heavy"></i>80%</div>
        </div>
      </div>
    </div>
    <div class="landing-page-boxs">
      <div class="landing-page-box-container" @click="toggleDataType('CB')">
        <div class="landing-page-box">
          <div class="box-icon"><i class="fas fa-bus-alt"></i></div>
          <div class="box-text">找公車</div>
        </div>
      </div>
      <div class="landing-page-box-container" @click="toggleDataType('ICB')">
        <div class="landing-page-box">
          <div class="box-icon"><i class="fas fa-road"></i></div>
        <div class="box-text">找客運</div>
        </div>
      </div>
      <div class="landing-page-box-container" @click="toggleDataType('bike')">
        <div class="landing-page-box">
          <div class="box-icon"><i class="fas fa-bicycle"></i></div>
        <div class="box-text">找單車</div>
        </div>
      </div>
      <div class="landing-page-box-container">
        <div class="landing-page-box">
          <div class="box-icon"><i class="fas fa-subway"></i></div>
        <div class="box-text">轉乘資訊</div>
        </div>
      </div>
    </div>
    <div class="landing-page-service accent">
      <div class="service-icon"><i class="fas fa-crosshairs"></i></div>
      <div class="service-text">您已同意開啟定位服務</div>
      <div class="service-btns"></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters(['landingPageShow'])
  },
  methods: {
    toggleDataType(type) {
      this.$store.commit("TOGGLE_LANDING_APGE", false);
      this.$store.dispatch("updateTargetData", type);
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .landing-page-container {
    @include flex-column-flex-start-center;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    margin-top: $nav-bar-m-h;
    margin-bottom: $footer-m-h;
    background-color: $primary-100;
    padding: 10px 32px;
    z-index: $landing-page;
    .landing-page-weater {
      @include flex-row-center-center;
      width: 100%;
      padding: 15px;
      .weater-icon {
        @include flex-col(3);
        color: $primary-400;
        width: 100%;
        font-size: 62px;
      }
      .weater-detail {
        @include flex-col(9);
        color: $primary-500;
        .detail-tags {
          @include flex-row-space-between-center;
          .tag-block {
            @include flex-row-center-center;
            .tag {
              @include btn;
              @include btn-filled($primary-500);
              @include font-overline(bold);
              padding: $btn-tag-p;
            }
            .date-text {
              @include font-caption(bold);
              margin-left: $icon-ma;
            }
            .change {
              @include icon-m($icon-ma, l);
              color: $primary-400;
            }
          }
        }
        .detail-values {
          @include flex-row-space-between-baseline;
          margin-top: 12px;
          .temperature {
            @include flex-row-center-baseline;
            .temperature-max {
              @include font-h3(bold);
              margin-right: $tag-ma;
            }
            .temperature-min {
              @include font-content(bold);
            }
          }
          .rain-rate {
            @include icon-m($icon-ma);
            color: $primary-400;
          }
        }
      }
    }
    .landing-page-boxs {
      @include flex-row-center-center;
      flex-wrap: wrap;
      width: 100%;
      .landing-page-box-container {
        @include flex-column-center-center;
        @include flex-col(6);
        padding: 10px;
        .landing-page-box {
          min-height: 166px;
          width: 100%;
          background-color: $grey-100;
          border-radius: 12px;
          @include flex-column-center-center;
          .box-icon {
            color: $primary-400;
            font-size: 60px;
          }
          .box-text {
            @include font-button(bold);
            color: $grey-500;
          }
        }
      }
    }
    .landing-page-service {
      @include flex-row-center-center;
      width: 100%;
      padding: 8px 12px;
      border-radius: 8px;
      &.accent {
        background-color: $accent-100;
        .service-icon {
          color: $accent-500;
        }
      }
      &.alert {
        background-color: $alert-100;
        .service-icon {
          color: $alert-300;
        }
      }
      .service-icon {
        font-size: 24px;
        margin-right: $tag-ma;
      }
      .service-text {
        @include font-overline(500);
        color: $grey-600;
      }
    }
  }
  @include screen-up {
    .landing-page-container {
      display: none;
    }
  }

</style>