import { distance } from "./calculate";
// 路線細節塞入最靠近車站
export const insertNearByStopToDetailList = (detailList, currentPosition) => {
  detailList.map((detailListDir) => {
    let minDistance = { index: 0, distance: 0 };
    detailListDir.Stops = detailListDir.Stops.map((detailData, index) => {
      const { PositionLat, PositionLon } = detailData.StopPosition;
      const thisDistance = distance(PositionLat, PositionLon, currentPosition.latitude, currentPosition.longitude);
      if (index === 1 || minDistance.distance > thisDistance) {
        minDistance.index = index;
        minDistance.distance = thisDistance;
      }
      detailData.ClosestStop = false;
      return detailData;
    })
    detailListDir.Stops[minDistance.index].ClosestStop = true;
  })
  return detailList;
}

// 路線細節塞入預估時間
export const insertTimeArrivalToDetailList = (detailList, timeList) => {
  detailList.map((detailListDir) => {
    const direction = detailListDir.Direction;
    detailListDir.Stops = detailListDir.Stops.map((detailData) => {
      let findData = timeList.find(timeData => timeData.Direction === direction && detailData.StopUID === timeData.StopUID);
      if (findData) detailData = { ...detailData, ...findData }
      return detailData;
    });
  })
  return detailList;
}

// 路線細節塞入路線圖資
export const insertRouteShapeToDetailList = (detailList, routeList) => {
  detailList[0].Geometry = routeList[0].Geometry;
  routeList[1] ? detailList[1].Geometry = routeList[1].Geometry : detailList[1].Geometry = routeList[0].Geometry;
  return detailList
}

// 路線細節塞入公車動態
export const insertRealTimeToDetailList = (detailList, realTimeList) => {
  detailList.map((detailListDir) => {
    const direction = detailListDir.Direction;
    detailListDir.BusRealTime = [];
    realTimeList.forEach(rtData => rtData.Direction === direction && detailListDir.BusRealTime.push(rtData));
  })
  return detailList;
}

// 路線細節塞入公車動態站名
export const insertReailTimeStopToDeatailList = (detailList, realTimeStopList) => {
  detailList.map((detailListDir) => {
    const direction = detailListDir.Direction;
    detailListDir.Stops = detailListDir.Stops.map((detailData) => {
      let findData = realTimeStopList.find(timeData => timeData.Direction === direction && detailData.StopUID === timeData.StopUID);
      if (findData) detailData = { ...detailData, ...findData }
      return detailData;
    });
  })
  return detailList;
}