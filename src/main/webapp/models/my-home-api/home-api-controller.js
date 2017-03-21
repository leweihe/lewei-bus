'use strict';

angular.module('myApp-home-api').controller('HomeApiController', ['$scope', '$location', 'HomeApiService', 'AmapService', 'ManageRouteService', function ($scope, $location, HomeApiService, AmapService, ManageRouteService) {

    $scope.inputBusStation = {
        lng: '',
        lat: ''
    };
    $scope.map = new AMap.Map('mapContainer', {
        resizeEnable: false,
        zoom: 14,
        center: [118.139839, 24.488006]
    });

    window.onload = function() {
        $scope.map.plugin(['AMap.ToolBar'], function() {
            $scope.map.addControl(new AMap.ToolBar());
        });
        if(location.href.indexOf('&guide=1')!==-1){
            $scope.map.setStatus({scrollWheel:false})
        }
    };

    $('#tipinput').click(function(){
        $('#searchTitle1').animate({height:'hide'});
        $('#searchTitle2').animate({height:'hide'});
    });

    $scope.map.plugin(['AMap.ToolBar'], function () {
        $scope.map.addControl(new AMap.ToolBar());
    });

    $scope.showMap = function(){
        $('#mapContainer').show();

        if($scope.inputBusStation.lng) {
            $scope.map.setZoomAndCenter(14, new AMap.LngLat($scope.inputBusStation.lng, $scope.inputBusStation.lat));
            var walking = new AMap.Walking({
                map: $scope.map,
                panel: 'resultPanel'
            });
            var fromLnglat = new AMap.LngLat($scope.inputBusStation.lng, $scope.inputBusStation.lat);
            var toLngLat = new AMap.LngLat($scope.nearestStation.lng, $scope.nearestStation.lat);
            walking.search(fromLnglat, toLngLat);
        }
    };

    $scope.searchNearestStations = function (apiFlag) {
        if(!$scope.inputBusStation.lng) {
            return;
        }
        console.log('[' + $scope.inputBusStation.lng + ', ' + $scope.inputBusStation.lat + ']');
        HomeApiService.findStationsInCircle($scope.circle, apiFlag).then(function (stations) {
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
                        shortestDist = parseFloat(dist.distance);
                    }
                    tmpDist = parseFloat(dist.distance);
                    if(tmpDist < shortestDist) {
                        shortestDist = tmpDist;
                        shortestInd = index;
                    }
                });
                console.log('the shortest one is ' + shortestDist + ' and the index is ' + shortestInd);
                console.log('the nearest station is : ' + stations[shortestInd].keyword + ', suggest to take route number ' + stations[shortestInd].routeId);
                $scope.nearestStation = stations[shortestInd];
            }).then(function () {
                ManageRouteService.findRoutesByStationIds($scope.nearestStation.stationId).then(function (outputRoutes) {
                    $scope.outputRoutes = outputRoutes;
                    $scope.resultDesc = '为您推荐的路线为[' + $scope.outputRoutes[0].routeName +'], 在[' + $scope.nearestStation.keyword + ']站上车';
                    console.log('choose route name : ' + $scope.outputRoutes[0].routeName);

                    angular.forEach(outputRoutes, function (route) {
                        var path = [];
                        angular.forEach(route.stations, function (station) {
                            path.push([station.lng, station.lat]);
                        });
                        $scope.map.plugin('AMap.DragRoute', function () {
                            route = new AMap.DragRoute($scope.map, path, AMap.DrivingPolicy.LEAST_DISTANCE);
                            route.search();
                        });
                    });

                });
            });

        });
    };

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



    $scope.onComplete = function(data) {
        $scope.inputBusStation.lng = data.position.getLng();
        $scope.inputBusStation.lat = data.position.getLat();
        var point = {
            location: new AMap.LngLat(data.position.getLng(), data.position.getLat())
        };
        $scope.openInfoPoint($scope.map, point);
        $scope.searchNearestStations(true);
    };

    $scope.onError = function(data) {
        //TODO
    };

    if ($location.search().useCurrent) {
        $('#mapContainer').show();
        $scope.map.setZoom(14);

        $scope.map.plugin('AMap.Geolocation', function() {
            var geolocation = new AMap.Geolocation({
                timeout: 10000,
                zoomToAccuracy: true,
                buttonPosition:'RB'
            });
            $scope.map.addControl(geolocation);
            geolocation.getCurrentPosition();
            AMap.event.addListener(geolocation, 'complete', $scope.onComplete);
            AMap.event.addListener(geolocation, 'error', $scope.onError);
        });
    }


    if ($location.search().lng && $location.search().lat) {
        $scope.inputBusStation.lng = $location.search().lng;
        $scope.inputBusStation.lat = $location.search().lat;
        var point = {
            location: new AMap.LngLat($scope.inputBusStation.lng, $scope.inputBusStation.lat)
        };
        $scope.openInfoPoint($scope.map, point);
        $scope.searchNearestStations(true);
    }

    AmapService.initTipInput($scope.map);

    $scope.$on('openInfoPoint', function (ev, point) {
        $scope.openInfoPoint($scope.map, point);
    });


}]);
