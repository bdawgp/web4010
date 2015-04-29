(function(){
	"use strict";

	angular.module("calendarApp.Event", ['ui.router'])

	.config(function EventConfig($stateProvider){

		$stateProvider

			.state('event', {
				url: '/event/{id}',
				templateUrl: 'templates/event.html',
				controller: 'EventCtrl',
				controllerAs: 'vm',
				resolve: {
					event: function(EventList, Event, $stateParams){
						if(!EventList.loaded) EventList.load(Event);
						return EventList.getById($stateParams.id) || false;
					}
				}
			})

			;
	})

	.factory('EventList', function(){
		var events = [];

		var EventList = function(){};
		var eventList = EventList.prototype;

		eventList.loaded = false;

		eventList.addEvent = function(event){
			var insertAt = _.findIndex(events, function(eventSearch){
				return eventSearch.date.isAfter(event.date);
			});

			if(insertAt >= 0){
				events.splice(insertAt, 0, event);
			}else{
				events.push(event);
			}
		};

		eventList.getById = function(id){
			return _.find(events, 'id', id) || null;
		};

		eventList.getByDate = function(date){
			return _.filter(events, function(event){
				return event.date.isSame(date);
			}) || null;
		};

		eventList.removeById = function(id){
			var idx = _.findIndex(events, 'id', id);
			if(idx >= 0){
				events.splice(idx, 1);
			}
		};

		eventList.load = function(Event){
			events = JSON.parse(window.localStorage['angularCalendarEvents'] || '[]');
			var e;
			for(e = 0; e < events.length; e++){
				this.loaded = true;
				var event =  new Event(events[e]);
				event.isNew = false;
				events.splice(e, 1, event);
			}
		};

		eventList.persist = function(){
			window.localStorage['angularCalendarEvents'] = JSON.stringify(events);
		};

		return new EventList();
	})

	.factory('Event', function(EventList){
		var Event = function(properties){
			properties = properties || {};

			this.id = properties.id || _.uniqueId('event' + Date.now().valueOf());
			this.title = properties.title;
			this.date = moment.utc(properties.date || null);
		};
		var event = Event.prototype;

		event.id = null;
		event.title = null;
		event.date = null;
		event.isNew = true;

		event.remove = function(){
			if(!this.isNew){
				EventList.removeById(this.id);
				this.isNew = true;
				EventList.persist();
			}
		};

		event.save = function(){
			if(this.isNew){
				EventList.addEvent(this);
				this.isNew = false;
			}
			EventList.persist();
		};

		EventList.load(Event);

		return Event;
	})

	.controller('EventCtrl', function(){
		var EventCtrl = function(event, $state){
			this.event = event;
			if(!event){
				$state.go('calendar.monthly');
			}

			this.go = $state.go.bind($state);
		};
		var eventCtrl = EventCtrl.prototype;

		eventCtrl.editEvent = function(){
			var text = prompt('Edit Event', this.event.title);
			if(text === null) return;
			if(text){
				this.event.title = text;
				this.event.save();
			}else{
				this.event.remove();
				this.go('calendar.monthly');
			}
		};

		return EventCtrl;
	}.call(this))

	;
}).call(this);
