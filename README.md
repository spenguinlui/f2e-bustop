# 作品說明

The F2E 全台公車動態時刻查詢應用服務，串接交通部 PTX 資料與氣象局開放資料，達到查詢公車、客運、自行車位置需求。
作品為 RWD 環境，mobile 端不開放橫置瀏覽。

## 網站 Demo
[https://spenguinlui.github.io/f2e-bustop/](https://spenguinlui.github.io/f2e-bustop/)

## 設計稿來源

UI/UX 設計師：Shiaohan

[figma 連結](https://www.figma.com/file/mAZZ9AMvcobxfAKDjXTZxN/The-F2E-Week-03?node-id=138%3A3144)

[系列相關設計連結](https://2021.thef2e.com/users/6296427084285739387)

[作品集連結](https://www.behance.net/hsiaohan)

## 功能項目

- 搜尋自身定位附近公車、客運站牌，自行車站點
- 以公車、客運站牌查詢相關路線
- 查詢指定公車、客運路線去返程各站預估時間
- 查詢指定公車、客運路線去返程路線位置
- 查詢指定公車、客運路線公車動態位置、車牌號碼
- 間隔 5 秒鐘更新即時資訊
- 以行政區域篩選公車、客運路線
- 以距離、可租、還車數量排序自行車站點
- 取得自身定位天氣狀況

# 系統說明

系統以 Vue 2 環境建立，並以 scss 編寫樣式。

系統運行方式:
```
yarn install
yarn run serve
```

# 資料夾說明

* assets/images - 圖片與 icon
* assets/scss - scss 引用檔
* components - vue 元件
* json - 靜態 json 檔引用
* modules
  - gist.js - 串接 gist api function
  - ptx_bus.js - 串接 ptx 公車&客運 api function
  - ptx_bike.js - 串接 ptx 自行車 api function
  - weather.js - 串接氣象局 api function
  - calculate.js - 計算 function
  - data-insert.js - 資料整合 function
* pages - 畫面主要底版
* store - vuex 資料存放


# 使用技術、套件、第三方服務

* Vue Cli
* Vuex
* Axios
* JsSHA
* Leaflet
* ESlint
* SCSS
* fontawesome

# 串接 API 資料

## PTX (https://ptx.transportdata.tw/MOTC/v2/)
市區公車
```
取得指定[縣市]的市區公車顯示用路線站序資料
- Bus/Stop/City/{City}
取得指定[縣市],[站位]的市區公車路線資料
- Bus/Route/City/{City}/PassThrough/Station/{StationID}
取得指定[縣市]的市區公車路線資料
- Bus/Route/City/{City}
取得指定[縣市],[路線名稱]的市區公車路線站序資料
- Bus/StopOfRoute/City/{City}/{RouteName}
取得指定[縣市],[路線名稱]的公車預估到站資料(N1)[批次更新]
- Bus/EstimatedTimeOfArrival/City/{City}/{RouteName}
取得指定[縣市]的市區公車線型資料
- Bus/Shape/City/{City}/{RouteName}
取得指定[縣市],[路線名稱]的公車動態定時資料(A1)[批次更新]
- Bus/RealTimeByFrequency/City/{City}/{RouteName}
取得指定[縣市],[路線名稱]的公車動態定點資料(A2)[批次更新]
- Bus/RealTimeNearStop/City/{City}/{RouteName}
取得指定[縣市],[路線名稱]的市區公車路線班表資料
- Bus/Schedule/City/{City}/{RouteName}
取得指定[縣市]的市區公車營運業者資料
- Bus/Operator/City/{City}
```

公路客運
```
取得公路客運站牌資料
- Bus/Stop/InterCity
取得指定[站位]的公路客運路線資料
- Bus/Route/InterCity/PassThrough/Station/{StationID}
取得公路客運路線資料
- Bus/Route/InterCity
取得指定[路線名稱]的公路客運路線與站牌資料
- Bus/StopOfRoute/InterCity/{RouteName}
取得指定[路線名稱]的公路客運預估到站資料(N1)[批次更新]
- Bus/EstimatedTimeOfArrival/InterCity/{RouteName}
取得指定[路線名稱]的公路公車線型資料
- Bus/Shape/InterCity/{RouteName}
取得指定[路線名稱]的公路客運動態定時資料(A1)[批次更新]
- Bus/RealTimeByFrequency/InterCity/{RouteName}
取得指定[路線名稱]的公路客運動態定點資料(A2)[批次更新]
- Bus/RealTimeNearStop/InterCity/{RouteName}
取得公路客運路線班表資料
- Bus/Schedule/InterCity
取得公路客運的營運業者資料
- Bus/Operator/InterCity
```

自行車
```
取得指定[位置,範圍]的全臺公共自行車租借站位資料
- Bike/Station/NearBy
取得指定[位置,範圍]的全臺公共自行車即時車位資料
- Bike/Availability/NearBy
```

## GIST (https://gist.motc.gov.tw/gist_api/V3/)

```
依座標取得行政區域
- Map/GeoLocating/District/LocationX/{Longitude}/LocationY/{Latitude}
```
## 氣象局開放資料
(https://opendata.cwb.gov.tw/api/v1/rest/datastore/)
```
一般天氣預報-今明 36 小時天氣預報
- F-C0032-001
局屬氣象站-現在天氣觀測報告
- O-A0003-001
```

# 畫面呈現

## PC 畫面

---
附近站點

![](https://github.com/spenguinlui/f2e-bustop/blob/master/readme-img/pc-1.png)

指定站牌路線

![](https://github.com/spenguinlui/f2e-bustop/blob/master/readme-img/pc-2.png)

預估到站時間

![](https://github.com/spenguinlui/f2e-bustop/blob/master/readme-img/pc-3.png)

客運

![](https://github.com/spenguinlui/f2e-bustop/blob/master/readme-img/pc-5.png)

城市篩選

![](https://github.com/spenguinlui/f2e-bustop/blob/master/readme-img/pc-6.png)

自行車借車還車

![](https://github.com/spenguinlui/f2e-bustop/blob/master/readme-img/pc-4.png)

---

## Mobile 畫面

行動版首頁

![](https://github.com/spenguinlui/f2e-bustop/blob/master/readme-img/m-1.png)

行動版輸入

![](https://github.com/spenguinlui/f2e-bustop/blob/master/readme-img/m-2.png)

不同裝置縮放

![](https://github.com/spenguinlui/f2e-bustop/blob/master/readme-img/m-3.png)
