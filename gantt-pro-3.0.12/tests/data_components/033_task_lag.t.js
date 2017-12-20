/* global root,task,taskStore,dependencyStore */
/* jshint withstmt:true */
StartTest(function(t) {

    var getDataSet = function () {
        return t.getAllStoresDataSet(
            [
                {
                    Id          : 1,
                    leaf        : true,
                    StartDate   : new Date(2011, 5, 1),
                    EndDate     : new Date(2011, 5, 3)
                },
                {
                    Id          : 123,
                    StartDate   : new Date(2011, 5, 15),
                    EndDate     : new Date(2011, 5, 23),
                    children    : [
                        {
                            Id          : 2,
                            leaf        : true,
                            StartDate   : new Date(2011, 5, 16),
                            EndDate     : new Date(2011, 5, 22)
                        },
                        {
                            Id          : 3,
                            leaf        : true,
                            StartDate   : new Date(2011, 5, 18),
                            EndDate     : new Date(2011, 5, 22)
                        }
                    ]
                },
                {
                    Id          : 4,
                    leaf        : true,
                    StartDate   : new Date(2011, 5, 6),
                    EndDate     : new Date(2011, 5, 8)
                },
                {
                    Id          : 5,
                    leaf        : true,
                    StartDate   : new Date(2011, 5, 28),
                    EndDate     : new Date(2011, 5, 30)
                },
                {
                    Id          : 6,
                    leaf        : true,
                    StartDate   : new Date(2011, 5, 28),
                    EndDate     : new Date(2011, 5, 28)
                },
                {
                    Id          : 7,
                    leaf        : true,
                    StartDate   : new Date(2011, 5, 28),
                    EndDate     : new Date(2011, 5, 28)
                }
            ],
            [
                {
                    From        : 1,
                    To          : 4,
                    Type        : 2,
                    Lag         : 1,
                    Id          : 1
                },
                {
                    From        : 2,
                    To          : 3,
                    Type        : 2,
                    Lag         : -2,
                    Id          : 2
                },
                {
                    From        : 6,
                    To          : 7,
                    Type        : 0,
                    Lag         : 1,
                    Id          : 3
                },
                {
                    From        : 5,
                    To          : 7,
                    Type        : 0,
                    Lag         : 2,
                    Id          : 4
                }
            ]
        )
    }

    t.it('Part 1', function (t) {
        with (getDataSet()) {
            t.ok(root.childNodes.length, 'There are some tasks')

            //======================================================================================================================================================================================================================================================
            t.diag('Constraints')

            // Simple end-to-start scenario between two tasks: task(1) ends on Thursday, 1 day lag means task(4) should be constrained to Saturday
            // and when changing start date it will be bumped to Monday (see below)
            t.isDeeply(task(4).getIncomingDependenciesConstraintContext(), {
                startDate           : new Date(2011, 5, 4),
                endDate             : null,
                constrainingTask    : task(1)
            },  "Correct constrain context for `task(4)`")

            // Simple end-to-start scenario between two tasks: task(2) ends on Monday, -2 day lag means task(4) should be bumped to Monday
            t.isDeeply(task(3).getIncomingDependenciesConstraintContext(), {
                startDate           : new Date(2011, 5, 20),
                endDate             : null,
                constrainingTask    : taskStore.getNodeById(2)
            },  "Correct constrain context for `task(3)`, negative lag ok")

            // Multiple start-to-start scenario
            t.isDeeply(task(7).getIncomingDependenciesConstraintContext(), {
                startDate           : new Date(2011, 5, 30),
                endDate             : null,
                constrainingTask    : taskStore.getNodeById(5)
            },  "Correct constrain context for `task(7)`")

            //======================================================================================================================================================================================================================================================
            t.diag('Cascading')

            task(1).setStartDate(Ext.Date.add(task(1).getStartDate(), Ext.Date.HOUR, 36), true);
            taskStore.cascadeChangesForTask(task(1));

            t.isDateEqual(task(4).getStartDate(), new Date(2011, 5, 7, 12), 'Correct dates for `task(4)` after cascade, hour amount intact');

            task(1).setStartDate(Ext.Date.add(task(1).getStartDate(), Ext.Date.HOUR, 12), true);
            taskStore.cascadeChangesForTask(task(1));

            t.isDateEqual(task(4).getStartDate(), new Date(2011, 5, 8), 'Correct dates for `task(4)` after cascade');

            // Change to Finish-to-Start link and set 3 day lag
            dependencyStore.getById(4).set({
                Type    : 2,
                Lag     : 3
            });
            taskStore.cascadeChangesForTask(task(5));

            t.isDateEqual(task(7).get('StartDate'), new Date(2011, 6, 5), 'Correct dates for `task(7)` after updating dependency type');

            // Change to Finish-to-Start link and set 3 day lag
            dependencyStore.getById(4).set({
                Type    : 2,
                Lag     : -2
            });
            dependencyStore.remove(dependencyStore.getById(3));

            task(5).setStartEndDate(new Date(2011, 5, 24), new Date(2011, 5, 28));
            taskStore.cascadeChangesForTask(task(5));

            // Now task(5) ends on Tuesday 00:00, -2 means task(7) should skip the weekends backwards and start on previous Friday
            t.isDateEqual(task(7).get('StartDate'), new Date(2011, 5, 24), 'Correct dates for `task(7)` after updating dependency type');
        }
    })

    t.it('Part 2', function (t) {
        with (getDataSet()) {
            task(4).alignByIncomingDependencies()

            t.is(task(4).getStartDate(), new Date(2011, 5, 6), 'Constraining task actually moves it over the weekend')
        }
    })

    t.it('The `dependenciesCalendar` option should work correctly', function (t) {
        Ext.create('Gnt.data.Calendar', { calendarId : 'fullWeek', weekendsAreWorkdays : true });

        with (t.getAllStoresDataSet(
            [
                {
                    Id          : 1,
                    leaf        : true,
                    StartDate   : new Date(2013, 11, 6),
                    Duration    : 1,
                    CalendarId  : 'fullWeek'
                },
                {
                    Id          : 2,
                    leaf        : true,
                    StartDate   : new Date(2013, 11, 28),
                    Duration    : 2,
                    CalendarId  : 'fullWeek'
                },
                {
                    Id          : 3,
                    leaf        : true,
                    StartDate   : new Date(2013, 11, 6),
                    Duration    : 1,
                    CalendarId  : 'fullWeek'
                },
                {
                    Id          : 4,
                    leaf        : true,
                    StartDate   : new Date(2013, 11, 28),
                    Duration    : 1
                }
            ],
            [
                {
                    From        : 1,
                    To          : 2,
                    Lag         : 2
                },
                {
                    From        : 3,
                    To          : 4,
                    Lag         : 2
                }
            ]
        )) {
            taskStore.dependenciesCalendar  = 'source'

            taskStore.cascadeChangesForTask(task(1))

            t.is(task(2).getStartDate(), new Date(2013, 11, 9), 'The lag should be calculated according to `fullWeek` calendar')


            taskStore.dependenciesCalendar  = 'target'

            taskStore.cascadeChangesForTask(task(3))

            t.is(task(4).getStartDate(), new Date(2013, 11, 11), 'The lag should be calculated according to project calendar and skip weeekends')
        }
    })

})
