StartTest(function(t) {

    // #2730 - Incorrect splitting of tasks having scheduling mode other than "Normal"

    t.it('Task end date is aligned w/ the last segment end after split (for not "Normally" scheduled tasks)', function (t) {

        var taskStore   = t.getTaskStore({
            DATA        : [
                {
                    leaf           : true,
                    Id             : 'FixedDuration',
                    StartDate      : "2016-03-22",
                    Duration       : 2,
                    SchedulingMode : 'FixedDuration'
                },
                {
                    leaf           : true,
                    Id             : 'DynamicAssignment',
                    StartDate      : "2016-03-22",
                    Duration       : 2,
                    SchedulingMode : 'DynamicAssignment'
                }
            ]
        });

        // split both tasks and ensure end date is correct
        taskStore.getRoot().eachChild(function (task) {
            task.split(new Date(2016, 2, 23));

            t.is(task.getStartDate(), new Date(2016, 2, 22), 'correct ' + task.getId() + ' task start date');
            t.is(task.getEndDate(), new Date(2016, 2, 25), 'correct ' + task.getId() + ' task end date');
            t.is(task.getDuration(), 2, 'correct ' + task.getId() + ' task duration');

            t.is(task.getFirstSegment().getStartDate(), task.getStartDate(), 'correct ' + task.getId() + ' first segment start date');
            t.is(task.getLastSegment().getEndDate(), task.getEndDate(), 'correct ' + task.getId() + ' last segment end date');
        });

    });

});
