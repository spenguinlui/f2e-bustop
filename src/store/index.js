import axios from 'axios';
import { authorizationHeader, urlQueryStr, urlPath } from "../modules/api";
import { distance, distanceZh } from "../modules/calculate";

import estimateTimeMock from "../json/citybusEstimateTime.json";

import mapModules from "./map";

export const storeObject = {
  state: {
    landingPageShow: false,
    targetMode: {
      cityBus: {
        currentMode: true,
        routeDetail: false,
        lisboardShow: false
      },
      interCityBus: {
        currentMode: false,
        routeDetail: false,
        lisboardShow: false
      },
      bike: {
        currentMode: false,
        routeDetail: false,
        lisboardShow: true
      },
    },
    searchKeyword: "",
    dataList: [{a: 1},{a: 2},{a: 3},{a: 4},{a: 5},{a: 6},{a: 7}],
    targetCity: "臺北市",
    cityBusRealTimeData: estimateTimeMock,
    interCityBusRealTimeData: [],
    bikeDataList: [],
  },
  getters: {
    landingPageShow: state => state.landingPageShow,
    targetMode: state => state.targetMode,
    searchKeyword: state => state.searchKeyword,
    targetCity: state => state.targetCity,
    
    // dataList
    dataList: state => state.dataList,
    cityBusRealTimeData: state => state.cityBusRealTimeData,
    bikeDataList: state => state.bikeDataList,

    // in charge
    isCityBus: state => state.targetMode.cityBus.currentMode,
    isCityBusDetail: (state) => state.targetMode.cityBus.currentMode ? state.targetMode.cityBus.routeDetail : false,
    isInterCityBus: state => state.targetMode.interCityBus.currentMode,
    isInterCityBusDetail: state => state.targetMode.interCityBus.currentMode ? state.targetMode.interCityBus.routeDetail : false,
    isBike: state => state.targetMode.bike.currentMode,
  },
  mutations: {
    TOGGLE_LANDING_APGE(state, toggle) {
      state.landingPageShow = toggle;
    },
    INIT_TARGET_MODE(state) {
      state.targetMode = {
        cityBus: {
          currentMode: true,
          routeDetail: false,
          lisboardShow: false
        },
        interCityBus: {
          currentMode: false,
          routeDetail: false,
          lisboardShow: false
        },
        bike: {
          currentMode: false,
          routeDetail: false,
          lisboardShow: true
        },
      }
    },
    CHECK_OUT_TARGET_MODE(state, targetType) {
      if (targetType === "cityBus") {
        state.targetMode.cityBus.currentMode = true;
        state.targetMode.interCityBus.currentMode = false;
        state.targetMode.bike.currentMode = false;
      } else if (targetType === "interCityBus") {
        state.targetMode.cityBus.currentMode = false;
        state.targetMode.interCityBus.currentMode = true;
        state.targetMode.bike.currentMode = false;
      } else if (targetType === "bike") {
        state.targetMode.cityBus.currentMode = false;
        state.targetMode.interCityBus.currentMode = false;
        state.targetMode.bike.currentMode = true;
      } else {
        console.log(`CHECK_OUT_TARGET_MODE 錯誤, targetType: ${targetType}`);
      }
    },

    // 公車搜尋輸入/輸出
    ENTER_MSG_TO_KEYWORD: (state, msg) => state.searchKeyword += msg,
    SLICE_ONE_CHAR_FROM_KEYWORD: state => state.searchKeyword = state.searchKeyword.substr(0, state.searchKeyword.length - 1),
    CHECK_OUT_CITY(state, city) {
      state.targetCity = city;
    },
    CHECK_OUTE_ROUTE_DETAIL(state, { busType, index }) {
      if (busType === "cityBus") {
        state.targetMode.cityBus.routeDetail = true;
      } else if (busType === "interCityBus") {
        state.targetMode.interCityBus.routeDetail = true;
      } else {
        console.log(`CHECK_OUTE_ROUTE_DETAIL 錯誤: ${busType}`)
      }
      console.log(index);
    },

    // 單車 ------------
    // 更新單車資料
    UPDATE_BIKE_DATA_LIST: (state, dataList) => state.bikeDataList = dataList,
    // 依照距離位置排序
    SORT_BY_DISTANCE: state => state.bikeDataList = state.bikeDataList.sort((a, b) => a.Distance - b.Distance),
    // 依照可租用量排序
    SORT_BY_RENT: state => state.bikeDataList = state.bikeDataList.sort((a, b) => b.AvailableRentBikes - a.AvailableRentBikes),
    // 依照可還車量排序
    SORT_BY_RETURN: state => state.bikeDataList = state.bikeDataList.sort((a, b) => b.AvailableReturnBikes - a.AvailableReturnBikes),
  },

  actions: {
    updateTargetData({ commit }, targetType) {
      if (targetType === "cityBus") {
        // ... 要附近站點
      } else if (targetType === "interCityBus") {
        // ... 要附近站點
      } else if (targetType === "bike") {
        this.dispatch("getBikeDataList");
      } else {
        console.log(`updateTargetData 錯誤: ${targetType}`);
      }
      commit("CHECK_OUT_TARGET_MODE", targetType);
    },
    filterByCity({ commit }, city) {
      commit("CHECK_OUT_CITY", city);
    },
    getRouteDetail({ commit }, { busType, index }) {
      // ... 要資料
      commit("CHECK_OUTE_ROUTE_DETAIL", { busType, index });
    },
    getBikeDataList({ commit }) {
      const position = this.state.map.currentPosition;
      const stationQuery = { position: position, select: ['StationUID', 'AuthorityID','StationName', 'StationPosition'] };
      const availabilityQuery = { position: position, select: ['StationUID', 'AvailableRentBikes', 'AvailableReturnBikes'] };
      const header = authorizationHeader();
      
      let dataList = [];
      axios({
        method: 'get',
        url: urlQueryStr(urlPath.bikeSt, stationQuery),
        headers: header
      }).then((res) => {
        dataList =  res.data; // 保存第一次站點資料
        axios({
          method: 'get',
          url: urlQueryStr(urlPath.bikeAv, availabilityQuery),
          headers: header
        })
        .then((res) => {
          let avaDataList = res.data;
          avaDataList = avaDataList.map((data) => {
            let findData = dataList.find((d) => d.StationUID === data.StationUID);
            if (findData) data = {...data, ...findData}
            // 改個名字
            data.StationName.Zh_tw = data.StationName.Zh_tw.replace("YouBike1.0_", "");
            data.StationName.Zh_tw = data.StationName.Zh_tw.replace("YouBike2.0_", "");
            const lat = data.StationPosition.PositionLat;
            const lon = data.StationPosition.PositionLon;
            data.Distance = distance(lat, lon, position.latitude, position.longitude);
            data.DistanceZH = distanceZh(data.Distance);
            return data;
          });
          commit("UPDATE_BIKE_DATA_LIST", avaDataList);
          this.dispatch("map/setBikeRentDataOnMap", avaDataList);
        }).catch((e) => {
          console.log(e)
          // 錯誤處理
        })
      }).catch((e) => {
        console.log(e)
        // 錯誤處理
      })
    }
  },
  modules: {
    map: mapModules
  }
}