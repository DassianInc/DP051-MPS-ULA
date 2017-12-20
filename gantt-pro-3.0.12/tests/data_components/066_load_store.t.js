StartTest(function (t) {
    // in this test we verify, that subsequential tree store loads are not significantly slower than initial loading
    // this was the problem in 4.2.0, where treeStore.removeAll() was removing records one by one and
    // performing a full layout cycle after each
    
    var ID  = 0
    
    var generateTaskData = function (level, index, levelsRemains, numberOfChildren, date) {
        var data    = {
            Id          : ID++,
            Name        : 'Parent task ' + level + '/' + index,
            StartDate   : date,
            Duration    : 2,
            expanded    : true
        }
        
        var children    = []
        
        for (var i = 0; i < numberOfChildren; i++) 
            children.push(
                levelsRemains 
                    ? 
                generateTaskData(level + 1, i, levelsRemains - 1, numberOfChildren, Sch.util.Date.add(date, Sch.util.Date.DAY, 7))
                    :
                {
                    Id          : ID++,
                    Name        : 'Child task ' + (level + 1) + '/' + i,
                    StartDate   : date,
                    Duration    : 2,
                    leaf        : true
                }
            )
            
        data.children   = children
        
        return data
    }

    var taskStore = new Gnt.data.TaskStore({
        cascadeChanges : true,
        cascadeDelay   : 0,

        autoSync : false,
        autoLoad : false,

        proxy : {
            type        : 'memory',
            reader      : { type : 'json' }
        }
    });

    var gantt = t.getGantt({
        height          : 500,
        renderTo        : Ext.getBody(),
        taskStore       : taskStore,
        
        startDate       : new Date(2010, 0, 5),
        endDate         : new Date(2010, 2, 5),
        
        tbar            : [
            {
                text        : 'load',
                handler     : function () {
                    taskStore.proxy.data    = generateTaskData(0, 0, 2, 6, new Date(2010, 0, 5)).children
                    
//                    Ext.suspendLayouts()
                    console.time("Load")
                    taskStore.load()
                    console.timeEnd("Load")
//                    Ext.resumeLayouts()
                } 
            }
        ]
    });

    
    t.chain(
        function (next) {
            taskStore.proxy.data    = generateTaskData(0, 0, 2, 6, new Date(2010, 0, 5)).children
            
            var start       = new Date()
            
            t.livesOk(function () {
                taskStore.load()    
            })
            
            var duration1   = new Date() - start
            
            t.diag("Initial loading: " + duration1)
            
            next()
        },
        
        'waitFor(500)',
        
        function (next) {
            taskStore.proxy.data    = generateTaskData(0, 0, 2, 6, new Date(2010, 0, 5)).children

            var start       = new Date()
            
            // "beforebulkremove/bulkremovecomplete" were removed in 4.2.1, tree store re-load seems to be ok
            // keeping this test for 4.2.0 only now
            if (Ext.getVersion('extjs').isGreaterThanOrEqual('4.2.1.883'))
                taskStore.load()
            else
                t.firesOk({
                    observable      : taskStore,
                    events          : {
                        beforebulkremove        : 1,
                        bulkremovecomplete      : 1
                    },
                    during          : function () {
                        taskStore.load()    
                    },
                    desc            : "Beforebulkremove should be triggered, which will suspend the layouts"
                })

            var duration2   = new Date() - start
            
            t.diag("Re-loading: " + duration2)
        }
    )

})    
