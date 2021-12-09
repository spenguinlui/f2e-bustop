// 小數點四捨五入
export const roundX = (val, precision) => Math.round(Math.round(val * Math.pow(10, (precision || 0) + 1)) / 10) / Math.pow(10, (precision || 0));

// 計算兩點距離
export const distance = (lat1, lon1, lat2, lon2) => {
  if (!((lat1 == lat2) && (lon1 == lon2))) {
    let radlat1 = Math.PI * lat1 / 180;
    let radlat2 = Math.PI * lat2 / 180;
    let theta = lon1 - lon2;
    let radtheta = Math.PI * theta / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) dist = 1;
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344;
    return dist;
  } else {
    return 0;
  }
}

// 距離顯示，公尺公里轉換 -- 套用 distance 結果
export const distanceZh = (dist) => {
  let distStr = '0公尺';
  if (dist <= 1) {
    distStr = `${Math.round(dist * 1000)}公尺`;
  } else {
    distStr = `${roundX(dist, 2)}公里`;
  }
  return distStr;
}