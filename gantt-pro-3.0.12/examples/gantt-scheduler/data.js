{
    "success"     : true,
    "assignments" : {
        "rows" : [
            {
                "Id"         : 1,
                "ResourceId" : 1,
                "TaskId"     : 11,
                "Units"      : 100
            },
            {
                "Id"         : 2,
                "ResourceId" : 2,
                "TaskId"     : 12,
                "Units"      : 50
            },
            {
                "Id"         : 3,
                "ResourceId" : 3,
                "TaskId"     : 12,
                "Units"      : 50
            },
            {
                "Id"         : 4,
                "ResourceId" : 4,
                "TaskId"     : 13,
                "Units"      : 100
            },
            {
                "Id"         : 5,
                "ResourceId" : 5,
                "TaskId"     : 14,
                "Units"      : 100
            },
            {
                "Id"         : 6,
                "ResourceId" : 6,
                "TaskId"     : 16,
                "Units"      : 100
            }
        ]
    },
    "calendars" : {
        "metaData"  : {
            // this specifies identifier of the project calendar
            "projectCalendar" : "default"
        },
        "rows" : [
            {
                "Id"                  : "default",
                "Name"                : "Default",
                "parentId"            : null,
                "DaysPerWeek"         : 5,
                "DaysPerMonth"        : 20,
                "HoursPerDay"         : 8,
                "WeekendFirstDay"     : 6,
                "WeekendSecondDay"    : 0,
                "WeekendsAreWorkDays" : false,
                "DefaultAvailability" : ["08:00-12:00", "13:00-17:00"],
                "leaf"                : true,
                "Days"                : {
                    "rows" : [
                        {
                            "Cls"        : "gnt-national-holiday",
                            "Date"       : "2010-01-12",
                            "Id"         : 1,
                            "calendarId" : "default",
                            "Name"       : "Some big holiday"
                        },
                        {
                            "Cls"        : "gnt-chinese-holiday",
                            "Date"       : "2010-02-14",
                            "Id"         : 2,
                            "calendarId" : "default",
                            "Name"       : "Chinese New Year"
                        }
                    ]
                }
            },
            {
                "Id"                  : "NightShift",
                "Name"                : "Night Shift",
                "parentId"            : null,
                "DaysPerWeek"         : 5,
                "DaysPerMonth"        : 20,
                "HoursPerDay"         : 8,
                "WeekendFirstDay"     : 6,
                "WeekendSecondDay"    : 0,
                "WeekendsAreWorkDays" : false,
                "DefaultAvailability" : ["00:00-06:00", "22:00-24:00"],
                "leaf"                : true
            }
        ]
    },
    "resources": {
        "rows" : [
            {
                "Id"         : 1,
                "Name"       : "Mike",
                "Type"       : "user"
            },
            {
                "Id"         : 2,
                "Name"       : "Linda",
                "Type"       : "user"
            },
            {
                "Id"         : 3,
                "Name"       : "Don",
                "Type"       : "user"
            },
            {
                "Id"         : 4,
                "Name"       : "Karen",
                "Type"       : "user"
            },
            {
                "Id"         : 5,
                "Name"       : "Doug",
                "Type"       : "user"
            },
            {
                "Id"         : 6,
                "Name"       : "Peter",
                "Type"       : "user"
            },
            {
                "CalendarId" : "NightShift",
                "Id"         : 1001,
                "Name"       : "Drill",
                "Type"       : "machine"
            },
            {
                "CalendarId" : "NightShift",
                "Id"         : 1002,
                "Name"       : "Oil pump",
                "Type"       : "machine"
            },
            {
                "CalendarId" : "NightShift",
                "Id"         : 1006,
                "Name"       : "Crane #1",
                "Type"       : "machine"
            },
            {
                "CalendarId" : "NightShift",
                "Id"         : 1007,
                "Name"       : "Crane #2",
                "Type"       : "machine"
            },
            {
                "CalendarId" : "NightShift",
                "Id"         : 1008,
                "Name"       : "Crane #3",
                "Type"       : "machine"
            },
            {
                "CalendarId" : "Default",
                "Id"         : 1003,
                "Name"       : "Light truck #1",
                "Type"       : "truck"
            },
            {
                "CalendarId" : "Default",
                "Id"         : 1004,
                "Name"       : "Light truck #2",
                "Type"       : "truck"
            },
            {
                "CalendarId" : "Default",
                "Id"         : 1005,
                "Name"       : "Heavy truck",
                "Type"       : "truck"
            },
            {
                "CalendarId" : "Default",
                "Id"         : 1009,
                "Name"       : "Cargo jet #1",
                "Type"       : "airplane"
            },
            {
                "CalendarId" : "Default",
                "Id"         : 1010,
                "Name"       : "Cargo jet #2",
                "Type"       : "airplane"
            }
        ]
    },
    "dependencies": {
        "rows" : [
            {
                "Id"   : 1,
                "From" : 12,
                "To"   : 13,
                "Type" : 0
            },
            {
                "Id"   : 2,
                "From" : 20,
                "To"   : 19,
                "Type" : 2
            },
            {
                "Id"   : 3,
                "From" : 19,
                "To"   : 18,
                "Type" : 2
            },
            {
                "Id"   : 4,
                "From" : 18,
                "To"   : 21,
                "Type" : 2
            },
            {
                "Id"   : 5,
                "From" : 21,
                "To"   : 5,
                "Type" : 2
            },
            {
                "Id"   : 6,
                "From" : 9,
                "To"   : 7,
                "Type" : 2
            },
            {
                "Id"   : 7,
                "From" : 26,
                "To"   : 25,
                "Type" : 0
            },
            {
                "Id"   : 8,
                "From" : 27,
                "To"   : 26,
                "Type" : 0
            },
            {
                "Id"   : 9,
                "From" : 6,
                "To"   : 10,
                "Type" : 2
            },
            {
                "Id"   : 10,
                "From" : 24,
                "To"   : 9,
                "Type" : 2
            },
            {
                "Id"   : 11,
                "From" : 22,
                "To"   : 23,
                "Type" : 2
            },
            {
                "Id"   : 12,
                "From" : 11,
                "To"   : 12,
                "Type" : 0
            },
            {
                "Id"   : 13,
                "From" : 34,
                "To"   : 20,
                "Type" : 2
            },
            {
                "Id"   : 14,
                "From" : 13,
                "To"   : 17,
                "Type" : 2
            }
        ]
    },
    "tasks" : {
        "rows" : [
            {
                "Id"        : 100,
                "Name"      : "PROJECT: BUILD DEVICE",
                "StartDate" : "2010-01-18T08:00:00",
                "EndDate"   : "2010-05-15",
                "TaskType"  : "Gnt.model.Project",
                "children"  : [
                    {
                        "Id"          : 1,
                        "Name"        : "Planning",
                        "PercentDone" : 50,
                        "StartDate"   : "2010-01-18T08:00:00",
                        "EndDate"     : "2010-01-30",
                        "TaskType"    : "Important",
                        "children"    : [
                            {
                                "Duration"          : 10,
                                "Id"                : 11,
                                "Name"              : "Investigate",
                                "PercentDone"       : 50,
                                "StartDate"         : "2010-01-18T08:00:00",
                                "TaskType"          : "LowPrio",
                                "leaf"              : true
                            },
                            {
                                "Duration"          : 10,
                                "Id"                : 12,
                                "Name"              : "Assign resources",
                                "PercentDone"       : 50,
                                "StartDate"         : "2010-01-18T08:00:00",
                                "leaf"              : true
                            },
                            {
                                "Duration"          : 10,
                                "Id"                : 13,
                                "Name"              : "Gather documents (not resizable)",
                                "PercentDone"       : 50,
                                "Resizable"         : false,
                                "StartDate"         : "2010-01-18T08:00:00",
                                "leaf"              : true
                            },
                            {
                                "Draggable"         : false,
                                "Duration"          : 0,
                                "Id"                : 17,
                                "Name"              : "Report to management (not draggable)",
                                "PercentDone"       : 0,
                                "StartDate"         : "2010-01-30",
                                "ManuallyScheduled" : true,
                                "leaf"              : true
                            }
                        ],
                        "expanded"    : true
                    },
                    {
                        "Duration"    : 12,
                        "Id"          : 4,
                        "Name"        : "Implementation Phase 1",
                        "PercentDone" : 50,
                        "StartDate"   : "2010-02-01T08:00:00",
                        "TaskType"    : "LowPrio",
                        "children"    : [
                            {
                                "Duration"    : 5,
                                "Id"          : 34,
                                "Name"        : "Preparation work",
                                "PercentDone" : 30,
                                "StartDate"   : "2010-02-01T08:00:00",
                                "leaf"        : true
                            },
                            {
                                "Duration"    : 5,
                                "Id"          : 14,
                                "Name"        : "Evaluate chipsets",
                                "PercentDone" : 30,
                                "StartDate"   : "2010-02-01T08:00:00",
                                "leaf"        : true
                            },
                            {
                                "Duration"    : 5,
                                "Id"          : 16,
                                "Name"        : "Choose technology suite",
                                "PercentDone" : 30,
                                "StartDate"   : "2010-02-01T08:00:00",
                                "leaf"        : true
                            },
                            {
                                "Duration"    : 5,
                                "Id"          : 15,
                                "Name"        : "Build prototype",
                                "PercentDone" : 40,
                                "StartDate"   : "2010-02-10T08:00:00",
                                "children"    : [
                                    {
                                        "Duration"          : 4,
                                        "Id"                : 20,
                                        "Name"              : "Step 1",
                                        "PercentDone"       : 60,
                                        "StartDate"         : "2010-02-10T08:00:00",
                                        "ManuallyScheduled" : true,
                                        "leaf"              : true
                                    },
                                    {
                                        "Duration"          : 4,
                                        "Id"                : 19,
                                        "Name"              : "Step 2",
                                        "PercentDone"       : 60,
                                        "StartDate"         : "2010-02-10T08:00:00",
                                        "ManuallyScheduled" : true,
                                        "leaf"              : true
                                    },
                                    {
                                        "Duration"          : 4,
                                        "Id"                : 18,
                                        "Name"              : "Step 3",
                                        "PercentDone"       : 60,
                                        "StartDate"         : "2010-02-10T08:00:00",
                                        "ManuallyScheduled" : true,
                                        "leaf"              : true
                                    },
                                    {
                                        "Duration"          : 1,
                                        "Id"                : 21,
                                        "Name"              : "Follow up with customer",
                                        "PercentDone"       : 60,
                                        "StartDate"         : "2010-02-16",
                                        "ManuallyScheduled" : true,
                                        "leaf"              : true
                                    }
                                ],
                                "expanded" : true
                            }
                        ],
                        "expanded"          : true
                    },
                    {
                        "Duration"          : 0,
                        "Id"                : 5,
                        "Name"              : "Customer approval",
                        "PercentDone"       : 0,
                        "StartDate"         : "2010-02-18",
                        "ManuallyScheduled" : true,
                        "leaf"              : true
                    },
                    {
                        "Duration"          : 8,
                        "Id"                : 6,
                        "Name"              : "Implementation Phase 2",
                        "PercentDone"       : 50,
                        "StartDate"         : "2010-02-22T08:00:00",
                        "children"          : [
                            {
                                "Duration"    : 8,
                                "Id"          : 25,
                                "Name"        : "Task 1",
                                "PercentDone" : 10,
                                "StartDate"   : "2010-02-22T08:00:00",
                                "leaf"        : true
                            },
                            {
                                "Duration"    : 8,
                                "Id"          : 26,
                                "Name"        : "Task 2",
                                "PercentDone" : 20,
                                "StartDate"   : "2010-02-22T08:00:00",
                                "leaf"        : true
                            },
                            {
                                "Duration"    : 8,
                                "Id"          : 27,
                                "Name"        : "Task 3",
                                "PercentDone" : 20,
                                "StartDate"   : "2010-02-22T08:00:00",
                                "leaf"        : true
                            }
                        ],
                        "expanded"          : true
                    },
                    {
                        "Duration"          : 0,
                        "Id"                : 10,
                        "Name"              : "Customer approval 2",
                        "PercentDone"       : 0,
                        "StartDate"         : "2010-03-17",
                        "ManuallyScheduled" : true,
                        "leaf"              : true
                    },
                    {
                        "Duration"          : 35,
                        "Id"                : 8,
                        "Name"              : "Production phase 1",
                        "PercentDone"       : 40,
                        "StartDate"         : "2010-03-22T08:00:00",
                        "children"          : [
                            {
                                "Duration"          : 12,
                                "Id"                : 22,
                                "Name"              : "Assemble",
                                "PercentDone"       : 50,
                                "StartDate"         : "2010-03-22T08:00:00",
                                "leaf"              : true
                            },
                            {
                                "Duration"          : 11,
                                "Id"                : 23,
                                "Name"              : "Load SW",
                                "PercentDone"       : 20,
                                "StartDate"         : "2010-04-06T08:00:00",
                                "ManuallyScheduled" : true,
                                "leaf"              : true
                            },
                            {
                                "Duration"          : 12,
                                "Id"                : 24,
                                "Name"              : "Basic testing (inc some test)",
                                "PercentDone"       : 50,
                                "StartDate"         : "2010-04-22T08:00:00",
                                "leaf"              : true
                            }
                        ],
                        "expanded" : true
                    },
                    {
                        "Duration"          : 6,
                        "Id"                : 9,
                        "Name"              : "Final testing",
                        "PercentDone"       : 0,
                        "StartDate"         : "2010-05-07T08:00:00",
                        "ManuallyScheduled" : true,
                        "leaf"              : true
                    },
                    {
                        "Duration"          : 0,
                        "Id"                : 7,
                        "Name"              : "Delivery",
                        "PercentDone"       : 40,
                        "StartDate"         : "2010-05-15",
                        "ManuallyScheduled" : true,
                        "leaf"              : true
                    }
                ],
                "cls"      : "project",
                "expanded" : true
            }
        ]
    }
}
