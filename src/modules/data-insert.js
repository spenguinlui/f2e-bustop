import { distance } from "./calculate";
// 路線細節塞入最靠近車站
export const insertNearByStopToDetailList = (detailList, currentPosition) => {
  try {
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
  } catch(error) {
    console.log(`insertNearByStopToDetailList Error: ${error}`);
    return detailList;
  }
  return detailList;
}

// 路線細節塞入預估時間
export const insertTimeArrivalToDetailList = (detailList, timeList) => {
  try {
    detailList.map((detailListDir) => {
      const direction = detailListDir.Direction;
      detailListDir.Stops = detailListDir.Stops.map((detailData) => {
        let findData = timeList.find(timeData => timeData.Direction === direction && detailData.StopUID === timeData.StopUID);
        if (findData) detailData = { ...detailData, ...findData }
        return detailData;
      });
    })
  } catch(error) {
    console.log(`insertTimeArrivalToDetailList Error: ${error}`);
    return detailList;
  }
  return detailList;
}

// 路線細節塞入路線圖資
export const insertRouteShapeToDetailList = (detailList, routeList) => {
  try {
    detailList[0].Geometry = routeList[0].Geometry;
    if (routeList[1]) {
      if (detailList[1]) detailList[1].Geometry = routeList[1].Geometry;
      else detailList[0].Geometry = routeList[1].Geometry;
    } else {
      if (detailList[1]) detailList[1].Geometry = routeList[0].Geometry;
      else detailList[0].Geometry = routeList[0].Geometry;
    }
  } catch(error) {
    console.log(`insertRouteShapeToDetailList Error: ${error}`);
    return detailList;
  }
  return detailList
}

// 路線細節塞入公車動態
export const insertRealTimeToDetailList = (detailList, realTimeList) => {
  try {
    detailList.map((detailListDir) => {
      const direction = detailListDir.Direction;
      detailListDir.BusRealTime = [];
      realTimeList.forEach(rtData => rtData.Direction === direction && detailListDir.BusRealTime.push(rtData));
    })
  } catch(error) {
    console.log(`insertRealTimeToDetailList Error: ${error}`);
    return detailList;
  }
  return detailList;
}

// 路線細節塞入公車動態站名
export const insertReailTimeStopToDeatailList = (detailList, realTimeStopList) => {
  try {
    detailList.map((detailListDir) => {
      const direction = detailListDir.Direction;
      detailListDir.Stops = detailListDir.Stops.map((detailData) => {
        let findData = realTimeStopList.find(timeData => timeData.Direction === direction && detailData.StopUID === timeData.StopUID);
        if (findData) detailData = { ...detailData, ...findData }
        return detailData;
      });
    })
  } catch(error) {
    console.log(`insertReailTimeStopToDeatailList Error: ${error}`);
    return detailList;
  }
  return detailList;
}

// 路線細節塞入基本資料
export const insertRouteDataToDetailList = (detailList, dataList) => {
  try {
    detailList.map((detailListDir) => {
      let findData = dataList.find(data => data.RouteName.Zh_tw === detailListDir.RouteName.Zh_tw)
      if (findData) detailListDir.Data = findData
      return detailListDir;
    });
  } catch(error) {
    console.log(`insertRouteDataToDetailList Error: ${error}`);
    return detailList;
  }
  return detailList;
}

// 將班表時程塞入基本資料
export const insertScheduleToDetailList = (detailList, scheduleList) => {
  try {
    detailList.map((detailListDir) => {
      const direction = detailListDir.Direction;
      scheduleList.map(schedule => {
        if (schedule.Direction === direction && schedule.Frequencys) {
          let scheduleTime = schedule.Frequencys.reduce(
            (pre, frequency) => {
              if (frequency.ServiceDay.Sunday || frequency.ServiceDay.Saturday) {
                if (frequency.StartTime < pre.HolidayFirstBusTime) pre.HolidayFirstBusTime = frequency.StartTime;
                if (frequency.EndTime > pre.HolidayLastBusTime) pre.HolidayLastBusTime = frequency.EndTime;
              } else {
                if (frequency.StartTime < pre.FirstBusTime) pre.FirstBusTime = frequency.StartTime;
                if (frequency.EndTime > pre.LastBusTime) pre.LastBusTime = frequency.EndTime;
              }
              return pre;
            }, {
              FirstBusTime: "24:00",
              LastBusTime: "00:00",
              HolidayFirstBusTime: "24:00",
              HolidayLastBusTime: "00:00"
            }
          )
          detailListDir.Data = { ...detailListDir.Data, ...schedule, Schedule: scheduleTime }
        }
      })
      return detailListDir;
    })
  } catch(error) {
    console.log(`insertScheduleToDetailList Error: ${error}`);
    return detailList;
  }
  return detailList;
}

// 將指定業者資料塞入基本資料
export const insertOperatorToDetailList = (detailList, operatorList) => {
  try {
    detailList.map((detailListDir) => {
      operatorList.forEach((operator) => {
        detailListDir.Data.Operators = detailListDir.Data.Operators.map((deta) => {
          if (deta.OperatorID === operator.OperatorID) deta = { ...deta, ...operator }
          return deta;
        })
      })
      return detailListDir;
    })
  } catch(error) {
    console.log(`insertOperatorToDetailList Error: ${error}`);
    return detailList;
  }
  return detailList;
}