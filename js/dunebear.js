var dunebear = angular.module('dunebear', ['ngRoute']);
dunebear.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/home', {templateUrl: 'partials/home.html', controller: 'HomeCtrl'})
		.when('/games', {templateUrl: 'partials/games.html', controller: 'GamesCtrl'})
		.when('/about', {templateUrl: 'partials/about.html', controller: 'AboutCtrl'})
		.otherwise({redirectTo: '/home'});
}]);

dunebear.controller('HomeCtrl', ['$scope', function($scope) {
	
}]);

dunebear.controller('DunebearCtrl', ['$scope', function($scope) {
	
}]);

dunebear.controller('AboutCtrl', ['$scope', function($scope) {

}]);

dunebear.controller('GamesCtrl', ['$scope', function($scope) {
	
}]);