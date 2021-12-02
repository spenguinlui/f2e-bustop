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
export const urlQueryStr = (dataType, query = { top: null, position: null, select: null }) => {
  let queryStr = "";
  if (query.top) {
    queryStr += `&$top=${query.top}`;
  } else {
    queryStr += `&$top=30`;  // 安全機制
  }
  if (query.position) queryStr += createNearByStr(query.position);
  if (query.select) queryStr += createSelectByStr(query.select);

  // 特殊請求
  if (query.keyword)  queryStr += `&$filter=contains(RouteName/Zh_tw, '${query.keyword}')`;

  return encodeURI(`${API_DOMAIN}${dataType}?$format=JSON${queryStr}`);
}

export const urlPath = {
  BikeSt: "Bike/Station/NearBy",
  BikeAv: "Bike/Availability/NearBy",
  cityBusR_n: "Bus/Route/City/",
  cityBusRS_n: "Bus/Shape/City/Taipei/"
}

// 呼叫 API ----------
// 公車路線列表
export const AJAX_getBusRoute = (urlOfRoute, keyword = null) => {
  return axios({
    method: 'get',
    url: urlQueryStr(urlOfRoute, { keyword: keyword, select: ['RouteUID', 'RouteName','DepartureStopNameZh', 'DestinationStopNameZh', 'City'] }),
    headers: authorizationHeader()
  })
}

// 指定路線站序
export const AJAX_getBusStopOfRoute = (urlOfStop) => {
  return axios({
    method: 'get',
    url: urlQueryStr(urlOfStop, { select: ['Direction', 'Stops']}),
    headers: authorizationHeader()
  })
}

// 指定路線預估時間
export const AJAX_getBusTimeIfArrival = (urlOfTime) => {
  return axios({
    method: 'get',
    url: urlQueryStr(urlOfTime, { select: ['Direction', 'StopUID', 'EstimateTime', 'StopStatus']}),
    headers: authorizationHeader()
  })
}

// 指定路線路線圖
export const AJAX_getBusShapOfRoute = (urlOfShap) => {
  return axios({
    method: 'get',
    url: urlQueryStr(urlOfShap, { select: ['Geometry']}),
    headers: authorizationHeader()
  })
}

// 指定路線公車動態
export const AJAX_getBusRealTime = (urlOfRealTime) => {
  return axios({
    method: 'get',
    url: urlQueryStr(urlOfRealTime, { select: ['PlateNumb', 'Direction', 'BusPosition', 'BusStatus']}),
    headers: authorizationHeader()
  })
}

// 附近自行車站點
export const AJAX_getBikeStation = (position) => {
  return axios({
    method: 'get',
    url: urlQueryStr("Bike/Station/NearBy", { position: position, select: ['StationUID', 'AuthorityID','StationName', 'StationPosition'] }),
    headers: authorizationHeader()
  })
}

// 附近自行車站點可還可借量
export const AJAX_getBikeAvailability = (position) => {
  return axios({
    method: 'get',
    url: urlQueryStr("Bike/Availability/NearBy", { position: position, select: ['StationUID', 'AvailableRentBikes', 'AvailableReturnBikes'] }),
    headers: authorizationHeader()
  })
}
