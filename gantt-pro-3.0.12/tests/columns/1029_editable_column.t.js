StartTest(function (t) {
    var gantt;

    t.beforeEach(function () {
        gantt && gantt.destroy();
    });

    t.it('Most of TaskFieldColumn mixed columns should have dataIndex provided', function (t) {

        // these classes should not have dataIndex
        var ignoreList = ['Gnt.column.Milestone'];

        var columns = [];

        // collect all the Gnt.column.mixin.TaskFieldColumn mixed columns
        Ext.Array.forEach(Ext.ClassManager.getNamesByExpression('widget.ganttcolumn.*'), function (cls) {
            var proto = Ext.ClassManager.get(cls).prototype;

            if (proto.mixins && proto.mixins['Gnt.column.mixin.TaskFieldColumn'] && !Ext.Array.contains(ignoreList, cls)) {
                columns.push({ xclass : cls });
            }
        });

        gantt = t.getGantt({
            renderTo    : Ext.getBody(),
            columns     : columns,
            taskStore   : t.getTaskStore({
                DATA    : [{
                    "leaf"         : true,
                    "Id"           : 1,
                    "StartDate"    : "2010-02-11",
                    "Name"         : "New task 4",
                    "Duration"     : 5
                }]
            })
        });

        // check that all of the columns being used have dataIndex provided
        t.waitForRowsVisible(gantt, function () {
            gantt.lockedGrid.headerCt.query('gridcolumn').forEach(function (c) {
                t.ok(c.dataIndex, c.$className +' has dataIndex filled');
            })
        });
    });

    t.it('Milestone column should read duration field and end date field to check read only', function (t) {
        Ext.override(Gnt.model.Task, {
            isEditable  : function (fieldName) {
                if (fieldName === this.endDateField || fieldName === this.durationField) return false;
                return this.callParent(arguments);
            }
        });

        gantt = t.getGantt({
            renderTo    : Ext.getBody(),
            columns     : [{ xtype : 'milestonecolumn' }],
            taskStore   : t.getTaskStore({
                DATA    : [{
                    "leaf"         : true,
                    "Id"           : 1,
                    "StartDate"    : "2010-02-11",
                    "Name"         : "New task 4",
                    "Duration"     : 5
                }]
            })
        });

        t.waitForRowsVisible(gantt, function () {
            t.selectorExists('.sch-column-readonly', 'Milestone column is readonly');
        });
    });
});