import L from 'leaflet';
import CenterIcon from "../assets/images/center-pc.svg";
const centerIcon = L.icon({
  iconUrl: CenterIcon,
  iconSize: [75, 75],
  iconAnchor: [37, 37]
})

// 判斷單車 Marker 樣式
const countChangeClass = (dataCount) => {
  const calssName = dataCount === 0 ? 'disable' : dataCount < 5 ? 'limit' : 'default';
  return calssName
}

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
}

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
      bikeLayer: {}
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
  }
}