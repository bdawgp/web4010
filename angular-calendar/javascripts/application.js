(function(){
	"use strict";

	angular.module('calendarApp', ['calendarApp.Calendar', 'ui.router'])

	.config(function ApplicationConfig($urlRouterProvider){
		$urlRouterProvider
			.otherwise('/calendar');
	})

	.controller('ApplicationCtrl', function(){
		var ApplicationCtrl = function(){};
		var applicationCtrl = ApplicationCtrl.prototype;

		applicationCtrl.range = function(){
			return _.range.apply(_, arguments);
		};

		return ApplicationCtrl;
	}.call(this))

	;
})();
