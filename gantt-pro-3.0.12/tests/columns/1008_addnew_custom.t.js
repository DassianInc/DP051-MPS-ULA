StartTest(function(t) {

    var g = t.getGantt({
        renderTo    : Ext.getBody(),
        columns : [
            {
                xtype : 'treecolumn',
                dataIndex : 'Id'
            },
            {
                xtype : 'addnewcolumn',
                columnList : (function() {
                    var list = Gnt.column.AddNew.buildDefaultColumnList();
                    list.push({
                        text      : 'Custom text',
                        config    : {
                            dataIndex : 'Name',
                            editor    : 'textfield'
                        }
                    });
                    return list;
                })()
            }
        ]
    });

    t.describe('Add new column', function(t) {
        t.it('Should support adding custom fields', function(t) {
            t.chain(
                { waitFor : 'rowsVisible', args : g },
                { click   : '>> addnewcolumn' },
                { waitFor : 50 },
                { type    : 'Custom' },
                { waitFor : 50 },
                { type    : '[ENTER]' },
                { waitFor : 50 },
                function(next) {
                    t.ok(t.cq1('ganttpanel gridcolumn[text="Custom text"]'), 'Custom text column must be present');
                    t.matchGridCellContent(g.lockedGrid, 0, 1, g.taskStore.getById(114).getName(), "Custom text column uses proper data index");
                    next();
                }
            );
        });
    });
});
