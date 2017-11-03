function GpsDataFactor() {
    var gpsData = [];
    const pointsContent = "<h4>Lorem ipsum</h4><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis vehicula ornare. Integer imperdiet libero nec mauris congue, vitae porttitor nisl luctus.</p>";

    this.LoadRouteData = function () {
        gpsData = [];

        gpsData.push({
            lat: -30.028491,
            lng: -51.199785,
            title: 'START POINT',
            icon: '0',
            content: pointsContent,
            idGps: 1
        });

        gpsData.push({
            lat: -30.028409,
            lng: -51.198385,
            title: 'FIRST POINT',
            icon: '1',
            content: pointsContent,
            idGps: 2
        });

        gpsData.push({
            lat: -30.028279,
            lng: -51.196068,
            title: 'SECOND POINT',
            icon: '2',
            content: pointsContent,
            idGps: 3
        });

        gpsData.push({
            lat: -30.024180,
            lng: -51.196584,
            title: 'THIRD POINT',
            icon: '3',
            content: pointsContent,
            idGps: 4
        });

        gpsData.push({
            lat: -30.020189,
            lng: -51.197311,
            title: 'FOURTH POINT',
            icon: '4',
            content: pointsContent,
            idGps: 5
        });

        gpsData.push({
            lat: -30.019622,
            lng: -51.195423,
            title: 'FIFTH POINT',
            icon: '5',
            content: pointsContent,
            idGps: 6
        });

        gpsData.push({
            lat: -30.019433,
            lng: -51.177604,
            title: 'FINAL POINT',
            icon: '6',
            content: pointsContent,
            idGps: 7
        });

        return gpsData;
    }

    this.CirclePoint = {
        lat: -30.022409,
        lng: -51.210612
    };

    this.PolygonCoordList = [
        {
            lat: -30.022127,
            lng: -51.184079
        },
        {
            lat: -30.021179,
            lng: -51.181118
        },
        {
            lat: -30.021718,
            lng: -51.178479
        },
        {
            lat: -30.023808,
            lng: -51.179123
        },
        {
            lat: -30.025043,
            lng: -51.182385
        },
    ];
}