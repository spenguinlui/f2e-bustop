<template>
  <div class="keepmsg">
    <div class="msg">為了確保最佳的使用體驗，請將您的螢幕轉為直向，謝謝！</div>
  </div>
</template>

<script>
export default {
  
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .keepmsg {
    @include posi(f);
    @include flex-row-center-center;
    width: 100vw;
    height: 100vh;
    background: $primary-300;
    color: $grey-100;
    z-index: 1000;
    .msg {
      @include font-h5(bold);
    }
  }
</style>