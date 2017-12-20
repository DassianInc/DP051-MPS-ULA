StartTest(function (t) {
    var g = t.getGantt({
        taskStore   : t.getTaskStore({
            DATA    : [{
                'Id'    : 1,
                'Name'  : 'Unplanned 1',
                'leaf'  : true
            }, {
                'Id'    : 2,
                'Name'  : 'Unplanned 2',
                'leaf'  : true
            }]
        }),
        renderTo    : Ext.getBody()
    });
    
    g.on('beforedragcreatefinalize', function (s, context) {
        Ext.Msg.confirm('Please confirm', 'Do you want to create task?', function (btn) {
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
    
    var task = g.taskStore.getNodeById(1);
    
    t.it('Drag create should work in async mode', function (t) {
        t.chain(
            { waitForRowsVisible : g },
            { action : "drag", target : ".sch-ganttview .sch-timetd", offset : [20, 9], by : [43, 0] },
            { action : "click", target : "[itemId=no] => .x-btn-button" },
            function (next) {
                t.notOk(task.getStartDate(), 'Task doesn\'t have start date');
                t.notOk(task.getEndDate(), 'Task doesn\'t have end date');
                next();
            },
            { action : "drag", target : ".sch-ganttview .sch-timetd", offset : [22, 8], by : [60, 0] },
            { action : "click", target : "[itemId=yes] => .x-btn-button" },
            function (next) {
                t.is(task.getStartDate(), new Date(2010, 0, 5), 'Start date is correct');
                t.is(task.getEndDate(), new Date(2010, 0, 8), 'End date is correct');
                next();
            }
        );
    });
});