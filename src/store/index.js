import axios from 'axios';
import { authorizationHeader, urlQueryStr, urlPath } from "../modules/api";
import { distance, distanceZh } from "../modules/calculate";

import mapModules from "./map";

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
    CBrouteShape: [],
    ICBdataList: [],
    ICBrouteDetailList: [],

    // 詳細內容判斷
    targetRoute: {
      routeName: "",
      departureStop: "",
      destinationStop: ""
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
    
    // dataList
    BikeDataList: state => state.BikeDataList,
    CBdataList: state => state.CBdataList,
    goCBrouteDetailList: (state) => state.CBrouteDetailList.length !== 0 ? state.CBrouteDetailList[0].Stops : [],
    backCBrouteDetailList: (state) => state.CBrouteDetailList.length !== 0 ? state.CBrouteDetailList[1].Stops : [],
    ICBdataList: state => state.ICBdataList,
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
    isICBgo: state => state.isICBgo,
    targetRoute: state => state.targetRoute
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
    UPDATE_CB_ROUTE_SHAPE: (state, dataList) => state.CBrouteShape = dataList,

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
    getRouteDetail({ commit }, { busType, routeName }) {
      const urlOfStop = (busType === "CB") ? `Bus/DisplayStopOfRoute/City/${this.state.targetCity}/${routeName}` : `Bus/StopOfRoute/InterCity/${routeName}`;
      const urlOfTime = (busType === "CB") ? `Bus/EstimatedTimeOfArrival/City/${this.state.targetCity}/${routeName}` : `Bus/EstimatedTimeOfArrival/InterCity/${routeName}`;
      const header = authorizationHeader();
      
      // 公車要兩次 - 站序 & 預估時間
      let stopList = [];
      axios({
        method: 'get',
        url: urlQueryStr(urlOfStop, { select: ['Direction', 'Stops']}),
        headers: header
      }).then((res) => {
        stopList = res.data;
        axios({
          method: 'get',
          url: urlQueryStr(urlOfTime, { select: ['Direction', 'StopUID', 'EstimateTime', 'StopStatus']}),
          headers: header
        }).then((res) => {
          const timeList = res.data;
          // 去程加入預估時間
          stopList[0].Stops = stopList[0].Stops.map((stopData) => {
            let findData = timeList.find(timeData => timeData.Direction === 0 && stopData.StopUID === timeData.StopUID);
            if (findData) stopData = {...stopData, ...findData}
            return stopData
          })
          // 回程加入預估時間
          stopList[1].Stops = stopList[1].Stops.map((stopData) => {
            let findData = timeList.find(timeData => timeData.Direction === 1 && stopData.StopUID === timeData.StopUID);
            if (findData) stopData = {...stopData, ...findData}
            return stopData
          })
          if (busType === "CB") {
            commit("UPDATE_CITY_BUS_ROUTE_DETAIL", stopList);
          } else {
            commit("UPDATE_INTER_CITY_BUS_ROUTE_DETAIL", stopList);
          }
          this.dispatch("map/setCBstopDataOnMap");
        })
      })
    },

    getRouteShape({ commit }, routeName) {
      const city = this.state.targetCity;
      const urlOfRoute = (this.getters.isCB) ? `Bus/Shape/City/${city}/${routeName}` : `Bus/Shape/InterCity/${routeName}`;
      const header = authorizationHeader();

      axios({
        method: 'get',
        url: urlQueryStr(urlOfRoute, { select: ['Geometry']}),
        headers: header
      }).then((res) => {
        if (res.data) {
          commit("UPDATE_CB_ROUTE_SHAPE", res.data[0]);
        } else {
          // ...錯誤處理
        }
        this.dispatch("map/setCBrouteDataOnMap");
      })
    },
    // 關鍵字搜尋市區公車
    getCBdataListWithKeyWord({ commit }, { city, keyword }) {
      const header = authorizationHeader();
      const routeQuery = { keyword: keyword, select: ['RouteUID', 'RouteName','DepartureStopNameZh', 'DestinationStopNameZh', 'City'] };
      axios({
        method: 'get',
        url: urlQueryStr(`Bus/Route/City/${city}`, routeQuery),
        headers: header
      }).then((res) => {
        commit("UPDATE_CITY_BUS_DATA", res.data);
      })
    },
    // 關鍵字搜尋客運
    getICBdataListWithKeyWord({ commit }, { city, keyword }) {
      const header = authorizationHeader();
      const routeQuery = { keyword: keyword, city: city, select: ['RouteUID', 'RouteName','DepartureStopNameZh', 'DestinationStopNameZh', 'City'] };
      // 客運比較少城市區分，之後在想怎區隔
      axios({
        method: 'get',
        url: urlQueryStr(`Bus/Route/InterCity/`, routeQuery),
        headers: header
      }).then((res) => {
        commit("UPDATE_INTER_CITY_BUS_DATA", res.data);
      })
    },
    getBikeDataList({ commit }) {
      const position = this.state.map.currentPosition;
      const stationQuery = { position: position, select: ['StationUID', 'AuthorityID','StationName', 'StationPosition'] };
      const availabilityQuery = { position: position, select: ['StationUID', 'AvailableRentBikes', 'AvailableReturnBikes'] };
      const header = authorizationHeader();
      
      let dataList = [];
      axios({
        method: 'get',
        url: urlQueryStr(urlPath.BikeSt, stationQuery),
        headers: header
      }).then((res) => {
        dataList =  res.data; // 保存第一次站點資料
        axios({
          method: 'get',
          url: urlQueryStr(urlPath.BikeAv, availabilityQuery),
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