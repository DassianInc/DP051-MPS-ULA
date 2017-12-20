StartTest(function (t) {

    t.it('Histogram suspends its store listeners during CRUD manager loading', function (t) {

        var response = {
            "success"       : true,

            "calendars"     : {

                "metaData"  : {
                    "projectCalendar"   : "general"
                },

                "rows"  : [
                    {
                        "Id"                  : "general",
                        "Name"                : "General",
                        "DaysPerMonth"        : 20,
                        "DaysPerWeek"         : 5,
                        "HoursPerDay"         : 8,
                        "WeekendsAreWorkdays" : false,
                        "WeekendFirstDay"     : 6,
                        "WeekendSecondDay"    : 0,
                        "DefaultAvailability" : [ "08:00-12:00", "13:00-17:00" ],
                        "leaf"                : true
                    },
                    {
                        "Id"                  : "calendar1",
                        "Name"                : "calendar1",
                        "DaysPerMonth"        : 20,
                        "DaysPerWeek"         : 5,
                        "HoursPerDay"         : 8,
                        "WeekendsAreWorkdays" : false,
                        "WeekendFirstDay"     : 6,
                        "WeekendSecondDay"    : 0,
                        "DefaultAvailability" : [ "08:00-12:00", "13:00-17:00" ],
                        "leaf"                : true,
                        "Days"                : {
                            "rows" : [
                                {
                                    "Date"          : new Date(2010, 1, 11)
                                }
                            ]
                        }
                    }
                ]
            },

            "tasks" : {
                "rows" : [
                    {
                        leaf            : true,
                        Id              : 1,
                        StartDate       : '2010-02-03T00:00:00',
                        Duration        : 6
                    },
                    {
                        leaf            : true,
                        Id              : 2,
                        StartDate       : '2010-02-03T00:00:00',
                        Duration        : 6
                    },
                    {
                        leaf            : true,
                        Id              : 3,
                        StartDate       : '2010-02-03T00:00:00',
                        Duration        : 6
                    }
                ]
            },

            "assignments" : {
                "rows" : [
                    { Id: 1, ResourceId: 'r1', TaskId : 1, Units : 50 },
                    { Id: 2, ResourceId: 'r2', TaskId : 2, Units : 50 },
                    { Id: 3, ResourceId: 'r3', TaskId : 3, Units : 50 }
                ]
            },

            "resources" : {
                "rows" : [
                    { Id: 'r1', Name: 'Mike', CalendarId: 'calendar1' },
                    { Id: 'r2', Name: 'Alex' },
                    { Id: 'r3', Name: 'Ben' }
                ]
            }
        };

        var crudManager     = new Gnt.data.CrudManager({

            taskStore       : new Gnt.data.TaskStore({
                calendarManager     : new Gnt.data.CalendarManager({
                    calendarClass   : 'Gnt.data.calendar.BusinessTime'
                })
            }),

            // dummy sendRequest: simply calls success callback
            sendRequest     : function (cfg) {
                cfg.success.call(this, response);
            }
        });


        var histogram       = new Gnt.panel.ResourceHistogram({
            crudManager     : crudManager,
            startDate       : new Date(2010, 1, 1),
            endDate         : new Date(2010, 1, 13),
            width           : 800,
            height          : 400,
            renderTo        : Ext.getBody()
        });

        t.methodIsCalledNTimes('processAllocationData', Gnt.panel.ResourceHistogram, 3, 'called once for each resource');

        crudManager.load();

        histogram.destroy();
    });

});
