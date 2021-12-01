<template>
  <div class="key-board-container"
    :class="{ inter: isICB, detail: isCB ? isCBdetail : isICBdetail }"
    v-if="!isBike && !landingPageShow">
    <div class="select-city-container">
      <div class="city-tag"
        :class="{ active: targetCity === city.enName }"
        v-for="city in cityTagList" :key="city.enName"
        @click="checkCity(city.enName)">
        {{ city.cityName }}
      </div>
    </div>
    <div class="key-board-panel">
      <div class="city-panel" v-if="isCB">
        <div class="panel-container" @click="enterBtn('紅')"><div class="red-line panel-btn">紅</div></div>
        <div class="panel-container" @click="enterBtn('綠')"><div class="green-line panel-btn">綠</div></div>
        <div class="panel-container" @click="enterBtn('橘')"><div class="orange-line panel-btn">橘</div></div>
        <div class="panel-container" @click="enterBtn('藍')"><div class="blue-line panel-btn">藍</div></div>
        <div class="panel-container" @click="enterBtn('棕')"><div class="brown-line panel-btn">棕</div></div>
      </div>
      <div class="route-panel" v-if="isCB">
        <div class="panel-container" @click="enterBtn('幹線')"><div class="panel-btn">幹線</div></div>
        <div class="panel-container" @click="enterBtn('1')"><div class="panel-btn">1</div></div>
        <div class="panel-container" @click="enterBtn('2')"><div class="panel-btn">2</div></div>
        <div class="panel-container" @click="enterBtn('3')"><div class="panel-btn">3</div></div>
        <div class="panel-container" @click="enterBtn('通勤')"><div class="panel-btn">通勤</div></div>
        <div class="panel-container" @click="enterBtn('4')"><div class="panel-btn">4</div></div>
        <div class="panel-container" @click="enterBtn('5')"><div class="panel-btn">5</div></div>
        <div class="panel-container" @click="enterBtn('6')"><div class="panel-btn">6</div></div>
        <div class="panel-container" @click="enterBtn('小巴')"><div class="panel-btn">小巴</div></div>
        <div class="panel-container" @click="enterBtn('7')"><div class="panel-btn">7</div></div>
        <div class="panel-container" @click="enterBtn('8')"><div class="panel-btn">8</div></div>
        <div class="panel-container" @click="enterBtn('9')"><div class="panel-btn">9</div></div>
        <div class="panel-container" @click="enterBtn('接駁')"><div class="panel-btn">接駁</div></div>
        <div class="panel-container" @click="enterBtn('0')"><div class="panel-btn">0</div></div>
        <div class="panel-container back-btn" @click="backSpaceBtn"><div class="panel-btn"><i class="fas fa-backspace"></i></div></div>
      </div>
      <div class="inner-city-panel" v-if="isICB">
        <div class="panel-container" @click="enterBtn('北部')"><div class="panel-btn">北部</div></div>
        <div class="panel-container" @click="enterBtn('1')"><div class="panel-btn">1</div></div>
        <div class="panel-container" @click="enterBtn('2')"><div class="panel-btn">2</div></div>
        <div class="panel-container" @click="enterBtn('3')"><div class="panel-btn">3</div></div>
        <div class="panel-container" @click="enterBtn('中部')"><div class="panel-btn">中部</div></div>
        <div class="panel-container" @click="enterBtn('4')"><div class="panel-btn">4</div></div>
        <div class="panel-container" @click="enterBtn('5')"><div class="panel-btn">5</div></div>
        <div class="panel-container" @click="enterBtn('6')"><div class="panel-btn">6</div></div>
        <div class="panel-container" @click="enterBtn('南部')"><div class="panel-btn">南部</div></div>
        <div class="panel-container" @click="enterBtn('7')"><div class="panel-btn">7</div></div>
        <div class="panel-container" @click="enterBtn('8')"><div class="panel-btn">8</div></div>
        <div class="panel-container" @click="enterBtn('9')"><div class="panel-btn">9</div></div>
        <div class="panel-container" @click="enterBtn('東部')"><div class="panel-btn">東部</div></div>
        <div class="panel-container" @click="enterBtn('0')"><div class="panel-btn">0</div></div>
        <div class="panel-container back-btn" @click="backSpaceBtn"><div class="panel-btn"><i class="fas fa-backspace"></i></div></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CitysData from "../json/citys.json";

export default {
  data() {
    return {
      citysData: CitysData,
      keyword: ""
    }
  },
  computed: {
    ...mapGetters(['landingPageShow', 'targetCity', 'searchKeyword', 'isCB', 'isCBdetail','isICB', 'isICBdetail', 'isBike']),
    cityTagList() {
      let cityList = [];
      this.citysData.forEach((data) => data.citys.forEach((city) => cityList.push(city)))
      return cityList
    }
  },
  methods: {
    enterBtn(msg) {
      this.$store.commit("ENTER_MSG_TO_KEYWORD", msg);
      if (this.isCB)
        this.$store.dispatch("getCBdataListWithKeyWord", { city: this.targetCity, keyword: this.searchKeyword });
      else
        this.$store.dispatch("getICBdataListWithKeyWord", { city: this.targetCity, keyword: this.searchKeyword });
    },
    backSpaceBtn() {
      this.$store.commit("SLICE_ONE_CHAR_FROM_KEYWORD");
    },
    checkCity(city) {
      this.$store.commit("CHECK_OUT_CITY", city);
      this.$store.dispatch("getCBdataListWithKeyWord", { city: city, keyword: this.searchKeyword });
    }
  },
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .key-board-container {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: $grey-100;
    z-index: $key-board;
    @include transi;
    &.detail {
      bottom: -400px;
    }
    // &.inter {
    //   height: 300px;
    // }
    .select-city-container {
      @include flex-row-flex-start-center;
      width: 100%;
      background-color: $primary-200;
      padding: 12px 0;
      flex-wrap: nowrap;
      overflow: auto;
      .city-tag {
        @include flex-col(2);
        @include btn;
        @include btn-filled($primary-400);
        @include font-caption(bold);
        padding: 4px 8px;
        min-width: 55px;
        margin-right: 12px;
        &:nth-child(1) {
          margin-left: 20px;
        }

        &.active {
          background-color: $primary-600;
        }
      }
    }
    .key-board-panel {
      padding: 12px 20px;
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
        padding-right: 10px;
        padding-bottom: 10px;
        .panel-btn {
          @include btn;
          @include btn-outline-color($primary-500, $grey-100, $primary-500);
          @include font-content;
          height: 40px;
          &.red-line { @include btn-outline-color($alert-300, $alert-100, $alert-300) }
          &.green-line { @include btn-outline-color($primary-500, $primary-100, $primary-500) }
          &.orange-line { @include btn-outline-color($accent-400, $accent-100, $accent-400) }
          &.blue-line { @include btn-outline-color(#59C3DA, #D9F4FF, #59C3DA) }
          &.brown-line { @include btn-outline-color($accent-500, $accent-100, $accent-500) }
        }
        &.back-btn {
          flex-grow: 1;
          .panel-btn {
            @include btn-outline-color($alert-400, $grey-100, $alert-400);
          }
        }
      }
    }
  }

</style>