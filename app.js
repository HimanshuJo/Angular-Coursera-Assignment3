(function () {
    'use strict';
    angular.module('ShoppingListPromiseApp', [])
        .controller('ShoppingListController', ShoppingListController)
        .service('ShoppingListService', ShoppingListService)
        .service('WeightLossFilterService', WeightLossFilterService)
        .service('MenuCategoriesService', MenuCategoriesService)
        .constant('ApiBasePath', " https://coursera-jhu-default-rtdb.firebaseio.com/menu_items.json");

    MenuCategoriesService.$inject = ['$http', 'ApiBasePath'];
    function MenuCategoriesService($http, ApiBasePath) {
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

    ShoppingListController.$inject = ['ShoppingListService'];
    function ShoppingListController(ShoppingListService) {
        let list = this;
        list.items = ShoppingListService.getItems();
        list.itemName = "";
        list.itemQuantity = "";

        list.addItem = function () {
            ShoppingListService.addItem_version2(list.itemName, list.itemQuantity);
        };

        list.removeItem = function (itemIndex) {
            ShoppingListService.removeItem(itemIndex);
        };
    };

    ShoppingListService.$inject = ['$q', 'WeightLossFilterService', 'MenuCategoriesService'];
    function ShoppingListService($q, WeightLossFilterService, MenuCategoriesService) {
        let service = this;
        let items = [];

        service.addItem_version2 = function (name, quantity) {
            let promise = MenuCategoriesService.getMenuCategories();
            promise.then(function (response) {
                return WeightLossFilterService.checkName(name, response);
            }, function (errorResponse) {
                console.log(errorResponse.message);
            }).then(function (response) {
                let item = {
                    menu: response.menu,
                    short_name: response.short_name,
                    description: response.description
                };
                items.push(item);
            }, function (errorResponse) {
                console.log(errorResponse.message);
            }).catch(function (errorResponse) {
                console.log(errorResponse.message);
            });
        };

        service.removeItem = function (itemIndex) {
            items.splice(itemIndex, 1);
        };

        service.getItems = function () {
            return items;
        };
    };

    WeightLossFilterService.$inject = ['$q', '$timeout'];
    function WeightLossFilterService($q, $timeout) {
        let service = this;

        service.checkName = function (name, response) {
            console.log(response);
            let deferred = $q.defer();

            let flag = false;

            let result = {
                menu: "",
                short_name: "",
                description: ""
            };

            $timeout(function () {

                const entries = Object.entries(response.data);
                for (let [key, value] of entries) {
                    let curmenu = "";
                    let curshortname = "";
                    const entries2 = Object.entries(value);
                    for (let [key2, value2] of entries2) {
                        const entries3 = Object.entries(value2);
                        for (let [key3, value3] of entries3) {
                            let tochk1 = "";
                            tochk1 = key3.toString();
                            if (tochk1 === "name") {
                                curmenu = value3.valueOf().toString();
                            }
                            if (tochk1 === "short_name") {
                                curshortname = value3.valueOf().toString();
                            }
                            const entries4 = Object.entries(value3);
                            for (let [key4, value4] of entries4) {
                                if (key4 === "description") {
                                    if (value4.indexOf(name) !== -1) {
                                        result.menu = curmenu;
                                        result.short_name = curshortname;
                                        result.description = value4;
                                        flag = true;
                                        break;
                                    }
                                }
                            }
                            if (flag) break;
                        }
                        if (flag) break;
                    }
                    if (flag) break;
                }
                if (flag) {
                    deferred.resolve(result);
                } else {
                    deferred.reject(result);
                }
            }, 3000);
            return deferred.promise;
        };

        service.checkQuantity = function (quantity) {
            let deferred = $q.defer();

            let result = {
                message: ""
            };

            $timeout(function () {
                if (quantity < 6) {
                    deferred.resolve(result);
                } else {
                    result.message = "Too much!";
                    deferred.reject(result);
                }
            }, 1000);
            return deferred.promise;
        }
    };
})();