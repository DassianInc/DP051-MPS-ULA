# Using CRUD manager with Ext Gantt

## Introduction

This guide describes how to use the CRUD manager with Ext Gantt.
It contains only Gantt specific details. For general information on CRUD manager implementation and architecture
see [this guide](#!/guide/crud_manager).

The class implementing _CRUD manager_ for Ext Gantt is called {@link Gnt.data.CrudManager}.
It uses {@link Sch.crud.transport.Ajax AJAX} as transport system and {@link Sch.crud.encoder.Json JSON} as encoding format.

## Benefits of using the CRUD manager

In previous versions of the Ext Gantt, you had to load and save data using the standard Ext JS data package. This would involve
setting proxies on data stores and handling load and save on each such store. This approach worked, but had a few drawbacks:

- To load data into the Gantt, you had to deal with each store separately. In the worst case, this could mean about 4-5 ajax requests to load the Gantt chart (Tasks, Dependencies, Resources, Assignments, Calendars) depending on which features you used.
- Hard to use database transactions on the server side.

For performance reasons, obvisously we'd like the loading process to use a single request that returns the data to be consumed by all the stores used in the Gantt chart.
This is now easy to achieve since the CM loads the data in one request. When it comes to saving changes, you normally want to have an
 "all-or-nothing" transaction-based approach to persisting updates in your database. This is not feasible if you're using two separate ajax requests.


## Stores

There are a number of different data entities used in Ext Gantt: calendars, resources, assignments, dependencies and tasks.
To register them with a {@link Gnt.data.CrudManager} instance, the following configs should be used respectively:
{@link Gnt.data.CrudManager#calendarManager calendarManager}, {@link Gnt.data.CrudManager#resourceStore resourceStore},
{@link Gnt.data.CrudManager#assignmentStore assignmentStore}, {@link Gnt.data.CrudManager#dependencyStore dependencyStore},
{@link Gnt.data.CrudManager#taskStore taskStore}.

Here's a how a basic configuration would look:

    var crudManager = new Gnt.data.CrudManager({
        autoLoad        : true,
        calendarManager : calendarManager,
        resourceStore   : resourceStore,
        dependencyStore : dependencyStore,
        assignmentStore : assignmentStore
        taskStore       : taskStore,
        transport       : {
            load    : {
                url     : 'php/read.php'
            },
            sync    : {
                url     : 'php/save.php'
            }
        }
    });

The backend, in this case the "read.php" should return a JSON similar to the one seen below:

    {
        "success"      : true,

        "dependencies" : {
            "rows" : [
                {"Id" : 1, "From" : 11, "To" : 17, "Type" : 2, "Lag" : 0, "Cls" : "", "LagUnit" : "d"},
                {"Id" : 2, "From" : 12, "To" : 17, "Type" : 2, "Lag" : 0, "Cls" : "", "LagUnit" : "d"},
                {"Id" : 3, "From" : 13, "To" : 17, "Type" : 2, "Lag" : 0, "Cls" : "", "LagUnit" : "d"}
            ]
        },

        "assignments" : {
            "rows" : [
                {
                    "Id"         : 1,
                    "TaskId"     : 11,
                    "ResourceId" : 1,
                    "Units"      : 100
                },
                {
                    "Id"         : 2,
                    "TaskId"     : 11,
                    "ResourceId" : 2,
                    "Units"      : 80
                }
            ]
        },

        "resources" : {
            "rows" : [
                {"Id" : 1, "Name" : "Mats" },
                {"Id" : 2, "Name" : "Nickolay" },
                {"Id" : 3, "Name" : "Goran" }
            ]
        },

        "tasks" : {
            "rows" : [
                {
                    "BaselineEndDate"   : "2010-01-28",
                    "Id"                : 11,
                    "leaf"              : true,
                    "Name"              : "Investigate",
                    "PercentDone"       : 50,
                    "TaskType"          : "LowPrio",
                    "StartDate"         : "2010-01-18",
                    "BaselineStartDate" : "2010-01-20",
                    "Segments"          : [
                        {
                            "Id"                : 1,
                            "StartDate"         : "2010-01-18",
                            "Duration"          : 1
                        },
                        {
                            "Id"                : 2,
                            "StartDate"         : "2010-01-20",
                            "Duration"          : 2
                        },
                        {
                            "Id"                : 3,
                            "StartDate"         : "2010-01-25",
                            "Duration"          : 5
                        }
                    ]
                },
                {
                    "BaselineEndDate"   : "2010-02-01",
                    "Id"                : 12,
                    "leaf"              : true,
                    "Name"              : "Assign resources",
                    "PercentDone"       : 50,
                    "StartDate"         : "2010-01-18",
                    "BaselineStartDate" : "2010-01-25",
                    "Duration"          : 10
                },
                {
                    "BaselineEndDate"   : "2010-02-01",
                    "Id"                : 13,
                    "leaf"              : true,
                    "Name"              : "Gather documents (not resizable)",
                    "Resizable"         : false,
                    "PercentDone"       : 50,
                    "StartDate"         : "2010-01-18",
                    "BaselineStartDate" : "2010-01-25",
                    "Duration"          : 10
                },
                {
                    "BaselineEndDate"   : "2010-02-04",
                    "Id"                : 17,
                    "leaf"              : true,
                    "Name"              : "Report to management",
                    "PercentDone"       : 0,
                    "StartDate"         : "2010-01-30",
                    "BaselineStartDate" : "2010-01-29",
                    "Duration"          : 0
                }
            ]
        }
    }


You should not specify {@link Gnt.data.CrudManager#calendarManager calendarManager}, {@link Gnt.data.CrudManager#resourceStore resourceStore},
{@link Gnt.data.CrudManager#dependencyStore dependencyStore} and {@link Gnt.data.CrudManager#assignmentStore assignmentStore}
configs if they were already specified for the task store instance. In this case, the CRUD manager will just take them from the provided task store instance:

    var taskStore = new Gnt.data.TaskStore({
        calendarManager : calendarManager,
        resourceStore   : resourceStore,
        dependencyStore : dependencyStore,
        assignmentStore : assignmentStore
    });

    var crudManager = new Gnt.data.CrudManager({
        // Specifying TaskStore only
        taskStore       : taskStore,
        transport       : {
            load    : {
                url     : 'php/read.php'
            },
            sync    : {
                url     : 'php/save.php'
            }
        }
    });

You can provide any number of additional stores using the {@link Gnt.data.CrudManager#stores stores} config:

    var crudManager = new Gnt.data.CrudManager({
        taskStore       : taskStore,
        stores          : [ store1, store2, store3 ],
        transport       : {
            load    : {
                url     : 'php/read.php'
            },
            sync    : {
                url     : 'php/save.php'
            }
        }
    });

Or add them programmatically using the {@link Gnt.data.CrudManager#addStore addStore} method:

    crudManager.addStore([ store2, store3 ]);


## Implementation

Here is how a CRUD manager can be created:

    var crudManager = new Gnt.data.CrudManager({
        autoLoad        : true,
        taskStore       : taskStore,
        transport       : {
            load    : {
                url     : 'php/read.php'
            },
            sync    : {
                url     : 'php/save.php'
            }
        }
    });

In above example data, the load operation will start automatically since the CM is configured with the {@link Gnt.data.CrudManager#autoLoad autoLoad} option set to `true`.
There is also a {@link Gnt.data.CrudManager#method-load load} method to invoke loading manually:

    crudManager.load(function (response) {
        alert('Data loaded...');
    })

To persist changes automatically, there is an {@link Gnt.data.CrudManager#autoSync autoSync} option,
and you can of course also call the {@link Gnt.data.CrudManager#method-sync sync} method manually if needed:

    crudManager.sync(function (response) {
        alert('Changes saved...');
    });

Any {@link Gnt.panel.Gantt} instances can be configured to use a _CRUD manager_ by providing the {@link Gnt.panel.Gantt#crudManager crudManager} config.
In this case you don't need to specify {@link Gnt.panel.Gantt#taskStore taskStore}, {@link Gnt.panel.Gantt#dependencyStore dependencyStore},
{@link Gnt.panel.Gantt#resourceStore resourceStore}, {@link Gnt.panel.Gantt#assignmentStore assignmentStore}
on the Gantt panel. They will be taken from provided {@link Gnt.panel.Gantt#crudManager crudManager} instance.

    new Gnt.panel.Gantt({
        viewPreset          : 'dayAndWeek',
        startDate           : new Date(2014, 0, 1),
        endDate             : new Date(2014, 1, 1),
        width               : 800,
        height              : 350,
        // point grid to use CRUD manager
        crudManager         : crudManager
        columns             : [
            {
                xtype   : 'namecolumn'
            },
            {
                xtype   : 'startdatecolumn'
            }
        ]
    });


## Calendars

{@link Gnt.data.CrudManager} supports bulk loading of all the project calendars in a project.
To be able to do this, the {@link Gnt.data.CrudManager#calendarManager} config has to be specified or it can be specified on the {@link Gnt.data.TaskStore#calendarManager task store}.

    var calendarManager   = Ext.create('Gnt.data.CalendarManager', {
        calendarClass   : 'Gnt.data.calendar.BusinessTime'
    });

    ...

    var taskStore     = Ext.create('Gnt.data.TakStore', {
        // taskStore calendar will automatically be set when calendarManager gets loaded
        calendarManager : calendarManager,
        resourceStore   : resourceStore,
        dependencyStore : dependencyStore,
        assignmentStore : assignmentStore
    });

    var crudManager   = Ext.create('Gnt.data.CrudManager', {
        autoLoad        : true,
        taskStore       : taskStore,
        transport       : {
            load    : {
                url     : 'php/read.php'
            },
            sync    : {
                url     : 'php/save.php'
            }
        }
    });

### Load response structure

The calendar manager load response has a bit more complex structure than the [described general one](#!/guide/crud_manager-section-4).

The first difference from a standard response is that for each calendar we include its data under the `Days` field.
The object under `Days` field has exactly the same structure as any other object containing store data.
It has `rows` containing an array of calendar records (each represents a {@link Gnt.model.CalendarDay} instance) and `total` defines the number of them.

Another thing to take a note on, is how `metaData` is used for calendar manager loading.
It has a `projectCalendar` property which **must** contain the identifier of the calendar that should be used as the **project calendar**.

    {
        requestId   : 123890,
        revision    : 123,
        success     : true,

        calendars   : {
            // each record represents a Gnt.model.Calendar instance
            rows        : [
                {
                    Id                  : "1",
                    parentId            : null,
                    Name                : "General",
                    DaysPerMonth        : 20,
                    DefaultAvailability : ["08:00-12:00","13:00-17:00"],
                    ...
                    // the calendar data
                    Days                : {
                        // each record represents Gnt.model.CalendarDay instance
                        rows    : [{
                            Id                  : 2,
                            calendarId          : "1",
                            Name                : "Some big holiday",
                            Type                : "DAY",
                            Date                : "2010-01-14",
                            Availability        : [],
                            Weekday             : 0,
                            OverrideStartDate   : null,
                            OverrideEndDate     : null,
                            IsWorkingDay        : false,
                            Cls                 : "gnt-national-holiday"
                        }],
                        total   : 1
                    },
                    // child calendars go here
                    // each record represents a Gnt.model.Calendar instance
                    children    : [{
                        Id          : "2",
                        parentId    : "1",
                        Name        : "Holidays",
                        ...
                        // "Holidays" calendar data
                        Days        : {
                            // each record represents Gnt.model.CalendarDay instance
                            rows    : [
                                {
                                    Id          : 3,
                                    calendarId  : "2",
                                    Name        : "Mats's birthday",
                                    Date        : "2010-01-13",
                                    ...
                                },
                                {
                                    Id          : 4
                                    calendarId  : "2",
                                    Name        : "Bryntum company holiday",
                                    Date        : "2010-02-01",
                                    ...
                                },
                                {
                                    Id          : 5,
                                    calendarId  : "2",
                                    Name        : "Bryntum 1st birthday",
                                    Date        : "2010-12-01",
                                    ...
                                }
                            ],
                            total   : 3
                        },
                        leaf    : true
                    }]
                }
            ],
            total       : 2,
            metaData    : {
                // this specifies the identifier of the project calendar
                projectCalendar : "1"
            }

        },

        store2      : {
            ...
        },

        store3      : {
            ...
        }
    }


## Error handling

See [details on error handling in general guide](#!/guide/crud_manager-section-5).

## Writing own server-side implementation.

The CM doesn't require any specific backend, meaning you can implement the server-side parts in any platform. The only requirement is to follow [the requests and responses structure convention](#!/guide/crud_manager-section-3).

