<template>
  <div>
    <div class="select-area-block">
      <div class="area-container">
        <div v-for="data in citysData" :key="data.area" class="area-block">
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
        this.$store.dispatch("getCBdataListWithKeyWord", { city: city, keyword: this.searchKeyword });
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .select-area-block {
    width: 390px;
    padding: 28px 24px;
    position: absolute;
    left: 0;
    top: 40px;
    background-color: $grey-100;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
    z-index: 1;
    cursor: default;
    border-radius: $normal-bora;
    .area-container {
      height: 270px;
      overflow: auto;
      .area-block {
        color: $grey-600;
        &:not(:last-child) {
          border-bottom: 1px solid $grey-300;
        }
        padding: 12px 0;
        .city-title {
          @include flex-row-flex-start-center;
          .city-text {
            @include font-content(bold);
          }
          .title-icon {
            margin-left: 8px;
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
          gap: 19px;
          .area-item {
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