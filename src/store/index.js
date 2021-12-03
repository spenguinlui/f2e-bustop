import { distance, distanceZh } from "../modules/calculate";
import {
  AJAX_getBusRoute,
  AJAX_getBusStopOfRoute,
  AJAX_getBusTimeIfArrival,
  AJAX_getBusShapOfRoute,
  AJAX_getBusRealTime,
  AJAX_getBustRealTimeStop,
  AJAX_getBikeStation,
  AJAX_getBikeAvailability
} from "../modules/api";

import mapModules from "./map";

// 路線細節塞入預估時間
const insertTimeArrivalToDetailList = (detailList, timeList) => {
  detailList[0].Stops = detailList[0].Stops.map((detailData) => {
    let findData = timeList.find(timeData => timeData.Direction === 0 && detailData.StopUID === timeData.StopUID);
    if (findData) detailData = { ...detailData, ...findData }
    return detailData;
  });
  detailList[1].Stops = detailList[1].Stops.map((detailData) => {
    let findData = timeList.find(timeData => timeData.Direction === 1 && detailData.StopUID === timeData.StopUID);
    if (findData) detailData = { ...detailData, ...findData }
    return detailData;
  });
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
  detailList[0].BusRealTime = [];
  realTimeList.forEach(rtData => rtData.Direction === 0 && detailList[0].BusRealTime.push(rtData));
  detailList[1].BusRealTime = [];
  realTimeList.forEach(rtData => rtData.Direction === 1 && detailList[1].BusRealTime.push(rtData));
  return detailList;
}

const insertReailTimeStopToDeatailList = (detailList, realTimeStopList) => {
  detailList[0].Stops = detailList[0].Stops.map((detailData) => {
    let findData = realTimeStopList.find(timeData => timeData.Direction === 0 && detailData.StopUID === timeData.StopUID);
    if (findData) detailData = { ...detailData, ...findData }
    return detailData;
  });
  detailList[1].Stops = detailList[1].Stops.map((detailData) => {
    let findData = realTimeStopList.find(timeData => timeData.Direction === 1 && detailData.StopUID === timeData.StopUID);
    if (findData) detailData = { ...detailData, ...findData }
    return detailData;
  });
  return detailList;
}

export const storeObject = {
  state: {
    landingPageShow: false,
    targetMode: {
      CB: {
        currentMode: true,
        routeDetail: false,
        lisboardShow: false
      },
      ICB: {
        currentMode: false,
        routeDetail: false,
        lisboardShow: false
      },
      Bike: {
        currentMode: false,
        routeDetail: false,
        lisboardShow: true
      },
    },

    // 搜尋關鍵字
    searchKeyword: "",

    // 目標城市
    targetCity: "Taipei",

    // data
    BikeDataList: [],
    CBdataList: [],
    CBrouteDetailList: [],
    ICBdataList: [],
    ICBrouteDetailList: [],

    // 詳細內容判斷
    targetRoute: {
      routeName: "",
      departureStop: "",
      destinationStop: "",

    },

    // 是否去程
    isCBgo: true,
    isICBgo: true
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
    ICBdataList: state => state.ICBdataList,
    ICBrouteDetailList: state => state.ICBrouteDetailList,
    goICBrouteDetailList: (state) => state.ICBrouteDetailList.length !== 0 ? state.ICBrouteDetailList[0].Stops : [], 
    backICBrouteDetailList: (state) => state.ICBrouteDetailList.length !== 0 ? state.ICBrouteDetailList[1].Stops : [], 

    // in charge
    isCB: state => state.targetMode.CB.currentMode,
    isCBdetail: (state) => state.targetMode.CB.currentMode ? state.targetMode.CB.routeDetail : false,
    isICB: state => state.targetMode.ICB.currentMode,
    isICBdetail: state => state.targetMode.ICB.currentMode ? state.targetMode.ICB.routeDetail : false,
    isBike: state => state.targetMode.Bike.currentMode,

    // in charge - detail
    isCBgo: state => state.isCBgo,
    isICBgo: state => state.isICBgo
  },
  mutations: {
    // 切換手機版首頁
    TOGGLE_LANDING_APGE: (state, toggle) => state.landingPageShow = toggle,

    // 初始化資料類型(按首頁圖用的)
    INIT_TARGET_MODE(state) {
      state.targetMode = {
        CB: {
          currentMode: true,
          routeDetail: false,
          lisboardShow: false
        },
        ICB: {
          currentMode: false,
          routeDetail: false,
          lisboardShow: false
        },
        Bike: {
          currentMode: false,
          routeDetail: false,
          lisboardShow: true
        },
      }
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
    CHECK_OUTE_ROUTE_DETAIL(state, busType) {
      if (busType === "CB") {
        state.targetMode.CB.routeDetail = true;
      } else if (busType === "ICB") {
        state.targetMode.ICB.routeDetail = true;
      } else {
        console.log(`CHECK_OUTE_ROUTE_DETAIL 錯誤: ${busType}`)
      }
    },

    // 切換回路線列表
    CHECK_OUTE_ROUTE_LIST(state, busType) {
      if (busType === "CB") {
        state.targetMode.CB.routeDetail = false;
      } else if (busType === "ICB") {
        state.targetMode.ICB.routeDetail = false;
      } else {
        console.log(`CHECK_OUTE_ROUTE_DETAIL 錯誤: ${busType}`)
      }
    },
    
    // 路線細節判斷
    CHECK_CB_GO_ROUTE: (state, toggle) =>  state.isCBgo = toggle,
    CHECK_ICB_GO_ROUTE: (state, toggle) => state.isICBgo = toggle,
    UPDATE_TARGET_ROUTE: (state, targetRoute) => state.targetRoute = targetRoute,

    // 市區公車
    UPDATE_CITY_BUS_DATA: (state, dataList) => state.CBdataList = dataList,
    UPDATE_CITY_BUS_ROUTE_DETAIL: (state, dataList) => state.CBrouteDetailList = dataList,

    // 公路客運
    UPDATE_INTER_CITY_BUS_DATA: (state, dataList) => state.ICBdataList = dataList,
    UPDATE_INTER_CITY_BUS_ROUTE_DETAIL: (state, dataList) => state.ICBrouteDetailList = dataList,

    // 單車 ------------

    // 更新單車資料
    UPDATE_BIKE_DATA_LIST: (state, dataList) => state.BikeDataList = dataList,
    // 距離排序/可租排序/可還排序
    SORT_BY_DISTANCE: state => state.BikeDataList = state.BikeDataList.sort((a, b) => a.Distance - b.Distance),
    SORT_BY_RENT: state => state.BikeDataList = state.BikeDataList.sort((a, b) => b.AvailableRentBikes - a.AvailableRentBikes),
    SORT_BY_RETURN: state => state.BikeDataList = state.BikeDataList.sort((a, b) => b.AvailableReturnBikes - a.AvailableReturnBikes),
  },

  actions: {
    // 剛進入畫面要附近站點
    updateTargetData({ commit }, targetType) {
      if (targetType === "CB") {
        // ... 要附近站點
      } else if (targetType === "ICB") {
        // ... 要附近站點
      } else if (targetType === "Bike") {
        this.dispatch("getBikeDataList");
      } else {
        console.log(`updateTargetData 錯誤: ${targetType}`);
      }
      commit("CHECK_OUT_TARGET_MODE", targetType);
    },

    // 取得路線細節
    getRouteDetail({ commit }, routeName) {
      const dataType = this.getters.isCB ? `City/${this.state.targetCity}/${routeName}` : `InterCity/${routeName}`;
      const urlOfStop = `Bus/StopOfRoute/${dataType}`;
      const urlOfTime = `Bus/EstimatedTimeOfArrival/${dataType}`;
      const urlOfRoute = `Bus/Shape/${dataType}`;
      const urlOfRealTime = `Bus/RealTimeByFrequency/${dataType}`;
      const urlOfRealTimeStop = `Bus/RealTimeNearStop/${dataType}`;

      Promise.all([
        AJAX_getBusStopOfRoute(urlOfStop, routeName),
        AJAX_getBusTimeIfArrival(urlOfTime, routeName),
        AJAX_getBusShapOfRoute(urlOfRoute, routeName),
        AJAX_getBusRealTime(urlOfRealTime, routeName),
        AJAX_getBustRealTimeStop(urlOfRealTimeStop, routeName)
      ])
        .then(res => {
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

          if (this.getters.isCB) commit("UPDATE_CITY_BUS_ROUTE_DETAIL", detailList);
          if (this.getters.isICB) commit("UPDATE_INTER_CITY_BUS_ROUTE_DETAIL", detailList);
          
          // 地圖分別打上 站點、路線、動態
          this.dispatch("map/setBusStopDataOnMap");
          this.dispatch("map/setBusRouteDataOnMap");
          this.dispatch("map/setBusRealTimeOnMap");
        })
        .catch((e) => {
          console.log(e)
          // 錯誤處理
        })
    },
    refreshRouteDetail({ commit }) {
      const routeName = this.state.targetRoute.routeName;
      const dataType = this.getters.isCB ? `City/${this.state.targetCity}/${routeName}` : `InterCity/${routeName}`;
      const urlOfTime = `Bus/EstimatedTimeOfArrival/${dataType}`;
      const urlOfRealTime = `Bus/RealTimeByFrequency/${dataType}`;
      const urlOfRealTimeStop = `Bus/RealTimeNearStop/${dataType}`;

      Promise.all([
        AJAX_getBusTimeIfArrival(urlOfTime, routeName),
        AJAX_getBusRealTime(urlOfRealTime, routeName),
        AJAX_getBustRealTimeStop(urlOfRealTimeStop, routeName)
      ])
        .then(res => {
          const timeList = res[0].data;
          const realTimeList = res[1].data;
          const realTimeStopList = res[2].data;

          let detailList = this.getters.isCB ? this.getters.CBrouteDetailList : this.getters.ICBrouteDetailList;
          detailList = insertTimeArrivalToDetailList(detailList, timeList);
          detailList = insertRealTimeToDetailList(detailList, realTimeList);
          detailList = insertReailTimeStopToDeatailList(detailList, realTimeStopList);

          if (this.getters.isCB) commit("UPDATE_CITY_BUS_ROUTE_DETAIL", detailList);
          if (this.getters.isICB) commit("UPDATE_INTER_CITY_BUS_ROUTE_DETAIL", detailList);

          // 只清掉公車動態再重新打新的上去
          this.dispatch("map/removeBusPointLayers");
          this.dispatch("map/setBusRealTimeOnMap");
        })
    },

    // 關鍵字搜尋市區公車
    getCBdataListWithKeyWord({ commit }, { city, keyword }) {
      const urlOfRoute = `Bus/Route/City/${city}`;
      AJAX_getBusRoute(urlOfRoute, keyword).then(res => {
        commit("UPDATE_CITY_BUS_DATA", res.data);
      })
      .catch((e) => {
        console.log(e)
        // 錯誤處理
      })
    },

    // 關鍵字搜尋客運
    getICBdataListWithKeyWord({ commit }, { keyword }) {
      // 客運比較少城市區分，之後在想怎區隔
      const urlOfRoute = `Bus/Route/InterCity/`;
      AJAX_getBusRoute(urlOfRoute, keyword).then(res => {
        commit("UPDATE_INTER_CITY_BUS_DATA", res.data);
      })
      .catch((e) => {
        console.log(e)
        // 錯誤處理
      })
    },

    // 取得附近單車站點
    getBikeDataList({ commit }) {
      const position = this.state.map.currentPosition;

      Promise.all([AJAX_getBikeStation(position), AJAX_getBikeAvailability(position)])
        .then(res => {
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
        })
        .catch((e) => {
          console.log(e)
          // 錯誤處理
        })
    }
  },
  modules: {
    map: mapModules
  }
}