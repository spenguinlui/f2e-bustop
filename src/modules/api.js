import jsSHA from "jssha";

const API_DOMAIN = "https://ptx.transportdata.tw/MOTC/v2/";

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

const createNearByStr = ({ latitude, longitude }, limit = 1000) => (latitude && longitude) ? `&$spatialFilter=nearby(${latitude},${longitude}, ${limit})` : "";
const createSelectByStr = (select) => select.reduce((acc, cur, index) => acc + (index === 0 ? `${cur}` : `, ${cur}`), "&$select=");

export const urlQueryStr = (dataType, query = { top: null, position: null, select: null }) => {
  let queryStr = "";
  if (query.top) {
    queryStr += `&$top=${query.top}`;
  } else {
    queryStr += `&$top=30`;  // 安全機制
  }
  if (query.position) queryStr += createNearByStr(query.position);
  if (query.select) queryStr += createSelectByStr(query.select);
  if (query.keyword)  queryStr += `&$filter=contains(RouteName/Zh_tw, '${query.keyword}')`

  // ..其他的參數在這處理
  const url = encodeURI(`${API_DOMAIN}${dataType}?$format=JSON${queryStr}`);
  return url
}

export const urlPath = {
  bikeSt: "Bike/Station/NearBy",
  bikeAv: "Bike/Availability/NearBy",
  cityBusR: "Bus/Route/City/"
}