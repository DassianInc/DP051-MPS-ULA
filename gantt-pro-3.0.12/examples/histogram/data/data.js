{
    "success"   : true,

    "calendars" : {

        "metaData"  : {
            "projectCalendar"   : "general"
        },

        "rows": [
        {
            "Id"                    : "general",
            "Name"                  : "General",
            "DaysPerMonth"          : 20,
            "DaysPerWeek"           : 5,
            "HoursPerDay"           : 8,
            "WeekendsAreWorkdays"   : false,
            "WeekendFirstDay"       : 6,
            "WeekendSecondDay"      : 0,
            "DefaultAvailability"   : ["08:00-12:00", "13:00-17:00"],
            "leaf"                  : true,
            "Days"                  : {
                "rows"  : [
                    {
                        "Id"    : 1,
                        "Date"  : "2010-01-14",
                        "Cls"   : "gnt-national-holiday",
                        "Name"  : "Some big holiday"
                    }
                ]
            }
        },
        {
            "Id"                    : "Customized",
            "Name"                  : "Customized",
            "DaysPerMonth"          : 20,
            "DaysPerWeek"           : 5,
            "HoursPerDay"           : 8,
            "WeekendsAreWorkdays"   : false,
            "WeekendFirstDay"       : 6,
            "WeekendSecondDay"      : 0,
            "DefaultAvailability"   : ["00:00-06:00", "22:00-24:00"],
            "leaf"                  : true,
            "Days"                  : {
                "rows": [
                    {
                        "Id"            : 1,
                        "Date"          : "2010-01-19",
                        "Availability"  : ["08:00-10:00"]
                    },
                    {
                        "Id"            : 2,
                        "Date"          : "2010-01-20",
                        "Availability"  : ["09:00-10:00"]
                    },
                    {
                        "Id"            : 3,
                        "Date"          : "2010-01-21",
                        "Availability"  : ["08:00-12:00"]
                    }
                ]
            }
        }]
    },


    "dependencies"  : {
        "rows"  : []
    },

    "assignments"   : {
        "rows"  : [
            {
                "Id"            : 1,
                "TaskId"        : 11,
                "ResourceId"    : 1,
                "Units"         : 100
            },
            {
                "Id": 2,
                "TaskId": 11,
                "ResourceId"    : 2,
                "Units": 80
            },
            {
                "Id"            : 3,
                "TaskId"        : 12,
                "ResourceId"    : 5,
                "Units"         : 50
            },
            {
                "Id"            : 4,
                "TaskId"        : 13,
                "ResourceId"    : 6,
                "Units"         : 50
            },
            {
                "Id"            : 5,
                "TaskId"        : 12,
                "ResourceId"    : 1,
                "Units"         : 10
            }
        ]
    },

    "resources": {
        "rows": [
            {
                "Id"            : 1,
                "Name"          : "Mats"
            },
            {
                "Id"            : 2,
                "Name"          : "Nickolay"
            },
            {
                "Id"            : 3,
                "Name"          : "Goran",
                "CalendarId"    : "Customized"
            },
            {
                "Id"            : 4,
                "Name"          : "Dan"
            },
            {
                "Id"            : 5,
                "Name"          : "Jake"
            },
            {
                "Id"            : 6,
                "Name"          : "Kim"
            },
            {
                "Id"            : 7,
                "Name"          : "Bart"
            }
        ]
    },

    "tasks": {
        "rows": [
            {
                "BaselineEndDate"   : "2010-02-01",
                "Id"                : 1,
                "Name"              : "Planning",
                "PercentDone"       : 50,
                "StartDate"         : "2010-01-18 08:00:00",
                "BaselineStartDate" : "2010-01-13",
                "Duration"          : 11,
                "expanded"          : true,
                "TaskType"          : "Important",
                "children": [
                    {
                        "BaselineEndDate"   : "2010-01-28",
                        "Id"                : 11,
                        "leaf"              : true,
                        "Name"              : "Investigate",
                        "PercentDone"       : 50,
                        "TaskType"          : "LowPrio",
                        "StartDate"         : "2010-01-18 08:00:00",
                        "BaselineStartDate" : "2010-01-20",
                        "Duration"          : 10
                    },
                    {
                        "BaselineEndDate"   : "2010-02-01",
                        "Id"                : 12,
                        "leaf"              : true,
                        "Name"              : "Assign resources",
                        "PercentDone"       : 50,
                        "StartDate"         : "2010-01-20 08:00:00",
                        "BaselineStartDate" : "2010-01-25",
                        "Duration"          : 6
                    },
                    {
                        "BaselineEndDate"   : "2010-02-01",
                        "Id"                : 13,
                        "leaf"              : true,
                        "Name"              : "Gather documents (not resizable)",
                        "Resizable"         : false,
                        "PercentDone"       : 50,
                        "StartDate"         : "2010-01-18 08:00:00",
                        "BaselineStartDate" : "2010-01-25",
                        "Duration"          : 10
                    },
                    {
                        "BaselineEndDate"   : "2010-02-04",
                        "Id"                : 17,
                        "leaf"              : true,
                        "Name"              : "Report to management",
                        "TaskType"          : "Important",
                        "PercentDone"       : 0,
                        "StartDate"         : "2010-02-01 17:00",
                        "BaselineStartDate" : "2010-02-04",
                        "Duration"          : 0
                    }
                ]
            },
            {
                "BaselineEndDate"   : "2010-03-15",
                "Id"                : 4,
                "TaskType"          : "LowPrio",
                "Name"              : "Implementation Phase 1",
                "PercentDone"       : 50,
                "StartDate"         : "2010-02-02 08:00:00",
                "BaselineStartDate" : "2010-01-23",
                "Duration"          : 11,
                "expanded"          : true,
                "children"          : [
                    {
                        "BaselineEndDate"   : "2010-01-25",
                        "Id"                : 34,
                        "leaf"              : true,
                        "Name"              : "Preparation work",
                        "PercentDone"       : 30,
                        "StartDate"         : "2010-02-02 08:00:00",
                        "BaselineStartDate" : "2010-01-20",
                        "Duration"          : 5
                    },
                    {
                        "BaselineEndDate": "2010-03-07",
                        "Id": 14,
                        "leaf": true,
                        "Name": "Evaluate chipsets",
                        "PercentDone": 30,
                        "BaselineStartDate": "2010-02-25",
                        "StartDate": "2010-02-02 08:00:00",
                        "Duration": 5
                    },
                    {
                        "BaselineEndDate": "2010-03-20",
                        "Id": 16,
                        "leaf": true,
                        "Name": "Choose technology suite",
                        "PercentDone": 30,
                        "BaselineStartDate": "2010-03-10",
                        "StartDate": "2010-02-02 08:00:00",
                        "Duration": 5
                    },
                    {
                        "BaselineEndDate": "2010-03-06",
                        "Id": 15,
                        "Name": "Build prototype",
                        "PercentDone": 40,
                        "StartDate": "2010-02-10",
                        "BaselineStartDate": "2010-01-28",
                        "Duration": 5,
                        "expanded": true,
                        "children": [
                            {
                                "BaselineEndDate"   : "2010-02-06",
                                "Id"                : 20,
                                "leaf"              : true,
                                "Name"              : "Step 1",
                                "PercentDone"       : 60,
                                "StartDate"         : "2010-02-10 08:00:00",
                                "BaselineStartDate" : "2010-01-27",
                                "Duration"          : 4
                            },
                            {
                                "BaselineEndDate"   : "2010-02-22",
                                "Id"                : 19,
                                "leaf"              : true,
                                "Name"              : "Step 2",
                                "PercentDone"       : 60,
                                "StartDate"         : "2010-02-10 08:00:00",
                                "BaselineStartDate" : "2010-02-17",
                                "Duration"          : 4
                            },
                            {
                                "BaselineEndDate"   : "2010-03-07",
                                "Id"                : 18,
                                "leaf"              : true,
                                "Name"              : "Step 3",
                                "PercentDone"       : 60,
                                "StartDate"         : "2010-02-10 08:00:00",
                                "BaselineStartDate" : "2010-02-25",
                                "Duration"          : 4
                            },
                            {
                                "BaselineEndDate"   : "2010-03-08",
                                "Id"                : 21,
                                "leaf"              : true,
                                "Name"              : "Follow up with customer",
                                "PercentDone"       : 60,
                                "StartDate"         : "2010-02-16 08:00:00",
                                "BaselineStartDate" : "2010-03-04",
                                "Duration"          : 1
                            }
                        ]
                    }
                ]
            },
            {
                "BaselineEndDate"   : "2010-03-08",
                "Id"                : 5,
                "leaf"              : true,
                "Name"              : "Customer approval",
                "PercentDone"       : 0,
                "BaselineStartDate" : "2010-03-01",
                "StartDate"         : "2010-02-18 17:00",
                "Duration"          : 0,
                "TaskType"          : "CustomerApproval"
            },
            {
                "BaselineEndDate"   : "2010-03-18",
                "Id"                : 6,
                "Name"              : "Implementation Phase 2",
                "PercentDone"       : 50,
                "BaselineStartDate" : "2010-03-08",
                "StartDate"         : "2010-02-22 08:00:00",
                "Duration"          : 8,
                "expanded"          : true,
                "children"          : [
                    {
                        "BaselineEndDate"   : "2010-03-18",
                        "Id"                : 25,
                        "leaf"              : true,
                        "Name"              : "Task 1",
                        "PercentDone"       : 10,
                        "BaselineStartDate" : "2010-03-08",
                        "StartDate"         : "2010-02-22 08:00:00",
                        "Duration"          : 8
                    },
                    {
                        "BaselineEndDate"   : "2010-03-18",
                        "Id"                : 26,
                        "leaf"              : true,
                        "Name"              : "Task 2",
                        "PercentDone"       : 20,
                        "BaselineStartDate" : "2010-03-08",
                        "StartDate"         : "2010-02-22 08:00:00",
                        "Duration"          : 8
                    },
                    {
                        "BaselineEndDate"   : "2010-03-18",
                        "Id"                : 27,
                        "leaf"              : true,
                        "Name"              : "Task 3",
                        "PercentDone"       : 20,
                        "StartDate"         : "2010-02-22 08:00:00",
                        "BaselineStartDate" : "2010-03-08",
                        "Duration"          : 8
                    }
                ]
            },
            {
                "BaselineEndDate"   : "2010-03-17",
                "Id"                : 10,
                "leaf"              : true,
                "Name"              : "Customer approval 2 (not draggable)",
                "Draggable"         : false,
                "PercentDone"       : 0,
                "StartDate"         : "2010-03-17 17:00",
                "BaselineStartDate" : "2010-03-17",
                "Duration"          : 0
            },
            {
                "BaselineEndDate"   : "2010-05-08",
                "Id"                : 8,
                "Name"              : "Production phase 1",
                "PercentDone"       : 40,
                "StartDate"         : "2010-03-22 08:00:00",
                "BaselineStartDate" : "2010-03-22",
                "Duration"          : 35,
                "expanded"          : true,
                "children"          : [
                    {
                        "BaselineEndDate"   : "2010-04-07",
                        "Id"                : 22,
                        "leaf"              : true,
                        "Name"              : "Assemble",
                        "PercentDone"       : 50,
                        "StartDate"         : "2010-03-22 08:00:00",
                        "BaselineStartDate" : "2010-03-22",
                        "Duration"          : 12
                    },
                    {
                        "BaselineEndDate"   : "2010-04-21",
                        "Id"                : 23,
                        "leaf"              : true,
                        "Name"              : "Load SW",
                        "PercentDone"       : 20,
                        "StartDate"         : "2010-04-06 08:00:00",
                        "BaselineStartDate" : "2010-04-06",
                        "Duration"          : 11
                    },
                    {
                        "BaselineEndDate"   : "2010-05-04",
                        "Id"                : 24,
                        "leaf"              : true,
                        "Name"              : "Basic testing (inc some test)",
                        "PercentDone"       : 50,
                        "BaselineStartDate" : "2010-04-14",
                        "StartDate"         : "2010-04-22 08:00:00",
                        "Duration"          : 12
                    }
                ]
            },
            {
                "BaselineEndDate"   : "2010-05-11",
                "Id"                : 9,
                "leaf"              : true,
                "Name"              : "Final testing",
                "PercentDone"       : 0,
                "BaselineStartDate" : "2010-05-02",
                "StartDate"         : "2010-05-07 08:00:00",
                "Duration"          : 6
            },
            {
                "BaselineEndDate"   : "2010-05-11",
                "Id"                : 7,
                "leaf"              : true,
                "Name"              : "Delivery",
                "PercentDone"       : 40,
                "BaselineStartDate" : "2010-05-11",
                "StartDate"         : "2010-05-14 17:00",
                "Duration"          : 0
            }
        ]
    }
}