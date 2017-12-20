StartTest(function (t) {


    t.it('Should find dependencies rendered', function (t) {
        var dependencyStore = new Gnt.data.DependencyStore({
            autoLoad : true,
            proxy    : {
                type : 'memory',
                data : [
                    {
                        "From" : 1,
                        "To"   : 2,
                        "Type" : 2,
                        "Id"   : 1
                    },
                    {
                        "From" : 3,
                        "To"   : 2,
                        "Type" : 3,
                        "Id"   : 2
                    },
                    {
                        "From" : 3,
                        "To"   : 4,
                        "Type" : 2,
                        "Id"   : 3
                    }
                ]
            }
        });

        var gantt = t.getGantt({
            renderTo       : Ext.getBody(),
            animate        : false,
            cascadeChanges : true,
            rootVisible    : true,
            startDate      : new Date(2010, 0, 1),
            endDate        : new Date(2010, 4, 1),
            taskStore      : new Gnt.data.TaskStore({
                root : {
                    expanded : true,
                    children : [
                        {
                            "EndDate"           : null,
                            "BaselineEndDate"   : "2010-02-01",
                            "Id"                : 1,
                            "Name"              : "Planning",
                            "PercentDone"       : 40,
                            "Priority"          : 1,
                            "Responsible"       : "",
                            "StartDate"         : "2010-01-18",
                            "BaselineStartDate" : "2010-01-13",
                            "expanded"          : true,
                            "TaskType"          : "Important",
                            "children"          : [
                                {
                                    "BaselineEndDate"   : "2010-01-28",
                                    "Id"                : 11,
                                    "leaf"              : true,
                                    "Name"              : "Investigate",
                                    "PercentDone"       : 30,
                                    "TaskType"          : "LowPrio",
                                    "Priority"          : 1,
                                    "Duration"          : 0,
                                    "DurationUnit"      : "d",
                                    "StartDate"         : "2010-01-18",
                                    "parentId"          : 1,
                                    "BaselineStartDate" : "2010-01-20"
                                },
                                {
                                    "BaselineEndDate"   : "2010-02-01",
                                    "Id"                : 12,
                                    "leaf"              : true,
                                    "Duration"          : 0,
                                    "DurationUnit"      : "d",
                                    "Name"              : "Assign resources",
                                    "PercentDone"       : 0,
                                    "Priority"          : 0,
                                    "parentId"          : 1,
                                    "Responsible"       : "",
                                    "StartDate"         : "2010-01-28",
                                    "BaselineStartDate" : "2010-01-25"
                                },
                                {
                                    "BaselineEndDate"   : "2010-02-01",
                                    "Id"                : 13,
                                    "leaf"              : true,
                                    "Name"              : "Assign resources",
                                    "PercentDone"       : 0,
                                    "Priority"          : 0,
                                    "parentId"          : 1,
                                    "Responsible"       : "",
                                    "StartDate"         : "2010-01-28",
                                    "BaselineStartDate" : "2010-01-25"
                                },
                                {
                                    "BaselineEndDate"   : "2010-02-01",
                                    "Id"                : 14,
                                    "leaf"              : true,
                                    "Duration"          : 0,
                                    "Name"              : "Assign resources",
                                    "PercentDone"       : 0,
                                    "Priority"          : 0,
                                    "parentId"          : 1,
                                    "Responsible"       : "",
                                    "StartDate"         : "2010-01-29",
                                    "BaselineStartDate" : "2010-01-25"
                                }
                            ]
                        }
                    ]
                }
            })
        });

        gantt.dependencyStore.add([
            new Gnt.model.Dependency({
                From : 11,
                To   : 12,
                Type : 2
            }),

            new Gnt.model.Dependency({
                From : 11,
                To   : 14,
                Type : 1
            }),

            // This target task has no end date, should not break anything
            new Gnt.model.Dependency({
                From : 11,
                To   : 13,
                Type : 2
            })
        ]);

        t.waitForTasksAndDependenciesToRender(gantt, function () {
            gantt.destroy();
        })
    })

    t.it('Should update dependencies after store is sorted', function (t) {

        var dependencyStore = new Gnt.data.DependencyStore({
            autoLoad : true,
            proxy    : {
                type : 'memory',
                data : [
                    {
                        "From" : 1,
                        "To"   : 2,
                        "Type" : 2,
                        "Id"   : 1
                    },
                    {
                        "From" : 3,
                        "To"   : 2,
                        "Type" : 3,
                        "Id"   : 2
                    },
                    {
                        "From" : 3,
                        "To"   : 4,
                        "Type" : 2,
                        "Id"   : 3
                    }
                ]
            }
        });

        var gantt2 = t.getGantt({
            dependencyStore : dependencyStore,
            cls             : 'two',
            taskStore       : new Gnt.data.TaskStore({
                root : {
                    expanded : true,
                    children : [
                        {
                            "EndDate"   : "2010-02-02",
                            "Id"        : 1,
                            "Name"      : "Parent",
                            "StartDate" : "2010-01-18",
                            "expanded"  : true,
                            "children"  : [
                                {
                                    "EndDate"   : "2010-01-28",
                                    "Id"        : 2,
                                    "leaf"      : true,
                                    "Name"      : "Child 1",
                                    "StartDate" : "2010-01-18"
                                },
                                {
                                    "EndDate"   : "2010-02-02",
                                    "Id"        : 3,
                                    "leaf"      : true,
                                    "Name"      : "Child 2",
                                    "StartDate" : "2010-01-28"
                                },
                                {
                                    "EndDate"   : "2010-02-02",
                                    "Id"        : 4,
                                    "leaf"      : true,
                                    "Name"      : "Child 3",
                                    "StartDate" : "2010-01-25"
                                },
                                {
                                    "EndDate"   : "2010-02-02",
                                    "Id"        : 5,
                                    "leaf"      : true,
                                    "Name"      : "Child 4",
                                    "StartDate" : "2010-02-02"
                                }
                            ]
                        }
                    ]
                }
            })
        });

        gantt2.render(Ext.getBody());

        var taskStore = gantt2.taskStore;

        t.chain(
            { waitForTasksAndDependenciesToRender : gantt2 },

            { waitFor : 100 },

            function (next) {

                gantt2.el.select('.sch-dependency').remove();

                t.firesOnce(gantt2.getDependencyView(), 'refresh');

                taskStore.sort('Id', 'DESC');
                next();

            },
            { waitForSelector : '.two .sch-dependency' }
        );
    });
})
