StartTest(function(t) {

    var D = Sch.util.Date,
        T1_START_DATE = new Date(2014, 5, 23), // 23.05.2014
        T1_END_DATE   = new Date(2014, 5, 30), // |-------|
        T2_START_DATE = new Date(2014, 5, 25), // 25.05.2014
        T2_END_DATE   = new Date(2014, 5, 27); //   |--|

    function getTaskStore(data) {
        data = data || [
            { leaf : true, Id : 1, StartDate : new Date(T1_START_DATE), EndDate : new Date(T1_END_DATE), DurationUnit : 'd'},
            { leaf : true, Id : 2, StartDate : new Date(T2_START_DATE), EndDate : new Date(T2_END_DATE), DurationUnit : 'd'}
        ];

        return new Gnt.data.TaskStore({
            proxy          : 'memory',
            cascadeChanges : true,
            calendar : new Gnt.data.Calendar({
                hoursPerDay         : 24,
                weekendFirstDay     : 6, // Saturday
                weekendSecondDay    : 0, // Sunday
                weekendsAreWorkdays : true,
                defaultAvailability : ['00:00-24:00']
            }), 
            root : {
                expanded : true,
                children : data
            }
        }); 
    }

    var store = getTaskStore();

    t.describe('Sibling task without predecessors/successors', function(t) {
        t.it('should calculate slack correctly initially', function(t) {
            var t1    = store.getById(1),
                t2    = store.getById(2);

            t.is(t1.getSlack(), 0);
            t.is(t2.getSlack(), D.getDurationInDays(t2.getEarlyStartDate(), t2.getLateStartDate()));
        });

        t.it('should re-calculate slack in case sibling task duration changes', function(t) {
            var t1         = store.getById(1),
                t2         = store.getById(2),
                t1Duration = t1.getDuration(D.DAY),
                t2Slack    = t2.getSlack();

            t.diag('Increasing duration by setDuration()');
            t1.setDuration(t1Duration + 1, D.Day);
            t.is(t1.getSlack(), 0);
            t.is(t2.getSlack(), t2Slack + 1);

            t.diag('Decreasing duration by setDuration()');
            t1.setDuration(t1Duration, D.DAY);
            t.is(t1.getSlack(), 0);
            t.is(t2.getSlack(), t2Slack);

            t.diag('Increasing duration by setEndDate()');
            t1.setEndDate(Sch.util.Date.add(t1.getEndDate(), D.DAY, 1));
            t.is(t1.getSlack(), 0);
            t.is(t2.getSlack(), t2Slack + 1);

            t.diag('Decreasing duration by setEndDate()');
            t1.setEndDate(Sch.util.Date.add(t1.getEndDate(), D.DAY, -1));
            t.is(t1.getSlack(), 0);
            t.is(t2.getSlack(), t2Slack);
        });
    }); 
});
