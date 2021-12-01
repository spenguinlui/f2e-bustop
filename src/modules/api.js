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