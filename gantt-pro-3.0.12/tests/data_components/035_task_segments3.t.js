StartTest(function(t) {

    // Here we check that a segment methods do not get results of a task having the same Id

    t.it('Segment id can match task id', function (t) {
        var resourceStore = t.getResourceStore({
            data : [
                { Id : 1 },
                { Id : 2 },
                { Id : 3 }
            ]
        });

        var assignmentStore = t.getAssignmentStore({
            data : [
                { Id : 1, ResourceId : 1, TaskId : 1 },
                { Id : 2, ResourceId : 2, TaskId : 1 },
                { Id : 3, ResourceId : 3, TaskId : 1 }
            ]
        });

        var taskStore       = t.getTaskStore({
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            DATA            : [
                {
                    Id          : 1,
                    StartDate   : '2012-09-03',
                    Duration    : 9,
                    leaf        : true
                },
                {
                    Id          : 2,
                    StartDate   : '2012-09-03',
                    Segments    : [
                        {
                            Id          : 1,
                            StartDate   : '2012-09-03',
                            Duration    : 2
                        },
                        {
                            Id          : 2,
                            StartDate   : '2012-09-06',
                            Duration    : 3
                        }
                    ],
                    leaf        : true
                }
            ]
        });

        var segment = taskStore.getNodeById(2).getSegment(0);
        var task    = taskStore.getNodeById(1);

        // methods to assert
        var methods = [
            'getAssignments',
            // 0th is method name and further elements are arguments
            ['getAssignmentFor', 1],
            ['getAssignmentFor', 2],
            ['getAssignmentFor', 3],
            ['isAssignedTo', 1],
            ['isAssignedTo', 2],
            ['isAssignedTo', 3],
            'getResources'
        ];

        // ensure that method result do not match
        for (var i = 0; i < methods.length; i++) {
            var method  = methods[i],
                args    = [];

            if (Ext.isArray(methods[i])) {
                method  = method[0];
                args    = Ext.Array.slice(methods[i], 1);
            }

            t.notOk( t.compareObjects(segment[method].apply(segment, args), task[method].apply(task, args)), method +'('+args.join(',')+') results do not match' );
        }
    });
});
