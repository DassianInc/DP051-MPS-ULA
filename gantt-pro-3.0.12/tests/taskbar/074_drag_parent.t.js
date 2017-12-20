StartTest(function(t) {
    
    var gantt   = t.getGantt({    
        width               : 500,
        lockedGridConfig    : { width : 100},
        forceFit            : true,
        allowParentTaskMove : true,
        
        renderTo            : Ext.getBody(),
        
        taskStore           : new Gnt.data.TaskStore({
            proxy       : 'memory'
        })
    });

    var date    = Ext.Date.add(gantt.getStart(), Ext.Date.DAY, 10);

    var parent  = new Gnt.model.Task({
        StartDate   : date,
        EndDate     : date,
        children    : [
            {
                StartDate   : date,
                EndDate     : date
            }
        ]
    });
    gantt.taskStore.getRootNode().appendChild(parent)

    t.willFireNTimes(gantt, 'beforetaskdrag', 1)
    t.willFireNTimes(gantt, 'aftertaskdrop', 1)

    t.chain(
        { waitFor : 'rowsVisible', args : gantt.normalGrid },
        
        // this waitfor is required only for index-no-ui mode and only in Chrome
        { waitFor : 50 },
        
        { action : 'drag', target : '.sch-gantt-milestone-diamond-ct', by : [100, 0] },
        
        function() {
            t.isGreater(parent.getStartDate(), date, 'Parent task moved ok');
        }
    );
});    
