import axios from 'axios';
import jsSHA from "jssha";

const API_DOMAIN = "https://ptx.transportdata.tw/MOTC/v2/";

// APP 授權認證 header
export const authorizationHeader = () => {
  const APP_ID = process.env.VUE_APP_APP_ID;
  const APP_KEY = process.env.VUE_APP_APP_KEY;

  const GMTString = new Date().toGMTString();
  let ShaObj = new jsSHA('SHA-1', 'TEXT');
  ShaObj.setHMACKey(APP_KEY, 'TEXT');
  ShaObj.update('x-date: ' + GMTString);
  const HMAC = ShaObj.getHMAC('B64');
  const Authorization = 'hmac username="' + APP_ID + '", algorithm="hmac-sha1", headers="x-date", signature="' + HMAC + '"';

  return { 'Authorization': Authorization, 'X-Date': GMTString };
}

// 參數字串
const createNearByStr = ({ latitude, longitude }, limit = 1000) => (latitude && longitude) ? `&$spatialFilter=nearby(${latitude},${longitude}, ${limit})` : "";
const createSelectByStr = (select) => select.reduce((acc, cur, index) => acc + (index === 0 ? `${cur}` : `, ${cur}`), "&$select=");

// 呼叫 API 的最終 URL
export const urlQueryStr = (dataType, query = { top: null, position: null, select: null, routeName: null }) => {
  let queryStr = "";

  if (query.top) queryStr += `&$top=${query.top}`;
  if (!query.top) queryStr += `&$top=30`;  // 安全機制
  
  if (query.position) queryStr += createNearByStr(query.position);
  if (query.select) queryStr += createSelectByStr(query.select);

  // 針對關鍵字過濾
  if (query.keyword) queryStr += `&$filter=contains(RouteName/Zh_tw, '${query.keyword}')`;
  
  // 指定路線要全部符合
  if (query.routeName) queryStr += `&$filter=RouteName/Zh_tw eq '${query.routeName}'`;

  return encodeURI(`${API_DOMAIN}${dataType}?$format=JSON${queryStr}`);
}

export const urlPath = {
  BikeSt: "Bike/Station/NearBy",
  BikeAv: "Bike/Availability/NearBy",
  cityBusR_n: "Bus/Route/City/",
  cityBusRS_n: "Bus/Shape/City/Taipei/"
}

// 呼叫 API ----------
// 尋找附近公車站
export const AJAX_getBusStopNearBy = ({ type = "CB", city = null, position }) => {
  const path = type === "CB" ?
    `Bus/Stop/City/${city}` :
    `Bus/Stop/InterCity`;
  return axios({
    method: 'get',
    url: urlQueryStr(path, { position: position }),
    headers: authorizationHeader()
  })
}

// 公車路線列表
export const AJAX_getBusRoute = ({ type = "CB", city = null, keyword = null }) => {
  const path = type === "CB" ?
    `Bus/Route/City/${city}` :
    `Bus/Route/InterCity/`;
  return axios({
    method: 'get',
    url: urlQueryStr(path, { keyword: keyword, select: ['RouteUID', 'RouteName','DepartureStopNameZh', 'DestinationStopNameZh', 'City', 'FareBufferZoneDescriptionZh'] }),
    headers: authorizationHeader()
  })
}

// 指定路線站序
export const AJAX_getBusStopOfRoute = ({ type = "CB", city = null, routeName = null }) => {
  const path = type === "CB" ?
    `Bus/StopOfRoute/City/${city}/${routeName}` :
    `Bus/StopOfRoute/InterCity/${routeName}`;
  return axios({
    method: 'get',
    url: urlQueryStr(path, { select: ['Direction', 'Stops', 'RouteName'], routeName: routeName }),
    headers: authorizationHeader()
  })
}

// 指定路線預估時間
export const AJAX_getBusTimeIfArrival = ({ type = "CB", city = null, routeName = null }) => {
  const path = type === "CB" ?
    `Bus/EstimatedTimeOfArrival/City/${city}/${routeName}` :
    `Bus/EstimatedTimeOfArrival/InterCity/${routeName}`;
  return axios({
    method: 'get',
    url: urlQueryStr(path, { top: 1000, select: ['Direction', 'StopUID', 'IsLastBus','EstimateTime', 'StopStatus'], routeName: routeName }),
    headers: authorizationHeader()
  })
}

// 指定路線路線圖
export const AJAX_getBusShapOfRoute = ({ type = "CB", city = null, routeName = null }) => {
  const path = type === "CB" ?
    `Bus/Shape/City/${city}/${routeName}` :
    `Bus/Shape/InterCity/${routeName}`;
  return axios({
    method: 'get',
    url: urlQueryStr(path, { select: ['Geometry', 'Direction'], routeName: routeName }),
    headers: authorizationHeader()
  })
}

// 指定路線公車動態
export const AJAX_getBusRealTime = ({ type = "CB", city = null, routeName = null }) => {
  const path = type === "CB" ?
    `Bus/RealTimeByFrequency/City/${city}/${routeName}` :
    `Bus/RealTimeByFrequency/InterCity/${routeName}`;
  return axios({
    method: 'get',
    url: urlQueryStr(path, { top: 1000, select: ['PlateNumb', 'Direction', 'BusPosition', 'BusStatus'], routeName: routeName }),
    headers: authorizationHeader()
  })
}

// 指定路線站位附近公車
export const AJAX_getBustRealTimeStop = ({ type = "CB", city = null, routeName = null }) => {
  const path = type === "CB" ?
    `Bus/RealTimeNearStop/City/${city}/${routeName}` :
    `Bus/RealTimeNearStop/InterCity/${routeName}`;
  return axios({
    method: 'get',
    url: urlQueryStr(path, { select: ['PlateNumb', 'Direction', 'BusStatus', 'StopName', 'StopUID'], routeName: routeName }),
    headers: authorizationHeader()
  })
}

// 附近自行車站點
export const AJAX_getBikeStation = (position) => {
  const path = "Bike/Station/NearBy";
  return axios({
    method: 'get',
    url: urlQueryStr(path, { position: position, select: ['StationUID', 'AuthorityID','StationName', 'StationPosition'] }),
    headers: authorizationHeader()
  })
}

// 附近自行車站點可還可借量
export const AJAX_getBikeAvailability = (position) => {
  const path = "Bike/Availability/NearBy";
  return axios({
    method: 'get',
    url: urlQueryStr(path, { position: position, select: ['StationUID', 'AvailableRentBikes', 'AvailableReturnBikes'] }),
    headers: authorizationHeader()
  })
}

// 依照座標取得行政區  v3
export const AJAX_getCurrentLocation = (position) => {
  return axios({
    method: 'get',
    url: `https://gist.motc.gov.tw/gist_api/V3/Map/GeoLocating/District/LocationX/${position.longitude}/LocationY/${position.latitude}?$format=JSON`,
    headers: authorizationHeader()
  })
}

// 天氣觀測 API ------
export const AJAX_getWeaterRain = (currentLocation, limit = 1) => {
  return axios({
    method: 'get',
    url: `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${process.env.VUE_APP_WEATHER_API_KEY}&limit=${limit}&locationName=${currentLocation}`,
  })
}
