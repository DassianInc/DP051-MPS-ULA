StartTest(function(t) {

    // #1875 this test checks that CrudManager resets phantom Segments ids for updated tasks

    t.it('CrudManager resets phantom Segments ids for updated tasks when resetIdsBeforeSync is enabled', function (t) {

        var crud    = new Gnt.data.CrudManager({
            resetIdsBeforeSync  : true,
            taskStore           : t.getTaskStore({
                DATA            : {
                    expanded    : true,
                    children    : [
                        {
                            Id          : 1,
                            StartDate   : new Date(2010, 0, 14),
                            Duration    : 10,
                            leaf        : true,
                            Segments    : [
                                {
                                    Id          : 1,
                                    StartDate   : new Date(2010, 0, 14),
                                    Duration    : 1
                                },
                                {
                                    Id          : 2,
                                    StartDate   : new Date(2010, 0, 18),
                                    Duration    : 9
                                }
                            ]
                        }
                    ]
                }
            })
        });

        var task    = crud.getTaskStore().getById(1);

        task.split(new Date(2010, 0, 19));

        var segments    = crud.getChangeSetPackage().tasks.updated[0].Segments;

        t.is(segments[0].Id, 1, '0th segment has correct id');
        t.is(segments[1].Id, 2, '1th segment has correct id');
        t.notOk(segments[2].Id, '2th segment has no id');
    });

});
