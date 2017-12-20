StartTest(function(t) {
    // in this test we'll be reproducing the #1082 and #1083
    
    var taskStore = Ext.create("Gnt.data.TaskStore", {
        // sorting slow downs the initial loading/rendering time for big trees
        sortOnLoad  : false,
        root : {
            expanded        : true
        },
        proxy       : {
            type : 'memory'
        }
    });
    
    taskStore.proxy.data        = t.getLargeDataset();
    
    taskStore.load();

    var gantt = t.getGantt({
        renderTo    : Ext.getBody(),
        taskStore   : taskStore,
        width       : 700,
        rightLabelField : 'Name',
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

    
    var lockedView          = gantt.lockedGrid.getView();
    var schedulingView      = gantt.getSchedulingView();
    
    var lockedNode          = function (record) {
        return lockedView.getNode(record)
    };
    
    var scrollHeight, viewEl, newTask, newTask1;
    
    t.chain(
        {
            waitFor     : 'selector',
            args        : '.sch-ganttview'
        },
        function (next) {
            viewEl              = schedulingView.el;
            
            scrollHeight        = viewEl.dom.scrollHeight;
            
            // #1082 - reloading the store - should not change the scroll height
            taskStore.proxy.data = t.getLargeDataset();
            taskStore.load({
                callback        : next
            });
        },
        function (next) {
            t.isApprox(viewEl.dom.scrollHeight, scrollHeight, 'Scroll height should not change much after reloading of the same data');
            
            // now #1083 - 1st part
            t.scrollVerticallyTo(viewEl, scrollHeight, next)
        },
        function (next) {
            newTask     = taskStore.getRootNode().appendChild({
                Id              : 10000,
                Name            : 10000,
                StartDate       : new Date(2010, 0, 5),
                Duration        : 2,
                expanded        : false,
                children        : [
                    {
                        Id              : 10001,
                        Name            : 10001,
                        leaf            : true,
                        StartDate       : new Date(2010, 0, 5),
                        Duration        : 2
                    },
                    {
                        Id              : 10002,
                        Name            : 10002,
                        leaf            : true,
                        StartDate       : new Date(2010, 0, 5),
                        Duration        : 2
                    }
                ]
            });
            
            newTask.expand();
            
            t.scrollVerticallyTo(viewEl, viewEl.dom.scrollHeight, next)
        },
        function (next) {
            newTask.collapse();
            
            // seems this wait for 1ms is required for FF and IE to "settle down" after collapsing the rows
            // or may be there's some asynchronity in buffered processing
            // interesting that FF and IE requires 0 or 1ms, Chrome either absense (sync or at least 50)
            t.waitFor(100, next)
        },
        function (next) {
            // this is a final assertion for #1083, 1st part, now go to the 2nd part
            t.bufferedRowsAreSync(gantt);
            
            // adding 2 new tasks 
            newTask     = taskStore.getRootNode().appendChild({
                Name            : 20000,
                StartDate       : new Date(2010, 0, 5),
                Duration        : 2,
                expanded        : false,
                children        : [
                    {
                        Name            : 20001,
                        leaf            : true,
                        StartDate       : new Date(2010, 0, 5),
                        Duration        : 2
                    },
                    {
                        Name            : 20002,
                        leaf            : true,
                        StartDate       : new Date(2010, 0, 5),
                        Duration        : 2
                    }
                ]
            });

            newTask1    = taskStore.getRootNode().appendChild({
                Name            : 30000,
                StartDate       : new Date(2010, 0, 5),
                Duration        : 2,
                expanded        : false,
                children        : [
                    {
                        Name            : 30001,
                        leaf            : true,
                        StartDate       : new Date(2010, 0, 5),
                        Duration        : 2
                    },
                    {
                        Name            : 30002,
                        leaf            : true,
                        StartDate       : new Date(2010, 0, 5),
                        Duration        : 2
                    }
                ]
            });
            
            t.bufferedRowsAreSync(gantt);

            // and scroll to the bottom
            t.scrollVerticallyTo(viewEl, viewEl.dom.scrollHeight, next)
        },
        function (next) {
            newTask.expand();
            // see comment above
            t.waitFor(100, function () {
                // in Ext 5.1.2 expanding last node will not render nodes outside of view
                // to trigger them to load we need to scroll
                t.scrollVerticallyTo(viewEl, viewEl.dom.scrollHeight, next)
            });
        },
        function (next) {
            var nodes       = [ 
                lockedNode(newTask),
                lockedNode(newTask).nextSibling,
                lockedNode(newTask).nextSibling.nextSibling,
                lockedNode(newTask).nextSibling.nextSibling.nextSibling
            ];
            
            t.isDeeply(nodes, [
                lockedNode(newTask),
                lockedNode(newTask.childNodes[ 0 ]),
                lockedNode(newTask.childNodes[ 1 ]),
                lockedNode(newTask1)
            ], "Correct order of nodes in view");
            
            t.isDeeply(nodes, lockedView.all.slice().slice(-4), 'Correct elements in the `all` collection');
            
            t.bufferedRowsAreSync(gantt)
        }
    );
});

