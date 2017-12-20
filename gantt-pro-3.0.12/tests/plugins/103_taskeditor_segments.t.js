StartTest(function(t) {

    // Ensures that duration change for a segmented task does not affect the master task instantly #2036

    var taskEditor  = new Gnt.plugin.TaskEditor();

    var Ext         = t.getExt();

    var g           = t.getGantt({
        taskStore           : t.getTaskStore({
            DATA : [
                {
                    leaf        : true,
                    StartDate   : '2015-05-11',
                    Segments    : [
                        {
                            StartDate   : '2015-05-11',
                            Duration    : 1
                        },
                        {
                            StartDate   : '2015-05-13',
                            Duration    : 1
                        }
                    ]
                }
            ]
        }),
        startDate           : null,
        endDate             : null,
        renderTo            : Ext.getBody(),
        forceFit            : true,
        lockedGridConfig    : { collapsed : true },
        plugins             : taskEditor
    });

    var taskStore   = g.getTaskStore();
    var task        = taskStore.getRoot().firstChild;

    t.chain(
        { dblclick : '.sch-gantt-item' },

        { waitForComponentVisible : taskEditor },

        function () {
            t.cq1('durationfield').setValue({ value : 7, unit : 'd' });

            t.isnt(task.getDuration(), 7, 'Duration is not changed');
        }
    );
});
