StartTest(function(t) {
    
    var taskStore = new Gnt.data.TaskStore({
        cascadeChanges : true,
        cascadeDelay : 0,

        proxy       : {
            type    : 'memory',
            reader  : { type    : 'json' }
        },
        
        root        : {
            expanded    : false,
            
            children    : [
                {
                    Id          : 1,
                    leaf        : true
                },
                {
                    Id          : 123,
                    expanded    : true,
                    
                    children    : [
                        {
                            Id          : 2,
                            leaf        : true
                        },
                        {
                            Id          : 3,
                            leaf        : true
                        }
                    ]
                },
                {
                    Id          : 4,
                    leaf        : true
                },
                {
                    Id          : 5,
                    leaf        : true
                },
                {
                    Id          : 6,
                    leaf        : true
                }
            ]
        }
    });
    
    var task    = function (id) {
        return taskStore.getNodeById(id)
    }
    
    // checking that "isAbove" works correctly, consult the order of tasks above
    t.ok(task(1).isAbove(task(123)))
    t.ok(task(1).isAbove(task(2)))
    t.ok(task(1).isAbove(task(3)))
    t.ok(task(1).isAbove(task(5)))
    
    t.ok(task(123).isAbove(task(2)))
    t.ok(task(123).isAbove(task(3)))
    
    t.notOk(task(1).isAbove(task(1)))
    t.notOk(task(123).isAbove(task(1)))
    t.notOk(task(2).isAbove(task(1)))
    t.notOk(task(2).isAbove(task(123)))
    t.notOk(task(3).isAbove(task(123)))
})    
