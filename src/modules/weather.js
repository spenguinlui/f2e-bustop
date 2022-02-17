import axios from 'axios';

// 天氣資料來源
const WEATHER_DOMAIN = "https://opendata.cwb.gov.tw/api/v1/rest/datastore/";
const WEATHER_KEY = process.env.VUE_APP_WEATHER_API_KEY;

// 天氣觀測 API ------
const AJAX_getWeaterRain = (currentLocation, limit = 1) => {
  return axios({
    method: 'get',
    url: `${WEATHER_DOMAIN}F-C0032-001?Authorization=${WEATHER_KEY}&limit=${limit}&locationName=${currentLocation}`,
  })
}
const AJAX_getWeaterTep = (currentLocation, limit = 1) => {
  return axios({
    method: 'get',
    url: `${WEATHER_DOMAIN}O-A0003-001?Authorization=${WEATHER_KEY}&limit=${limit}&locationName=${currentLocation}`,
  })
}

// 取得即時天氣資料
// input: cityName:string, locationName:string
// output: Promise()
export const getWeatherNowData = (cityName, locationName) => {
  return Promise
  .all([AJAX_getWeaterRain(cityName), AJAX_getWeaterTep(locationName)])
  .then(res => {
    // 取得天氣狀況、最高溫最低溫、降雨率
    const locationData = res[0].data.records.location[0];
    const weatherElements = locationData.weatherElement.reduce(
      (neededElements, item) => {
        if (["Wx", "MaxT", "MinT", "PoP"].includes(item.elementName)) {
          neededElements[item.elementName] = item.time[0].parameter;
        }
        return neededElements;
      },
      {}
    );
    // 取得溫度
    const TepLocationData = res[1].data.records.location[0];
    TepLocationData.weatherElement.forEach(
      item => {
        if (["TEMP"].includes(item.elementName)) {
          weatherElements[item.elementName] = item.elementValue;
        }
      }
    );
    return weatherElements;
  })
}

// 輸出內容
// {
//   "Wx": {
//       "parameterName": "陰短暫雨",
//       "parameterValue": "11"
//   },
//   "PoP": {
//       "parameterName": "60",
//       "parameterUnit": "百分比"
//   },
//   "MinT": {
//       "parameterName": "16",
//       "parameterUnit": "C"
//   },
//   "MaxT": {
//       "parameterName": "20",
//       "parameterUnit": "C"
//   },
//   "TEMP": "18.40"
// }