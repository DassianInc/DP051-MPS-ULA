StartTest(function(t) {

    // Here we check dependencies removing on task indent (#824)

    var taskStore = new Gnt.data.TaskStore({
        root        : {
            expanded : true,
            children : [{
                Id          : 1,
                expanded    : true,
                children    : [
                    {
                        Id          : 10,
                        leaf        : true
                    },
                    {
                        Id          : 11,
                        leaf        : true
                    },
                    {
                        Id          : 12,
                        leaf        : true
                    },
                    {
                        Id          : 13,
                        leaf        : true
                    },
                    {
                        Id          : 14,
                        leaf        : true
                    },
                    {
                        Id          : 15,
                        leaf        : true
                    }
                ]
            }]
        },
        dependencyStore : new Gnt.data.DependencyStore({
            data    : [
                { Id : 1, From    : 10, To      : 11 },
                { Id : 2, From    : 10, To      : 14 },
                { Id : 3, From    : 11, To      : 12 },  // ONLY THIS DEPENDENCY SHOULD BE DEEMED INVALID AFTER INDENT
                { Id : 4, From    : 11, To      : 13 },
                { Id : 5, From    : 12, To      : 15 }
            ]
        })
    });

    var task12  = taskStore.getNodeById(12);
    var depStore = taskStore.dependencyStore;

    t.ok(task12.getAllDependencies().length, "Task 12 has dependencies");

    t.diag("Indent Task 12");

    task12.indent();

    t.ok(depStore.getById(1), "Dep #1 still valid");
    t.ok(depStore.getById(2), "Dep #2 still valid");
    t.notOk(depStore.getById(3), "Dep #3 invalid");
    t.ok(depStore.getById(4), "Dep #4 still valid");
    t.ok(depStore.getById(5), "Dep #5 still valid");
});
