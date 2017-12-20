StartTest(function(t) {

    var setup = function (config) {
        config          = config || {};

        var calendar    = new Gnt.data.Calendar({
            data        : config.days || [
                {
                    'Date' : '2015-03-27'
                }
            ]
        });

        var taskStore   = t.getTaskStore({
            calendar    : calendar,
            DATA        : config.tasks || [
                {
                    Id          : 1,
                    StartDate   : '2015-03-25',
                    EndDate     : '2015-03-28',
                    Duration    : 3,
                    leaf        : true
                },
                {
                    Id          : 2,
                    StartDate   : '2015-03-25',
                    EndDate     : '2015-03-28',
                    Duration    : 3,
                    leaf        : true
                },
                {
                    Id          : 3,
                    StartDate   : '2015-03-25',
                    EndDate     : '2015-03-28',
                    Duration    : 3,
                    leaf        : true
                }
            ]
        });

        return taskStore;
    };

    t.it('taskStore.adjustToCalendar adjusts single task provided', function (t) {
        var taskStore   = setup();

        var task1 = taskStore.getNodeById(1);
        var task2 = taskStore.getNodeById(2);
        var task3 = taskStore.getNodeById(3);

        t.is(task1.getStartDate(), new Date(2015, 2, 25), 'task1 initially has unadjusted start');
        t.is(task1.getEndDate(), new Date(2015, 2, 28), 'task1 initially has unadjusted finish');
        t.is(task2.getStartDate(), new Date(2015, 2, 25), 'task2 initially has unadjusted start');
        t.is(task2.getEndDate(), new Date(2015, 2, 28), 'task2 initially has unadjusted finish');
        t.is(task3.getStartDate(), new Date(2015, 2, 25), 'task3 initially has unadjusted start');
        t.is(task3.getEndDate(), new Date(2015, 2, 28), 'task3 initially has unadjusted finish');

        taskStore.adjustToCalendar(task1);

        t.is(task1.getStartDate(), new Date(2015, 2, 25), 'task1 eventually has proper start');
        t.is(task1.getEndDate(), new Date(2015, 2, 31), 'task1 eventually has ADJUSTED finish');
        t.is(task2.getStartDate(), new Date(2015, 2, 25), 'task2 eventually has unadjusted start');
        t.is(task2.getEndDate(), new Date(2015, 2, 28), 'task2 eventually has unadjusted finish');
        t.is(task3.getStartDate(), new Date(2015, 2, 25), 'task3 eventually has unadjusted start');
        t.is(task3.getEndDate(), new Date(2015, 2, 28), 'task3 eventually has unadjusted finish');

        taskStore.calendar.destroy();
        taskStore.destroy();
    });

    t.it('taskStore.adjustToCalendar adjusts multiple tasks provided', function (t) {
        var taskStore   = setup();

        var task1 = taskStore.getNodeById(1);
        var task2 = taskStore.getNodeById(2);
        var task3 = taskStore.getNodeById(3);

        t.is(task1.getStartDate(), new Date(2015, 2, 25), 'task1 initially has unadjusted start');
        t.is(task1.getEndDate(), new Date(2015, 2, 28), 'task1 initially has unadjusted finish');
        t.is(task2.getStartDate(), new Date(2015, 2, 25), 'task2 initially has unadjusted start');
        t.is(task2.getEndDate(), new Date(2015, 2, 28), 'task2 initially has unadjusted finish');
        t.is(task3.getStartDate(), new Date(2015, 2, 25), 'task3 initially has unadjusted start');
        t.is(task3.getEndDate(), new Date(2015, 2, 28), 'task3 initially has unadjusted finish');

        taskStore.adjustToCalendar([task1, task3]);

        t.is(task1.getStartDate(), new Date(2015, 2, 25), 'task1 eventually has proper start');
        t.is(task1.getEndDate(), new Date(2015, 2, 31), 'task1 eventually has ADJUSTED finish');
        t.is(task2.getStartDate(), new Date(2015, 2, 25), 'task2 eventually has unadjusted start');
        t.is(task2.getEndDate(), new Date(2015, 2, 28), 'task2 eventually has unadjusted finish');
        t.is(task3.getStartDate(), new Date(2015, 2, 25), 'task3 eventually has unadjusted start');
        t.is(task3.getEndDate(), new Date(2015, 2, 31), 'task3 eventually has ADJUSTED finish');

        taskStore.calendar.destroy();
        taskStore.destroy();
    });

    t.it('taskStore.adjustToCalendar adjusts all tasks if tasks omitted', function (t) {
        var taskStore   = setup();

        var task1 = taskStore.getNodeById(1);
        var task2 = taskStore.getNodeById(2);
        var task3 = taskStore.getNodeById(3);

        t.is(task1.getStartDate(), new Date(2015, 2, 25), 'task1 initially has unadjusted start');
        t.is(task1.getEndDate(), new Date(2015, 2, 28), 'task1 initially has unadjusted finish');
        t.is(task2.getStartDate(), new Date(2015, 2, 25), 'task2 initially has unadjusted start');
        t.is(task2.getEndDate(), new Date(2015, 2, 28), 'task2 initially has unadjusted finish');
        t.is(task3.getStartDate(), new Date(2015, 2, 25), 'task3 initially has unadjusted start');
        t.is(task3.getEndDate(), new Date(2015, 2, 28), 'task3 initially has unadjusted finish');

        taskStore.adjustToCalendar();

        t.is(task1.getStartDate(), new Date(2015, 2, 25), 'task1 eventually has proper start');
        t.is(task1.getEndDate(), new Date(2015, 2, 31), 'task1 eventually has ADJUSTED finish');
        t.is(task2.getStartDate(), new Date(2015, 2, 25), 'task2 eventually has unadjusted start');
        t.is(task2.getEndDate(), new Date(2015, 2, 31), 'task2 eventually has ADJUSTED finish');
        t.is(task3.getStartDate(), new Date(2015, 2, 25), 'task3 eventually has unadjusted start');
        t.is(task3.getEndDate(), new Date(2015, 2, 31), 'task3 eventually has ADJUSTED finish');

        taskStore.calendar.destroy();
        taskStore.destroy();
    });

});
