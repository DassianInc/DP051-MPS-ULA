StartTest(function (t) {

    new Gnt.data.Calendar({ calendarId : 'elapsed', weekendsAreWorkdays : true });

    var taskStore   = t.getTaskStore({
        DATA        : [
            {
                Id          : 'parent',
                StartDate   : '2015-06-05',
                EndDate     : '2015-06-08',
                children    : [
                    {
                        Id          : 'child1',
                        StartDate   : '2015-06-05',
                        EndDate     : '2015-06-08',
                        CalendarId  : 'elapsed',
                        leaf        : true
                    }
                ]
            }
        ],

        calendar : new Gnt.data.Calendar({ calendarId : 'general' })
    });


    t.it('Assert Parent Calendar update', function (t) {
        var parent  = taskStore.getNodeById('parent'),
            child   = taskStore.getNodeById('child1');

        t.is(parent.getDuration(), 1, 'Parent has project calendar which gives duration 1');
        t.is(child.getDuration(), 3, 'Child has duration 3 because it has an elapsed calendar');

        t.is(parent.getStartDate(), new Date(2015, 5, 5), 'Parent startdate is correct');
        t.is(parent.getEndDate(), new Date(2015, 5, 8), 'Parent enddate is correct');

        child.setStartDate(new Date(2015, 5, 6), false);

        t.is(parent.getDuration(), 0, 'Parent has project calendar which gives duration 0');
        t.is(parent.getStartDate(), new Date(2015, 5, 6), 'Parent startdate has changed');
        t.is(parent.getEndDate(), new Date(2015, 5, 8), 'Parent enddate has not changed');

        t.is(parent.isMilestone(), false, 'Then parent is not a milestone');

        parent.setCalendar('elapsed');

        t.is(parent.getDuration(), 2, 'Parent has elapsed calendar which gives duration 2');
        t.is(child.getDuration(), 2, 'Child has duration 2 because it has an elapsed calendar');

        t.is(parent.getStartDate(), new Date(2015, 5, 6), 'Parent startdate has not changed');
        t.is(parent.getEndDate(), new Date(2015, 5, 8), 'Parent enddate has not changed');
    });

});