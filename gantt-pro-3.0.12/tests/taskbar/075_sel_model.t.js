StartTest(function (t) {

    var g = t.getGantt2({
        width       : 500,
        viewConfig  : { forceFit : true },
        renderTo    : Ext.getBody(),
        multiSelect : true
    });

    t.chain(
        { waitForRowsVisible : g },

        function (next) {
            t.selectorNotExists('.' + Ext.grid.View.prototype.selectedItemCls, 'No rows selected initially');
            next();
        },

        { click : '.sch-gantt-task-bar' },

        function (next) {
            var row = Ext.select('.sch-gantt-task-bar').first().up(Ext.grid.View.prototype.itemSelector);
            t.hasCls(row, Ext.grid.View.prototype.selectedItemCls, 'Row selected after clicking task bar');
            t.selectorExists('.x-grid-inner-locked ' + Ext.grid.View.prototype.itemSelector, 'Row should also be selected in locked section');
            next();
        },

        { action : 'click', options : { ctrlKey : true } },

        function (next) {
            var row = Ext.select('.sch-gantt-task-bar').first().up(Ext.grid.View.prototype.itemSelector);
            t.selectorNotExists('.' + Ext.grid.View.prototype.selectedItemCls, 'No rows selected after clicking task again');
        }
    );
});    
