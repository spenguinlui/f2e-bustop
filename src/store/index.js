import axios from 'axios';
import { authorizationHeader, urlQueryStr, urlPath } from "../modules/api";
import { distance, distanceZh } from "../modules/calculate";

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
    targetCity: "Taipei",

    // data
    bikeDataList: [],
    cityBusDataList: [],
    cityBusRouteDetailList: [],
    interCityBusDataList: [],
    interCityBusRouteDetailList: [],

    // 詳細內容判斷
    targetRouteDetailName: "",
    // 是否去程
    isCityBusGo: true,
    isInterCityBusGo: true
  },
  getters: {
    landingPageShow: state => state.landingPageShow,
    targetMode: state => state.targetMode,
    searchKeyword: state => state.searchKeyword,
    targetCity: state => state.targetCity,
    
    // dataList
    bikeDataList: state => state.bikeDataList,
    cityBusDataList: state => state.cityBusDataList,
    goCityBusRouteDetailList(state) {
      return state.cityBusRouteDetailList.length !== 0 ? state.cityBusRouteDetailList[0].Stops : []
    },
    backCityBusRouteDetailList(state) {
      return state.cityBusRouteDetailList.length !== 0 ? state.cityBusRouteDetailList[1].Stops : []
    },
    interCityBusDataList: state => state.interCityBusDataList,
    goInterCityBusRouteDetailList(state) {
      return state.interCityBusRouteDetailList.length !== 0 ? state.interCityBusRouteDetailList[0].Stops : []
    }, 
    backInterCityBusRouteDetailList(state) {
      return state.interCityBusRouteDetailList.length !== 0 ? state.interCityBusRouteDetailList[1].Stops : []
    }, 

    // in charge
    isCityBus: state => state.targetMode.cityBus.currentMode,
    isCityBusDetail: (state) => state.targetMode.cityBus.currentMode ? state.targetMode.cityBus.routeDetail : false,
    isInterCityBus: state => state.targetMode.interCityBus.currentMode,
    isInterCityBusDetail: state => state.targetMode.interCityBus.currentMode ? state.targetMode.interCityBus.routeDetail : false,
    isBike: state => state.targetMode.bike.currentMode,

    // in charge - detail
    isCityBusGo: state => state.isCityBusGo,
    isInterCityBusGo: state => state.isInterCityBusGo,
    targetRouteDetailName: state => state.targetRouteDetailName
  },
  mutations: {
    TOGGLE_LANDING_APGE: (state, toggle) => state.landingPageShow = toggle,
    // 初始化資料類型(按首頁圖用的)
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
    // 切換資料類型
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
    // 切換城市
    CHECK_OUT_CITY: (state, city) => state.targetCity = city,

    // 公車搜尋 輸入/輸出
    UPDATE_KEYWORD: (state, word) => state.searchKeyword = word,
    ENTER_MSG_TO_KEYWORD: (state, msg) => state.searchKeyword += msg,
    SLICE_ONE_CHAR_FROM_KEYWORD: state => state.searchKeyword = state.searchKeyword.substr(0, state.searchKeyword.length - 1),
    CLEAR_OUT_SEARCH_KEY_WORD: state => state.searchKeyword = "",
    
    // 切換至路線動態
    CHECK_OUTE_ROUTE_DETAIL(state, busType) {
      if (busType === "cityBus") {
        state.targetMode.cityBus.routeDetail = true;
      } else if (busType === "interCityBus") {
        state.targetMode.interCityBus.routeDetail = true;
      } else {
        console.log(`CHECK_OUTE_ROUTE_DETAIL 錯誤: ${busType}`)
      }
    },
    // 切換回路線列表
    CHECK_OUTE_ROUTE_LIST(state, busType) {
      if (busType === "cityBus") {
        state.targetMode.cityBus.routeDetail = false;
      } else if (busType === "interCityBus") {
        state.targetMode.interCityBus.routeDetail = false;
      } else {
        console.log(`CHECK_OUTE_ROUTE_DETAIL 錯誤: ${busType}`)
      }
    },
    
    // 路線細節判斷
    CHECK_CB_GO_ROUTE: (state, toggle) =>  state.isCityBusGo = toggle,
    CHECK_ICB_GO_ROUTE: (state, toggle) => state.isInterCityBusGo = toggle,
    UPDATE_TARGET_ROUTE_NAME: (state, routeName) => state.targetRouteDetailName = routeName,

    // 市區公車
    UPDATE_CITY_BUS_DATA: (state, dataList) => state.cityBusDataList = dataList,
    UPDATE_CITY_BUS_ROUTE_DETAIL: (state, dataList) => state.cityBusRouteDetailList = dataList,
    // 公路客運
    UPDATE_INTER_CITY_BUS_DATA: (state, dataList) => state.interCityBusDataList = dataList,
    UPDATE_INTER_CITY_BUS_ROUTE_DETAIL: (state, dataList) => state.interCityBusRouteDetailList = dataList,

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
    // 剛進入畫面要附近站點
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
    // 先保留
    filterByCity({ commit }, city) {
      commit("CHECK_OUT_CITY", city);
      // ... 要資料
    },
    // 取得路線細節
    getRouteDetail({ commit }, { busType, routeName }) {
      const urlOfStop = (busType === "cityBus") ? `Bus/DisplayStopOfRoute/City/${this.state.targetCity}/${routeName}` : `Bus/StopOfRoute/InterCity/${routeName}`;
      const urlOfTime = (busType === "cityBus") ? `Bus/EstimatedTimeOfArrival/City/${this.state.targetCity}/${routeName}` : `Bus/EstimatedTimeOfArrival/InterCity/${routeName}`;
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
          url: urlQueryStr(urlOfTime),
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
          if (busType === "cityBus") {
            commit("UPDATE_CITY_BUS_ROUTE_DETAIL", stopList);
          } else {
            commit("UPDATE_INTER_CITY_BUS_ROUTE_DETAIL", stopList);
          }
        })
      })
    },
    // 關鍵字搜尋市區公車
    getCityBusDataListWithKeyWord({ commit }, { city, keyword }) {
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
    getInterCityBusDataListWithKeyWord({ commit }, { city, keyword }) {
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