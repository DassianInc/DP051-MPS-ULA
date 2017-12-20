StartTest(function(t) {
    // In this test we'll start with root node collapsed, and expand it after render. 
    // See https://www.assembla.com/spaces/bryntum/support/tickets/260
    
    var generateTaskData = function() {
        var arr = [],
            i, j, k,
            cn, cn2,
            dt = new Date(2010, 0, 5);
            
        var counter     = 0;

        for (var i = 1; i <= 10; i++) {
            cn = [];
            for (j = 1; j <= 10; j++) {
                cn.push({
                    Id          : counter++,
                    Name        : 'Child task ' + String(i) + ' / ' + String(j),
                    StartDate   : dt,
                    EndDate     : Ext.Date.add(dt, Ext.Date.DAY, 2),
                    leaf        : true
                });
            }
            arr.push({  
                Id          : counter++,
                Name        : 'Root task #' + i,
                StartDate   : new Date(2010, 0, 5),
                EndDate     : dt,
                children    : cn,
                expanded    : false
            });
        }

        return arr;
    };


    var taskStore = Ext.create("Gnt.data.TaskStore", {
        // sorting slow downs the initial loading/rendering time for big trees
        sortOnLoad  : false,
        root : {
            expanded : false
        },
        proxy       : {
            type : 'memory'
        }
    });

    var gantt = t.getGantt({
        taskStore   : taskStore,
        width       : 400,
        columns: [
            {
                xtype       : 'treecolumn',
                header      : 'Tasks',
                sortable    : true,
                dataIndex   : 'Name',
                width       : 150
            }
        ],
        plugins : ['bufferedrenderer']
    });

    
    var lockedView          = gantt.lockedGrid.getView()
    var schedulingView      = gantt.getSchedulingView()
    
    t.chain(
        {
            waitFor : 'selector',
            args    : '.sch-ganttview'
        },
        function (next) {
            var schedulingViewEl    = schedulingView.el
            
            t.selectorNotExists(lockedView.itemSelector, 'No rows rendered');
            
            taskStore.proxy.data = generateTaskData(200);
            taskStore.load();
            taskStore.getRootNode().expand();
            t.selectorExists(lockedView.itemSelector, 'Rows rendered after manual root node expand');
        }
    )

    gantt.render(Ext.getBody());
})    

