var gpsConnection = new GMapsConnection();
var gpsDataFactor = new GpsDataFactor();

$(function () {
    LoadEvents();
});

function LoadEvents() {
    $("#btnMapAction").click(function () {
        if (gpsConnection != null) {
            if ($(this).hasClass("clean-map")) {
                gpsConnection.CleanMap();

                $(this).attr("value", "Reload");
                $(this).removeClass("clean-map");
                $(this).addClass("reload-map");
            } else if ($(this).hasClass("reload-map")) {
                SetDataToMap();

                $(this).attr("value", "Clean");
                $(this).removeClass("reload-map");
                $(this).addClass("clean-map");
            }
        } else {
            console.warn("GMap is not loaded.");
        }
    });
}

function StartMapLoad() {
    //gpsConnection = new GMapsConnection();
    gpsConnection.StartMap();
    gpsConnection.CreateAnimatePolylineControl();
    SetDataToMap();
}

function SetDataToMap() {
    try {
        gpsConnection.SetMapData(gpsDataFactor.LoadRouteData(), 0);
    } catch (e) {
        console.warn("Retentativa de carregamento");
        StartMapLoad();
        gpsConnection.SetMapData(gpsData, 0);
    }

    gpsConnection.CreatePolylines("#FF0000");
    gpsConnection.CreateCircle(gpsDataFactor.CirclePoint, 200);
    gpsConnection.CreatePolygon(gpsDataFactor.PolygonCoordList, "#00FF00");
}