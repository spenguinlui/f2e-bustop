import { AJAX_getCurrentLocation } from "../modules/gist";
import {
  AJAX_getBusStopNearBy,
  AJAX_getBusRouteByStop,
  AJAX_getBusRoute,
  getBusRouteData, refreshBusRouteData
} from "../modules/ptx_bus";
import { getbikeStation } from "../modules/ptx_bike";
import { getWeatherNowData } from "../modules/weather";

import citysHash from "../json/cityshash.json";
import mapModules from "./map";

export const storeObject = {
  state: {
    allowPosition: false,  // 使用者是否允許定位
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
    isDetailContent: false, // 是否顯示路線資訊(只有文字沒有列表)

    // 天氣資訊
    weatherData: {
      MaxT: { parameterName: "", parameterValue: "" },    // 最高溫
      MinT: { parameterName: "", parameterValue: "" },    // 最低溫
      Wx: { parameterName: "", parameterValue: "1" },      // 天氣描述
      PoP: { parameterName: "", parameterValue: "" }      // 降雨率
    }
  },
  getters: {
    allowPosition: state => state.allowPosition,
    landingPageShow: state => state.landingPageShow,
    searchKeyword: state => state.searchKeyword,
    targetCity: state => state.targetCity,
    targetRoute: state => state.targetRoute,
    
    // dataList
    bikeDataList: state => state.bikeDataList,
    busDataList: state => state.busDataList,
    busStopDataList: state => state.busStopDataList,
    routeDataList: state => state.routeDataList,
    routeGoDetailList: state => state.routeDataList.length !== 0 ? state.routeDataList[0].Stops : [],
    routeBackDetailList: state => state.routeDataList.length !== 0 ? state.routeDataList.length !== 1 ? state.routeDataList[1].Stops : state.routeDataList[0].Stops : [],

    // in charge
    isCB: state => state.targetType === "CB",
    isICB: state => state.targetType === "ICB",
    isBike: state => state.targetType === "Bike",
    isRouteDetail: state => state.isRouteDetail,
    isGoDirection: state => state.isGoDirection,
    isDetailContent: state => state.isDetailContent,

    weatherData: state => state.weatherData
  },
  mutations: {
    // 更新同意定位
    UPDATE_ALLOW_POSITION: (state) => state.allowPosition = true,
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
    // 切換路線細節資訊
    CHECK_OUT_ROUTE_INFO: (state, toggle) => state.isDetailContent = toggle,

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
    getCurrentPostion({ commit, dispatch }, currentPosition) {
      commit("map/SET_POSITION", currentPosition);
      dispatch("updateTargetData");
      dispatch("getCurrentCity", currentPosition);
      dispatch("getWeather");
      dispatch("map/setCurrentPosition", currentPosition);
    },

    // 更新目前位置(移動地圖)
    updateCurrentPosition({ commit, dispatch }, currentPosition) {
      dispatch("map/removeOtherLayers", currentPosition);
      commit("map/SET_POSITION", currentPosition);
      dispatch("updateTargetData", false);
    },

    // 依座標取得目前行政區域(城市)
    getCurrentCity({ commit }, currentPosition) {
      AJAX_getCurrentLocation(currentPosition)
      .then(res => {
        commit("CHECK_OUT_CITY", res.data[0].City);
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
    checkOutTargetType({ commit, dispatch }, targetType) {
      commit("CHECK_OUT_TARGET_TYPE", targetType);
      commit("CLOSE_ROUTE_DETAIL_LIST");
      dispatch("updateTargetData");
    },

    // 無搜尋狀態下更新資料
    updateTargetData({ state, dispatch }, focus = true) {
      const { targetType } = state;
      if (targetType !== "Bike") {
        dispatch("getBusStopList");
      } else {
        dispatch("getBikeDataList");
      }
      if (focus) dispatch("map/focusCurrentPosition");
    },

    // 尋找附近公車站牌
    getBusStopList({ commit, state, dispatch }) {
      const { targetType, targetCity, map } = state;
      const targetParam = {
        type: targetType,
        city: targetCity,
        position: map.currentPosition
      };
      AJAX_getBusStopNearBy(targetParam).then(res => {
        commit("UPDATE_BUS_STOP_DATA_LIST", res.data);
        dispatch("map/setBusStopDataOnMap", res.data);
      }).catch(error => {
        let errorMsg = `getBusStopList 發生錯誤: ${error},\ntargetParam: `;
        for (let param in targetParam) errorMsg += `${param}: ${targetParam[param]}, `
        console.log(errorMsg)
      })
    },

    // 關鍵字搜尋公車客運
    getBusDataWithKeyword({ commit, state }) {
      const { targetType, targetCity, searchKeyword } = state;
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

    // 依照公車站牌尋找路線
    getBusRoutebyStop({ commit, state }, stationId) {
      const { targetType, targetCity } = state;
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
    getRouteDetail({ commit, state, dispatch }, targetRoute) {
      commit("CHECK_OUT_ROUTE_DETAIL_LIST");
      commit("UPDATE_TARGET_ROUTE", targetRoute);
      commit("CLEAR_OUT_SEARCH_KEY_WORD");

      const targetParam = {
        type: state.targetType,
        city: state.targetCity,
        routeName: targetRoute.routeName,
        currentPosition: state.map.currentPosition
      };

      getBusRouteData(targetParam)
      .then(res => {
        commit("UPDATE_BUS_ROUTE_DATA_LIST", res);

        // 地圖分別打上 站點、路線、動態
        dispatch("map/setBusStopDataOnMap");
        dispatch("map/setBusRouteDataOnMap");
        dispatch("map/setBusRealTimeOnMap");
      })
      .catch(error => {
        let errorMsg = `getRouteDetail 發生錯誤: ${error},\ntargetParam: `;
        for (let param in targetParam) errorMsg += `${param}: ${targetParam[param]}, `
        console.log(errorMsg)
      })
    },

    // 刷新路線細節
    refreshRouteDetail({ commit, state, dispatch }) {
      const { targetType, targetCity, targetRoute, routeDataList } = state;
      const targetParam = {
        type: targetType,
        city: targetCity,
        routeName: targetRoute.routeName
      };

      // 假如沒有指定路線就不更新
      if (!targetRoute.routeName) { return; }

      refreshBusRouteData(targetParam, routeDataList)
      .then(res => {
        commit("UPDATE_BUS_ROUTE_DATA_LIST", res);

        // 只清掉公車動態再重新打新的上去
        dispatch("map/removeBusPointLayers");
        dispatch("map/setBusRealTimeOnMap");
      })
      .catch(error => {
        let errorMsg = `refreshRouteDetail 發生錯誤: ${error},\ntargetParam: `;
        for (let param in targetParam) errorMsg += `${param}: ${targetParam[param]}, `
        console.log(errorMsg)
      })
    },

    // 取得附近單車站點
    getBikeDataList({ commit, state, dispatch }) {
      const position = state.map.currentPosition;

      getbikeStation(position)
      .then(res => {
        commit("UPDATE_BIKE_DATA_LIST", res);
        dispatch("map/setBikeRentDataOnMap", res);
      })
      .catch(error => {
        console.log(`getBikeDataList 發生錯誤: ${error}`)
      })
    },

    // 取得天氣資料
    getWeather({ commit, state }) {
      const location = citysHash[state.targetCity].cityName;
      const weatherLocation = citysHash[state.targetCity].locationName;

      getWeatherNowData(location, weatherLocation)
      .then(res => {
        commit("UPDATE_WEATHER_DATA", res);
      })
      .catch(error => {
        console.log(`getWeather 發生錯誤: ${error}`)
      })
    }
  },
  modules: {
    map: mapModules
  }
}