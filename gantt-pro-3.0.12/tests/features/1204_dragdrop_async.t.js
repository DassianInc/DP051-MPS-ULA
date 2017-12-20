StartTest(function (t) {
    var g = t.getGantt2({
        startDate   : new Date(2010, 1, 1),
        renderTo    : Ext.getBody(),
        taskStore   : t.getTaskStore({
            DATA    : [
                {
                    "Id"           : 117,
                    "leaf"         : true,
                    "StartDate"    : new Date(2010, 1, 3),
                    "Name"         : "New task 1",
                    "Duration"     : 6
                },
                {
                    "Id"           : 118,
                    "leaf"         : true,
                    "StartDate"    : new Date(2010, 1, 3),
                    "Name"         : "New task 2",
                    "Duration"     : 6
                }
            ]
        })
    });
    
    var id      = t.getLocatorById(g.taskStore)
    
    g.on('beforetaskdropfinalize', function (view, context) {
        t.is(view, g.getSchedulingView(), 'view argument correct');

        Ext.Msg.confirm('Please confirm', 'Do you want to drop task?', function (btn) {
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
    
    var task    = id(117),
        start   = task.getStartDate(),
        end     = task.getEndDate();
        
    var view    = g.getSchedulingView()
    
    t.it('Drag drop should happen in async mode', function (t) {
        t.chain(
            { waitForEventsToRender : g },
            // say "no"
            { 
                drag    : function () { return Ext.fly(view.getNode(task)).down('.sch-gantt-task') }, 
                by      : function () {
                    return [ view.timeAxisViewModel.getDistanceBetweenDates(new Date(2010, 1, 3), new Date(2010, 1, 5)), 0 ]
                }  
            },
            function (next) {
                t.is(task.getStartDate(), start, 'Start date has not changed right after dd');
                t.is(task.getEndDate(), end, 'End date has not changed right after dd');
                next();
            },
            { click : ">>[itemId=no]" },
            function (next) {
                t.is(task.getStartDate(), start, 'Start date has not changed after selecting `no`');
                t.is(task.getEndDate(), end, 'End date has not changed after selecting `no`');
                next();
            },
            
            // say "yes"            
            { 
                drag    : function () { return Ext.fly(view.getNode(id(118))).down('.sch-gantt-task') }, 
                by      : function () {
                    return [ view.timeAxisViewModel.getDistanceBetweenDates(new Date(2010, 1, 3), new Date(2010, 1, 5)), 0 ]
                } 
            },
            function (next) {
                t.is(id(118).getStartDate(), start, 'Start date has not changed right after dd');
                t.is(id(118).getEndDate(), end, 'End date has not changed right after dd');
                next();
            },
            { click : ">>[itemId=yes]" },
            function (next) {
                t.is(id(118).getStartDate(), new Date(2010, 1, 5), 'Start date is correct');
                t.is(id(118).getEndDate(), new Date(2010, 1, 13), 'End date is correct');
                next();
            }
        );
    });
});