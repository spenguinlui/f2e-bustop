<template>
  <div>
    <div class="select-area-block">
      <div class="area-container">
        <div v-for="data in citysData" :key="data.area" class="area-block" :class="{ noshow: currentArea !== data.area }">
          <div class="city-title" @click.prevent.stop="toggleList(data.area)">
            <div class="city-text">{{ data.area }}</div>
            <div class="title-icon" :class="{ show: currentArea === data.area }"></div>
          </div>
          <div class="area-list" v-show="currentArea === data.area">
            <div class="area-item"
              v-for="city in data.citys" :key="city.enName"
              @click="checkCity(city.enName)"
              :class="{ active: targetCity === city.enName }">
              {{ city.cityName }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
  import CitysData from "../json/citys.json";

  export default {
    data () {
      return {
        citysData: CitysData,
        currentArea: "北部"
      }
    },
    computed: {
      ...mapGetters(['targetCity'])
    },
    methods: {
      toggleList(area) {
        this.currentArea = area;
      },
      checkCity(city) {
        this.$store.commit("CHECK_OUT_CITY", city);
        this.$store.dispatch("getWeather");
        this.$store.dispatch("getCBdataListWithKeyWord", { city: city, keyword: this.searchKeyword });
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .select-area-block {
    @include posi(a);
    top: 40px;
    width: 390px;
    padding: 1.5rem;
    background-color: $grey-100;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
    cursor: default;
    border-radius: $normal-bora;
    z-index: $select-city-block;
    .area-container {
      @include scroll;
      height: 270px;
      .area-block {
        color: $grey-600;
        padding: .75rem 0;
        &:not(:last-child) {
          border-bottom: 1px solid $grey-300;
        }
        &.noshow {
          cursor: pointer;
        }
        .city-title {
          @include flex-row-flex-start-center;
          .city-text {
            @include font-content(bold);
          }
          .title-icon {
            margin-left: .5rem;
            // 以下三角型設定
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 6px 0 6px 10px;
            border-color: transparent transparent transparent $grey-500;
            @include transi(.2s);
            &.show {
              transform: rotate(90deg); // 控制去增加這個
            }
          }
        }
        .area-list {
          @include flex-row-flex-start-center;
          margin-top: 7px;
          .area-item {
            cursor: pointer;
            &:not(:last-child) {
              margin-right: 19px;
            }
            @include font-button(500);
            &:hover {
              color: $primary-400;
            }
            &.active {
              color: $primary-600;
            }
          }
        }
      }
    }
  }

</style>