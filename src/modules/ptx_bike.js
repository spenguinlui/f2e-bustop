import axios from 'axios';
import jsSHA from "jssha";

// 外部引用記得去複製這兩個公式
import { distance, distanceZh } from "./calculate";

// ptx 資料來源
const API_DOMAIN = "https://ptx.transportdata.tw/MOTC/v2/";
const APP_ID = process.env.VUE_APP_APP_ID;
const APP_KEY = process.env.VUE_APP_APP_KEY;

// APP 授權認證 header
const authorizationHeader = () => {
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
const urlQueryStr = (dataType, query = { top: null, position: null, select: null, routeName: null }) => {
  let queryStr = "";

  if (query.top) queryStr += `&$top=${query.top}`;
  if (!query.top) queryStr += `&$top=100`;           // 安全機制
  
  if (query.position) queryStr += createNearByStr(query.position);
  if (query.select) queryStr += createSelectByStr(query.select);

  // 針對關鍵字過濾
  if (query.keyword) queryStr += `&$filter=contains(RouteName/Zh_tw, '${query.keyword}')`;
  
  // 指定路線要全部符合
  if (query.routeName) queryStr += `&$filter=RouteName/Zh_tw eq '${query.routeName}'`;

  // 指定業者
  if (query.operator) queryStr += `&$filter=OperatorID eq '${query.operator}'`;

  return encodeURI(`${API_DOMAIN}${dataType}?$format=JSON${queryStr}`);
}

// 自行車 API ------
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

// 取得附近自行車站點資料
// input: position: { latitude: string, longitude: string }
// output: Promise()
export const getbikeStation = (position) => {
  return Promise
  .all([AJAX_getBikeAvailability(position), AJAX_getBikeStation(position)])
  .then(res => {
    const dataList = res[0].data;
    let avaDataList = res[1].data;
    return avaDataList.map(
      data => {
        const { PositionLat, PositionLon } = data.StationPosition;
        let findData = dataList.find((d) => d.StationUID === data.StationUID);
        if (findData) data = {...data, ...findData}

        // 暫時拿掉太長贅字
        data.StationName.Zh_tw = data.StationName.Zh_tw.replace("YouBike1.0_", "");
        data.StationName.Zh_tw = data.StationName.Zh_tw.replace("YouBike2.0_", "");

        // 寫入站點離自身距離 & 中文敘述(公里/公尺)
        data.Distance = distance(PositionLat, PositionLon, position.latitude, position.longitude);
        data.DistanceZH = distanceZh(data.Distance);
        return data;
      }
    );
  })
}

// 輸出內容
// [
//   {
//       "StationUID": "TPE0014",
//       "AuthorityID": "TPE",
//       "StationName": {
//           "Zh_tw": "榮星花園",
//           "En": "YouBike1.0_Rongxing Park"
//       },
//       "StationPosition": {
//           "PositionLon": 121.54037,
//           "PositionLat": 25.06424,
//           "GeoHash": "wsqqtdycz"
//       },
//       "BikesCapacity": 32,
//       "ServiceType": 1,
//       "SrcUpdateTime": "2022-02-17T09:58:19+08:00",
//       "UpdateTime": "2022-02-17T09:59:34+08:00",
//       "ServiceStatus": 1,
//       "AvailableRentBikes": 20,
//       "AvailableReturnBikes": 12,
//       "Distance": 0.6558952345064243,
//       "DistanceZH": "656公尺"
//   },
//   ...
// ]