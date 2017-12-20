{
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
                "DefaultAvailability" : [ '08:00-12:00', '13:00-17:00' ],
                "Days"                : {
                    "rows" : [
                        {
                            "Id"    : 1,
                            "Date"  : "2010-01-14",
                            "Cls"   : "gnt-national-holiday",
                            "Name"  : "Some big holiday"
                        }
                    ]
                },
                "expanded" : true,
                "children"            : [
                    {
                        "Id"                  : "calendar1",
                        "Name"                : "Sub-calendar 1",
                        "DaysPerMonth"        : 20,
                        "DaysPerWeek"         : 5,
                        "HoursPerDay"         : 8,
                        "WeekendsAreWorkdays" : false,
                        "WeekendFirstDay"     : 6,
                        "WeekendSecondDay"    : 0,
                        "DefaultAvailability" : [ '08:00-12:00', '13:00-17:00' ],
                        "leaf"                : true,
                        "Days"                : {
                            "rows" : [
                                {
                                    "Id"    : 1,
                                    "Date"  : "2010-02-03",
                                    "Name"  : "day3"
                                }
                            ]
                        }
                    },
                    {
                        "Id"                  : "calendar2",
                        "Name"                : "Sub-calendar 2",
                        "DaysPerMonth"        : 20,
                        "DaysPerWeek"         : 5,
                        "HoursPerDay"         : 8,
                        "WeekendsAreWorkdays" : false,
                        "WeekendFirstDay"     : 6,
                        "WeekendSecondDay"    : 0,
                        "DefaultAvailability" : [ '08:00-12:00', '13:00-17:00' ],
                        "leaf"                : true,
                        "Days"                : {
                            "rows" : [
                                {
                                    "Id"    : 1,
                                    "Date"  : "2010-02-05",
                                    "Name"  : "day5"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "Id"                  : "nightshift",
                "Name"                : "Night shift",
                "DaysPerMonth"        : 20,
                "DaysPerWeek"         : 5,
                "HoursPerDay"         : 8,
                "WeekendsAreWorkdays" : false,
                "WeekendFirstDay"     : 6,
                "WeekendSecondDay"    : 0,
                "DefaultAvailability" : [ "00:00-06:00", "22:00-24:00" ],
                "leaf"                : true,
                "Days"                : {
                    "rows" : [
                        {
                            "Id"    : 1,
                            "Date"  : "2010-02-05",
                            "Name"  : "day5"
                        }
                    ]
                }
            }
        ]
    },


    "dependencies"  : {
        "rows"  : [
            {
                "Id"    : 1,
                "From"  : 3,
                "To"    : 4
            },
            {
                "Id"    : 2,
                "From"  : 4,
                "To"    : 5
            },
            {
                "Id"    : 3,
                "From"  : 5,
                "To"    : 13
            },
            {
                "Id"    : 4,
                "From"  : 13,
                "To"    : 14
            },
            {
                "Id"    : 5,
                "From"  : 14,
                "To"    : 15
            },
            {
                "Id"    : 6,
                "From"  : 23,
                "To"    : 24
            },
            {
                "Id"    : 7,
                "From"  : 24,
                "To"    : 25
            }
        ]
    },

    "assignments" : {
        "rows" : [
            {
                "Id"            : 1,
                "TaskId"        : 4,
                "ResourceId"    : 1,
                "Units"         : 100
            },
            {
                "Id"            : 2,
                "TaskId"        : 4,
                "ResourceId"    : 2,
                "Units"         : 80
            },
            {
                "Id"            : 3,
                "TaskId"        : 11,
                "ResourceId"    : 5,
                "Units"         : 50
            },
            {
                "Id"            : 4,
                "TaskId"        : 12,
                "ResourceId"    : 6,
                "Units"         : 50
            }
        ]
    },

    "resources" : {
        "rows" : [
            {"Id" : 1, "Name" : "Mats", "CalendarId" : "nightshift" },
            {"Id" : 2, "Name" : "Nickolay" },
            {"Id" : 3, "Name" : "Goran" },
            {"Id" : 4, "Name" : "Dan" },
            {"Id" : 5, "Name" : "Jake" },
            {"Id" : 6, "Name" : "Kim" },
            {"Id" : 7, "Name" : "Bart" }
        ]
    },

    "tasks" : {
        "rows" : [
            {
                "Id"            : 1,
                "Name"          : "Sencha Releases",
                "StartDate"     : "2010-01-18",
                "Duration"      : 16,
                "expanded"      : true,
                "PercentDone"   : 50,
                "children": [
                    {
                        "expanded"      : true,
                        "StartDate"     : "2010-01-18",
                        "Duration"      : 16,
                        "PercentDone"   : 50,
                        "Id"            : 2,
                        "Name"          : "Ext 4.x branch",
                        "children"      : [
                            {
                                "PercentDone"   : 100,
                                "StartDate"     : "2010-01-18",
                                "Duration"      : 5,
                                "Id"            : 3,
                                "leaf"          : true,
                                "Name"          : "Ext JS 4.0.1",
                                "CalendarId"    : "nightshift"
                            },
                            {
                                "PercentDone"   : 100,
                                "StartDate"     : "2010-01-25 08:00",
                                "Duration"      : 5,
                                "Id"            : 4,
                                "leaf"          : true,
                                "Name"          : "Ext JS 4.0.2"
                            },
                            {
                                "PercentDone"   : 30,
                                "StartDate"     : "2010-02-02 08:00",
                                "Duration"      : 5,
                                "Id"            : 5,
                                "leaf"          : true,
                                "Name"          : "Ext JS 4.0.3"
                            }
                        ]
                    },
                    {
                        "expanded"      : true,
                        "StartDate"     : "2010-01-20",
                        "Duration"      : 12,
                        "PercentDone"   : 10,
                        "Id"            : 22,
                        "Name"          : "Gxt 3 branch",
                        "children"      : [
                            {
                                "PercentDone"   : 30,
                                "StartDate"     : "2010-01-20 08:00",
                                "Duration"      : 4,
                                "Id"            : 23,
                                "leaf"          : true,
                                "Name"          : "Gxt 3.0 Preview"
                            },
                            {
                                "PercentDone"   : 10,
                                "StartDate"     : "2010-01-26 08:00",
                                "Duration"      : 4,
                                "Id"            : 24,
                                "leaf"          : true,
                                "Name"          : "Gxt 3.0 Beta"
                            },
                            {
                                "PercentDone"   : 0,
                                "StartDate"     : "2010-02-02 08:00",
                                "Duration"      : 3,
                                "Id"            : 25,
                                "leaf"          : true,
                                "Name"          : "Gxt 3.0 Final"
                            }
                        ]
                    }
                ]
            },
            {
                "expanded"      : true,
                "StartDate"     : "2010-02-09",
                "Duration"      : 15,
                "PercentDone"   : 50,
                "Id"            : 11,
                "Name"          : "Bryntum Releases",
                "children"      : [
                    {
                        "PercentDone"   : 50,
                        "StartDate"     : "2010-02-09 08:00",
                        "Duration"      : 5,
                        "Id"            : 13,
                        "leaf"          : true,
                        "Name"          : "Product X"
                    },
                    {
                        "PercentDone"   : 80,
                        "StartDate"     : "2010-02-16 08:00",
                        "Duration"      : 5,
                        "Id"            : 14,
                        "leaf"          : 1,
                        "Name"          : "Ext Scheduler 2.0"
                    },
                    {
                        "PercentDone"   : 50,
                        "StartDate"     : "2010-02-23 08:00",
                        "Duration"      : 5,
                        "Id"            : 15,
                        "leaf"          : true,
                        "Name"          : "Ext Gantt 2.0"
                    }
                ]
            }
        ]
    }
}
