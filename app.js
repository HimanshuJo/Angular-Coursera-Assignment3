(function () {
    'use strict';
    angular.module('NarrowItDownApp', [])
        .controller('NarrowItDownController', NarrowItDownController)
        .service('NarrowItDownService', NarrowItDownService)
        .service('NarrowItDownFilterService', NarrowItDownFilterService)
        .service('NarrowItDownAPIService', NarrowItDownAPIService)
        .directive('foundItems', FoundItems)
        .constant('ApiBasePath', " https://coursera-jhu-default-rtdb.firebaseio.com/menu_items.json");

    function FoundItems() {
        var ddo = {
            template: '<br>\
            <hr>\
            <div class="container">\
            <ol>\
            <li ng-repeat="item in menu.items">\
            {{item.menu}}<br>\
            {{item.short_name}}<br>\
            {{item.description}}\
            <button ng-click="menu.removeItem({index: $index});">Don\'t want this one!</button>\
            </li>\
            </ol>\
            </div>\
            <div ng-if="menu.items.length==0&&menu.counter>=1">Nothing found</div>',
            scope: {
                menu: '<',
                removeItem: '&'
            },
        };

        return ddo;
    }

    NarrowItDownAPIService.$inject = ['$http', 'ApiBasePath'];
    function NarrowItDownAPIService($http, ApiBasePath) {
        let service = this;

        service.getMenuCategories = function () {
            let response = $http({
                method: "GET",
                url: (ApiBasePath + "")
            });
            return response;
        };

        service.getMenuForCategory = function (shortName) {
            let response = $http({
                method: "GET",
                url: (ApiBasePath + ""),
                params: {
                    category: shortName
                }
            });
            return response;
        };
    };

    NarrowItDownController.$inject = ['NarrowItDownService'];
    function NarrowItDownController(NarrowItDownService) {
        let list = this;
        list.items = NarrowItDownService.getItems();
        list.itemName;
        list.counter = 0;

        list.addItem = function () {
            list.items.splice(0, list.items.length);
            if(list.itemName===""){
                list.itemName="### --- ###";
            }
            NarrowItDownService.addItem_version2(list.itemName);
            list.itemName="";
        };

        list.removeItem = function (itemIndex) {
            NarrowItDownService.removeItem(itemIndex);
        };

        list.setCounter = function () {
            list.counter++;
        }
    };

    NarrowItDownService.$inject = ['$q', 'NarrowItDownFilterService', 'NarrowItDownAPIService'];
    function NarrowItDownService($q, NarrowItDownFilterService, NarrowItDownAPIService) {
        let service = this;
        let items = [];

        service.addItem_version2 = function (name) {
            let promise = NarrowItDownAPIService.getMenuCategories();
            promise.then(function (response) {
                return NarrowItDownFilterService.checkName(name, response, items);
            }, function (errorResponse) {
                console.log("Error 1: " + errorResponse.message);
            }).then(function (response) {

            }, function (errorResponse) {
                console.log("Error 2: " + errorResponse.message);
            }).catch(function (errorResponse) {
                console.log("Error 3: " + errorResponse.message);
            });
        };

        service.removeItem = function (itemIndex) {
            items.splice(itemIndex, 1);
        };

        service.getItems = function () {
            return items;
        };
    };

    NarrowItDownFilterService.$inject = ['$q', '$timeout'];
    function NarrowItDownFilterService($q, $timeout) {
        let service = this;

        service.checkName = function (name, response, items) {
            //console.log(response);
            let deferred = $q.defer();
            let flag = false;

            $timeout(function () {

                const entries = Object.entries(response.data);
                for (let [key, value] of entries) {
                    let curmenu = "";
                    let curshortname = "";
                    const entries2 = Object.entries(value);
                    for (let [key2, value2] of entries2) {
                        const entries3 = Object.entries(value2);
                        for (let [key3, value3] of entries3) {
                            const entries4 = Object.entries(value3);
                            for (let [key4, value4] of entries4) {
                                if (key4 === "name") {
                                    curmenu = value4.toString();
                                }
                                if (key4 === "short_name") {
                                    curshortname = value4.toString();
                                }
                            }
                            for(let [key4, value4] of entries4){
                                if (key4 === "description") {
                                    if (value4.indexOf(name) !== -1) {
                                        flag = true;
                                        items.push({
                                            menu: curmenu,
                                            short_name: curshortname,
                                            description: value4
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                if (flag) {
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            }, 1);
            return deferred.promise;
        };
    };
})();