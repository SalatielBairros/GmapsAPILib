var gpsConnection = null;
var gpsDataFactor = new GpsDataFactor();

$(function () {

});

function StartMapLoad() {
    gpsConnection = new GMapsConnection();
    gpsConnection.StartMap();
    gpsConnection.CreateAnimatePolylineControl();
    
    try {
        gpsConnection.SetMapData(gpsDataFactor.LoadRouteData(), 0);
    } catch (e) {
        console.warn("Retentativa de carregamento");
        StartMapLoad();
        gpsConnection.SetMapData(gpsData, 0);
    }

    gpsConnection.CreatePolylines("#FF0000");
}