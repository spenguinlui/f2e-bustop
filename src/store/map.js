import L from 'leaflet';

// 中心點樣式
const centerIcon = new L.DivIcon({ className: 'center-marker-icon', iconSize: [80, 80], iconAnchor: [40, 40] });

// 公車站點樣式 - 先設定桌面版基準點在下方， 手機版再對齊中心下方就可以了
const busStopIcon = new L.DivIcon({ className: 'bus-stop-marker-icon', iconSize: [44, 65], iconAnchor: [22, 65] });

// 公車動態點樣式
const busPointIcon = new L.DivIcon({ className: 'bus-point-marker-icon', iconSize: [84, 84], iconAnchor: [42, 42] });

// 公車站點 Marker 的 Popup
const createBusPopupObj = (data, destinationStop) => {
  if (destinationStop)
    return `
      <div class="popup-title">${data.StopName.Zh_tw}</div>
      <div class="popup-direction">往 ${destinationStop}</div>
    `
  else
    return `<div class="popup-title">${data.StopName.Zh_tw}</div>`
};

// 判斷單車 Marker 樣式
const countChangeClass = (dataCount) => dataCount === 0 ? 'disable' : dataCount < 5 ? 'limit' : 'default';

// 單車 Marker
const createBikeMarker = (dataCount) => {
  const markerIcon = countChangeClass(dataCount);
  return new L.DivIcon(
    {
      className: 'bike-maker-icon-dafault',
      html: `
        <div class="bike-maker-icon ${markerIcon}">
          <span class="bike-maker-icon-text">${dataCount}</span>
        </div>
      `
    })
};

// 單車 Marker 的 Popup
const createBikePopupObj = (data) => {
  return `
    <div class="tooltips-title">${data.StationName.Zh_tw}</div>
    <div class="tooltips-content">
      <div class="block-left">
        <div class="bike-block ${countChangeClass(data.AvailableRentBikes)}"><i class="fas fa-bicycle"></i>${data.AvailableRentBikes}</div>
        <div class="stop-block ${countChangeClass(data.AvailableReturnBikes)}"><i class="fas fa-parking"></i>${data.AvailableReturnBikes}</div>
      </div>
      <div class="block-right"><i class="fas fa-map-marker-alt"></i>距離 ${data.DistanceZH}</div>
    </div>
  `
};

// 決定路線詳細資料去程返程，是要用哪一筆
const getTargetDataList = ({ isGoDirection, routeDataList }) => {
  return isGoDirection ? routeDataList[0] : routeDataList[1];
}

// 解析 geojson 純文字資料成 json
const geometryStrToGeoJson = (geometryStr) => {
  const isLineStr = geometryStr.substr(0, 10) === "LINESTRING";
  const isMultiLine = geometryStr.substr(0, 15) === "MULTILINESTRING";
  let corStr = "";
  let corNewAry = [];

  if (isLineStr) {
    corStr = geometryStr.slice(12, -2);
    if (geometryStr.slice(12, -2)[0] !== "1") {
      corStr = geometryStr.slice(11, -2);
    }
  }
  if (isMultiLine) {
    corStr = geometryStr.slice(18, -2);
    if (geometryStr.slice(18, -2)[0] !== "1") {
      corStr = geometryStr.slice(117, -2);
    }
  }

  corStr.split(',').map((cor) => {
    let cs = cor.split(' ');
    
    cs = cs.filter((c) => c).map((c) => parseFloat(c));
    corNewAry.push(cs);
  });
  return { type: "LineString", coordinates: corNewAry };
}

export default {
  namespaced: true,
  state: {
    currentPosition: {
      latitude: "25.046951",
      longitude: "121.516887", // 預設台北車站
    },
    storeMap: {},
    mapLayers: {
      bikeLayer: {},
      busStopLayer: {}
    }
  },
  gatters: {
    currentPosition: state => state.currentPosition,
  },
  mutations: {
    SET_MAP_OBJECT: (state, mapClass) => state.storeMap = mapClass,
    SET_POSITION: (state, position) => state.currentPosition = position,
    REMOVE_OLD_CENTER(state) {
      state.storeMap.eachLayer(function(layer){ 
        if (layer.options.layerName === 'center') { state.storeMap.removeLayer(layer) }
      });
    },
    SET_BIKE_RENT_LAYER(state, layer) {
      state.mapLayers.bikeLayer = layer;
    },
    SET_BUS_STOP_LAYER(state, layer) {
      state.mapLayers.busStopLayer = layer;
    }
  },
  actions: {
    // 將地圖中心鎖定現在位置
    focusCurrentPosition() {
      this.state.map.storeMap.flyTo([this.state.map.currentPosition.latitude, this.state.map.currentPosition.longitude], 16);
    },

    // 取得目前位置
    setCurrentPosition({ commit }, currentPosition) {
      commit("REMOVE_OLD_CENTER");
      // 地圖更新及移動位置
      const lat = currentPosition.latitude;
      const lon = currentPosition.longitude;
      L.marker([lat, lon], { icon: centerIcon, layerName: 'center' }).addTo(this.state.map.storeMap);
      this.dispatch("map/focusCurrentPosition");
    },

    // 清除底圖與中心點以外圖層 (盡量在 vue 元件呼叫)
    removeOtherLayers() {
      const { storeMap } = this.state.map;
      storeMap.eachLayer(layer => { 
        if (!(layer instanceof L.TileLayer)) {
          if (layer.options.layerName !== 'center') storeMap.removeLayer(layer);
        }
      });
    },

    removeBusPointLayers() {
      const { storeMap } = this.state.map;
      storeMap.eachLayer(layer => {
        if (layer.options.layerName === 'buspoint') storeMap.removeLayer(layer);
      })
    },

    // 將單車資料打上地圖
    setBikeRentDataOnMap({ commit }, bikeDataList) {
      const { storeMap } = this.state.map;
      let bikeLayer = new L.LayerGroup().addTo(storeMap);
      bikeDataList.map(data => {
        const divIcon = createBikeMarker(data.AvailableRentBikes);
        L.marker([data.StationPosition.PositionLat, data.StationPosition.PositionLon], { icon: divIcon })
          .bindPopup(createBikePopupObj(data), { minWidth: 270, offset: [0, 0], className: "bike-tooltips" })
          .addTo(bikeLayer);
      })
      if (storeMap.tap) storeMap.tap.disable();  // 解決 safari、edge popup失效
      commit("SET_BIKE_RENT_LAYER", bikeLayer);
    },

    // 將公車站點打上地圖
    setBusStopDataOnMap({ commit }, targetDataList = []) {
      // if bus stop data given, else find it
      const { storeMap } = this.state.map;
      const istargetGiven = targetDataList.length !== 0;
      const targetStops = istargetGiven ? targetDataList : getTargetDataList(this.state).Stops;

      let busLayer = new L.LayerGroup().addTo(storeMap);
      targetStops.map((data, index) => {
        const marker = L.marker([data.StopPosition.PositionLat, data.StopPosition.PositionLon], { icon: busStopIcon, title: data.StationID })
          .bindPopup(createBusPopupObj(data, this.state.targetRoute.destinationStop), { minWidth: 100, offset: [90, 20], className: "bus-popup" })
          .addTo(busLayer);
        if (index === 0 && this.state.targetRoute.destinationStop) marker.openPopup();
        marker.on("click", (e) => {
          const stationId = e.target.options.title;
          this.dispatch("getBusRoutebyStop", stationId);
        })
      })
      if (storeMap.tap) storeMap.tap.disable();  // 解決 safari、edge popup失效
      if (!istargetGiven) storeMap.flyTo([targetStops[0].StopPosition.PositionLat, targetStops[0].StopPosition.PositionLon], 16);
      commit("SET_BUS_STOP_LAYER", busLayer);
    },

    // 將公車路線打上地圖
    setBusRouteDataOnMap() {
      const { storeMap } = this.state.map;
      const busRouteLayer = new L.LayerGroup().addTo(storeMap);
      const targetGeometry = getTargetDataList(this.state).Geometry;
      const geoJsonData = geometryStrToGeoJson(targetGeometry);
      const lineStyle = { color: "#4EA476", weight: 4 };
      try {
        L.geoJSON(geoJsonData, lineStyle).addTo(busRouteLayer);
      } catch {
        console.log(`路線資料異常: ${geoJsonData}`);
      }
    },

    // 將公車動態打上地圖
    setBusRealTimeOnMap() {
      const { storeMap } = this.state.map;
      const busRealTimeLayer = new L.LayerGroup().addTo(storeMap);
      const targetRealTime = getTargetDataList(this.state).BusRealTime;
      targetRealTime.map(data => {
        L.marker([data.BusPosition.PositionLat, data.BusPosition.PositionLon], { icon: busPointIcon, zIndexOffset: 1000, layerName: "buspoint" })
          .addTo(busRealTimeLayer);
      })
    }
  }
}