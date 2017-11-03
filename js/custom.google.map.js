/*!
* Custom GMaps Library
* Author: Salatiel Bairros
* Copyright (c) 2016 - 2017 Softmóvel
*/
function GMapsConnection() {

    /* ******************************************** GLOBAL VARIABLES ************************************************ */

    /**
     * Array with the points data (coordinates and events info).
     */
    var gpsData = [];
    /**
     * Instance of GMaps.
     */
    var map = null;
    /**
     * Shortcut/alias to GMaps Libary.
     */
    var gmaps = null;
    var mainInfoWindow = null;
    var trafficLayer = null;
    var directionsService = null;
    var directionsDisplay = null;
    var polylines = null;
    var bTraficLayer = false;
    var bounds = null;
    var markers = [];
    var hidden = false;
    var timerId = null;
    var animated = false;

    /* ******************************************** PUBLIC METHODS ************************************************ */

    /**
      * Start GMap API on #map element with zoom 6.
      * It Includes: TrafficLayer and CenterMapControl      
      */
    this.StartMap = function () {
        gmaps = google.maps;
        map = new gmaps.Map(document.getElementById("map"), {
            center: {
                lat: -11.932,
                lng: -51.441
            },
            zoom: 6,
            scaleControl: true,
            mapTypeControlOptions: {
                mapTypeIds: [gmaps.MapTypeId.ROADMAP, "main_map"]
            },
            fullscreenControl: true
        });

        printStyleVersion();

        mainInfoWindow = new gmaps.InfoWindow({
            content: "",
            maxWidth: 200
        });

        setTrafficControlLayer();
        createCenterMapControl();
        setRoutesButtom();

        directionsService = new gmaps.DirectionsService;
        directionsDisplay = new gmaps.DirectionsRenderer;
        directionsDisplay.setMap(map);
        directionsDisplay.setOptions({ suppressMarkers: true });
    }

    /**
     * Creates the "P" buttom that allows to remove the track points icons. 
     * @param clickCallback:function(hide)     
     */
    this.CreateRemovePointMarkersControl = function (clickCallback) {

        function centerControl(controlDiv) {

            // Set CSS for the control border.
            var controlUi = document.createElement("div");
            controlUi.style.backgroundColor = "#fff";
            controlUi.style.border = "2px solid #fff";
            controlUi.style.borderRadius = "3px";
            controlUi.style.boxShadow = "0 1px 2px rgba(0,0,0,.3)";
            controlUi.style.cursor = "pointer";
            controlUi.style.marginBottom = "5px";
            controlUi.style.marginRight = "8px";
            controlUi.style.textAlign = "center";
            controlUi.title = "Clique para remover os pontos de Leitura GPS.";
            controlDiv.appendChild(controlUi);

            // Set CSS for the control interior.
            var controlText = document.createElement("div");
            controlText.style.color = "rgb(25,25,25)";
            controlText.style.fontFamily = "Roboto,Arial,sans-serif";
            controlText.style.fontSize = "13px";
            controlText.style.lineHeight = "30px";
            controlText.style.paddingLeft = "10px";
            controlText.style.paddingRight = "10px";
            controlText.innerHTML = "P";
            controlUi.appendChild(controlText);

            controlUi.addEventListener("click", function () {
                togglePointMarkers(clickCallback);
            });
        }

        var centerControlDiv = document.createElement("div");
        centerControl(centerControlDiv, map);

        centerControlDiv.index = 1;
        map.controls[gmaps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);
    }

    /**
     * Creates the "A" buttom that activate the track animation.
     * This action also hides the track points, for better viewing of the animation.
     * @param clickCallback:function(hide)     
     */
    this.CreateAnimatePolylineControl = function () {

        function centerControl(controlDiv) {

            // Set CSS for the control border.
            var controlUi = document.createElement("div");
            controlUi.style.backgroundColor = "#fff";
            controlUi.style.border = "2px solid #fff";
            controlUi.style.borderRadius = "3px";
            controlUi.style.boxShadow = "0 1px 2px rgba(0,0,0,.3)";
            controlUi.style.cursor = "pointer";
            controlUi.style.marginBottom = "5px";
            controlUi.style.marginRight = "8px";
            controlUi.style.textAlign = "center";
            controlUi.title = "Clique para visualizar a rota percorrida até o momento.";
            controlDiv.appendChild(controlUi);

            // Set CSS for the control interior.
            var controlText = document.createElement("div");
            controlText.style.color = "rgb(25,25,25)";
            controlText.style.fontFamily = "Roboto,Arial,sans-serif";
            controlText.style.fontSize = "13px";
            controlText.style.lineHeight = "30px";
            controlText.style.paddingLeft = "10px";
            controlText.style.paddingRight = "10px";
            controlText.innerHTML = "A";
            controlUi.appendChild(controlText);

            controlUi.addEventListener("click", function () {
                //if (!hidden) {
                //    togglePointMarkers(clickCallback);
                //}
                if (!animated) {
                    animateCirclePolyline(polylines);
                    animated = true;
                } else if (timerId != null) {
                    stopAnimation();
                    animated = false;
                }
            });
        }

        var centerControlDiv = document.createElement("div");
        centerControl(centerControlDiv, map);

        centerControlDiv.index = 1;
        map.controls[gmaps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);
    }

    /**
     * Create a sequence of polylines. It is used to plot the GPS tracking.
     * @param {String} color - The line color.
     * @param {Array} data - A list of coordinates to create the polyline.
     * @param {Function} filter - A function to filter the data.     
     */
    this.CreatePolylines = function (color, data, filter) {
        color = color || "#FF0000";
        data = data || gpsData;
        filter = filter || null;

        var lineSymbolArrow = {
            path: gmaps.SymbolPath.FORWARD_OPEN_ARROW,
            scale: 1.5,
            strokeColor: "#A20707"
        };

        var lineSymbolCircle = {
            path: gmaps.SymbolPath.CIRCLE,
            scale: 10,
            strokeColor: "#000"
        };

        if (filter != null) {
            data = data.filter(filter);
        }

        polylines = new gmaps.Polyline({
            path: data,
            clickable: false,
            geodesic: true,
            map: map,
            strokeColor: color,
            strokeOpacity: 0.5,
            strokeWeight: 4,
            icons: [{
                icon: lineSymbolArrow,
                offset: "100%",
                repeat: "2%"
            },
            {
                icon: lineSymbolCircle,
                offset: "100%"
            }]
        });
    }

    /**
     * Recenter the Map based on its markers.     
     */
    this.RecenterMap = function () {
        bounds = null;
        centerMap();
    }

    this.CenterMapOnPosition = function(gpsId) {
        if (gpsId !== null && gpsId > 0) {
            var retFilter = gpsData.filter(function (d) { return d.idGps === gpsId; });

            if (retFilter.length > 0) {
                var position = new gmaps.LatLng(retFilter[0].lat, retFilter[0].lng);
                map.setCenter(position);
                map.setZoom(20);

                var mk = markers.filter(function (d) { return d.idGps === gpsId; });
                console.log(mk);
                if (mk.length > 0) {
                    gmaps.event.trigger(mk[0], "click");
                }
            }
        }
    }

    /**
     * Create an GMaps Route based on GpsData.
     * @see gpsData
     */
    this.MakeRoute = function () {
        console.info("Method in development");
        if (gpsData != null && gpsData.length > 0) {
            var first = gpsData[0];
            gpsData.splice(0, 1);

            var nPoints = gpsData.length;
            var lastIndex = (nPoints > 10 ? 9 : nPoints - 1);
            var last = gpsData[lastIndex];
            gpsData.splice(lastIndex, 1);

            var wPoints = [];
            for (var i = 0; i < gpsData.length && i < 8; i++) {
                wPoints.push({
                    location: { lat: gpsData[i].lat, lng: gpsData[i].lng },
                    stopover: true
                });
            }

            directionsService.route({
                origin: { lat: first.lat, lng: first.lng },
                destination: { lat: last.lat, lng: last.lng },
                waypoints: wPoints,
                provideRouteAlternatives: false,
                optimizeWaypoints: false,
                travelMode: gmaps.TravelMode.DRIVING,
                drivingOptions: {
                    departureTime: new Date(/* now, or future date */)
                },
                unitSystem: gmaps.UnitSystem.METRIC
            }, function (response, status) {
                if (status === gmaps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                    //var route = response.routes[0];
                } else {
                    window.alert("Erro to load route: " + status);
                }
            });

        } else {
            console.error("Error to calculate route: There's not valid positions.");
        }
    }

    /**
     * Set the GPS data and plot it on map. 
     * Must be called only after the StartMap method.
     * @param {Array} pDataGps - GPS data to show on the map
     * @param {Number} timeout - timeout of the animation (the used animation is gmaps.Animation.DROP)     
     */
    this.SetMapData = function (pDataGps, timeout) {
        if (timeout !== 0) {
            timeout = timeout || 50;
        }
        gpsData = pDataGps;
        setAnimatedMarkers(timeout);
        centerMap();
    }

    /**
     * Remove all markers and polylines from the map.     
     */
    this.CleanMap = function () {
        if (polylines != null) {
            polylines.setMap(null);
            polylines = null;
        }
        if (markers.length > 0) {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            markers = [];
        }
    }

    /**
     * Create a polygon based in a array of coordinates.
     * @param {Array} latLngList - Array with coordinates of polygon (vertices).
     * @param {String} color - Color of the polygon     
     */
    this.CreatePolygon = function (latLngList, color) {
        latLngList = latLngList || gpsData;
        color = color || "#FF0000";

        var localPo = new gmaps.Polygon({
            paths: latLngList,
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 4,
            fillColor: color,
            fillOpacity: 0.35
        });

        console.info("Method in development");
        console.info(localPo);
    }

    /**
     * Create a circle based in a center coordinate.
     * @param {Object} center - Circle center coordinates.
     * @param {number} radius - Circle radius size.     
     * @param {String} color - Color of the circle.
     */
    this.CreateCircle = function (center, radius, color) {
        color = color || "#FF0000";
        radius = radius || 100;

        var localCir = new gmaps.Circle({
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 0.35,
            map: map,
            center: center,
            radius: radius
        });

        console.info("Method in development");
        console.info(localCir);
    }

    /* ******************************************** PRIVATE FUNCTIONS ************************************************ */

    /**
     * Toggles the visibility of tracking markers.
     * @param {Function} callback      
     */
    function togglePointMarkers(callback) {
        callback = callback || function (hide) { return hide; };

        if (markers.length > 0) {
            var i;
            if (hidden) {
                for (i = 0; i < markers.length; i++) {
                    markers[i].setMap(map);
                }
                hidden = false;

                if (timerId != null && animated) {
                    stopAnimation();
                    animated = false;
                }

            } else {
                for (i = 0; i < markers.length; i++) {
                    if (markers[i].icon === getIcon("0")) {
                        markers[i].setMap(null);
                    }
                }
                hidden = true;
            }
            callback(hidden);
        }
    }

    /**
     * 
     * @param {Number} latitude - Marker Latitude
     * @param {Number} longitude - Marker Logitude
     * @param {String} tooltip - Marker Tooltip (HTML title property). Default is empty.
     * @param {String} mIcon - Marker Icon URL
     * @param {String} popupContent - Marker Popup HTML content. Default is empty.
     * @param {Boolean} mDraggable - True if the marker is draggable. Default is true.
     * @param {Number} idGps - The ID of the GPS record on Database.
     */
    function addMarker(latitude, longitude, tooltip, mIcon, popupContent, mDraggable, idGps) {
        tooltip = tooltip || "";
        var iconPath = getIcon(mIcon);
        popupContent = popupContent || "";
        mDraggable = mDraggable || true;

        if (map != null && gmaps != null) {
            var myLatlng = { lat: latitude, lng: longitude };

            var marker = new gmaps.Marker({
                position: myLatlng,
                map: map,
                title: tooltip,
                animation: gmaps.Animation.DROP,
                draggable: mDraggable,
                icon: iconPath,
                idGps: idGps
            });

            marker.addListener("click", function () {
                mainInfoWindow.setContent(popupContent);
                mainInfoWindow.open(map, marker);
            });

            markers.push(marker);
        } else {
            console.error("Não foi possível adicionar o ponto: mapa não está carregado corretamente.");
        }
    }

    function addMarkerTimeout(latitude, longitude, tooltip, timeout, icon, content, mDraggable, idGps) {
        if (timeout > 0) {
            window.setTimeout(function () { addMarker(latitude, longitude, tooltip, icon, content, mDraggable, idGps) }, timeout);
        } else {

            addMarker(latitude, longitude, tooltip, icon, content, mDraggable, idGps);
        }
    }

    function printStyleVersion() {
        var printStyle = [{ "featureType": "all", "elementType": "all", "stylers": [{ "saturation": -100 }, { "gamma": 0.5 }] }];

        // Create a new StyledMapType object, passing it the array of styles,
        // as well as the name to be displayed on the map type control.
        var styledMap = new gmaps.StyledMapType(printStyle,
            { name: "Versão Impressão" });

        map.mapTypes.set("main_map", styledMap);
        // Set de visualization 
        // map.setMapTypeId('main_map');
    }

    /**
     * Activate the GMaps Traffic Layer funcionality.
     */
    function setTrafficControlLayer() {

        trafficLayer = new gmaps.TrafficLayer();

        function centerControl(controlDiv, map) {

            // Set CSS for the control border.
            var controlUi = document.createElement("div");
            controlUi.style.backgroundColor = "#fff";
            controlUi.style.border = "2px solid #fff";
            controlUi.style.borderRadius = "3px";
            controlUi.style.boxShadow = "0 1px 2px rgba(0,0,0,.3)";
            controlUi.style.cursor = "pointer";
            controlUi.style.marginBottom = "5px";
            controlUi.style.marginRight = "8px";
            controlUi.style.textAlign = "center";
            controlUi.title = "Clique para ativar a visualização do trânsito.";
            controlDiv.appendChild(controlUi);

            // Set CSS for the control interior.
            var controlText = document.createElement("div");
            controlText.style.color = "rgb(25,25,25)";
            controlText.style.fontFamily = "Roboto,Arial,sans-serif";
            controlText.style.fontSize = "13px";
            controlText.style.lineHeight = "30px";
            controlText.style.paddingLeft = "10px";
            controlText.style.paddingRight = "10px";
            controlText.innerHTML = "T";
            controlUi.appendChild(controlText);

            // Setup the click event listeners: simply set the map to Chicago.
            controlUi.addEventListener("click", function () {
                if (bTraficLayer) {
                    trafficLayer.setMap(null);
                    bTraficLayer = false;
                } else {
                    trafficLayer.setMap(map);
                    bTraficLayer = true;
                }
            });
        }

        var centerControlDiv = document.createElement("div");
        centerControl(centerControlDiv, map);

        centerControlDiv.index = 1;
        map.controls[gmaps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);
    }

    function setRoutesButtom() {
        function centerControl(controlDiv) {

            // Set CSS for the control border.
            var controlUi = document.createElement("div");
            controlUi.style.backgroundColor = "#fff";
            controlUi.style.border = "2px solid #fff";
            controlUi.style.borderRadius = "3px";
            controlUi.style.boxShadow = "0 1px 2px rgba(0,0,0,.3)";
            controlUi.style.cursor = "pointer";
            controlUi.style.marginBottom = "5px";
            controlUi.style.marginRight = "8px";
            controlUi.style.textAlign = "center";
            controlUi.title = "Clique para informações sobre as rotas agendadas.";
            controlDiv.appendChild(controlUi);

            // Set CSS for the control interior.
            var controlText = document.createElement("div");
            controlText.style.color = "rgb(25,25,25)";
            controlText.style.fontFamily = "Roboto,Arial,sans-serif";
            controlText.style.fontSize = "13px";
            controlText.style.lineHeight = "30px";
            controlText.style.paddingLeft = "10px";
            controlText.style.paddingRight = "10px";
            controlText.innerHTML = "R";
            controlUi.appendChild(controlText);

            controlUi.addEventListener("click", function () {
                $.each(map.markers, function (i, marker) {
                    if (marker.iconPath.indexOf("gps_icon12") !== -1)
                        gmaps.event.trigger(marker, "click");
                });
            });
        }

        var centerControlDiv = document.createElement("div");
        centerControl(centerControlDiv, map);

        centerControlDiv.index = 1;
        map.controls[gmaps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);
    }

    function createCenterMapControl() {

        function centerControl(controlDiv) {

            // Set CSS for the control border.
            var controlUi = document.createElement("div");
            controlUi.style.backgroundColor = "#fff";
            controlUi.style.border = "2px solid #fff";
            controlUi.style.borderRadius = "3px";
            controlUi.style.boxShadow = "0 1px 2px rgba(0,0,0,.3)";
            controlUi.style.cursor = "pointer";
            controlUi.style.marginBottom = "5px";
            controlUi.style.marginRight = "8px";
            controlUi.style.textAlign = "center";
            controlUi.title = "Clique para centralizar o mapa.";
            controlDiv.appendChild(controlUi);

            // Set CSS for the control interior.
            var controlText = document.createElement("div");
            controlText.style.color = "rgb(25,25,25)";
            controlText.style.fontFamily = "Roboto,Arial,sans-serif";
            controlText.style.fontSize = "13px";
            controlText.style.lineHeight = "30px";
            controlText.style.paddingLeft = "10px";
            controlText.style.paddingRight = "10px";
            controlText.innerHTML = "C";
            controlUi.appendChild(controlText);

            controlUi.addEventListener("click", function () {
                centerMap();
            });
        }

        var centerControlDiv = document.createElement("div");
        centerControl(centerControlDiv, map);

        centerControlDiv.index = 1;
        map.controls[gmaps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);
    }

    function setAnimatedMarkers(timeout) {
        for (var i = 0; i < gpsData.length; i++) {
            addMarkerTimeout(gpsData[i].lat, gpsData[i].lng, gpsData[i].title, i * timeout, gpsData[i].icon, gpsData[i].content, true, gpsData[i].idGps);
        }
    }

    function centerMap() {

        if (bounds == null) {
            bounds = new gmaps.LatLngBounds();
            for (var i = 0; i < gpsData.length; i++) {
                var position = new gmaps.LatLng(gpsData[i].lat, gpsData[i].lng);
                bounds.extend(position);
            }
        }

        map.fitBounds(bounds);
        map.panToBounds(bounds);
        console.info("Mapa Centralizado.");
    }

    function getIcon(iconNumber) {
        iconNumber = iconNumber || "0";
        return "img/gps_icon" + iconNumber + ".png";
    }

    function animateCirclePolyline(line) {
        var count = 0;
        timerId = window.setInterval(function () {

            count = (count + 1) % 200;

            var icons = line.get("icons");
            icons[1].offset = (count / 2) + "%";
            line.set("icons", icons);
        }, 100);
    }

    function stopAnimation() {
        window.clearInterval(timerId);
    }
}
