StartTest(function (t) {
    var g = t.getGantt2({
        startDate   : new Date(2010, 1, 1),
        renderTo    : Ext.getBody()
    });
    
    var getById = function (id) { return g.taskStore.getNodeById(id); };
    
    g.on('beforetaskresizefinalize', function (s, context) {
        Ext.Msg.confirm('Please confirm', 'Do you want to resize task?', function (btn) {
            context.finalize(btn === 'yes');
        });
                        
        // HACK
        // style x-dd-drag-proxy has setting z-index : 1000000 !important;
        // so we need to override it in order to window to be on top of drag proxy
        // implement this in your code to avoid drag proxy to cover window
        var window = Ext.WindowManager.getActive();
        window.el.setZIndex(1100000);
        
        return false;
    });
    
    var task    = getById(117),
        start   = task.getStartDate(),
        end     = task.getEndDate();
    
    t.it('Resize should happen in async mode', function (t) {
        t.chain(
            { drag  : ".sch-resizable-handle-end", by : [34, 0] },
            { click : "[itemId=no] => .x-btn-button" },

            function (next) {
                t.is(task.getEndDate(), end, 'End date is correct');
                t.is(task.getStartDate(), start, 'Start date is correct');
                next();
            },

            { drag  : ".sch-resizable-handle-end", by : [-52, 0] },
            { click : "[itemId=yes] => .x-btn-button" },

            function (next) {
                t.is(task.getEndDate(), new Date(2010, 1, 9), 'End date is correct');
                t.is(task.getStartDate(), start, 'Start date is correct');
                next();
            }
        );
    });
});