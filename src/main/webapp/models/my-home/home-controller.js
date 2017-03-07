/**
    * Created by cn40580 at 2017-03-06 2:43 PM.
    */

angular.module('myApp-home').controller('HomeController', ['$scope', 'HomeService', 'AmapService', function ($scope, HomeService, AmapService) {

    $scope.inputBusStation = {
        lng: "",
        lat: ""
    };
    $scope.map = new AMap.Map('mapContainer', {
        resizeEnable: true,
        zoom: 14,
        center: [118.139839, 24.488006]
    });

    $scope.inputKeyword = "连岳里";
    $scope.outputRoutes;


    $scope.searchNearestStations = function() {
        if(!$scope.inputBusStation.lng) {
            return;
        }
        console.log('[' + $scope.inputBusStation.lng + ', ' + $scope.inputBusStation.lat + ']');
        HomeService.findStationsInCircle($scope.circle).then(function(stations){
            if(stations.length <= 0) {
                console.log('no station in the circle suggest user to enlarge the r and search again.');
                return;
            }
            var originals = [];
            angular.forEach(stations, function(station) {
                originals.push({lng: station.lng, lat: station.lat});
            });
            var destination = {lng: $scope.inputBusStation.lng, lat: $scope.inputBusStation.lat};

            AmapService.calcWalkDist(originals, destination).then(function(distResults){
                var shortestInd = 0;
                var shortestDist = 0;
                var tmpDist = 0;
                angular.forEach(distResults, function(dist, index){
                    console.log('@ ' + dist.distance + '');
                    if(index == 0) {
                        shortestDist = dist.distance;
                    }
                    tmpDist = dist.distance;
                    if(tmpDist < shortestDist) {
                        shortestDist = tmpDist;
                        shortestInd = index;
                    }
                });
                console.log('the shortest one is ' + shortestDist + ' and the index is ' + shortestInd);
                console.log('station is : ' + stations[0].keyword);
            });

        });
    };

    AmapService.initTipInput($scope.map);

    $scope.$on('openInfoPoint', function (ev, point) {
        $scope.openInfoPoint($scope.map, point);
    });

    $scope.openInfoPoint = function (map, point) {
        map.clearMap();
        var marker = new AMap.Marker({
            map: map,
            position: point.location,
            draggable: true
        });

        var circleOpt = {
            map: map,
            center: point.location,
            radius: 1000,
            strokeOpacity: 0.2,
            fillOpacity: 0.2
        };
        $scope.circle = new AMap.Circle(circleOpt);

        marker.on('dragend', function (dragedPoint) {
            $scope.inputBusStation.lng = dragedPoint.lnglat.lng;
            $scope.inputBusStation.lat = dragedPoint.lnglat.lat;
            $scope.circle.setCenter([dragedPoint.lnglat.lng, dragedPoint.lnglat.lat]);
        });

        $scope.inputBusStation.lng = point.location.lng;
        $scope.inputBusStation.lat = point.location.lat;
        $scope.inputBusStation.keyword = point.name;
    };

}]);