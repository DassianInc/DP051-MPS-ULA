/* globals Class: true, Siesta: true, Role */
Role('Bryntum.Data', {

    methods : {

        getResourceStore : function (config) {
            var Ext = this.global.Ext;

            return Ext.create('Gnt.data.ResourceStore', Ext.apply({
                model : 'Gnt.model.Resource',

                data : [
                    { Id : 'r1', Name : 'Mike' },
                    { Id : 'r2', Name : 'Linda' },
                    { Id : 'r3', Name : 'Don' },
                    { Id : 'r4', Name : 'Karen' },
                    { Id : 'r5', Name : 'Doug' },
                    { Id : 'r6', Name : 'Peter' }
                ]
            }, config || {}));
        },


        getSchedulerResourceStore : function (config) {
            var Ext = this.global.Ext;

            return Ext.create('Sch.data.ResourceStore', Ext.apply({

                data : [
                    { Id : 'r1', Name : 'Mike' },
                    { Id : 'r2', Name : 'Linda' },
                    { Id : 'r3', Name : 'Don' },
                    { Id : 'r4', Name : 'Karen' },
                    { Id : 'r5', Name : 'Doug' },
                    { Id : 'r6', Name : 'Peter' }
                ]
            }, config || {}));
        },


        getAssignmentStore : function (config) {
            var Ext = this.global.Ext;

            return Ext.create('Gnt.data.AssignmentStore', Ext.apply({
                model : 'Gnt.model.Assignment',

                data : [
                    { Id : 'a1', ResourceId : 'r1', TaskId : 117, Units : 50 },
                    { Id : 'a2', ResourceId : 'r2', TaskId : 118 },
                    { Id : 'a3', ResourceId : 'r3', TaskId : 115 }
                ]
            }, config || {}));
        },

        getEventStore : function (config) {
            var Ext = this.global.Ext;

            return Ext.create('Sch.data.EventStore', Ext.apply({
                data : [
                    { Id : 'e10', ResourceId : 'r1', Name : 'Assignment 1', StartDate : "2011-01-04", EndDate : "2011-01-06" },
                    { Id : 'e11', ResourceId : 'r2', Name : 'Assignment 1', StartDate : "2011-01-05", EndDate : "2011-01-08" },
                    { Id : 'e21', ResourceId : 'r3', Name : 'Assignment 2', StartDate : "2011-01-06", EndDate : "2011-01-08" },
                    { Id : 'e22', ResourceId : 'r4', Name : 'Assignment 2', StartDate : "2011-01-07", EndDate : "2011-01-09" },
                    { Id : 'e32', ResourceId : 'r5', Name : 'Assignment 3', StartDate : "2011-01-03", EndDate : "2011-01-05" },
                    { Id : 'e33', ResourceId : 'r6', Name : 'Assignment 3', StartDate : "2011-01-09", EndDate : "2011-01-11" }
                ]
            }, config || {}));
        },

        getDependencyStore : function (config) {
            var Ext = this.global.Ext;

            return Ext.create(Ext.apply({
                xclass : "Gnt.data.DependencyStore",
                autoLoad : false,

                data : [
                    { "From" : 117, "To" : 115, "Id" : 30, "Type" : 2 },
                    { "From" : 118, "To" : 115, "Id" : 31, "Type" : 2 },
                    { "From" : 115, "To" : 116, "Id" : 32, "Type" : 2 },
                    { "From" : 121, "To" : 120, "Id" : 33, "Type" : 2}
                ]
            }, config || {}));
        },

        getTaskStore : function (config, doNotLoad) {
            config = config || {};

            var Ext = this.global.Ext;

            var taskStore = Ext.create('Gnt.data.TaskStore', Ext.apply({
                cascadeChanges : true,
                cascadeDelay   : 0,

                autoSync : false,
                autoLoad : false,

                proxy : {
                    type   : 'memory',
                    reader : {
                        type : 'json'
                    },

                    data : config.DATA || [
                        {
                            "children"     : [
                                {
                                    "leaf"         : true,
                                    "Id"           : 117,
                                    "StartDate"    : "2010-02-03T00:00:00",
                                    "PercentDone"  : 0,
                                    "Name"         : "New task 1",
                                    "Duration"     : 6,
                                    "DurationUnit" : "d"
                                },
                                {
                                    "leaf"         : true,
                                    "Id"           : 118,
                                    "StartDate"    : "2010-02-03T00:00:00",
                                    "PercentDone"  : 0,
                                    "Name"         : "New task 2",
                                    "Duration"     : 6,
                                    "DurationUnit" : "d"
                                }
                            ],
                            "leaf"         : false,
                            "expanded"     : true,
                            "Id"           : 114,
                            "StartDate"    : "2010-02-03T00:00:00",
                            "PercentDone"  : 0,
                            "Name"         : "New task 3",
                            "Duration"     : 6,
                            "DurationUnit" : "d"
                        },
                        {
                            "leaf"         : true,
                            "Id"           : 115,
                            "StartDate"    : "2010-02-11T00:00:00",
                            "PercentDone"  : 0,
                            "Name"         : "New task 4",
                            "Duration"     : 5,
                            "DurationUnit" : "d"
                        },
                        {
                            "leaf"         : true,
                            "Id"           : 116,
                            "StartDate"    : "2010-02-18T00:00:00",
                            "PercentDone"  : 0,
                            "Name"         : "New task 5",
                            "Duration"     : 5,
                            "DurationUnit" : "d"
                        },
                        {
                            "children"     : [
                                {
                                    "leaf"         : true,
                                    "Id"           : 121,
                                    "StartDate"    : "2010-02-03T00:00:00",
                                    "PercentDone"  : 0,
                                    "Name"         : "New task 6",
                                    "Duration"     : 6,
                                    "DurationUnit" : "d"
                                }
                            ],
                            "leaf"         : false,
                            "expanded"     : true,
                            "Id"           : 119,
                            "StartDate"    : "2010-02-03T00:00:00",
                            "PercentDone"  : 0,
                            "Name"         : "New task 7",
                            "Duration"     : 6,
                            "DurationUnit" : "d"
                        },
                        {
                            "children"     : null,
                            "leaf"         : true,
                            "expanded"     : false,
                            "Id"           : 120,
                            "StartDate"    : "2010-02-11T00:00:00",
                            "PercentDone"  : 0,
                            "Name"         : "New task 8",
                            "Duration"     : 7,
                            "DurationUnit" : "d"
                        }
                    ]
                },

                root : {
                    Id       : 'Root',
                    loaded   : true,
                    expanded : true
                }
            }, config || {}));


            if (!doNotLoad) {
                taskStore.load();
            }

            return taskStore;
        },

        getBusinessTimeCalendar : function (config) {
            var Ext = this.Ext();
            var Date = this.global.Date;

            return Ext.create('Gnt.data.calendar.BusinessTime', Ext.apply({

                data : [
                    {
                        Date : new Date(2011, 6, 16),

                        IsWorkingDay : true,

                        Availability : [ '11:00-16:00', '17:00-20:00' ]
                    },
                    {
                        Date : new Date(2011, 6, 17),

                        IsWorkingDay : true,

                        Availability : [ '12:00-16:00' ]
                    }
                ]
            }, config));
        },


        getCalendar       : function (config) {
            var Ext = this.Ext();

            return Ext.create('Gnt.data.Calendar', Ext.apply({

            }, config));
        },


        // start of `getSampleDataSet1` ========================================================================================================================
        getSampleDataSet1 : function () {
            var Ext = this.Ext();
            var Date = this.global.Date;

            var calendar = Ext.create('Gnt.data.calendar.BusinessTime', {
                calendarId : 'Project',

                data : [
                    // will affect Task2 - weekend will be working day with non-standard availability
                    {
                        Date         : new Date(2011, 6, 16),
                        IsWorkingDay : true,
                        Availability : [ '11:00-16:00', '17:00-20:00' ]
                    },
                    {
                        Date         : new Date(2011, 6, 17),
                        IsWorkingDay : true,
                        Availability : [ '12:00-16:00' ]
                    }
                ]
            });

            // task4 has 26 as non-working day
            var calendar1 = Ext.create('Gnt.data.calendar.BusinessTime', {
                calendarId : 'Task4',

                parent : 'Project',

                data : [
                    {
                        Date         : new Date(2011, 6, 26),
                        IsWorkingDay : false
                    }
                ]
            });

            var calendar2 = Ext.create('Gnt.data.calendar.BusinessTime', {
                calendarId : 'Res5',

                parent : 'Project',

                data : [
                    {
                        Date         : new Date(2011, 6, 25),
                        IsWorkingDay : true,
                        // can work only 3 hours on 25th (task calendar has 12:00-13:00 as lunch time)
                        Availability : [ '12:00-16:00' ]
                    }
                ]
            });

            var calendar3 = Ext.create('Gnt.data.calendar.BusinessTime', {
                calendarId : 'Res6',

                parent : 'Project',

                data : [
                    {
                        Date         : new Date(2011, 6, 27),
                        IsWorkingDay : true,
                        // can work only 1 hours on 27th (task calendar is till 17:00)
                        Availability : [ '16:00-21:00' ]
                    }
                ]
            });

            var resourceStore = Ext.create("Gnt.data.ResourceStore", {
                proxy : { type : 'memory', reader : { type : 'json' } },

                data : [
                    {
                        Id   : 'Res1',
                        Name : 'John'
                    },
                    {
                        Id   : 'Res2',
                        Name : 'Mike'
                    },
                    // free resource, don't assign in initial data package
                    {
                        Id   : 'Res3',
                        Name : 'Fred'
                    },
                    {
                        Id   : 'Res4',
                        Name : 'Jay'
                    },
                    {
                        Id   : 'Res5',
                        Name : 'John',

                        CalendarId : 'Res5'
                    },
                    {
                        Id   : 'Res6',
                        Name : 'Jim',

                        CalendarId : 'Res6'
                    },
                    // free resource, don't assign in initial data package
                    {
                        Id   : 'Res7',
                        Name : 'Mark'
                    },
                    // free resource, don't assign in initial data package
                    {
                        Id   : 'Res8',
                        Name : 'Jake'
                    }
                ]
            });

            var assignmentStore = Ext.create("Gnt.data.AssignmentStore", {
                proxy : { type : 'memory', reader : { type : 'json' } },

                data : [
                    {
                        Id         : 'Assnmt1',
                        ResourceId : 'Res1',
                        TaskId     : 1,
                        Units      : 100
                    },
                    {
                        Id         : 'Assnmt2',
                        ResourceId : 'Res2',
                        TaskId     : 1,
                        Units      : 100
                    },
                    {
                        Id         : 'Assnmt3',
                        ResourceId : 'Res4',
                        TaskId     : 2
                    },
                    {
                        Id         : 'Assnmt4',
                        ResourceId : 'Res5',
                        TaskId     : 4,
                        Units      : 80
                    },
                    {
                        Id         : 'Assnmt5',
                        ResourceId : 'Res6',
                        TaskId     : 4,
                        Units      : 80
                    }
                ]
            });


            var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
                proxy : { type : 'memory', reader : { type : 'json' } },

                data : [
                    {
                        From : 1,
                        To   : 2,
                        Type : 2
                    },
                    {
                        From : 1,
                        To   : 3,
                        Type : 2
                    },
                    {
                        From : 2,
                        To   : 4,
                        Type : 2
                    },
                    {
                        From : 3,
                        To   : 4,
                        Type : 2
                    },
                    {
                        From : 4,
                        To   : 5,
                        Type : 2
                    }
                ]
            });

            var taskStore = Ext.create("Gnt.data.TaskStore", {
                dependencyStore : dependencyStore,
                resourceStore   : resourceStore,
                assignmentStore : assignmentStore,
                calendar        : calendar,

                proxy : { type : 'memory', reader : { type : 'json' } },

                root : {
                    expanded : false,

                    // do we need to specify the hours in tasks Start/End dates now?
                    children : [
                        {
                            Id        : 1,
                            leaf      : true,
                            StartDate : new Date(2011, 6, 1, 8, 0),
                            EndDate   : new Date(2011, 6, 4, 17, 0),

                            //Effort      : 32, // should be calculated by "normalization" process

                            SchedulingMode : 'FixedDuration'
                        },
                        {
                            Id : 123,

                            StartDate : new Date(2011, 6, 15),
                            EndDate   : new Date(2011, 6, 23),

                            children : [
                                {
                                    Id        : 2,
                                    leaf      : true,
                                    StartDate : new Date(2011, 6, 16, 11),
                                    EndDate   : new Date(2011, 6, 19, 17), // XXX EndDate should not be used? or do we normalize it?

                                    Effort : 28,   // XXX Effort should not be used? or do we normalize it?

                                    SchedulingMode : 'EffortDriven'
                                },
                                {
                                    Id        : 3,
                                    leaf      : true,
                                    StartDate : new Date(2011, 6, 18, 8),
                                    EndDate   : new Date(2011, 6, 21, 17)
                                }
                            ]
                        },
                        {
                            Id        : 4,
                            leaf      : true,
                            StartDate : new Date(2011, 6, 25, 8), // need to present for DynamicAssignment
                            EndDate   : new Date(2011, 6, 27, 17), // need to present for DynamicAssignment

                            CalendarId : 'Task4',

                            Effort : 16, // need to present for DynamicAssignment

                            SchedulingMode : 'DynamicAssignment'
                        },
                        // Milestone
                        {
                            Id        : 5,
                            leaf      : true,
                            StartDate : new Date(2011, 6, 28, 8),
                            EndDate   : new Date(2011, 6, 28, 8)
                        }
                    ]
                }
            });

            return {
                calendar        : calendar,
                taskStore       : taskStore,
                dependencyStore : dependencyStore,
                resourceStore   : resourceStore,
                assignmentStore : assignmentStore
            };
        },
        // eof `getSampleDataSet1` ========================================================================================================================


        // start of `getSampleDataSet2` ========================================================================================================================
        getSampleDataSet2 : function () {
            var Ext = this.Ext();
            var Date = this.global.Date;

            var calendar = Ext.create('Gnt.data.calendar.BusinessTime', {
                calendarId : 'Project'
            });

            var calendar1 = Ext.create('Gnt.data.calendar.BusinessTime', {
                calendarId : 'Task1',

                parent : 'Project',

                data : [
                    {
                        Date         : new Date(2011, 6, 2),
                        IsWorkingDay : true,
                        Availability : [ '11:00-16:00', '17:00-20:00' ]
                    },
                    {
                        Date         : new Date(2011, 6, 3),
                        IsWorkingDay : true,
                        Availability : [ '12:00-16:00' ]
                    }
                ]
            });

            var calendar2 = Ext.create('Gnt.data.calendar.BusinessTime', {
                calendarId : 'Res2',

                parent : 'Project',

                data : [
                    {
                        Date         : new Date(2011, 6, 1),
                        IsWorkingDay : true,
                        Availability : [ '13:00-16:00' ]
                    },
                    {
                        Date         : new Date(2011, 6, 2),
                        IsWorkingDay : true,
                        Availability : [ '09:00-14:00' ]
                    }
                ]
            });

            var calendar3 = Ext.create('Gnt.data.calendar.BusinessTime', {
                calendarId : 'Res3',

                parent : 'Project',

                data : [
                    {
                        Date         : new Date(2011, 6, 2),
                        IsWorkingDay : true,
                        Availability : [ '12:00-19:00' ]
                    },
                    {
                        Date : new Date(2011, 6, 4)
                    }
                ]
            });

            var calendar4 = Ext.create('Gnt.data.calendar.BusinessTime', {
                calendarId : 'Res4',

                parent : 'Project',

                data : [
                    {
                        Date         : new Date(2011, 6, 2),
                        IsWorkingDay : true,
                        Availability : [ '16:00-17:00' ]
                    },
                    {
                        Date         : new Date(2011, 6, 3),
                        IsWorkingDay : true,
                        Availability : [ '09:00-12:00', '13:00-14:00', '16:00-18:00' ]
                    },
                    {
                        Date         : new Date(2011, 6, 4),
                        IsWorkingDay : true,
                        Availability : [ '12:00-13:00' ]
                    }
                ]
            });


            var resourceStore = Ext.create("Gnt.data.ResourceStore", {
                proxy : { type : 'memory', reader : { type : 'json' } },

                data : [
                    {
                        Id         : 'Res1',
                        Name       : 'John',
                        CalendarId : 'Task1'
                    },
                    {
                        Id         : 'Res2',
                        Name       : 'Mike',
                        CalendarId : 'Res2'
                    },
                    {
                        Id         : 'Res3',
                        Name       : 'Fred',
                        CalendarId : 'Res3'
                    },
                    {
                        Id         : 'Res4',
                        Name       : 'Jay',
                        CalendarId : 'Res4'
                    }
                ]
            });

            var assignmentStore = Ext.create("Gnt.data.AssignmentStore", {
                proxy : { type : 'memory', reader : { type : 'json' } },
                data  : []
            });


            var taskStore = Ext.create("Gnt.data.TaskStore", {
                resourceStore   : resourceStore,
                assignmentStore : assignmentStore,
                calendar        : calendar,

                proxy : { type : 'memory', reader : { type : 'json' } },

                root : {
                    expanded : false,

                    // do we need to specify the hours in tasks Start/End dates now?
                    children : [
                        {
                            Id        : 1,
                            leaf      : true,
                            StartDate : new Date(2011, 6, 1, 8, 0),
                            EndDate   : new Date(2011, 6, 4, 17, 0),

                            SchedulingMode : 'FixedDuration',
                            CalendarId     : 'Task1'
                        }
                    ]
                }
            });

            return {
                calendar        : calendar,
                taskStore       : taskStore,
                resourceStore   : resourceStore,
                assignmentStore : assignmentStore
            };
        },
        // eof `getSampleDataSet2` ========================================================================================================================


        // start of `getSampleDataSet3` ========================================================================================================================
        getSampleDataSet3 : function () {
            var Ext = this.Ext();
            var Date = this.global.Date;

            var projectCalendar = Ext.create('Gnt.data.calendar.BusinessTime', {
                calendarId : 'Project'
            });

            var calendar1 = Ext.create('Gnt.data.calendar.BusinessTime', {
                calendarId : 'Resource1',

                parent : 'Project',

                data : [
                    {
                        Date         : new Date(2012, 6, 2),
                        IsWorkingDay : true,
                        Availability : [ '13:00-17:00' ]
                    },
                    {
                        Date         : new Date(2012, 6, 3),
                        IsWorkingDay : true,
                        Availability : [ '13:00-17:00' ]
                    },
                    {
                        Date         : new Date(2012, 7, 3),
                        IsWorkingDay : true,
                        Availability : [ '15:00-20:00' ]
                    }
                ]
            });

            var resourceStore = Ext.create("Gnt.data.ResourceStore", {
                proxy : { type : 'memory', reader : { type : 'json' } },

                data : [
                    {
                        Id         : 'Resource1',
                        Name       : 'Resource1',
                        CalendarId : 'Resource1'
                    }
                ]
            });

            var assignmentStore = Ext.create("Gnt.data.AssignmentStore", {
                proxy : { type : 'memory', reader : { type : 'json' } },
                data  : [
                    {
                        "Id"         : "Assignment1",
                        "TaskId"     : "Task1",
                        "ResourceId" : 'Resource1',
                        "Units"      : 100
                    }
                ]
            });


            var taskStore = Ext.create("Gnt.data.TaskStore", {
                resourceStore   : resourceStore,
                assignmentStore : assignmentStore,
                calendar        : projectCalendar,

                proxy : { type : 'memory', reader : { type : 'json' } },

                root : {
                    expanded : false,

                    children : [
                        {
                            Id           : "Task1",
                            leaf         : true,
                            StartDate    : new Date(2011, 6, 4, 8, 0),
                            Duration     : 4,
                            DurationUnit : 'h'
                        },
                        // this task should not have any assignments!
                        // testing behavior of task w/o assignments
                        {
                            Id           : "Task2",
                            leaf         : true,
                            StartDate    : new Date(2011, 6, 4, 8, 0),
                            Duration     : 4,
                            DurationUnit : 'h'
                        }
                    ]
                }
            });

            return {
                calendar        : projectCalendar,
                taskStore       : taskStore,
                resourceStore   : resourceStore,
                assignmentStore : assignmentStore
            };
        },
        // eof `getSampleDataSet3` ========================================================================================================================

        getLargeDataset : function () {
            var Date = this.global.Date;
            var Ext = this.Ext();

            var arr = [],
                i, j, k,
                cn, cn2,
                dt = new Date(2010, 0, 5);

            for (i = 1; i < 10; i++) {
                cn = [];
                for (j = 1; j < 10; j++) {
                    cn2 = [];
                    for (k = 1; k < 10; k++) {
                        var nbr = (100 * i) + (10 * j) + k;
                        cn2.push({
                            Id        : nbr,
                            Name      : 'Child task ' + nbr,
                            StartDate : dt,
                            EndDate   : Ext.Date.add(dt, Ext.Date.DAY, 2),
                            leaf      : true
                        });
                    }
                    cn.push({
                        Id        : 'Child task ' + String(i) + String(j),
                        Name      : 'Child task ' + String(i) + String(j),
                        StartDate : dt,
                        EndDate   : Ext.Date.add(dt, Ext.Date.DAY, 2),
                        expanded  : true,
                        children  : cn2
                    });
                }
                arr.push({
                    Id        : 'Root task #' + i,
                    Name      : 'Root task #' + i,
                    StartDate : new Date(2010, 0, 5),
                    EndDate   : dt,
                    children  : cn,
                    expanded  : true
                });
            }

            return arr;
        },

        getAllStoresDataSet : function (taskStoreData, dependenciesData, assignmentsData, resourcesData) {
            var Ext = this.Ext();

            var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
                data : dependenciesData || []
            });

            var resourceStore = Ext.create('Gnt.data.ResourceStore', {
                data : resourcesData || []
            });

            var assignmentStore = Ext.create('Gnt.data.AssignmentStore', {
                data : assignmentsData || []
            });

            var taskStore = Ext.create("Gnt.data.TaskStore", {
                dependencyStore : dependencyStore,
                assignmentStore : assignmentStore,
                resourceStore   : resourceStore,

                cascadeChanges : true,
                cascadeDelay   : 0,

                root : {
                    expanded : true,
                    children : taskStoreData
                }
            });

            return {
                taskStore       : taskStore,
                resourceStore   : resourceStore,
                assignmentStore : assignmentStore,
                dependencyStore : dependencyStore,
                depStore        : dependencyStore,
                root            : taskStore.getRootNode(),
                id              : function (id) { return taskStore.getNodeById(id); },
                task            : function (id) { return taskStore.getNodeById(id); },
                depId           : function (id) { return dependencyStore.getById(id); },
                dep             : function (id) { return dependencyStore.getById(id); },
                assId           : function (id) { return assignmentStore.getById(id); },
                resId           : function (id) { return resourceStore.getById(id); },
                idfy            : function (array) {
                    return Ext.Array.map(array, function (task) {
                        return task.getId();
                    });
                }
            };
        },

        getProjectData : function (noOfProjects) {

            var data = [];

            noOfProjects = noOfProjects || 1;

            for (var i = 0; i < noOfProjects; i++) {
                data.push(this.getProject('Project_' + i));
            }

            return data;
        },

        getProject : function (name, readOnly, allowDeps) {

            var data                = {
                Id                  : name,
                Cls                 : name,
                StartDate           : '2015-01-01',
                EndDate             : '2015-02-15',
                Name                : name,
                Note                : name + ' description',
                AllowDependencies   : !!allowDeps,
                ReadOnly            : !!readOnly,
                TaskType            : 'Gnt.model.Project',
                leaf                : false,
                expanded            : true,
                children            : [
                    {
                        Id          : name + '_task_1',
                        Cls         : name + '_task_1',
                        StartDate   : '2015-01-01',
                        EndDate     : '2015-01-15',
                        Name        : 'Task1',
                        leaf        : true
                    },
                    {
                        Id          : name + '_task_2',
                        Cls         : name + '_task_2',
                        StartDate   : '2015-01-01',
                        EndDate     : '2015-01-15',
                        Name        : 'Task2',
                        leaf        : true
                    },
                    {
                        Id          : name + '_task_3',
                        Cls         : name + '_task_3',
                        Name        : 'Task3',
                        leaf        : true
                    }
                ]
            };

            return data;
        }

    }
    // eof methods
});
