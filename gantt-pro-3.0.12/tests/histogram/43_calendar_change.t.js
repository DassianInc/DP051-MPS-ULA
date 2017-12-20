StartTest(function (t) {

    t.it('The histogram reacts on resorce calendar changes properly', function (t) {
        var calendar    = t.getBusinessTimeCalendar({
            calendarId  : 'calendar'
        });

        var calendar1   = t.getBusinessTimeCalendar({
            calendarId  : 'calendar1'
        });

        var resourceStore   = t.getResourceStore({
            data            : [
                { Id: 'r1', Name: 'Linda', CalendarId : 'calendar' },
                { Id: 'r2', Name: 'foo' },
                { Id: 'r3', Name: 'bar' },
                { Id: 'r4', Name: 'smth' }
            ]
        });

        var assignmentStore = t.getAssignmentStore({
            data    : [{ Id: 'a1', ResourceId: 'r1', TaskId : 1 }]
        });

        var taskStore       = t.getTaskStore({
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            DATA            : [
                {
                    Id          : 1,
                    leaf        : true,
                    Name        : "Task1",
                    StartDate   : new Date(2013, 3, 2, 8),
                    Duration    : 4
                }
            ]
        });

        var histogram       = new Gnt.panel.ResourceHistogram({
            taskStore           : taskStore,
            resourceStore       : resourceStore,
            assignmentStore     : assignmentStore,
            startDate           : taskStore.getProjectStartDate(),
            endDate             : taskStore.getProjectEndDate(),
            renderTo            : Ext.getBody(),
            height              : 500
        });

        t.waitForRowsVisible(histogram, function () {
            t.willFireNTimes(histogram.getView().lockedView, "itemupdate", 6, "Locked view: proper number of times occured refresh of particular grid row");
            t.willFireNTimes(histogram.getView().normalView, "itemupdate", 6, "Normal view: proper number of times occured refresh of particular grid row");

            t.wontFire(histogram.getView().lockedView, "refresh", "Locked view: No total panel refresh occured");
            t.wontFire(histogram.getView().normalView, "refresh", "Normal view: No total panel refresh occured");

            // 1st itemupdate
            calendar.add({
                "Date"          : new Date(2013, 3, 4),
                Availability    : [ '09:00-13:00' ]
            });

            var resource = resourceStore.first();
            resource.setCalendar(calendar1); // 2nd itemupdate

            // no actual refresh will happen
            // because no resources use this calendar
            calendar.add({
                "Date"          : new Date(2013, 3, 5),
                Availability    : [ '09:00-13:00' ]
            });

            // 3rd itemupdate
            var day             = calendar1.add({
                "Date"          : new Date(2013, 3, 4),
                Availability    : [ '09:00-13:00' ]
            })[0];

            // 4th itemupdate
            day.setDate(new Date(2013, 3, 5));

            // 5th itemupdate
            calendar1.remove(day);

            // 6th itemupdate
            resource.setCalendar(null);

            calendar.add({
                "Date"          : new Date(2013, 3, 6),
                Availability    : [ '09:00-13:00' ]
            });

            calendar1.add({
                "Date"          : new Date(2013, 3, 6),
                Availability    : [ '09:00-13:00' ]
            });

        });
    });
});