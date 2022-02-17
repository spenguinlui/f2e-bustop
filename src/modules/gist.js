import axios from 'axios';
import jsSHA from "jssha";

const GIST_API_DOMAIN = "https://gist.motc.gov.tw/gist_api/V3"
const APP_ID = process.env.VUE_APP_APP_ID;
const APP_KEY = process.env.VUE_APP_APP_KEY;

// APP 授權認證 header
export const authorizationHeader = () => {
  const GMTString = new Date().toGMTString();
  let ShaObj = new jsSHA('SHA-1', 'TEXT');
  ShaObj.setHMACKey(APP_KEY, 'TEXT');
  ShaObj.update('x-date: ' + GMTString);
  const HMAC = ShaObj.getHMAC('B64');
  const Authorization = 'hmac username="' + APP_ID + '", algorithm="hmac-sha1", headers="x-date", signature="' + HMAC + '"';

  return { 'Authorization': Authorization, 'X-Date': GMTString };
}

// 呼叫 API ----------
// 依照座標取得行政區  v3
export const AJAX_getCurrentLocation = (position) => {
  return axios({
    method: 'get',
    url: `${GIST_API_DOMAIN}/Map/GeoLocating/District/LocationX/${position.longitude}/LocationY/${position.latitude}?$format=JSON`,
    headers: authorizationHeader()
  })
}