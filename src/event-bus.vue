<template>
  <div>
    
  </div>
</template>

<script>
export default {
  created() {
    this.$bus.$on("get-position", callback => this.getCurrentPosition(callback));
    this.$bus.$on("check-city", city => this.checkCity(city));
  },
  methods: {
    getCurrentPosition(callback) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          const currentPosition = { latitude: position.coords.latitude, longitude: position.coords.longitude };
          this.$store.commit("UPDATE_ALLOW_POSITION");
          this.$store.dispatch("getCurrentPostion", currentPosition);
          if (callback) callback();
        }, () => {
          window.alert("建議允許定位功能取用您的位置已獲得更完整的服務，預設定位於台北車站");
        })
      } else {
        window.alert("無定位功能，預設定位於台北車站");
      }
    },
    checkCity(city) {
      this.$store.commit("CHECK_OUT_CITY", city);
      this.$store.dispatch("getWeather");
      this.$store.dispatch("getBusDataWithKeyword");
    }
  },
  beforeDestroy() {
    this.$bus.$off("get-position");
    this.$bus.$off("check-city");
  }
}
</script>