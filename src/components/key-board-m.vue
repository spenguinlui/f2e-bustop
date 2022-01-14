<template>
  <div class="key-board-container"
    :class="{ inter: isICB, detail: isRouteDetail }"
    v-if="!landingPageShow && !isRouteDetail && !isBike">
    <section class="select-city-container" v-if="isCB">
      <button type="button" class="city-tag"
        :class="{ active: targetCity === city.enName }"
        v-for="city in cityTagList" :key="city.enName"
        @click="checkCity(city.enName)">
        {{ city.cityName }}
      </button>
    </section>
    <section class="key-board-panel">
      <div class="city-panel" v-if="isCB">
        <button type="button" class="panel-container" @click="enterBtn('紅')"><span class="red-line panel-btn">紅</span></button>
        <button type="button" class="panel-container" @click="enterBtn('綠')"><span class="green-line panel-btn">綠</span></button>
        <button type="button" class="panel-container" @click="enterBtn('橘')"><span class="orange-line panel-btn">橘</span></button>
        <button type="button" class="panel-container" @click="enterBtn('藍')"><span class="blue-line panel-btn">藍</span></button>
        <button type="button" class="panel-container" @click="enterBtn('棕')"><span class="brown-line panel-btn">棕</span></button>
      </div>
      <div class="route-panel" v-if="isCB">
        <button type="button" v-for="text in cityBusBtn"
          class="panel-container" @click="enterBtn(text)" :key="text">
          <span class="panel-btn">{{ text }}</span>
        </button>
        <button type="button" class="panel-container back-btn" @click="backSpaceBtn">
          <span class="panel-btn"><i class="fas fa-backspace"></i></span>
        </button>
      </div>
      <div class="inner-city-panel" v-if="isICB">
        <button type="button" v-for="text in InterCityBusBtn"
          class="panel-container" @click="enterBtn(text)" :key="text">
          <span class="panel-btn">{{ text }}</span>
        </button>
        <button type="button" class="panel-container back-btn" @click="backSpaceBtn"><div class="panel-btn"><i class="fas fa-backspace"></i></div></button>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CitysData from "../json/citys.json";

export default {
  data() {
    return {
      citysData: CitysData,
      keyword: "",
      cityBusBtn: [
        "幹線", "1", "2", "3",
        "通勤", "4", "5", "6",
        "小巴", "7", "8", "9",
        "接駁", "0"
      ],
      InterCityBusBtn: [
        "北部", "1", "2", "3",
        "中部", "4", "5", "6",
        "南部", "7", "8", "9",
        "東部", "0"
      ]
    }
  },
  computed: {
    ...mapGetters(['landingPageShow', 'targetCity', 'searchKeyword', 'isCB','isICB', 'isBike', 'isRouteDetail']),
    cityTagList() {
      let cityList = [];
      this.citysData.forEach((data) => data.citys.forEach((city) => cityList.push(city)))
      return cityList
    }
  },
  methods: {
    enterBtn(msg) {
      this.$store.commit("ENTER_MSG_TO_KEYWORD", msg);
      this.$store.dispatch("getBusDataWithKeyword");
    },
    backSpaceBtn() {
      this.$store.commit("SLICE_ONE_CHAR_FROM_KEYWORD");
      this.$store.dispatch("getBusDataWithKeyword");
    },
    checkCity(city) {
      this.$bus.$emit("check-city", city);
    }
  },
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .key-board-container {
    @include transi;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: $grey-100;
    z-index: $key-board;
    &.detail {
      bottom: -100vh;
      bottom: calc(var(--vh, 1vh) * -100);
    }
    .select-city-container {
      @include flex-row-flex-start-center;
      @include scroll;
      width: 100%;
      $city-tag-padding: .75rem;
      background-color: $primary-200;
      padding: $city-tag-padding 0;
      flex-wrap: nowrap;
      .city-tag {
        @include flex-col(2);
        @include btn(.7em);
        @include btn-filled($primary-400);
        @include font-caption(bold);
        padding: .2em .7em;
        margin-right: $city-tag-padding;
        &:nth-child(1) {
          margin-left: $city-tag-padding;
        }
        &.active {
          background-color: $primary-600;
        }
      }
    }
    .key-board-panel {
      $key-board-panel-padding: 3vw;
      padding-top: $key-board-panel-padding;
      padding-left: $key-board-panel-padding;
      .city-panel {
        @include flex-row-center-center;
        width: 100%;
        .panel-container {
          flex: 0 0 (100% / 5);
        }
      }
      .route-panel, .inner-city-panel {
        @include flex-row-flex-start-center;
        width: 100%;
        flex-wrap: wrap;
        .panel-container {
          flex: 0 0 (100% / 4);
        }
      }
      .panel-container {
        padding-right: $key-board-panel-padding;
        padding-bottom: $key-board-panel-padding;
        .panel-btn {
          @include btn(.5rem);
          @include font-content;
          color: $primary-500;
          background-color: $grey-100;
          border: 1px solid $primary-500;
          &:hover, &.hover, &:focus, &.focus, &.active {
            background-color: $primary-200;
          }
          padding: .4em 0;
          &.red-line { 
            color: $alert-300;
            background-color: $alert-100;
            border: 1px solid $alert-300;
            &:hover, &.hover, &:focus, &.focus, &.active {
              background-color: $alert-200;
            }
          }
          &.green-line {
            color: $primary-500;
            background-color: $primary-100;
            border: 1px solid $primary-500;
            &:hover, &.hover, &:focus, &.focus, &.active {
              background-color: $primary-200;
            }
          }
          &.orange-line {
            color: $accent-400;
            background-color: $accent-100;
            border: 1px solid $accent-400;
            &:hover, &.hover, &:focus, &.focus, &.active {
              background-color: $accent-200;
            }
          }
          &.blue-line {
            color: #59C3DA;
            background-color: #D9F4FF;
            border: 1px solid #59C3DA;
            &:hover, &.hover, &:focus, &.focus, &.active {
              background-color: #C5EEFF;
            }
          }
          &.brown-line {
            color: $accent-500;
            background-color: $accent-100;
            border: 1px solid $accent-500;
            &:hover, &.hover, &:focus, &.focus, &.active {
              background-color: #EAD7C0;
            }
          }
          @media screen and (max-height: 600px) {
            @include font-button;  // 手機太短降一級距 SE~I8
          }
        }
        &.back-btn {
          flex-grow: 1;
          .panel-btn {
            color: $alert-400,;
            background-color: $grey-100;
            border: 1px solid $alert-400;
            &:hover, &.hover, &:focus, &.focus, &.active {
              background-color: $alert-200;
            }
          }
        }
      }
    }
    @include screen-up {
      display: none;
    }
  }

</style>