<template>
  <div class="landing-page" v-if="landingPageShow">
    <div class="landing-page-weater">
      <div class="landing-page-weater-icon">
        <div v-show="parseInt(weatherData.Wx.parameterValue) === 1"><i class="fas fa-sun"></i></div>
        <div v-show="parseInt(weatherData.Wx.parameterValue) === 2 || parseInt(weatherData.Wx.parameterValue) === 3"><i class="fas fa-cloud-sun"></i></div>
        <div v-show="parseInt(weatherData.Wx.parameterValue) >= 4 && parseInt(weatherData.Wx.parameterValue) <= 7"><i class="fas fa-cloud"></i></div>
        <div v-show="parseInt(weatherData.Wx.parameterValue) > 7"><i class="fas fa-cloud-showers-heavy"></i></div>
      </div>
      <div class="landing-page-weater-detail">
        <div class="detail-tags">
          <div class="tag-block">
            <div class="tag">{{ cityZh }}</div>
            <div class="date-text">{{ date }}</div>
          </div>
          <div class="tag-block" @click="checkCity">
            <div class="tag">重新定位</div>
            <div class="change" :class="{ loading: weatherLoading }"><i class="fas fa-redo-alt"></i></div>
          </div>
        </div>
        <div class="detail-values">
          <div class="temperature">
            <div class="temperature-max">{{ weatherData.TEMP }}°C</div>
            <!-- <div class="temperature-min">| {{ weatherData.MinT.parameterName }}°C</div> -->
          </div>
          <div class="rain-rate"><i class="fas fa-cloud-showers-heavy"></i>{{ weatherData.PoP.parameterName }}%</div>
        </div>
      </div>
    </div>
    <div class="landing-page-boxs">
      <div class="landing-page-box-container" @click="toggleDataType('CB')">
        <div class="landing-page-box-outside">
          <div class="landing-page-box">
            <div class="box-icon"><i class="fas fa-bus-alt"></i></div>
            <div class="box-text">找公車</div>
          </div>
        </div>
      </div>
      <div class="landing-page-box-container" @click="toggleDataType('ICB')">
        <div class="landing-page-box-outside">
          <div class="landing-page-box">
            <div class="box-icon"><i class="fas fa-road"></i></div>
          <div class="box-text">找客運</div>
          </div>
        </div>
      </div>
      <div class="landing-page-box-container" @click="toggleDataType('Bike')">
        <div class="landing-page-box-outside">
          <div class="landing-page-box">
            <div class="box-icon"><i class="fas fa-bicycle"></i></div>
          <div class="box-text">找單車</div>
          </div>
        </div>
      </div>
      <div class="landing-page-box-container">
        <div class="landing-page-box-outside">
          <div class="landing-page-box">
            <div class="box-icon"><i class="fas fa-subway"></i></div>
          <div class="box-text">轉乘資訊</div>
          </div>
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
import citysHash from "../json/cityshash.json";

export default {
  data() {
    return {
      date: this.currentDate(),
      weatherLoading: false
    }
  },
  computed: {
    ...mapGetters(['landingPageShow', 'weatherData', 'weatherIcon', 'targetCity']),
    cityZh() {
      return citysHash[this.targetCity].cityName;
    }
  },
  methods: {
    toggleDataType(type) {
      this.$store.commit("TOGGLE_LANDING_APGE", false);
      this.$store.dispatch("checkOutTargetType", type);
    },
    currentDate() {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      return `${month}/ ${day}`
    },
    checkCity() {
      this.weatherLoading = true;
      this.getCurrentPosition();
    },
    getCurrentPosition() {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.setPosition(position);
        }, () => {
          window.alert("若無定位，預設定位於台北車站")
        })
      } else {
        window.alert("若無定位，預設定位於台北車站")
      }
    },
    setPosition(position) {
      const currentPosition = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      this.$store.dispatch("map/setCurrentPosition", currentPosition);
      this.weatherLoading = false;
    },
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .landing-page {
    @include flex-column-space-around-center;
    @include posi(f);
    width: 100%;
    height: calc(100vh - #{$nav-bar-m-h} - #{$footer-m-h});
    margin-top: $nav-bar-m-h;
    margin-bottom: $footer-m-h;
    background-color: $primary-100;
    padding: 3vh 8vw;
    z-index: $landing-page;
    &-weater {
      @include flex-row-center-center;
      width: 100%;
      &-icon {
        @include flex-col(3);
        color: $primary-400;
        width: 100%;
        margin-right: .25rem;
        font-size: 15vw;
      }
      &-detail {
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
              &.loading {
                svg {
                  animation: loading;
                  animation-duration: 1s;
                  animation-iteration-count: infinite;
                  @keyframes loading {
                    0% {
                      transform: rotate(0deg);
                    }
                    100% {
                      transform: rotate(360deg);
                    }
                  }
                }
              }
            }
          }
        }
        .detail-values {
          @include flex-row-space-between-baseline;
          margin-top: 1vh;
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
    &-boxs {
      @include flex-row-center-center;
      flex-wrap: wrap;
      width: 100%;
      .landing-page-box-container {
        @include flex-column-center-center;
        @include flex-col(6);
        &:nth-child(odd) {
          padding-right: 2.5vw;
        }
        &:nth-child(even) {
          padding-left: 2.5vw;
        }
        &:nth-child(1), &:nth-child(2) {
          margin-bottom: 5vw;
        }
        .landing-page-box-outside {
          width: 100%;
          background-color: $grey-100;
          border-radius: .75rem;
          .landing-page-box {
            @include flex-column-center-center;
            width: 100%;
            padding: 6vh 10vw;
            .box-icon {
              color: $primary-400;
              font-size: 15vw;
            }
            .box-text {
              @include font-button(bold);
              margin-top: .5rem;
              color: $grey-500;
            }
          }
        }
      }
    }
    &-service {
      @include flex-row-center-center;
      width: 100%;
      padding: 2vh 2vw;
      border-radius: $normal-bora;
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
        font-size: 7vw;
        margin-right: $tag-ma;
      }
      .service-text {
        @include font-overline(500);
        color: $grey-600;
      }
    }
  }
  @include screen-up {
    .landing-page {
      display: none;
    }
  }

</style>