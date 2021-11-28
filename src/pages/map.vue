<template>
  <div id="map"></div>
</template>

<script>
import L from 'leaflet';
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState("map", ['currentPosition'])
  },
  methods: {
    initMap() {
      const map = L.map('map', { zoomControl: false })
        .setView([this.currentPosition.latitude, this.currentPosition.longitude], 16);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        opacity: 0.5
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);
      this.$store.commit("map/SET_MAP_OBJECT", map);
    },
    getCurrentPosition() {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.setPosition(position);
        }, () => {
          window.alert("無定位，預設定位於台北車站")
        })
      } else {
        window.alert("無定位，預設定位於台北車站")
      }
    },
    setPosition(position) {
      const currentPosition = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      this.$store.dispatch("map/setCurrentPosition", currentPosition);
    },
  },
  created() {
    this.getCurrentPosition();
  },
  mounted() {
    this.initMap();
  }
}
</script>

<style lang="scss">
  @import "@/assets/scss/main.scss";

  #map {
    width: 100%;
    height: 100%;
    margin-top: $nav-bar-m-h;
    position: fixed;
    left: 0;
    top: 0;
    z-index: -1;
    @mixin screen-up {
      margin-top: $nav-bar-h;
    }
  }

  .bike-maker-icon {
    width: 58px;
    height: 77px;
    &.default {
      background-image: url("../assets/images/bike-maker-icon-default.svg");
      color: $primary-500;
    }
    &.limit {
      background-image: url("../assets/images/bike-maker-icon-limit.svg");
      color: $alert-500;
    }
    &.disable {
      background-image: url("../assets/images/bike-maker-icon-disable.svg");
      color: $grey-500;
    }
    .bike-maker-icon-text {
      @include font-h5(bold);
      width: 30px;
      height: 30px;
      position: absolute;
      left: 14px;
      top: 16px;
      text-align: center;
      color: inherit;
    }
  }
  .bike-tooltips {
    width: 344px;
    // height: 96px;
    .leaflet-popup-content-wrapper {
      box-shadow: none;
    }
    .leaflet-popup-tip-container {
      display: none;
    }
    .leaflet-popup-content {
      margin: 0;
    }
    background-color: $grey-100;
    border: 2px solid $primary-300;
    box-shadow: 4px 4px 20px rgba(118, 118, 118, 0.3);;
    border-radius: 8px;
    padding: 16px 24px;
    @include flex-column-center-baseline;
    .tooltips-title {
      @include font-content(bold);
      color: $primary-500;
      margin: 8px 0;
    }
    .tooltips-content {
      @include flex-row-space-between-center;
      width: 100%;
      .block-left {
        @include flex-row-center-center;
        .bike-block, .stop-block {
          @include font-button(bold);
          @include icon-m(9px);
          padding: 4px 12px;
          background-color: $primary-100;
          color: $primary-500;
          border-radius: 4px;
          &.limit {
            background-color: $alert-100;
            color: $alert-500;
          }
          &.disable {
            background-color: $grey-200;
            color: $grey-500;
          }
        }
        .bike-block {
          margin-right: 12px;
        }
      }
      .block-right {
        @include font-button(500);
        @include icon-m(6px);
        color: $grey-500;
      }
    }
  }

</style>