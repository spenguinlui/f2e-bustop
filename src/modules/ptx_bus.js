import axios from 'axios';
import jsSHA from "jssha";

// 外部引用記得去複製這檔案
import {
  insertNearByStopToDetailList,
  insertTimeArrivalToDetailList,
  insertRouteShapeToDetailList,
  insertRealTimeToDetailList,
  insertReailTimeStopToDeatailList,
  insertRouteDataToDetailList,
  insertScheduleToDetailList,
  insertOperatorToDetailList
} from "./data-insert.js";

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

// 依照公車站牌查找路線
export const AJAX_getBusRouteByStop = ({ type = "CB", city = null, stationId }) => {
  const path = type === "CB" ?
    `Bus/Route/City/${city}/PassThrough/Station/${stationId}` :
    `Bus/Route/InterCity/PassThrough/Station/${stationId}`;
  return axios({
    method: 'get',
    url: urlQueryStr(path),
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

// 指定路線公車路線細節
export const AJAX_getBusRouteDetail = ({ type = "CB", city = null, routeName = null }) => {
  const path = type === "CB" ?
    `Bus/Route/City/${city}/${routeName}` :
    `Bus/Route/InterCity/${routeName}`;
  return axios({
    method: 'get',
    url: urlQueryStr(path),
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

// 指定路線班表資料
export const AJAX_getBusSchedule = ({ type = "CB", city = null, routeName = null }) => {
  const path = type === "CB" ?
    `Bus/Schedule/City/${city}/${routeName}` :
    `Bus/Schedule/InterCity/${routeName}`;
  return axios({
    method: 'get',
    url: urlQueryStr(path, { routeName: routeName }),
    headers: authorizationHeader()
  })
}

// 指定業者資料
export const AJAX_getBusOperator = ({ type = "CB", city = null, operator = null }) => {
  const path = type === "CB" ?
    `Bus/Operator/City/${city}` :
    `Bus/Operator/InterCity`;
  return axios({
    method: 'get',
    url: urlQueryStr(path, { operator }),
    headers: authorizationHeader()
  })
}

// 取得路線細節
// input: params: { type: string, city: string, routeName: string, currentPosition: { latitude: string, longitude: string } }
// output: Promise()
export const getBusRouteData = (params) => {
  const { type, city, currentPosition } = params;
  return Promise
  .all([
    AJAX_getBusStopOfRoute(params),
    AJAX_getBusTimeIfArrival(params),
    AJAX_getBusShapOfRoute(params),
    AJAX_getBusRealTime(params),
    AJAX_getBustRealTimeStop(params),
    AJAX_getBusRouteDetail(params),
    AJAX_getBusSchedule(params)
  ])
  .then(res => {
    const stopList = res[0].data;         // 公車站點資料
    const timeList = res[1].data;         // 公車即時到站時間
    const routeList = res[2].data;        // 公車路線圖
    const realTimeList = res[3].data;     // 公車動態位置
    const realTimeStopList = res[4].data; // 公車動態位置(站牌附近)
    const routeDataList = res[5].data;    // 公車路線細節
    const scheduleList = res[6].data;     // 公車路線行程

    // 整合各來源資訊
    let detailList = JSON.parse(JSON.stringify(stopList));
    detailList = insertNearByStopToDetailList(detailList, currentPosition);
    detailList = insertTimeArrivalToDetailList(detailList, timeList);
    detailList = insertRouteShapeToDetailList(detailList, routeList);
    detailList = insertRealTimeToDetailList(detailList, realTimeList);
    detailList = insertReailTimeStopToDeatailList(detailList, realTimeStopList);
    detailList = insertRouteDataToDetailList(detailList, routeDataList);
    detailList = insertScheduleToDetailList(detailList, scheduleList);
    return detailList;
  })
  .then(res => {
    let detailList = res;

    // 加入營運商資料
    // eslint-disable-next-line no-unexpected-multiline
    (async function() { 
      await Promise.all(
        detailList[0].Data.Operators.map((operator) => {
          return AJAX_getBusOperator({ type, city, operator: operator.OperatorID });
        })
      )
      .then(ress => {
        ress.forEach(res => {
          detailList = insertOperatorToDetailList(detailList, res.data);
        })
      })
    })();
    return detailList;
  })
}

// 刷新路線細節
// input: params: { type: string, city: string, routeName: string }, originDetailList: [] = getBusRouteData 的結果
// output: Promise()
export const refreshBusRouteData = (params, originDetailList) => {
  let detailList = JSON.parse(JSON.stringify(originDetailList));

  // 指刷新動態資料
  return Promise.all([
    AJAX_getBusTimeIfArrival(params),
    AJAX_getBusRealTime(params),
    AJAX_getBustRealTimeStop(params)
  ])
  .then(res => {
    const timeList = res[0].data;
    const realTimeList = res[1].data;
    const realTimeStopList = res[2].data;

    detailList = insertTimeArrivalToDetailList(detailList, timeList);
    detailList = insertRealTimeToDetailList(detailList, realTimeList);
    detailList = insertReailTimeStopToDeatailList(detailList, realTimeStopList);
    return detailList;
  })
}


// 路線細節輸出內容參考
// [
//   {
//       "RouteName": {
//           "Zh_tw": "14",
//           "En": "14"
//       },
//       "Direction": 0,
//       "Stops": [
//           {
//               "StopUID": "TPE148536",
//               "StopID": "148536",
//               "StopName": {
//                   "Zh_tw": "蘆洲站",
//                   "En": "Luzhou Sta."
//               },
//               "StopBoarding": 0,
//               "StopSequence": 1,
//               "StopPosition": {
//                   "PositionLon": 121.4691805,
//                   "PositionLat": 25.07853582,
//                   "GeoHash": "wsqqsj7jj"
//               },
//               "StationID": "3694",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "StopStatus": 1,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40084",
//               "StopID": "40084",
//               "StopName": {
//                   "Zh_tw": "和平路口",
//                   "En": "Heping Intersection"
//               },
//               "StopBoarding": -1,
//               "StopSequence": 2,
//               "StopPosition": {
//                   "PositionLon": 121.4696929,
//                   "PositionLat": 25.07952752,
//                   "GeoHash": "wsqqsjedb"
//               },
//               "StationID": "3688",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "StopStatus": 1,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40085",
//               "StopID": "40085",
//               "StopName": {
//                   "Zh_tw": "蘆洲監理站(中正路)",
//                   "En": "Luzhou Motor Vehicles Office(Zhongzheng Rd.)"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 3,
//               "StopPosition": {
//                   "PositionLon": 121.471647,
//                   "PositionLat": 25.081846,
//                   "GeoHash": "wsqqsnhbq"
//               },
//               "StationID": "3697",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "StopStatus": 1,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40086",
//               "StopID": "40086",
//               "StopName": {
//                   "Zh_tw": "蘆洲國小",
//                   "En": "Luzhou Elementary School"
//               },
//               "StopBoarding": -1,
//               "StopSequence": 4,
//               "StopPosition": {
//                   "PositionLon": 121.4703582,
//                   "PositionLat": 25.08330021,
//                   "GeoHash": "wsqqsnk0b"
//               },
//               "StationID": "15070",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "StopStatus": 1,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40087",
//               "StopID": "40087",
//               "StopName": {
//                   "Zh_tw": "中原公寓",
//                   "En": "Zhongyuan Apartment"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 5,
//               "StopPosition": {
//                   "PositionLon": 121.4685849,
//                   "PositionLat": 25.08581511,
//                   "GeoHash": "wsqqsndxr"
//               },
//               "StationID": "15069",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "StopStatus": 1,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40088",
//               "StopID": "40088",
//               "StopName": {
//                   "Zh_tw": "空中大學",
//                   "En": "National Open Univ."
//               },
//               "StopBoarding": 0,
//               "StopSequence": 6,
//               "StopPosition": {
//                   "PositionLon": 121.4677741,
//                   "PositionLat": 25.08692081,
//                   "GeoHash": "wsqqsnfju"
//               },
//               "StationID": "3671",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "StopStatus": 1,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40089",
//               "StopID": "40089",
//               "StopName": {
//                   "Zh_tw": "王爺廟口",
//                   "En": "Wangye Temple Entrance"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 7,
//               "StopPosition": {
//                   "PositionLon": 121.466902,
//                   "PositionLat": 25.08809,
//                   "GeoHash": "wsqqsp1kx"
//               },
//               "StationID": "15068",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "StopStatus": 1,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE151057",
//               "StopID": "151057",
//               "StopName": {
//                   "Zh_tw": "民族路口",
//                   "En": "Minzu Rd. Entrance"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 8,
//               "StopPosition": {
//                   "PositionLon": 121.467789,
//                   "PositionLat": 25.090065,
//                   "GeoHash": "wsqqspd0h"
//               },
//               "StationID": "50416",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "StopStatus": 1,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40090",
//               "StopID": "40090",
//               "StopName": {
//                   "Zh_tw": "捷運蘆洲站",
//                   "En": "MRT Luzhou Sta."
//               },
//               "StopBoarding": -1,
//               "StopSequence": 9,
//               "StopPosition": {
//                   "PositionLon": 121.4647878,
//                   "PositionLat": 25.09124688,
//                   "GeoHash": "wsqqezxzn"
//               },
//               "StationID": "3676",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "StopStatus": 1,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40091",
//               "StopID": "40091",
//               "StopName": {
//                   "Zh_tw": "捷運蘆洲站",
//                   "En": "MRT  Luzhou Sta."
//               },
//               "StopBoarding": -1,
//               "StopSequence": 10,
//               "StopPosition": {
//                   "PositionLon": 121.4638568,
//                   "PositionLat": 25.09148696,
//                   "GeoHash": "wsqqezz29"
//               },
//               "StationID": "15072",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "StopStatus": 1,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40092",
//               "StopID": "40092",
//               "StopName": {
//                   "Zh_tw": "長榮路",
//                   "En": "Changrong Rd."
//               },
//               "StopBoarding": 0,
//               "StopSequence": 11,
//               "StopPosition": {
//                   "PositionLon": 121.4603296,
//                   "PositionLat": 25.09231282,
//                   "GeoHash": "wsqqezutq"
//               },
//               "StationID": "3674",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "StopStatus": 1,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40093",
//               "StopID": "40093",
//               "StopName": {
//                   "Zh_tw": "永平市場",
//                   "En": "Yongping Market"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 12,
//               "StopPosition": {
//                   "PositionLon": 121.459553,
//                   "PositionLat": 25.090149,
//                   "GeoHash": "wsqqezs0s"
//               },
//               "StationID": "3658",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "StopStatus": 1,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00",
//               "PlateNumb": "835-U3",
//               "DutyStatus": 1,
//               "BusStatus": 0,
//               "A2EventType": 1,
//               "GPSTime": "2022-02-17T11:40:49+08:00"
//           },
//           {
//               "StopUID": "TPE40094",
//               "StopID": "40094",
//               "StopName": {
//                   "Zh_tw": "永樂街",
//                   "En": "Yongle St."
//               },
//               "StopBoarding": 0,
//               "StopSequence": 13,
//               "StopPosition": {
//                   "PositionLon": 121.458711,
//                   "PositionLat": 25.08836259,
//                   "GeoHash": "wsqqez5w3"
//               },
//               "StationID": "15045",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 43,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40095",
//               "StopID": "40095",
//               "StopName": {
//                   "Zh_tw": "長安街",
//                   "En": "Changan St."
//               },
//               "StopBoarding": 0,
//               "StopSequence": 14,
//               "StopPosition": {
//                   "PositionLon": 121.4572506,
//                   "PositionLat": 25.08798117,
//                   "GeoHash": "wsqqez4kp"
//               },
//               "StationID": "3672",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 123,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40096",
//               "StopID": "40096",
//               "StopName": {
//                   "Zh_tw": "成功國小",
//                   "En": "Chenggong Elementary School"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 15,
//               "StopPosition": {
//                   "PositionLon": 121.4573852,
//                   "PositionLat": 25.08625089,
//                   "GeoHash": "wsqqeyfd4"
//               },
//               "StationID": "3664",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 181,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40097",
//               "StopID": "40097",
//               "StopName": {
//                   "Zh_tw": "永康公園",
//                   "En": "Yongkang Park"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 16,
//               "StopPosition": {
//                   "PositionLon": 121.458073,
//                   "PositionLat": 25.084766,
//                   "GeoHash": "wsqqeye16"
//               },
//               "StationID": "3660",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 221,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40098",
//               "StopID": "40098",
//               "StopName": {
//                   "Zh_tw": "長安街一",
//                   "En": "JhangAn St. 1"
//               },
//               "StopBoarding": -1,
//               "StopSequence": 17,
//               "StopPosition": {
//                   "PositionLon": 121.4593921,
//                   "PositionLat": 25.08279255,
//                   "GeoHash": "wsqqeyhjb"
//               },
//               "StationID": "3673",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 279,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE153878",
//               "StopID": "153878",
//               "StopName": {
//                   "Zh_tw": "忠義廟",
//                   "En": "Zhongyi Trmple"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 18,
//               "StopPosition": {
//                   "PositionLon": 121.4611032,
//                   "PositionLat": 25.08115346,
//                   "GeoHash": "wsqqevvk2"
//               },
//               "StationID": "3669",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 352,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE153879",
//               "StopID": "153879",
//               "StopName": {
//                   "Zh_tw": "延平里",
//                   "En": "Yanping Li"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 19,
//               "StopPosition": {
//                   "PositionLon": 121.4631595,
//                   "PositionLat": 25.07961424,
//                   "GeoHash": "wsqqevwg2"
//               },
//               "StationID": "3667",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 423,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE153880",
//               "StopID": "153880",
//               "StopName": {
//                   "Zh_tw": "九芎街",
//                   "En": "Jiuqiong St"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 20,
//               "StopPosition": {
//                   "PositionLon": 121.465375,
//                   "PositionLat": 25.07935,
//                   "GeoHash": "wsqqsj83u"
//               },
//               "StationID": "3638",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 472,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40102",
//               "StopID": "40102",
//               "StopName": {
//                   "Zh_tw": "九芎廟",
//                   "En": "Jiuqiong Temple"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 21,
//               "StopPosition": {
//                   "PositionLon": 121.4665749,
//                   "PositionLat": 25.07899554,
//                   "GeoHash": "wsqqsj3r8"
//               },
//               "StationID": "3640",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 514,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40103",
//               "StopID": "40103",
//               "StopName": {
//                   "Zh_tw": "九芎街口",
//                   "En": "Jiuqiong St. Entrance"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 22,
//               "StopPosition": {
//                   "PositionLon": 121.46855,
//                   "PositionLat": 25.07848,
//                   "GeoHash": "wsqqsj6sw"
//               },
//               "StationID": "3639",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 600,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40104",
//               "StopID": "40104",
//               "StopName": {
//                   "Zh_tw": "永安里",
//                   "En": "Yongan Li"
//               },
//               "StopBoarding": -1,
//               "StopSequence": 23,
//               "StopPosition": {
//                   "PositionLon": 121.468908,
//                   "PositionLat": 25.077995,
//                   "GeoHash": "wsqqsj6cy"
//               },
//               "StationID": "15088",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 697,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40105",
//               "StopID": "40105",
//               "StopName": {
//                   "Zh_tw": "大同新村",
//                   "En": "Datong New Village"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 24,
//               "StopPosition": {
//                   "PositionLon": 121.467915780225,
//                   "PositionLat": 25.0751848083815,
//                   "GeoHash": "wsqqshf1x"
//               },
//               "StationID": "15090",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 718,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40106",
//               "StopID": "40106",
//               "StopName": {
//                   "Zh_tw": "褒仔寮",
//                   "En": "Baoziliao"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 25,
//               "StopPosition": {
//                   "PositionLon": 121.468655576842,
//                   "PositionLat": 25.072382114975,
//                   "GeoHash": "wsqqsh6c0"
//               },
//               "StationID": "3687",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 797,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40107",
//               "StopID": "40107",
//               "StopName": {
//                   "Zh_tw": "穀保中學",
//                   "En": "Gubao High School"
//               },
//               "StopBoarding": -1,
//               "StopSequence": 26,
//               "StopPosition": {
//                   "PositionLon": 121.470692510068,
//                   "PositionLat": 25.0720737220282,
//                   "GeoHash": "wsqqshhr2"
//               },
//               "StationID": "10615",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 889,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40108",
//               "StopID": "40108",
//               "StopName": {
//                   "Zh_tw": "仙公廟",
//                   "En": "Xiangong Temple"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 27,
//               "StopPosition": {
//                   "PositionLon": 121.473744486153,
//                   "PositionLat": 25.0714385525297,
//                   "GeoHash": "wsqqshn7x"
//               },
//               "StationID": "3421",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 942,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00",
//               "PlateNumb": "552-U3",
//               "DutyStatus": 1,
//               "BusStatus": 0,
//               "A2EventType": 0,
//               "GPSTime": "2022-02-17T11:41:11+08:00"
//           },
//           {
//               "StopUID": "TPE40109",
//               "StopID": "40109",
//               "StopName": {
//                   "Zh_tw": "博愛新村",
//                   "En": "Boai New Village"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 28,
//               "StopPosition": {
//                   "PositionLon": 121.4775856,
//                   "PositionLat": 25.06942063,
//                   "GeoHash": "wsqqs79rb"
//               },
//               "StationID": "13217",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 84,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40110",
//               "StopID": "40110",
//               "StopName": {
//                   "Zh_tw": "三重商工(中正北路)",
//                   "En": "Sanchong Vocational School(Zhongzheng N. Rd.)"
//               },
//               "StopBoarding": -1,
//               "StopSequence": 29,
//               "StopPosition": {
//                   "PositionLon": 121.48052,
//                   "PositionLat": 25.06855,
//                   "GeoHash": "wsqqs7e6v"
//               },
//               "StationID": "10618",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 156,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40111",
//               "StopID": "40111",
//               "StopName": {
//                   "Zh_tw": "忠孝三民街口",
//                   "En": "Zhongxiao&Sanmin  St. Intersection"
//               },
//               "StopBoarding": -1,
//               "StopSequence": 30,
//               "StopPosition": {
//                   "PositionLon": 121.4812489,
//                   "PositionLat": 25.06709838,
//                   "GeoHash": "wsqqs77fq"
//               },
//               "StationID": "10441",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 203,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40112",
//               "StopID": "40112",
//               "StopName": {
//                   "Zh_tw": "東海中學",
//                   "En": "Donghai High School"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 31,
//               "StopPosition": {
//                   "PositionLon": 121.481729929989,
//                   "PositionLat": 25.0658044228698,
//                   "GeoHash": "wsqqs7h6c"
//               },
//               "StationID": "10625",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 317,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40113",
//               "StopID": "40113",
//               "StopName": {
//                   "Zh_tw": "三民街",
//                   "En": "Sanmin St."
//               },
//               "StopBoarding": 0,
//               "StopSequence": 32,
//               "StopPosition": {
//                   "PositionLon": 121.485128,
//                   "PositionLat": 25.06332591,
//                   "GeoHash": "wsqqs6wu2"
//               },
//               "StationID": "3386",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 484,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40114",
//               "StopID": "40114",
//               "StopName": {
//                   "Zh_tw": "三重稅捐分處",
//                   "En": "Tax Administration"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 33,
//               "StopPosition": {
//                   "PositionLon": 121.48663201223,
//                   "PositionLat": 25.060305060826,
//                   "GeoHash": "wsqqs6pfg"
//               },
//               "StationID": "3455",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 633,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40115",
//               "StopID": "40115",
//               "StopName": {
//                   "Zh_tw": "菜寮(重陽路)",
//                   "En": "Cailiao(Chongyang Rd.)"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 34,
//               "StopPosition": {
//                   "PositionLon": 121.48651605944,
//                   "PositionLat": 25.0580096673922,
//                   "GeoHash": "wsqqs3xv3"
//               },
//               "StationID": "1000081",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 669,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00",
//               "PlateNumb": "461-U3",
//               "DutyStatus": 1,
//               "BusStatus": 0,
//               "A2EventType": 0,
//               "GPSTime": "2022-02-17T11:39:36+08:00"
//           },
//           {
//               "StopUID": "TPE40116",
//               "StopID": "40116",
//               "StopName": {
//                   "Zh_tw": "菜寮(重新路)",
//                   "En": "Cailiao(Chongxin Rd.)"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 35,
//               "StopPosition": {
//                   "PositionLon": 121.48792,
//                   "PositionLat": 25.057315,
//                   "GeoHash": "wsqqs98c3"
//               },
//               "StationID": "3456",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 39,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40117",
//               "StopID": "40117",
//               "StopName": {
//                   "Zh_tw": "捷運菜寮站",
//                   "En": "MRT Cailiao Sta."
//               },
//               "StopBoarding": 0,
//               "StopSequence": 36,
//               "StopPosition": {
//                   "PositionLon": 121.4905425,
//                   "PositionLat": 25.05907329,
//                   "GeoHash": "wsqqs9few"
//               },
//               "StationID": "13204",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 112,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE56866",
//               "StopID": "56866",
//               "StopName": {
//                   "Zh_tw": "中山藝術公園",
//                   "En": "Zhongshan Art park"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 37,
//               "StopPosition": {
//                   "PositionLon": 121.4925214,
//                   "PositionLat": 25.06043253,
//                   "GeoHash": "wsqqsdh5s"
//               },
//               "StationID": "13215",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 165,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40118",
//               "StopID": "40118",
//               "StopName": {
//                   "Zh_tw": "中正南路",
//                   "En": "Zhongzheng S. Rd."
//               },
//               "StopBoarding": 0,
//               "StopSequence": 38,
//               "StopPosition": {
//                   "PositionLon": 121.4940315,
//                   "PositionLat": 25.05927578,
//                   "GeoHash": "wsqqs9vkb"
//               },
//               "StationID": "3407",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 263,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "StopUID": "TPE40119",
//               "StopID": "40119",
//               "StopName": {
//                   "Zh_tw": "重安街口",
//                   "En": "Chongan. St. Entrance"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 39,
//               "StopPosition": {
//                   "PositionLon": 121.4939169,
//                   "PositionLat": 25.05705719,
//                   "GeoHash": "wsqqs9mpv"
//               },
//               "StationID": "3444",
//               "LocationCityCode": "NWT",
//               "ClosestStop": false,
//               "Direction": 0,
//               "EstimateTime": 312,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00",
//               "PlateNumb": "329-U3",
//               "DutyStatus": 1,
//               "BusStatus": 0,
//               "A2EventType": 0,
//               "GPSTime": "2022-02-17T11:36:05+08:00"
//           },
//           {
//               "StopUID": "TPE40120",
//               "StopID": "40120",
//               "StopName": {
//                   "Zh_tw": "臺北車站(鄭州)",
//                   "En": "Taipei Main Sta. (Zhengzhou)"
//               },
//               "StopBoarding": 0,
//               "StopSequence": 40,
//               "StopPosition": {
//                   "PositionLon": 121.517739472626,
//                   "PositionLat": 25.0483859091605,
//                   "GeoHash": "wsqqmpyt2"
//               },
//               "StationID": "1895",
//               "LocationCityCode": "TPE",
//               "ClosestStop": true,
//               "Direction": 0,
//               "EstimateTime": 103,
//               "StopStatus": 0,
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           }
//       ],
//       "UpdateTime": "2022-02-17T06:08:54+08:00",
//       "VersionID": 1493,
//       "Geometry": "LINESTRING (121.469354527529 25.0785723270019, 121.469293694 25.0784701650842, 121.469184172499 25.0785305501899, 121.469414548938 25.0791935220791, 121.469699067345 25.0795091062786, 121.471287065582 25.0812519031889, 121.471623182668 25.0814716310042, 121.471815074342 25.0815686622496, 121.471394787955 25.0821362086055, 121.47097615629 25.0827127109449, 121.470517563058 25.0832101524751, 121.470320753374 25.083444235265, 121.470196177918 25.0836415922066, 121.470059419345 25.0839095657072, 121.469788831519 25.0843326599962, 121.469159665317 25.0850743184847, 121.468771393469 25.0856407765479, 121.468570947478 25.0859623404019, 121.467619455879 25.0872050161157, 121.467148442984 25.0877990754852, 121.466707300054 25.0882916091885, 121.468528377246 25.0894911327003, 121.468266350333 25.0897081158479, 121.467733122451 25.0900861407997, 121.466985529147 25.0904556486151, 121.466588015281 25.0906270752657, 121.465550603676 25.0908765831196, 121.464776145426 25.0911427138353, 121.464121369538 25.0913412657799, 121.463306964437 25.0917405341491, 121.462907018289 25.0920075597942, 121.46230416749 25.092515097367, 121.461818194516 25.0930432820047, 121.4615191182 25.0933880743299, 121.461373494557 25.093270942953, 121.460645814128 25.0926002540584, 121.460511418129 25.0924208971911, 121.460319790462 25.0919796455256, 121.460010051881 25.0911730266797, 121.459639685471 25.0904967179134, 121.459444295954 25.0900186797581, 121.459408225845 25.0899208730731, 121.459384767243 25.0896872821919, 121.459398928952 25.0883305072541, 121.458622427165 25.0883015131572, 121.458124600388 25.0882993737337, 121.457342134785 25.0885029209897, 121.457265342375 25.0881171174114, 121.457260962648 25.0871577429974, 121.457267157619 25.0870033625372, 121.45727888052 25.0869178547146, 121.457520693078 25.0861112574578, 121.457827720269 25.0852323967586, 121.458709056764 25.0838850010721, 121.458844155977 25.0836289620382, 121.459121355879 25.0832021653156, 121.459664574961 25.0825053013164, 121.460307297333 25.0818759424459, 121.460796992003 25.081439710925, 121.461333737501 25.0809921986353, 121.461708577943 25.0807131710772, 121.461943829611 25.0804488835407, 121.462657850958 25.0800204532022, 121.463186369104 25.0796559791684, 121.46394757924 25.0791222298644, 121.464732944059 25.0786455086582, 121.465544100425 25.0795493512762, 121.465780174949 25.0798162946651, 121.466043285716 25.0795635981998, 121.466240767783 25.0793277604561, 121.466559243056 25.0790569834837, 121.466743491625 25.0789335923794, 121.46739553186 25.0786414666339, 121.467491168843 25.0786278543527, 121.468110856235 25.0785370934084, 121.468392821481 25.078535523953, 121.469080494557 25.0784678859065, 121.468667545582 25.0773726582072, 121.468386806996 25.0764963591872, 121.467913048122 25.0751511311007, 121.467644861302 25.0742446841252, 121.467448483498 25.0735184203449, 121.467322596002 25.0727726036725, 121.468143834814 25.0725309110746, 121.468672150926 25.0723891421133, 121.469020613037 25.0723318578816, 121.469221020323 25.0722957157649, 121.469459138523 25.0722583825755, 121.469918919596 25.0722109751245, 121.470665155891 25.0720849892001, 121.473765247121 25.0714502665321, 121.47430129607 25.0712554589558, 121.475005555724 25.0708921519859, 121.476244257968 25.0699987965849, 121.476492191572 25.0698894279011, 121.476676716975 25.0698035235265, 121.476855242379 25.0697176191146, 121.47731493968 25.0695263010313, 121.477601836417 25.0694497680728, 121.478078177719 25.0693128883204, 121.478408240335 25.069256506448, 121.479030155108 25.069130376095, 121.479579112395 25.0689825613139, 121.480100827918 25.0688034261038, 121.480655810064 25.068585589955, 121.481118753603 25.0683297019154, 121.482046939865 25.0677872819477, 121.481589744523 25.0673015028861, 121.481316908372 25.0668725087016, 121.480957924257 25.0663522343873, 121.481789153242 25.0657552804003, 121.483172359772 25.0648922127962, 121.484787126721 25.063764815902, 121.484847807917 25.0636924764527, 121.485975932718 25.0626230690984, 121.486720782787 25.0617486504792, 121.486717179567 25.0613429920154, 121.486653139077 25.0586553473166, 121.486589539139 25.0564477781147, 121.48692956195 25.0565781044784, 121.48792641931 25.0572816003535, 121.489359381337 25.0583266157658, 121.490895922528 25.0593432310633, 121.493069649093 25.060852458976, 121.493667931923 25.0601693090474, 121.493743678615 25.0600363324826, 121.494015588581 25.0595427411196, 121.494113023904 25.0593317486899, 121.494136303266 25.0591640803285, 121.494185337506 25.0589246606851, 121.49421123861 25.0585440289514, 121.49422284256 25.0582922650697, 121.494207343467 25.0579958140123, 121.49380749104 25.0562481319054, 121.493608730431 25.0554697792048, 121.495852535121 25.0545519927001, 121.496559397138 25.0541786338701, 121.499508666573 25.052565883075, 121.502908850998 25.0507029649558, 121.505620358733 25.049182923285, 121.505992295928 25.0489831772585, 121.509310996477 25.0481625015541, 121.509651653991 25.0480479421537, 121.510321249473 25.0477716805849, 121.510704104469 25.0476220595026, 121.511082862571 25.0475880075817, 121.511476552094 25.0475873112971, 121.511685058461 25.0475508850763, 121.511887996623 25.0474857295478, 121.515032726055 25.046744246597, 121.515004213786 25.0469417290471, 121.514994228882 25.047123484192, 121.515018702739 25.0473044057062, 121.515071066731 25.0474451762315, 121.515135686766 25.047513424222, 121.515185509794 25.0475286075622, 121.516088509105 25.0473728763921, 121.516152925052 25.0475475334509, 121.516401466111 25.0485986269249, 121.517752586126 25.0483929412562, 121.520559850179 25.0479972077076, 121.519947310001 25.0467189326592, 121.519502382583 25.045810813298, 121.514676070297 25.0469791827089, 121.514650425549 25.0470293791191, 121.514692266132 25.0473539997373, 121.514680966029 25.0474350731284, 121.514608803534 25.0474720974879, 121.513813608878 25.047624270089, 121.51370832372 25.0476217391697, 121.513624779717 25.0475674963741, 121.513407552814 25.0472828593904, 121.512234 25.047571, 121.511847049482 25.0476662928977, 121.511672538009 25.0477887511065, 121.511336541386 25.0481185353431, 121.511111050372 25.0481572797873, 121.510704815031 25.0481943025179, 121.510264654371 25.0482126379076, 121.50964185341 25.0482487553067, 121.509384033696 25.0482845258146, 121.506082473707 25.0490883157532, 121.505682869984 25.0492607029436, 121.503003787764 25.0507600571174, 121.499539826796 25.0526942553523, 121.4966925055 25.05429405208, 121.495916 25.054702, 121.493787336962 25.0555494069349, 121.493944547249 25.056200867112, 121.494367936263 25.057965771026, 121.494398216448 25.0582253741027, 121.494402432043 25.0585005468081, 121.494362568233 25.0589283930703, 121.494328256196 25.0592030255683, 121.494256283808 25.0594218500041, 121.494149640771 25.0596288800455, 121.493902270141 25.0600088293087, 121.49293876498 25.061127567255, 121.492865949816 25.0610494946663, 121.4927494271 25.0608016816363, 121.492589932608 25.0606719558922, 121.490787240857 25.0594733835733, 121.489284236504 25.0584293147468, 121.487830416485 25.0573863340189, 121.486787055467 25.0566834890845, 121.486766104833 25.058644684094, 121.48684976928 25.0613140105582, 121.486859730431 25.0616825217439, 121.486006941907 25.0626728520261, 121.484917764304 25.0637078232656, 121.484830976854 25.0637944326445, 121.483232268845 25.0650188865543, 121.481772300258 25.0659089365082, 121.481098516691 25.0664388777292, 121.481349524703 25.0667978453756, 121.481639023172 25.067238983076, 121.482131096246 25.0677931578488, 121.481150095284 25.0683770896896, 121.480671483088 25.0686288043664, 121.48013945221 25.0688564366934, 121.479596451677 25.0690261798369, 121.479054729391 25.0691874273095, 121.478428926102 25.0693226088162, 121.478103062106 25.0693808029248, 121.477625300416 25.0695104235131, 121.477322696787 25.0696112500867, 121.476918461223 25.0697934073796, 121.476721701814 25.069882717685, 121.476498372062 25.0699839404306, 121.476283292991 25.0700902105631, 121.47507435462 25.0709557070089, 121.474332030518 25.0713516429036, 121.473963065596 25.0714908433356, 121.473769055467 25.0715366297429, 121.470671947456 25.0721729611448, 121.47015644503 25.0722632224592, 121.469919010161 25.072294, 121.46870722278 25.0724521214968, 121.468158081873 25.072599583257, 121.467395206381 25.0728102888453, 121.467504756358 25.0734969541324, 121.467724103113 25.0742334559663, 121.467982555444 25.075108019637, 121.468468548938 25.0764317493036, 121.468730629342 25.0767050000016, 121.468825917565 25.0767834951949, 121.468854858843 25.0768913937771, 121.468836111974 25.0769941470568, 121.46872959963 25.0771683847939, 121.46872115109 25.0773234318598, 121.469189790593 25.0785242281346, 121.469102432189 25.0785514629757, 121.468951696734 25.0785565162992, 121.46839596467 25.0786120523089, 121.468130775097 25.078606357955, 121.467500640228 25.0786821086464, 121.46676114567 25.0790012170954, 121.466597666694 25.0791220693374, 121.466293592796 25.0793805960101, 121.466102601058 25.0796100325573, 121.46579078693 25.0799363615487, 121.465490850735 25.0795990337062, 121.464719205992 25.0787449143101, 121.463992443206 25.0791876671494, 121.463242162253 25.079709612852, 121.462713313645 25.0800949683604, 121.462016087929 25.0804988127255, 121.461756837526 25.0807499862647, 121.461383894071 25.0810566910533, 121.46085648656 25.0814935955005, 121.460347568026 25.0819441176187, 121.459761190929 25.0825365538178, 121.459190638959 25.0832322584039, 121.458915293755 25.0836666797873, 121.458774805189 25.0839365072522, 121.457888528253 25.0852751453559, 121.457601326076 25.0861563295137, 121.457360340436 25.0869101144659, 121.457346307685 25.0869968818801, 121.457343494557 25.0871695528285, 121.457348345999 25.0880815071653, 121.457406010161 25.0884103427627, 121.458108499645 25.0882332760275, 121.458639888388 25.0882202861511, 121.459488373952 25.0882646940661, 121.459480179137 25.0896765910169, 121.45950958914 25.0899371407413, 121.459601595646 25.0901750741154, 121.459714123735 25.0904451871462, 121.45992043886 25.0907973098752, 121.460088668211 25.0911627328303, 121.460394231411 25.0919307223061, 121.460603006506 25.0923960687002, 121.460706272863 25.0925453793175, 121.461454622112 25.0932191035313, 121.461705424035 25.0929715753592, 121.462183981173 25.0924393454176, 121.462801046686 25.0918909467398, 121.463228109268 25.091629185955, 121.463981080197 25.0912673480664, 121.464745089389 25.091004324622, 121.465514333839 25.0907630082101, 121.466565982123 25.0904690498932, 121.467045202165 25.0903032798903, 121.467601530823 25.089982337474, 121.468077083162 25.089643734021, 121.468303713319 25.0894218931597, 121.466572484758 25.0882890001125, 121.467088347425 25.087726615365, 121.467563849867 25.0871434834833, 121.468529151962 25.0858889434567, 121.46870350793 25.0855790456808, 121.469146065985 25.084953454213, 121.469745407204 25.0842433586551, 121.469975382687 25.0838798855105, 121.47012040363 25.0835799723892, 121.470243571642 25.0834012863287, 121.470440089538 25.0831756879081, 121.470902099194 25.0826700574217, 121.471340102175 25.0820854720907, 121.471696104744 25.0815797066735, 121.471468117816 25.0814683175731, 121.471207140204 25.081284610699, 121.469542691912 25.0794854809613, 121.469348259408 25.0792454291334, 121.46910642871 25.078554199226)",
//       "BusRealTime": [
//           {
//               "PlateNumb": "329-U3",
//               "Direction": 0,
//               "BusPosition": {
//                   "PositionLon": 121.514232,
//                   "PositionLat": 25.047022,
//                   "GeoHash": "wsqqmpevq"
//               },
//               "Speed": 13,
//               "Azimuth": 105,
//               "DutyStatus": 1,
//               "BusStatus": 0,
//               "GPSTime": "2022-02-17T11:41:14+08:00",
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "PlateNumb": "461-U3",
//               "Direction": 0,
//               "BusPosition": {
//                   "PositionLon": 121.486783,
//                   "PositionLat": 25.056992,
//                   "GeoHash": "wsqqs3rzx"
//               },
//               "Speed": 3,
//               "Azimuth": 112,
//               "DutyStatus": 1,
//               "BusStatus": 0,
//               "GPSTime": "2022-02-17T11:41:00+08:00",
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "PlateNumb": "552-U3",
//               "Direction": 0,
//               "BusPosition": {
//                   "PositionLon": 121.474287,
//                   "PositionLat": 25.071307,
//                   "GeoHash": "wsqqshnfu"
//               },
//               "Speed": 41,
//               "Azimuth": 113,
//               "DutyStatus": 1,
//               "BusStatus": 0,
//               "GPSTime": "2022-02-17T11:41:11+08:00",
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           },
//           {
//               "PlateNumb": "835-U3",
//               "Direction": 0,
//               "BusPosition": {
//                   "PositionLon": 121.459547,
//                   "PositionLat": 25.090178,
//                   "GeoHash": "wsqqezs0u"
//               },
//               "Speed": 22,
//               "Azimuth": 204,
//               "DutyStatus": 1,
//               "BusStatus": 0,
//               "GPSTime": "2022-02-17T11:41:02+08:00",
//               "SrcUpdateTime": "2022-02-17T11:41:20+08:00",
//               "UpdateTime": "2022-02-17T11:41:23+08:00"
//           }
//       ],
//       "Data": {
//           "RouteUID": "TPE10891",
//           "RouteID": "10891",
//           "HasSubRoutes": true,
//           "Operators": [
//               {
//                   "OperatorID": "800",
//                   "OperatorName": {
//                       "Zh_tw": "大都會客運",
//                       "En": "Metropolitan Bus Co., Ltd."
//                   },
//                   "OperatorCode": "MetropolitanBus",
//                   "OperatorNo": "0303",
//                   "ProviderID": "045",
//                   "OperatorPhone": "0800-053-434",
//                   "OperatorEmail": "service11@mtcbus.com.tw",
//                   "OperatorUrl": "http://www.mtcbus.com.tw",
//                   "AuthorityCode": "TPE",
//                   "UpdateTime": "2022-02-17T06:08:54+08:00"
//               }
//           ],
//           "AuthorityID": "004",
//           "ProviderID": "045",
//           "SubRoutes": [
//               {
//                   "SubRouteUID": "TPE108910",
//                   "SubRouteID": "108910",
//                   "OperatorIDs": [
//                       "800"
//                   ],
//                   "SubRouteName": {
//                       "Zh_tw": "14",
//                       "En": "14"
//                   },
//                   "Direction": 0,
//                   "FirstBusTime": "0530",
//                   "LastBusTime": "2300",
//                   "HolidayFirstBusTime": "0530",
//                   "HolidayLastBusTime": "2300"
//               },
//               {
//                   "SubRouteUID": "TPE108910",
//                   "SubRouteID": "108910",
//                   "OperatorIDs": [
//                       "800"
//                   ],
//                   "SubRouteName": {
//                       "Zh_tw": "14",
//                       "En": "14"
//                   },
//                   "Direction": 1,
//                   "FirstBusTime": "0530",
//                   "LastBusTime": "2300",
//                   "HolidayFirstBusTime": "0530",
//                   "HolidayLastBusTime": "2300"
//               }
//           ],
//           "BusRouteType": 11,
//           "RouteName": {
//               "Zh_tw": "14",
//               "En": "14"
//           },
//           "DepartureStopNameZh": "蘆洲",
//           "DepartureStopNameEn": "Luzhou",
//           "DestinationStopNameZh": "臺北車站",
//           "DestinationStopNameEn": "Taipei Main Sta.",
//           "TicketPriceDescriptionZh": "兩段票",
//           "TicketPriceDescriptionEn": "2 segments",
//           "FareBufferZoneDescriptionZh": "永安里－重安街口",
//           "FareBufferZoneDescriptionEn": "Yongan Li－Chongan. St. Entrance",
//           "RouteMapImageUrl": "https://ebus.gov.taipei/MapOverview?nid=0100001400",
//           "City": "Taipei",
//           "CityCode": "TPE",
//           "UpdateTime": "2022-02-17T06:08:54+08:00",
//           "VersionID": 1493,
//           "SubRouteUID": "TPE108910",
//           "SubRouteID": "108910",
//           "SubRouteName": {
//               "Zh_tw": "14",
//               "En": "14"
//           },
//           "Direction": 0,
//           "Frequencys": [
//               {
//                   "StartTime": "05:30",
//                   "EndTime": "23:00",
//                   "MinHeadwayMins": 15,
//                   "MaxHeadwayMins": 20,
//                   "ServiceDay": {
//                       "Sunday": 1,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "05:40",
//                   "EndTime": "06:00",
//                   "MinHeadwayMins": 15,
//                   "MaxHeadwayMins": 20,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 1,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "06:00",
//                   "EndTime": "08:00",
//                   "MinHeadwayMins": 12,
//                   "MaxHeadwayMins": 15,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 1,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "08:00",
//                   "EndTime": "16:00",
//                   "MinHeadwayMins": 15,
//                   "MaxHeadwayMins": 20,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 1,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "16:00",
//                   "EndTime": "18:00",
//                   "MinHeadwayMins": 12,
//                   "MaxHeadwayMins": 15,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 1,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "18:00",
//                   "EndTime": "21:00",
//                   "MinHeadwayMins": 15,
//                   "MaxHeadwayMins": 20,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 1,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "21:00",
//                   "EndTime": "23:00",
//                   "MinHeadwayMins": 20,
//                   "MaxHeadwayMins": 30,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 1,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "05:40",
//                   "EndTime": "06:00",
//                   "MinHeadwayMins": 15,
//                   "MaxHeadwayMins": 20,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 1,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "06:00",
//                   "EndTime": "08:00",
//                   "MinHeadwayMins": 12,
//                   "MaxHeadwayMins": 15,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 1,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "08:00",
//                   "EndTime": "16:00",
//                   "MinHeadwayMins": 15,
//                   "MaxHeadwayMins": 20,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 1,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "16:00",
//                   "EndTime": "18:00",
//                   "MinHeadwayMins": 12,
//                   "MaxHeadwayMins": 15,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 1,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "18:00",
//                   "EndTime": "21:00",
//                   "MinHeadwayMins": 15,
//                   "MaxHeadwayMins": 20,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 1,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "21:00",
//                   "EndTime": "23:00",
//                   "MinHeadwayMins": 20,
//                   "MaxHeadwayMins": 30,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 1,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "05:40",
//                   "EndTime": "06:00",
//                   "MinHeadwayMins": 15,
//                   "MaxHeadwayMins": 20,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 1,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "06:00",
//                   "EndTime": "08:00",
//                   "MinHeadwayMins": 12,
//                   "MaxHeadwayMins": 15,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 1,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "08:00",
//                   "EndTime": "16:00",
//                   "MinHeadwayMins": 15,
//                   "MaxHeadwayMins": 20,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 1,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "16:00",
//                   "EndTime": "18:00",
//                   "MinHeadwayMins": 12,
//                   "MaxHeadwayMins": 15,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 1,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "18:00",
//                   "EndTime": "21:00",
//                   "MinHeadwayMins": 15,
//                   "MaxHeadwayMins": 20,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 1,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "21:00",
//                   "EndTime": "23:00",
//                   "MinHeadwayMins": 20,
//                   "MaxHeadwayMins": 30,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 1,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "05:40",
//                   "EndTime": "06:00",
//                   "MinHeadwayMins": 15,
//                   "MaxHeadwayMins": 20,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 1,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "06:00",
//                   "EndTime": "08:00",
//                   "MinHeadwayMins": 12,
//                   "MaxHeadwayMins": 15,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 1,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "08:00",
//                   "EndTime": "16:00",
//                   "MinHeadwayMins": 15,
//                   "MaxHeadwayMins": 20,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 1,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "16:00",
//                   "EndTime": "18:00",
//                   "MinHeadwayMins": 12,
//                   "MaxHeadwayMins": 15,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 1,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "18:00",
//                   "EndTime": "21:00",
//                   "MinHeadwayMins": 15,
//                   "MaxHeadwayMins": 20,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 1,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "21:00",
//                   "EndTime": "23:00",
//                   "MinHeadwayMins": 20,
//                   "MaxHeadwayMins": 30,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 1,
//                       "Friday": 0,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "05:40",
//                   "EndTime": "06:00",
//                   "MinHeadwayMins": 15,
//                   "MaxHeadwayMins": 20,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 1,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "06:00",
//                   "EndTime": "08:00",
//                   "MinHeadwayMins": 12,
//                   "MaxHeadwayMins": 15,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 1,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "08:00",
//                   "EndTime": "16:00",
//                   "MinHeadwayMins": 15,
//                   "MaxHeadwayMins": 20,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 1,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "16:00",
//                   "EndTime": "18:00",
//                   "MinHeadwayMins": 12,
//                   "MaxHeadwayMins": 15,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 1,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "18:00",
//                   "EndTime": "21:00",
//                   "MinHeadwayMins": 15,
//                   "MaxHeadwayMins": 20,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 1,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "21:00",
//                   "EndTime": "23:00",
//                   "MinHeadwayMins": 20,
//                   "MaxHeadwayMins": 30,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 1,
//                       "Saturday": 0
//                   }
//               },
//               {
//                   "StartTime": "05:30",
//                   "EndTime": "23:00",
//                   "MinHeadwayMins": 15,
//                   "MaxHeadwayMins": 20,
//                   "ServiceDay": {
//                       "Sunday": 0,
//                       "Monday": 0,
//                       "Tuesday": 0,
//                       "Wednesday": 0,
//                       "Thursday": 0,
//                       "Friday": 0,
//                       "Saturday": 1
//                   }
//               }
//           ],
//           "Schedule": {
//               "FirstBusTime": "05:40",
//               "LastBusTime": "23:00",
//               "HolidayFirstBusTime": "05:30",
//               "HolidayLastBusTime": "23:00"
//           }
//       }
//   },
// ]