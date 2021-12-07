import { distance, distanceZh } from "../modules/calculate";
import citysHash from "../json/cityshash.json";
import {
  AJAX_getBusStopNearBy,
  AJAX_getBusRoute,
  AJAX_getBusStopOfRoute,
  AJAX_getBusTimeIfArrival,
  AJAX_getBusShapOfRoute,
  AJAX_getBusRealTime,
  AJAX_getBustRealTimeStop,
  AJAX_getBikeStation,
  AJAX_getBikeAvailability,
  AJAX_getCurrentLocation,
  AJAX_getWeaterRain
} from "../modules/api";

import mapModules from "./map";

// 路線細節塞入預估時間
const insertTimeArrivalToDetailList = (detailList, timeList) => {
  detailList.map((detailListDir) => {
    const direction = detailListDir.Direction;
    detailListDir.Stops = detailListDir.Stops.map((detailData) => {
      let findData = timeList.find(timeData => timeData.Direction === direction && detailData.StopUID === timeData.StopUID);
      if (findData) detailData = { ...detailData, ...findData }
      return detailData;
    });
  })
  return detailList;
}

// 路線細節塞入路線圖資
const insertRouteShapeToDetailList = (detailList, routeList) => {
  detailList[0].Geometry = routeList[0].Geometry;
  routeList[1] ? detailList[1].Geometry = routeList[1].Geometry : detailList[1].Geometry = routeList[0].Geometry;
  return detailList
}

// 路線細節塞入公車動態
const insertRealTimeToDetailList = (detailList, realTimeList) => {
  detailList.map((detailListDir) => {
    const direction = detailListDir.Direction;
    detailListDir.BusRealTime = [];
    realTimeList.forEach(rtData => rtData.Direction === direction && detailListDir.BusRealTime.push(rtData));
  })
  return detailList;
}

// 路線細節塞入公車動態站名
const insertReailTimeStopToDeatailList = (detailList, realTimeStopList) => {
  detailList.map((detailListDir) => {
    const direction = detailListDir.Direction;
    detailListDir.Stops = detailListDir.Stops.map((detailData) => {
      let findData = realTimeStopList.find(timeData => timeData.Direction === direction && detailData.StopUID === timeData.StopUID);
      if (findData) detailData = { ...detailData, ...findData }
      return detailData;
    });
  })
  return detailList;
}

export const storeObject = {
  state: {
    landingPageShow: true,
    targetMode: {
      CB: {
        currentMode: true,
        routeDetail: false,
      },
      ICB: {
        currentMode: false,
        routeDetail: false,
      },
      Bike: {
        currentMode: false,
        routeDetail: false,
      },
    },

    // 目標類型 - CB: 市區公車, ICB: 公路客運, Bike: 自行車
    targetType: "CB", 

    // 搜尋關鍵字
    searchKeyword: "",

    // 目標城市
    targetCity: "Taipei",

    // data
    BikeDataList: [],
    CBdataList: [],
    CBrouteDetailList: [],
    CBstopList: [],
    ICBdataList: [],
    ICBrouteDetailList: [],
    ICBstopList: [],

    // 詳細內容判斷
    targetRoute: {
      routeName: "",
      departureStop: "",
      destinationStop: "",

    },

    // 是否去程
    isCBgo: true,
    isICBgo: true,

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
    targetMode: state => state.targetMode,
    searchKeyword: state => state.searchKeyword,
    targetCity: state => state.targetCity,
    targetRoute: state => state.targetRoute,
    
    // dataList
    BikeDataList: state => state.BikeDataList,
    CBdataList: state => state.CBdataList,
    CBrouteDetailList: state => state.CBrouteDetailList,
    goCBrouteDetailList: (state) => state.CBrouteDetailList.length !== 0 ? state.CBrouteDetailList[0].Stops : [],
    backCBrouteDetailList: (state) => state.CBrouteDetailList.length !== 0 ? state.CBrouteDetailList[1].Stops : [],
    CBstopList: (state) => state.CBstopList,
    ICBdataList: state => state.ICBdataList,
    ICBrouteDetailList: state => state.ICBrouteDetailList,
    goICBrouteDetailList: (state) => state.ICBrouteDetailList.length !== 0 ? state.ICBrouteDetailList[0].Stops : [], 
    backICBrouteDetailList: (state) => state.ICBrouteDetailList.length !== 0 ? state.ICBrouteDetailList[1].Stops : [], 
    ICBstopList: (state) => state.ICBstopList,

    // in charge
    isCB: state => state.targetMode.CB.currentMode,
    isCBdetail: (state) => state.targetMode.CB.currentMode ? state.targetMode.CB.routeDetail : false,
    isICB: state => state.targetMode.ICB.currentMode,
    isICBdetail: state => state.targetMode.ICB.currentMode ? state.targetMode.ICB.routeDetail : false,
    isBike: state => state.targetMode.Bike.currentMode,

    // in charge - detail
    isCBgo: state => state.isCBgo,
    isICBgo: state => state.isICBgo,
    weatherData: state => state.weatherData,
    weatherIcon: (state) => { 
      if (["1"].includes(state.weatherData.Wx.parameterValue)) {
        return 1
      } else if (["2", "3"].includes(state.weatherData.Wx.parameterValue)) {
        return 2
      } else if (["4", "5", "6", "7"].includes(state.weatherData.Wx.parameterValue)) {
        return 3
      } else {
        return 4
      }
    }
  },
  mutations: {
    // 切換手機版首頁
    TOGGLE_LANDING_APGE: (state, toggle) => state.landingPageShow = toggle,

    // 初始化資料類型(按首頁圖用的)
    INIT_TARGET_MODE(state) {
      state.targetMode = {
        CB: {
          currentMode: true,
          routeDetail: false
        },
        ICB: {
          currentMode: false,
          routeDetail: false
        },
        Bike: {
          currentMode: false,
          routeDetail: false
        },
      }
      state.routeDetail = false;
      state.BikeDataList = [];
      state.CBdataList = [];
      state.CBrouteDetailList = [];
      state.CBstopList = [];
      state.ICBdataList = [];
      state.ICBrouteDetailList = [];
      state.ICBstopList = [];
      state.searchKeyword = "";
    },

    // 切換資料類型
    CHECK_OUT_TARGET_MODE(state, targetType) {
      if (targetType === "CB") {
        state.targetMode.CB.currentMode = true;
        state.targetMode.ICB.currentMode = false;
        state.targetMode.Bike.currentMode = false;
      } else if (targetType === "ICB") {
        state.targetMode.CB.currentMode = false;
        state.targetMode.ICB.currentMode = true;
        state.targetMode.Bike.currentMode = false;
      } else if (targetType === "Bike") {
        state.targetMode.CB.currentMode = false;
        state.targetMode.ICB.currentMode = false;
        state.targetMode.Bike.currentMode = true;
      } else {
        console.log(`CHECK_OUT_TARGET_MODE 錯誤, targetType: ${targetType}`);
      }
    },

    // 切換城市
    CHECK_OUT_CITY: (state, city) => state.targetCity = city,

    // 公車搜尋 輸入/輸出
    UPDATE_KEYWORD: (state, word) => state.searchKeyword = word,
    ENTER_MSG_TO_KEYWORD: (state, msg) => state.searchKeyword += msg,
    SLICE_ONE_CHAR_FROM_KEYWORD: state => state.searchKeyword = state.searchKeyword.substr(0, state.searchKeyword.length - 1),
    CLEAR_OUT_SEARCH_KEY_WORD: state => state.searchKeyword = "",

    // 切換至路線動態
    CHECK_OUT_ROUTE_DETAIL(state, busType) {
      if (busType === "CB") state.targetMode.CB.routeDetail = true;
      if (busType === "ICB") state.targetMode.ICB.routeDetail = true;
    },

    // 切換回路線列表
    CHECK_OUT_ROUTE_LIST(state, busType) {
      if (busType === "CB") state.targetMode.CB.routeDetail = false;
      if (busType === "ICB") state.targetMode.ICB.routeDetail = false;
    },
    
    // 路線細節判斷
    CHECK_CB_GO_ROUTE: (state, toggle) =>  state.isCBgo = toggle,
    CHECK_ICB_GO_ROUTE: (state, toggle) => state.isICBgo = toggle,
    UPDATE_TARGET_ROUTE: (state, targetRoute) => state.targetRoute = targetRoute,

    // 市區公車
    UPDATE_CITY_BUS_DATA: (state, dataList) => state.CBdataList = dataList,
    UPDATE_CITY_BUS_ROUTE_DETAIL: (state, dataList) => state.CBrouteDetailList = dataList,
    UPDATE_CITY_BUS_STOP_DATA: (state, dataList) => state.CBstopList = dataList,

    // 公路客運
    UPDATE_INTER_CITY_BUS_DATA: (state, dataList) => state.ICBdataList = dataList,
    UPDATE_INTER_CITY_BUS_ROUTE_DETAIL: (state, dataList) => state.ICBrouteDetailList = dataList,
    UPDATE_INTER_CITY_BUS_STOP_DATA: (state, dataList) => state.CBstopList = dataList,

    // 單車 ------------

    // 更新單車資料
    UPDATE_BIKE_DATA_LIST: (state, dataList) => state.BikeDataList = dataList,
    // 距離排序/可租排序/可還排序
    SORT_BY_DISTANCE: state => state.BikeDataList = state.BikeDataList.sort((a, b) => a.Distance - b.Distance),
    SORT_BY_RENT: state => state.BikeDataList = state.BikeDataList.sort((a, b) => b.AvailableRentBikes - a.AvailableRentBikes),
    SORT_BY_RETURN: state => state.BikeDataList = state.BikeDataList.sort((a, b) => b.AvailableReturnBikes - a.AvailableReturnBikes),

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
        .then((res) => {
          commit("CHECK_OUT_CITY", res.data[0].City);
          this.dispatch("getWeather");
        })
        .catch((e) => {
          console.log(`城市定位錯誤: ${e}`);
          // 錯誤處理
        })
    },
    // 切換目標型態
    checkOutTargetType({ commit }, targetType) {
      commit("CHECK_OUT_TARGET_MODE", targetType);
      commit("CHECK_OUT_ROUTE_LIST", targetType);
      this.dispatch("updateTargetData");
    },
    // 取得目前位置後尋找附近站點 || 切換目標資料型態
    updateTargetData({ commit }, targetType = null) {
      const { isCB, isICB, isBike } = this.getters;
      const targetParam = {
        type: isCB ? "CB" : "ICB",
        city: this.state.targetCity,
        position: this.state.map.currentPosition
      };
      if (isCB) {
        AJAX_getBusStopNearBy(targetParam).then((res) => {
          commit("UPDATE_CITY_BUS_STOP_DATA", res.data);
          this.dispatch("map/setBusStopDataOnMap", res.data);
        })
      } else if (isICB) {
        AJAX_getBusStopNearBy(targetParam).then((res) => {
          commit("UPDATE_INTER_CITY_BUS_STOP_DATA", res.data);
          this.dispatch("map/setBusStopDataOnMap", res.data);
        })
      } else if (isBike) {
        this.dispatch("getBikeDataList");
      } else {
        console.log(`updateTargetData 錯誤: ${targetType}`);
      }
    },

    // 取得路線細節
    getRouteDetail({ commit }, routeName) {
      const isCB = this.getters.isCB;
      const targetParam = {
        type: isCB ? "CB" : "ICB",
        city: this.state.targetCity,
        routeName
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
        detailList = insertTimeArrivalToDetailList(detailList, timeList);
        detailList = insertRouteShapeToDetailList(detailList, routeList);
        detailList = insertRealTimeToDetailList(detailList, realTimeList);
        detailList = insertReailTimeStopToDeatailList(detailList, realTimeStopList);
        
        if (isCB)
          commit("UPDATE_CITY_BUS_ROUTE_DETAIL", detailList);
        else (isCB)
          commit("UPDATE_INTER_CITY_BUS_ROUTE_DETAIL", detailList);
        
        // 地圖分別打上 站點、路線、動態
        this.dispatch("map/setBusStopDataOnMap");
        this.dispatch("map/setBusRouteDataOnMap");
        this.dispatch("map/setBusRealTimeOnMap");
      }).catch((e) => {
        const errorMsg = `
          getRouteDetail 發生錯誤: ${e}
          targetParam: { type: ${targetParam.type}, city: ${targetParam.city} }
        `;
        console.log(errorMsg)
        // 錯誤處理
      })
    },
    refreshRouteDetail({ commit }) {
      const routeName = this.state.targetRoute.routeName;
      const isCB = this.getters.isCB;
      const targetParam = {
        type: isCB ? "CB" : "ICB",
        city: this.state.targetCity,
        routeName
      };

      Promise.all([
        AJAX_getBusTimeIfArrival(targetParam),
        AJAX_getBusRealTime(targetParam),
        AJAX_getBustRealTimeStop(targetParam)
      ]).then(res => {
        const timeList = res[0].data;
        const realTimeList = res[1].data;
        const realTimeStopList = res[2].data;

        let detailList = this.getters.isCB ? this.getters.CBrouteDetailList : this.getters.ICBrouteDetailList;
        detailList = insertTimeArrivalToDetailList(detailList, timeList);
        detailList = insertRealTimeToDetailList(detailList, realTimeList);
        detailList = insertReailTimeStopToDeatailList(detailList, realTimeStopList);

        if (isCB) 
          commit("UPDATE_CITY_BUS_ROUTE_DETAIL", detailList);
        else
          commit("UPDATE_INTER_CITY_BUS_ROUTE_DETAIL", detailList);

        // 只清掉公車動態再重新打新的上去
        this.dispatch("map/removeBusPointLayers");
        this.dispatch("map/setBusRealTimeOnMap");
      }).catch((e) => {
        const errorMsg = `
          refreshRouteDetail 發生錯誤: ${e}
          targetParam: { type: ${targetParam.type}, city: ${targetParam.city} }
        `;
        console.log(errorMsg)
        // 錯誤處理
      })
    },

    // 關鍵字搜尋市區公車
    getCBdataListWithKeyWord({ commit }, { city, keyword }) {
      const targetParam = {
        type: "CB",
        city,
        keyword
      }
      AJAX_getBusRoute(targetParam)
      .then(res => {
        commit("UPDATE_CITY_BUS_DATA", res.data);
      })
      .catch((e) => {
        console.log(`AJAX_getBusRoute 失敗: ${e}`);
        // 錯誤處理
      })
    },

    // 關鍵字搜尋客運
    getICBdataListWithKeyWord({ commit }, { keyword }) {
      const targetParam = {
        type: "ICB",
        keyword
      }
      AJAX_getBusRoute(targetParam)
      .then(res => {
        commit("UPDATE_INTER_CITY_BUS_DATA", res.data);
      })
      .catch((e) => {
        console.log(`AJAX_getBusRoute 失敗: ${e}`);
        // 錯誤處理
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
        avaDataList = avaDataList.map((data) => {
          let findData = dataList.find((d) => d.StationUID === data.StationUID);
          if (findData) data = {...data, ...findData}
          // 改個名字
          data.StationName.Zh_tw = data.StationName.Zh_tw.replace("YouBike1.0_", "");
          data.StationName.Zh_tw = data.StationName.Zh_tw.replace("YouBike2.0_", "");
          const { PositionLat, PositionLon } = data.StationPosition;
          data.Distance = distance(PositionLat, PositionLon, position.latitude, position.longitude);
          data.DistanceZH = distanceZh(data.Distance);
          return data;
        });
        commit("UPDATE_BIKE_DATA_LIST", avaDataList);
        this.dispatch("map/setBikeRentDataOnMap", avaDataList);
      }).catch((e) => {
        console.log(e)
        // 錯誤處理
      })
    },

    // 取得天氣資料
    getWeather({ commit }) {
      const location = citysHash[this.state.targetCity].cityName;

      AJAX_getWeaterRain(location).then(res => {
        const locationData = res.data.records.location[0];
        const weatherElements = locationData.weatherElement.reduce(
          (neededElements, item) => {
            if (["Wx", "MaxT", "MinT", "PoP"].includes(item.elementName)) {
              neededElements[item.elementName] = item.time[0].parameter;
            }
            return neededElements;
          },
          {}
        );
        commit("UPDATE_WEATHER_DATA", weatherElements);
      })
    }
  },
  modules: {
    map: mapModules
  }
}