<template>
  <div id="map"></div>
</template>

<script>
import L from 'leaflet';
import { mapGetters, mapState } from 'vuex';

export default {
  computed: {
    ...mapState("map", ['currentPosition']),
    ...mapGetters(['targetRoute', 'isCB', 'isICB', 'isRouteDetail'])
  },
  methods: {
    initMap() {
      const { latitude, longitude } = this.currentPosition;
      const map = L.map('map', { zoomControl: false })
        .setView([latitude, longitude], 16);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        opacity: 0.5
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);
      this.$store.commit("map/SET_MAP_OBJECT", map);

      map.on("moveend", () => {
        const newCenter = map.getCenter();
        this.$store.dispatch("updateCurrentPosition", { latitude: newCenter.lat, longitude: newCenter.lng });
        console.log(newCenter.lat, newCenter.lng)
      })
    }
  },
  mounted() {
    this.initMap();
    this.$bus.$emit("get-position");
  }
}
</script>

<style lang="scss">
  @import "@/assets/scss/main.scss";

  #map {
    @include posi(f);
    width: 100%;
    height: calc(100% - #{$nav-bar-m-h}vh - 27vh);
    height: calc(100% - #{$nav-bar-m-h}vh - var(--vh, 1vh) * 27);
    margin-top: #{$nav-bar-m-h}vh;
    margin-top: calc(var(--vh, 1vh) * #{$nav-bar-m-h});
    z-index: $map;
    @include screen-up {
      height: calc(100% - #{$nav-bar-h} - #{$footer-h});
      margin-top: $nav-bar-h;
      margin-bottom: $footer-h;
    }
  }

  .center-marker-icon {
    background-image: url("../assets/images/center-m.svg");
    background-repeat: no-repeat;
    background-position: center;
    @include screen-up {
      background-image: url("../assets/images/center-pc.svg");
    }
  }

  .bus-stop-marker-icon {
    background-image: url("../assets/images/bus-stop-marker-m.svg");
    background-repeat: no-repeat;
    background-position: bottom;
    @include screen-up {
      background-image: url("../assets/images/bus-stop-marker.svg");
    }
  }

  .bus-popup {
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
    box-shadow: 4px 4px 12px rgba(118, 118, 118, 0.3);
    border-radius: 4px;
    padding: 8px 12px;
    .popup-title {
      @include font-button(bold);
      color: $primary-600;
      margin-right: 12px;
    }
    .popup-direction {
      @include font-overline(500);
      color: $grey-600;
      margin-top: 2px;
    }
  }

  .bus-point-marker-icon {
    background-image: url("../assets/images/bus-point-m.svg");
    background-repeat: no-repeat;
    background-position: center;
    @include screen-up {
      background-image: url("../assets/images/bus-point.svg");
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