import { distance, distanceZh } from "../modules/calculate";
import {
  insertNearByStopToDetailList,
  insertTimeArrivalToDetailList,
  insertRouteShapeToDetailList,
  insertRealTimeToDetailList,
  insertReailTimeStopToDeatailList
} from "../modules/data-insert.js";
import {
  AJAX_getBusStopNearBy,
  AJAX_getBusRouteByStop,
  AJAX_getBusRoute,
  AJAX_getBusStopOfRoute,
  AJAX_getBusTimeIfArrival,
  AJAX_getBusShapOfRoute,
  AJAX_getBusRealTime,
  AJAX_getBustRealTimeStop,
  AJAX_getBikeStation,
  AJAX_getBikeAvailability,
  AJAX_getCurrentLocation,
  AJAX_getWeaterTep,
  AJAX_getWeaterRain
} from "../modules/api";

import citysHash from "../json/cityshash.json";
import mapModules from "./map";

export const storeObject = {
  state: {
    landingPageShow: true, // 手機版首頁是否顯示
    targetType: "CB",      // 目標類型 - CB: 市區公車, ICB: 公路客運, Bike: 自行車
    targetCity: "Taipei",  // 目標城市, default: Taipei
    searchKeyword: "",     // 搜尋關鍵字

    // 取回資料列表
    bikeDataList: [],
    busDataList: [],
    busStopDataList: [],
    routeDataList: [],

    // 選定路線
    targetRoute: {
      routeName: "",
      departureStop: "",
      destinationStop: "",
    },

    isRouteDetail: false,   // 是否顯示路線詳細資料
    isGoDirection: true,    // 是否去程

    // 天氣資訊
    weatherData: {
      MaxT: { parameterName: "", parameterValue: "" },    // 最高溫
      MinT: { parameterName: "", parameterValue: "" },    // 最低溫
      Wx: { parameterName: "", parameterValue: "1" },      // 天氣描述
      PoP: { parameterName: "", parameterValue: "" }      // 降雨率
    }
  },
  getters: {
    landingPageShow: state => state.landingPageShow,
    searchKeyword: state => state.searchKeyword,
    targetCity: state => state.targetCity,
    targetRoute: state => state.targetRoute,
    
    // dataList
    bikeDataList: state => state.bikeDataList,
    busDataList: state => state.busDataList,
    busStopDataList: state => state.busStopDataList,
    routeGoDetailList: state => state.routeDataList.length !== 0 ? state.routeDataList[0].Stops : [],
    routeBackDetailList: state => state.routeDataList.length !== 0 ? state.routeDataList[1].Stops : [],

    // in charge
    isCB: state => state.targetType === "CB",
    isICB: state => state.targetType === "ICB",
    isBike: state => state.targetType === "Bike",
    isRouteDetail: state => state.isRouteDetail,
    isGoDirection: state => state.isGoDirection,

    weatherData: state => state.weatherData
  },
  mutations: {
    // 初始化資料類型(按首頁圖用的)
    INIT_TARGET_MODE(state) {
      state.landingPageShow = false;
      state.targetType = "CB";
      state.searchKeyword = "";
      state.isRouteDetail = false;
      state.isGoDirection = true;
      state.bikeDataList = state.busDataList = state.busStopDataList = state.routeDataList = [];
      state.targetRoute = {
        routeName: "",
        departureStop: "",
        destinationStop: ""
      };
    },

    // 公車 & 客運搜尋 輸入/輸出
    UPDATE_KEYWORD: (state, word) => state.searchKeyword = word,
    ENTER_MSG_TO_KEYWORD: (state, msg) => state.searchKeyword += msg,
    SLICE_ONE_CHAR_FROM_KEYWORD: state => state.searchKeyword = state.searchKeyword.substr(0, state.searchKeyword.length - 1),
    CLEAR_OUT_SEARCH_KEY_WORD: state => state.searchKeyword = "",
    
    // 切換手機版首頁
    TOGGLE_LANDING_APGE: (state, toggle) => state.landingPageShow = toggle,
    // 切換資料類型
    CHECK_OUT_TARGET_TYPE: (state, targetType) => state.targetType = targetType,
    // 切換城市
    CHECK_OUT_CITY: (state, city) => state.targetCity = city,
    // 切換至路線動態
    CHECK_OUT_ROUTE_DETAIL_LIST: (state) => state.isRouteDetail = true,
    UPDATE_TARGET_ROUTE: (state, targetRoute) => state.targetRoute = targetRoute,
    // 切換回路線列表
    CLOSE_ROUTE_DETAIL_LIST: (state) => state.isRouteDetail = false,
    // 路線細節判斷
    CHECK_OUT_ROUTE_DIRCTION: (state, isGo) => state.isGoDirection = isGo,

    // 公車 & 客運
    UPDATE_BUS_DATA_LIST: (state, dataList) => state.busDataList = dataList,
    UPDATE_BUS_STOP_DATA_LIST: (state, dataList) => state.busStopDataList = dataList,
    UPDATE_BUS_ROUTE_DATA_LIST: (state, dataList) => state.routeDataList = dataList,
    
    // 單車 ------------

    // 更新單車資料
    UPDATE_BIKE_DATA_LIST: (state, dataList) => state.bikeDataList = dataList,
    
    // 距離排序/可租排序/可還排序
    SORT_BY_DISTANCE: state => state.bikeDataList = state.bikeDataList.sort((a, b) => a.Distance - b.Distance),
    SORT_BY_RENT: state => state.bikeDataList = state.bikeDataList.sort((a, b) => b.AvailableRentBikes - a.AvailableRentBikes),
    SORT_BY_RETURN: state => state.bikeDataList = state.bikeDataList.sort((a, b) => b.AvailableReturnBikes - a.AvailableReturnBikes),

    // 天氣資訊
    UPDATE_WEATHER_DATA: (state, weatherData) => state.weatherData = weatherData,
  },

  actions: {
    // 取得目前位置
    getCurrentPostion({ commit }, currentPosition) {
      commit("map/SET_POSITION", currentPosition);
      this.dispatch("updateTargetData");
      this.dispatch("getCurrentCity", currentPosition);
      this.dispatch("map/setCurrentPosition", currentPosition);
    },

    // 依座標取得目前行政區域(城市)
    getCurrentCity({ commit }, currentPosition) {
      AJAX_getCurrentLocation(currentPosition)
        .then(res => {
          commit("CHECK_OUT_CITY", res.data[0].City);
          this.dispatch("getWeather");
        })
        .catch(error => {
          const errorMsg = `
            getCurrentCity 發生錯誤: ${error}
            currentPosition: [${currentPosition.latitude}, ${currentPosition.longitude}]
          `;
          commit("CHECK_OUT_CITY", "Taipei");
          console.log(errorMsg);
        })
    },

    // 切換目標型態
    checkOutTargetType({ commit }, targetType) {
      commit("CHECK_OUT_TARGET_TYPE", targetType);
      commit("CLOSE_ROUTE_DETAIL_LIST");
      this.dispatch("updateTargetData");
    },

    // 無搜尋狀態下更新資料
    updateTargetData() {
      const { targetType } = this.state;
      if (targetType !== "Bike") {
        this.dispatch("getBusStopList");
      } else {
        this.dispatch("getBikeDataList");
      }
    },

    // 尋找附近公車站牌
    getBusStopList({ commit }) {
      const { targetType, targetCity, map } = this.state;
      const targetParam = {
        type: targetType,
        city: targetCity,
        position: map.currentPosition
      };
      AJAX_getBusStopNearBy(targetParam).then(res => {
        commit("UPDATE_BUS_STOP_DATA_LIST", res.data);
        this.dispatch("map/setBusStopDataOnMap", res.data);
      }).catch(error => {
        let errorMsg = `getBusStopList 發生錯誤: ${error},\ntargetParam: `;
        for (let param in targetParam) errorMsg += `${param}: ${targetParam[param]}, `
        console.log(errorMsg)
      })
    },

    // 依照公車站牌尋找路線
    getBusRoutebyStop({ commit }, stationId) {
      const { targetType, targetCity } = this.state;
      const targetParam = {
        type: targetType,
        city: targetCity,
        stationId: stationId
      };
      AJAX_getBusRouteByStop(targetParam).then(res => {
        commit("UPDATE_BUS_DATA_LIST", res.data);
      }).catch(error => {
        let errorMsg = `getBusStopList 發生錯誤: ${error},\ntargetParam: `;
        for (let param in targetParam) errorMsg += `${param}: ${targetParam[param]}, `
        console.log(errorMsg)
      })
    },

    // 取得路線細節
    getRouteDetail({ commit }, targetRoute) {
      commit("CHECK_OUT_ROUTE_DETAIL_LIST");
      commit("UPDATE_TARGET_ROUTE", targetRoute);
      commit("CLEAR_OUT_SEARCH_KEY_WORD");

      const { targetType, targetCity } = this.state;
      const targetParam = {
        type: targetType,
        city: targetCity,
        routeName: targetRoute.routeName
      };

      Promise.all([
        AJAX_getBusStopOfRoute(targetParam),
        AJAX_getBusTimeIfArrival(targetParam),
        AJAX_getBusShapOfRoute(targetParam),
        AJAX_getBusRealTime(targetParam),
        AJAX_getBustRealTimeStop(targetParam)
      ]).then(res => {
        const stopList = res[0].data;
        const timeList = res[1].data;
        const routeList = res[2].data;
        const realTimeList = res[3].data;
        const realTimeStopList = res[4].data;

        let detailList = JSON.parse(JSON.stringify(stopList));
        
        detailList = insertNearByStopToDetailList(detailList, this.state.map.currentPosition);
        detailList = insertTimeArrivalToDetailList(detailList, timeList);
        detailList = insertRouteShapeToDetailList(detailList, routeList);
        detailList = insertRealTimeToDetailList(detailList, realTimeList);
        detailList = insertReailTimeStopToDeatailList(detailList, realTimeStopList);
        
        commit("UPDATE_BUS_ROUTE_DATA_LIST", detailList);
        
        // 地圖分別打上 站點、路線、動態
        this.dispatch("map/setBusStopDataOnMap");
        this.dispatch("map/setBusRouteDataOnMap");
        this.dispatch("map/setBusRealTimeOnMap");
      }).catch(error => {
        let errorMsg = `getRouteDetail 發生錯誤: ${error},\ntargetParam: `;
        for (let param in targetParam) errorMsg += `${param}: ${targetParam[param]}, `
        console.log(errorMsg)
      })
    },

    // 刷新路線細節
    refreshRouteDetail({ commit }) {
      const { targetType, targetCity, targetRoute, routeDataList } = this.state;
      const targetParam = {
        type: targetType,
        city: targetCity,
        routeName: targetRoute.routeName
      };

      Promise.all([
        AJAX_getBusTimeIfArrival(targetParam),
        AJAX_getBusRealTime(targetParam),
        AJAX_getBustRealTimeStop(targetParam)
      ]).then(res => {
        const timeList = res[0].data;
        const realTimeList = res[1].data;
        const realTimeStopList = res[2].data;

        let detailList = JSON.parse(JSON.stringify(routeDataList));
        detailList = insertTimeArrivalToDetailList(detailList, timeList);
        detailList = insertRealTimeToDetailList(detailList, realTimeList);
        detailList = insertReailTimeStopToDeatailList(detailList, realTimeStopList);

        commit("UPDATE_BUS_ROUTE_DATA_LIST", detailList);

        // 只清掉公車動態再重新打新的上去
        this.dispatch("map/removeBusPointLayers");
        this.dispatch("map/setBusRealTimeOnMap");
      }).catch(error => {
        let errorMsg = `refreshRouteDetail 發生錯誤: ${error},\ntargetParam: `;
        for (let param in targetParam) errorMsg += `${param}: ${targetParam[param]}, `
        console.log(errorMsg)
      })
    },

    // 關鍵字搜尋客運
    getBusDataWithKeyword({ commit }) {
      const { targetType, targetCity, searchKeyword } = this.state;
      let targetParam = {
        type: targetType,
        keyword: searchKeyword
      }
      if (targetType === "CB") targetParam.city = targetCity;

      AJAX_getBusRoute(targetParam)
        .then(res => {
          commit("UPDATE_BUS_DATA_LIST", res.data);
        })
        .catch(error => {
          let errorMsg = `getBusDataWithKeyword 發生錯誤: ${error},\ntargetParam: `;
          for (let param in targetParam) errorMsg += `${param}: ${targetParam[param]}, `
          console.log(errorMsg)
        })
    },

    // 取得附近單車站點
    getBikeDataList({ commit }) {
      const position = this.state.map.currentPosition;

      Promise.all([
        AJAX_getBikeStation(position),
        AJAX_getBikeAvailability(position)
      ]).then(res => {
        const dataList = res[0].data;
        let avaDataList = res[1].data;
        avaDataList = avaDataList.map(
          data => {
            const { PositionLat, PositionLon } = data.StationPosition;
            let findData = dataList.find((d) => d.StationUID === data.StationUID);
            if (findData) data = {...data, ...findData}
            // 改個名字
            data.StationName.Zh_tw = data.StationName.Zh_tw.replace("YouBike1.0_", "");
            data.StationName.Zh_tw = data.StationName.Zh_tw.replace("YouBike2.0_", "");
            data.Distance = distance(PositionLat, PositionLon, position.latitude, position.longitude);
            data.DistanceZH = distanceZh(data.Distance);
            return data;
          }
        );
        commit("UPDATE_BIKE_DATA_LIST", avaDataList);
        this.dispatch("map/setBikeRentDataOnMap", avaDataList);
      }).catch(error => {
        let errorMsg = `getBikeDataList 發生錯誤: ${error}`;
        console.log(errorMsg)
      })
    },

    // 取得天氣資料
    getWeather({ commit }) {
      const location = citysHash[this.state.targetCity].cityName;
      const weatherLocation = citysHash[this.state.targetCity].locationName;

      Promise.all([
        AJAX_getWeaterRain(location), AJAX_getWeaterTep(weatherLocation)
      ]).then(res => {
        const locationData = res[0].data.records.location[0];
        const weatherElements = locationData.weatherElement.reduce(
          (neededElements, item) => {
            if (["Wx", "MaxT", "MinT", "PoP"].includes(item.elementName)) {
              neededElements[item.elementName] = item.time[0].parameter;
            }
            return neededElements;
          },
          {}
        );
        const TepLocationData = res[1].data.records.location[0];
        TepLocationData.weatherElement.forEach(
          item => {
            if (["TEMP"].includes(item.elementName)) {
              weatherElements[item.elementName] = item.elementValue;
            }
          }
        );
        commit("UPDATE_WEATHER_DATA", weatherElements);
      }).catch(error => {
        let errorMsg = `getWeather 發生錯誤: ${error}`;
        console.log(errorMsg)
      })
    }
  },
  modules: {
    map: mapModules
  }
}