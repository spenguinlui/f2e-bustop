<template>
  <div>
    <!-- <div id="map"></div> -->
  </div>
</template>

<script>
// import L from 'leaflet';
// import { mapGetters } from 'vuex';

export default {
  methods: {
    // initMap() {
    //   const map = L.map('map', { zoomControl: false }).setView([25.046951, 121.516887], 16);
    //   L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    //     attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    //     opacity: 0.5
    //   }).addTo(map);
    //   L.control.zoom({ position: 'topright' }).addTo(map);
    //   this.$store.commit("SET_MAP_OBJECT", map);
    // }
  },
  mounted() {
    // this.initMap();
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  #map {
    width: 100%;
    height: 100%;
    margin-top: $nav-bar-m-h;
    @mixin pad-up {
      margin-top: $nav-bar-h;
    }
  }

</style>