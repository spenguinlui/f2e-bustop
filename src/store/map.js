import L from 'leaflet';

// 中心點樣式
const centerIcon = new L.DivIcon({ className: 'center-marker-icon', iconSize: [80, 80], iconAnchor: [40, 40] });

// 公車站點樣式 - 先設定桌面版基準點在下方， 手機版再對齊中心下方就可以了
const busStopIcon = new L.DivIcon({ className: 'bus-stop-marker-icon', iconSize: [44, 65], iconAnchor: [22, 65] });

// 公車站點 Marker 的 Popup
const createBusPopupObj = (data, targetRoute) => {
  return `
    <div class="popup-title">${data.StopName.Zh_tw}</div>
    <div class="popup-direction">往 ${targetRoute.destinationStop}</div>
  `
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
    // 取得目前位置
    setCurrentPosition({ commit }, currentPosition) {
      commit("SET_POSITION", currentPosition);
      commit("REMOVE_OLD_CENTER");
      // 地圖更新及移動位置
      const lat = currentPosition.latitude;
      const lon = currentPosition.longitude;
      L.marker([lat, lon], { icon: centerIcon, layerName: 'center' }).addTo(this.state.map.storeMap);
      this.state.map.storeMap.flyTo([lat, lon], 16);
    },

    // 清除底圖與中心點以外圖層
    removeOtherLayers() {
      const storeMap = this.state.map.storeMap;
      storeMap.eachLayer(function(layer){ 
        if (!(layer instanceof L.TileLayer)) {
          if (layer.options.layerName !== 'center') { storeMap.removeLayer(layer) }
        }
      });
    },

    // 將單車資料打上地圖
    setBikeRentDataOnMap({ commit }, bikeDataList) {
      let bikeLayer = new L.LayerGroup().addTo(this.state.map.storeMap);
      bikeDataList.map((data) => {
        const divIcon = createBikeMarker(data.AvailableRentBikes);
        L.marker([data.StationPosition.PositionLat, data.StationPosition.PositionLon], { icon: divIcon })
        .bindPopup(createBikePopupObj(data), { minWidth: 270, offset: [0, 0], className: "bike-tooltips" })
          .openPopup()
          .addTo(bikeLayer);
      })
      commit("SET_BIKE_RENT_LAYER", bikeLayer);
    },

    // 將公車站點打上地圖
    setCBstopDataOnMap({ commit }) {
      let targetStops;
      if (this.getters.isCB) {
        if (this.state.isCBgo) {
          targetStops = this.state.CBrouteDetailList[0].Stops;
        } else {
          targetStops = this.state.CBrouteDetailList[1].Stops;
        }
      } else {
        if (this.state.isICBgo) {
          targetStops = this.state.ICBrouteDetailList[0].Stops;
        } else {
          targetStops = this.state.ICBrouteDetailList[1].Stops;
        }
      }
      let busLayer = new L.LayerGroup().addTo(this.state.map.storeMap);
      targetStops.map((data) => {
        L.marker([data.StopPosition.PositionLat, data.StopPosition.PositionLon], { icon: busStopIcon })
        .bindPopup(createBusPopupObj(data, this.state.targetRoute), { minWidth: 100, offset: [0, 0], className: "bus-popup" })
          .openPopup()
          .addTo(busLayer);
      })
      commit("SET_BUS_STOP_LAYER", busLayer);
    },

    // 將公車路線打上地圖
    setCBrouteDataOnMap() {
      console.log(this.state.CBrouteShape)
      const busRouteLayer = new L.LayerGroup().addTo(this.state.map.storeMap);
      const geoJsonData = geometryStrToGeoJson(this.state.CBrouteShape.Geometry)
      const lineStyle = { color: "#4EA476", weight: 4 };
      try {
        L.geoJSON(geoJsonData, lineStyle).addTo(busRouteLayer);
      } catch {
        console.log(`路線資料異常: ${geoJsonData}`);
      }
    }
  }
}

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