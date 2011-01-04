/*
 * Licensed to Jasig under one or more contributor license
 * agreements. See the NOTICE file distributed with this work
 * for additional information regarding copyright ownership.
 * Jasig licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a
 * copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var cal = cal || {};

(function($, fluid, cal) {

    cal.EventDetailView = function(container, overallThat, options) {
        var that = fluid.initView("cal.EventDetailView", container, options);
        that.state = {};
        
        var cutpoints = [
            { id: "eventSummary", selector:that.options.selectors.eventSummary },
            { id: "eventDay", selector: that.options.selectors.eventDay },
            { id: "eventTime", selector: that.options.selectors.eventTime },
            { id: "eventLocationDiv:", selector: that.options.selectors.eventLocationDiv },
            { id: "eventLocation", selector: that.options.selectors.eventLocation },
            { id: "eventDescriptionDiv:", selector: that.options.selectors.eventDescriptionDiv },
            { id: "eventDescription", selector: that.options.selectors.eventDescription },
            { id: "eventLinkDiv:", selector: that.options.selectors.eventLinkDiv },
            { id: "eventLink", selector: that.options.selectors.eventLink }
        ];
        
        that.showEvent = function (event) {
            
            var date = event.startDate;
            
            var time = event.startTime;
            if (event.multiDay) {
                date += " - " + event.endDate;
                time = event.startTime + " - " + event.endTime + " " + event.endDate;
            } else if (event.allDay) {
                time = "All Day";
            } else if (event.endTime && (event.endTime != event.startTime || event.startDate  != event.endDate ) ) {
                time = event.startTime + " - " + event.endTime;
            } else {
                time = event.startTime;
            }
            
        	var tree = { 
        		children: [
        		    { ID: "eventSummary", value: event.summary },
                    { ID: "eventDay", value: date },
                    { ID: "eventTime", value: time }
        		] 
        	};

            if (event.location) {
                tree.children.push({
                    ID: "eventLocationDiv:",
                    children: [
                        { ID: "eventLocation", value: event.location }
                    ]
                });
            }

        	if (event.description) {
        	    tree.children.push({
        	        ID: "eventDescriptionDiv:",
        	        children: [
        	            { ID: "eventDescription", value: event.description }
        	        ]
        	    });
        	}

            if (event.url) {
                tree.children.push({
                    ID: "eventLinkDiv:",
                    children: [
                        { ID: "eventLink", value: event.url, target: event.url }
                    ]
                });
            }

            if (that.state.templates) {
                fluid.reRender(that.state.templates, $(container), tree, { cutpoints: cutpoints });
            } else {
                that.state.templates = fluid.selfRender($(container), tree, { cutpoints: cutpoints });
            }        	
        	
        };
        
        return that;
    	
    };

    fluid.defaults("cal.EventDetailView", {
        selectors: {
        	eventSummary: ".upcal-event-detail-summary",
        	eventDay: ".upcal-event-detail-day",
        	eventTime: ".upcal-event-detail-starttime",
        	eventLocationDiv: ".upcal-event-detail-loc",
        	eventLocation: ".upcal-event-detail-loc p",
        	eventDescriptionDiv: ".upcal-event-detail-desc",
        	eventDescription: ".upcal-event-detail-desc p",
        	eventLinkDiv: ".upcal-event-detail-link",
        	eventLink: ".upcal-event-detail-link p a"
        }
    });

    cal.EventListView = function(container, overallThat, options) {
        var that = fluid.initView("cal.EventListView", container, options);

		that.state = {};

    	var cutpoints = [
    		{ id: "day:", selector: that.options.selectors.day },
    		{ id: "dayName", selector: that.options.selectors.dayName },
    		{ id: "event:", selector: that.options.selectors.event },
    		{ id: "eventTime", selector: that.options.selectors.eventTime },
    		{ id: "eventLink", selector: that.options.selectors.eventLink }
    	];
    	
    	that.showEventList = function (dateMap) {
	        var tree = { children: [] };
	        for (date in dateMap) {
	        	var events = dateMap[date];
	    		var day = {
	    			ID: "day:",
	    			children: [
	    			    { ID: "dayName", value: date }
	    		    ]
	    		};
	    		$(events).each(function (idx, event){
	    		    var time;
	    		    
	    		    if (event.allDay) {
	    		        time = "All Day";
	    		    } else if (event.dateEndTime && (event.dateEndTime != event.dateStartTime || event.startDate  != event.endDate ) ) {
	    		        time = event.dateStartTime + " - " + event.dateEndTime;
	    		    } else {
	    		        time = event.dateStartTime;
	    		    }
	    		    
	    			day.children.push({
	    				ID: "event:",
	    				decorators: [
	    				    { type: "addClass", classes: "upcal-color-" + event.colorIndex }
	    				],
	    				children: [
	    				    { ID: "eventTime", value: time },
	    				    { 
	    				        ID: "eventLink", 
	    				        value: event.summary,
	                            decorators: [
                                     { type: "jQuery", func: "click",
                                         args: function () {
                                             overallThat.eventDetailView.showEvent(event);
                                             overallThat.locate("hideOnEvent").hide();
                                             overallThat.locate("hideOnCalendar").show();
                                         }
                                     }
                                 ] 

	    				    }
	    				]
	    			});
	    		});
	    		tree.children.push(day);
	    	}
			
	        if (that.state.templates) {
	            fluid.reRender(that.state.templates, $(container), tree, { cutpoints: cutpoints });
	        } else {
	            that.state.templates = fluid.selfRender($(container), tree, { cutpoints: cutpoints });
	        }
    	}

    	return that;
    };

    fluid.defaults("cal.EventListView", {
    	dateMap: null,
        selectors: {
        	day: ".day",
        	dayName: ".dayName",
        	event: ".upcal-event",
        	eventTime: ".upcal-event-time",
        	eventLink: ".upcal-event-link"
        }
    });

    //start of creator function

    /**
     * Calendar view creator function
     * 
     * see http://wiki.fluidproject.org/display/fluid/The+creator+function
     */
    cal.CalendarView = function(container, options) {
        console.log(cal);
        var that = fluid.initView("cal.CalendarView", container, options);
        that.eventListView = fluid.initSubcomponent(that, "eventListView", [that.locate("eventList"), that, fluid.COMPONENT_OPTIONS]);
        that.eventDetailView = fluid.initSubcomponent(that, "eventDetailView", [that.locate("eventDetail"), that, fluid.COMPONENT_OPTIONS]);
        
        /**
         * Update the event list to include the specified start date and 
         * number of days
         */
        that.updateEventList = function(startDate, days) {
            
            // update the state
            that.options.startDate = startDate;
            that.options.days = days;
            
            that.locate("loadingMessage").show();
            $.post(that.options.eventsUrl,
                { startDate: startDate, timePeriod: days }, 
                function(json) {
                    that.locate("loadingMessage").hide();
                    that.locate("eventList").show();
                    that.eventListView.options.dateMap = json.dateMap;
                    that.eventListView.showEventList(json.dateMap);
                }, "json"
            );        
        };
        
        that.updateEventList(that.options.startDate, that.options.days);
        that.locate("returnToCalendarLink").click(function(){ 
            that.locate("hideOnEvent").show();
            that.locate("hideOnCalendar").hide();
        });
        return that;
    };

    //end of creator function
    
    //start of defaults

    fluid.defaults("cal.CalendarView", {
        startDate: null,
        eventsUrl: null,
        days: 7,
        eventListView: {
            type: "cal.EventListView"
        },
        eventDetailView: {
            type: "cal.EventDetailView"
        },
        selectors: {
            hideOnEvent: '.upcal-hide-on-event',
            hideOnCalendar: '.upcal-hide-on-calendar',
            eventList: '.upcal-event-list',
            eventDetail: '.upcal-event-details',
            calendarEvent: '.upcal-event-detail',
            calendarEventLink: '.upcal-event-link',
            returnToCalendarLink: '.upcal-view-return',
            loadingMessage: '.upcal-loading-message'
        }
    });

    // end of defaults

})(jQuery, fluid, cal);
