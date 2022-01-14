<template>
  <div class="keepmsg">
    <p class="msg">為了確保最佳的使用體驗，請將您的螢幕轉為直向，謝謝！</p>
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
    width: 100%;
    height: 100%;
    background: $primary-300;
    color: $grey-100;
    z-index: $keepmsg;
    .msg {
      @include font-h5(bold);
    }
  }
</style>