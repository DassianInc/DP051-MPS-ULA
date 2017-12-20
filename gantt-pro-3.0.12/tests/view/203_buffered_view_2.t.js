StartTest(function(t) {
    // in this test we'll create almost the same dataset as in `203_buffered_view_1.t.js`
    // but it will have all top-level nodes collapsed
    // then we'll expand the bottom-most node and will check that view contains
    // correct rows (last row should be present)
    
    var generateTaskData = function() {
        var arr = [],
            i, j, k,
            cn, cn2,
            dt = new Date(2010, 0, 5);
            
        var counter     = 0;

        for (i = 1; i <= 10; i++) {
            cn = [];
            for (j = 1; j <= 10; j++) {
                cn.push({
                    Id          : counter++,
                    Name        : 'Child task ' + String(i) + ' / ' + String(j),
                    StartDate   : dt,
                    EndDate     : dt,
                    leaf        : true
                });
            }
            arr.push({  
                Id          : counter++,
                Name        : 'Root task #' + i,
                StartDate   : dt,
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

        proxy       : {
            type : 'memory',
            data : generateTaskData()
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
                dataIndex   : 'Id',
                width       : 150,
                editor      : {}
            }
        ],
        plugins     : ['bufferedrenderer'],
        renderTo    : Ext.getBody()
    });

    var lockedView          = gantt.lockedGrid.getView();
    var schedulingView      = gantt.getSchedulingView();
    
    t.chain(
        {
            waitFor     : 'rowsVisible',
            args        : [ gantt ]
        },
        {
            // it seems shortly after initial rendering, the "scrollTop" position of the buffered schedulingView will be reset to 0
            // need to wait some time before modifiying it
            waitFor     : 300
        },
        {
            action      : 'click',
            
            target      : function () {
                return Ext.fly(lockedView.getNode(lockedView.store.getCount() - 1)).down('.x-tree-expander');
            }
        },
        function (next) {
            var schedulingViewEl    = schedulingView.el;

            var lastNormalRow   = t.safeSelect('' + Ext.grid.View.prototype.itemSelector + ':last-child', schedulingViewEl.dom);
            var lastLockedRow   = t.safeSelect('' + Ext.grid.View.prototype.itemSelector + ':last-child', gantt.lockedGrid.view.el.dom);
            
            // 109 is the id of the last folder, 108 - the id of last record in it
            t.is(schedulingView.getRecord(lastNormalRow.dom).getId(), 108, 'Found last record row in scheduler schedulingView');
        }
    );
});