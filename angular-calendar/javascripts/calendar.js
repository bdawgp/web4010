(function(){
	"use strict";

	angular.module('calendarApp.Calendar', ['ui.router', 'calendarApp.Event'])

	.config(function CalendarConfig($stateProvider, $urlRouterProvider){
		$urlRouterProvider
			.when('/calendar', '/calendar/monthly');

		$stateProvider

			.state('calendar', {
				url: '/calendar',
				abstract: true,
				template: '<ui-view/>',
				controller: 'CalendarCtrl',
				controllerAs: 'vm'
			})

			.state('calendar.monthly', {
				url: '/monthly',
				templateUrl: 'templates/calendar.monthly.html'
			})

			;
	})

	.controller('CalendarCtrl', function(){
		var CalendarCtrl = function(EventList, Event){
			this.monthlyDatesPrepare();
			this.EventList = EventList;
			this.Event = Event;
		};
		var calendarCtrl = CalendarCtrl.prototype;

		calendarCtrl.today = moment.utc().startOf('day');
		calendarCtrl.current = moment.utc().startOf('day');
		calendarCtrl.daysOfWeek = _.range(7);
		calendarCtrl.daysHelper = moment.utc();

		calendarCtrl.monthlyDatesPrepare = function(){
			var current = moment.utc(this.current).startOf('month').day(0);
			var end = moment.utc(this.current).endOf('month').day(6);

			var weeks = current.diff(end, 'weeks');
			this.monthlyWeeks = [];

			var w, week, d;
			for(w = 0; current.isBefore(end); w++){
				week = [];
				for(d = 0; d < 7; d++){
					week.push(moment.utc(current));
					current.add(1, 'd');
				}
				this.monthlyWeeks.push(week);
			}
		};

		calendarCtrl.weeksInMonth = function(day){
			var start = moment.utc(day).startOf('month');
			var end = moment.utc(day).endOf('month');
			return start.diff(end, 'weeks');
		};
		calendarCtrl.buildWeek = function(weekInMonth){
			var current = moment.utc(this.current).startOf('month').day(0);
			if(weekInMonth > 0){
				current.add(weekInMonth, 'w');
			}
			var week = [], d;
			for(d = 0; d < 7; d++){
				week.push(moment.utc(current));
				current.add(1, 'd');
			}
			return week;
		};
		calendarCtrl.prevMonth = function(){
			this.current.subtract(1, 'M');
			this.monthlyDatesPrepare();
		};
		calendarCtrl.nextMonth = function(){
			this.current.add(1, 'M');
			this.monthlyDatesPrepare();
		};
		calendarCtrl.eventsForDay = function(date){
			return this.EventList.getByDate(date) || [];
		};

		calendarCtrl.createEvent = function(date){
			var text = prompt('New Event Title', '');
			if(text){
				var event = new this.Event({
					title: text,
					date: date
				});
				event.save();
			}
		};
		calendarCtrl.setCurrentDay = function(date){
			var previous = this.current;
			this.current = date;
			if(!date.isSame(previous, 'month')){
				calendarCtrl.monthlyDatesPrepare();
			}
		};

		calendarCtrl.agenda = {};

		calendarCtrl.jumpToToday = function(){
			this.today = moment.utc().startOf('day');
			this.current = moment.utc().startOf('day');
			this.monthlyDatesPrepare();
		};

		return CalendarCtrl;
	}.call(this))

	;
})();
