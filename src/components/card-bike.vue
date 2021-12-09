<template>
  <div class="card-container">
    <div class="card-title">
      <div class="card-title-text"><span>{{ data.StationName.Zh_tw }}</span></div>
      <div class="card-title-m-subtitle">
        <div class="left-btn"
          :class="{
            limit: data.AvailableRentBikes == 0 || data.AvailableReturnBikes || 0,
            available: data.AvailableRentBikes > 0 && data.AvailableReturnBikes > 0,
            unavailable: data.AvailableRentBikes == 0 && data.AvailableReturnBikes == 0
          }"
        >{{
          data.AvailableRentBikes > 0 && data.AvailableReturnBikes > 0 ? '可借可還' :
          data.AvailableRentBikes > 0 && data.AvailableReturnBikes == 0 ? '只可借車' :
          data.AvailableRentBikes == 0 && data.AvailableReturnBikes > 0 ? '只可還車' : '站點施工中'
        }}</div>
        <div class="right-msg"><i class="fas fa-map-marker-alt"></i>距離{{ data.DistanceZH }}</div>
      </div>
    </div>
    <div class="card-content-row">
      <div class="card-available" :class="{ limit: data.AvailableRentBikes <= 5, unavailable: data.AvailableRentBikes == 0 }">
        <div class="icon-text"><i class="fas fa-bicycle"></i>可租借</div>
        <div class="count">{{ data.AvailableRentBikes }}</div>
      </div>
      <div class="card-available" :class="{ limit: data.AvailableReturnBikes <= 5, unavailable: data.AvailableReturnBikes == 0 }">
        <div class="icon-text"><i class="fas fa-parking"></i>可停車</div>
        <div class="count">{{ data.AvailableReturnBikes }}</div>
      </div>
    </div>
    <div class="card-footer">
      <div class="left-btn"
        :class="{
          limit: data.AvailableRentBikes == 0 || data.AvailableReturnBikes || 0,
          available: data.AvailableRentBikes > 0 && data.AvailableReturnBikes > 0,
          unavailable: data.AvailableRentBikes == 0 && data.AvailableReturnBikes == 0
        }"
      >{{
        data.AvailableRentBikes > 0 && data.AvailableReturnBikes > 0 ? '可借可還' :
        data.AvailableRentBikes > 0 && data.AvailableReturnBikes == 0 ? '只可借車' :
        data.AvailableRentBikes == 0 && data.AvailableReturnBikes > 0 ? '只可還車' : '站點施工中'
      }}</div>
      <div class="right-msg"><i class="fas fa-map-marker-alt"></i>距離{{ data.DistanceZH }}</div>
    </div>
  </div>
</template>

<script>

export default {
  props: ['data']
}
</script>

<style lang="scss" scoped>
  @import "@/assets/scss/main.scss";

  .card-container {
    @include flex-column-center-center;
    border-bottom: 1px solid $grey-300;
    padding: 1rem 0;
    .card-title {
      @include flex-row-space-between-center;
      width: 100%;
      text-align: left;
      &-text {
        color: $grey-600;
        max-width: 45%;
        margin-right: .5rem;
        > span {
          @include font-button(bold);
          @include ellipsis-text;
        }
      }
      &-m-subtitle {
        @include flex-row-space-between-center;
        flex-grow: 1;
        .left-btn {
          @include font-caption(500);
          padding: .1em .5em;
          border-radius: $normal-bora;
          margin-right: .5rem;
          &.limit {
            @include btn-outline(alert);
          }
          &.available {
            @include btn-outline(accent);
          }
          &.unavailable {
            @include btn-outline(disabled);
          }
        }
        .right-msg {
          @include font-caption(500);
          @include icon-m($icon-ma);
          color: $grey-500;
        }
      }
    }
    .card-content-row {
      @include flex-row-center-center;
      width: 100%;
      padding: .75rem 0;
      .card-available {
        @include flex-row-space-between-center;
        width: 100%;
        border-radius: $normal-bora;
        padding: .5em 1.5em;
        background-color: $primary-200;
        color: $primary-500;
        &.limit {
          background-color: $alert-200;
          color: $alert-600;
        }
        &.unavailable {
          background-color: $grey-200;
          color: $grey-400;
        }
        .icon-text {
          @include font-button(500);
          @include icon-m($icon-ma);
        }
        .count {
          @include font-h5(bold);
        }
        &:first-child {
          margin-right: 1rem;
        }
      }
    }
    .card-footer {
      display: none;
    }
  }

  @include screen-up {
    .card-container {
      .card-title {
        &-text {
          max-width: 80%;
          > span {
            @include font-h5(bold); 
          }
        }
        &-m-subtitle {
          display: none;
        }
      }
      .card-content-row {
        .card-available {
          @include flex-column-space-between-center;
          .count {
            @include font-h4(bold);
            margin-top: .3rem;
          }
        }
      }
      .card-footer {
        @include flex-row-space-between-center;
        width: 100%;
        .left-btn {
          padding: .5em 1em;
          @include btn(.5em);
          @include font-button(500);
          &.limit {
            @include btn-outline(alert);
          }
          &.available {
            @include btn-outline(accent);
          }
          &.unavailable {
            @include btn-outline(disabled);
          }
        }
        .right-msg {
          @include font-button(500);
          @include icon-m(.5em);
          color: $grey-500;
        }
      }
    }
  }
</style>