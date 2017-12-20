StartTest(function(t) {

    var editing = new Sch.plugin.TreeCellEditing({clicksToEdit : 1});

    var gantt = t.getGantt({
        renderTo    : Ext.getBody(),
        plugins     : editing,
        taskStore   : new Gnt.data.TaskStore({
            // auto-syncing enables the some "if" checks in extjs code that throws errors,
            // when calling "afterEdit" with non-existent field name
            autoSync : true,
            proxy    : 'memory'
        }),

        dependencyStore : new Gnt.data.DependencyStore({
            data : [{ From : 4, To: 3 }]
        }),

        lockedViewConfig : {
            // Enable node reordering in the locked grid
            plugins     : {
                ptype           : 'treeviewdragdrop',
                containerScroll : true
            }
        },

        columns : [
            {
                xtype       : 'treecolumn',
                dataIndex   : 'Id'
            },
            {
                xtype       : 'predecessorcolumn',
                tdCls       : 'dep',
                text        : 'Id predecessor'
            },
            {
                xtype       : 'predecessorcolumn',
                useSequenceNumber : true,
                tdCls       : 'dep-seq',
                text        : 'Sequence predecessor'
            },
            {
                xtype       : 'sequencecolumn'
            }
        ]
    });

    var taskStore       = gantt.taskStore;
    var dependencyStore = gantt.dependencyStore;
    var lockedGrid      = gantt.lockedGrid;
    var lockedView      = gantt.lockedGrid.getView();
    var id              = t.getLocatorById(taskStore);

    t.it('testing reordering a task node, changing its sequence number', function(t) {
        taskStore.proxy.data = [
            { Id : 3, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
            { Id : 4, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
            { Id : 5, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 }
        ];

        taskStore.load();

        t.chain(
            { waitForRowsVisible : gantt },

            function (next) {
                taskStore.getRoot().appendChild(id(4));

                t.is(id(4).getSequenceNumber(), 3, 'getSequenceNumber returns proper result');

                next();
            },

            // need to wait for `>=refreshTimeout`
            { waitFor : 500 },

            function (next) {
                t.contentLike(lockedView.getCellByPosition({ row : 0, column : 2 }), '3')
            }
        );
    });

    t.it('testing reordering a task node, changing its sequence number', function(t) {
        taskStore.proxy.data = [
            { Id : 3, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
            { Id : 4, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
            { Id : 5, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 }
        ];

        taskStore.load();

        t.chain(
            { waitForRowsVisible : gantt },

            function (next) {
                taskStore.getRoot().insertChild(0, {});

                t.is(id(4).getSequenceNumber(), 3, 'getSequenceNumber() returns correct value');

                next();
            },

            { waitForSelector : '.x-grid-item:nth-child(2) .x-grid-cell:nth-child(3):contains(3)' }
        );
    });

    t.it('testing initial value of field', function(t) {

        taskStore.proxy.data = [
            { Id : 3, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
            { Id : 4, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
            { Id : 5, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 }
        ];

        taskStore.load();

        t.chain(
            { click : '.dep' },

            { waitForSelectorAtCursor : '.gnt-field-dependency input' },

            function (next) {
                t.is(t.cq1('dependencyfield').getValue(), '4', 'Correct initial value');
                editing.cancelEdit();
                gantt.dependencyStore.removeAll();
                next()
            },

            { waitForGridContent : [gantt.lockedGrid, 0, 1, '&nbsp;'] },
            { waitForGridContent : [gantt.lockedGrid, 0, 2, '&nbsp;'] }
        );
    });

    t.it('testing invalid dependency', function(t) {

        taskStore.proxy.data = [
            { Id : 3, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
            { Id : 4, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
            { Id : 5, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 }
        ];

        taskStore.load();

        t.wontFire(lockedView, 'itemupdate');

        t.chain(
            { click : '.dep' },

            { waitForSelectorAtCursor : '.gnt-field-dependency input' },

            function (next) {
                editing.getActiveEditor().field.setValue('asf_');
                next();
            },

            { waitForSelectorAtCursor : '.gnt-field-dependency .x-form-invalid-field' },

            { waitFor : 100 },

            { type : '[ENTER]'}
        )
    })

    t.it('testing regular dependency', function(t) {
        taskStore.proxy.data = [
            { Id : 3, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
            { Id : 4, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
            { Id : 5, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 }
        ];

        taskStore.load();

        // We expect 6 'itemupdate' events on the locked view:
        // 2 - caused by dependencyStore 'update'
        // 2 - caused by dependencyStore 'remove'
        // 2 - caused by dependencyStore 'add'

        t.willFireNTimes(gantt.lockedGrid.view, 'itemupdate', 6);

        t.chain(
            { click : '.dep' },

            { waitForSelectorAtCursor : '.gnt-field-dependency .x-form-field' },

            function (next) {
                // cause dependencyStore 'update' since we change a dependency type here
                editing.getActiveEditor().setValue("4FF");

                next();
            },

            {type : '[ENTER]'},

            { waitForGridContent : [gantt.lockedGrid, 0, 1, '4FF'] },
            { waitForGridContent : [gantt.lockedGrid, 0, 2, '2FF'] },

            { waitFor : 500 },

            { click : '.dep-seq' },
            { waitForSelectorAtCursor : '.gnt-field-dependency .x-form-field' },

            function (next) {
                // cause dependencyStore 'remove' and 'add'
                editing.getActiveEditor().setValue("3FF");

                next();
            },

            {type : '[ENTER]'},

            { waitForGridContent : [gantt.lockedGrid, 0, 1, '5FF'] },
            { waitForGridContent : [gantt.lockedGrid, 0, 2, '3FF'] },

            function (next) {
                editing.startEdit(gantt.taskStore.getRootNode().lastChild, 1);
                next();
            },

            { waitFor : 500 },

            function () {
                t.is(editing.getActiveEditor().getValue(), '', 'No predecessors for 2nd task - should be empty field');
                editing.completeEdit();
            }
        )
    });


    t.it('Should not crash after task re-ordering', function(t) {
        taskStore.proxy.data = [
            { Id : 4, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
            { Id : 3, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
            { Id : 5, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 }
        ];

        taskStore.load();

        dependencyStore.loadData([{ From : 4, To: 3 }])

        t.chain(
            { waitForRowsVisible : gantt },

            {
                drag        : function () { return lockedView.getNode(id(4)) },
                to          : function () { return lockedView.getNode(id(3)) },
                toOffset    : [ '50%', '50%+3' ]
            },
            // need to wait for `>=refreshTimeout`
            { waitFor : 500 },
            function (next) {
                t.is(id(3).getSequenceNumber(), 1)
                t.is(id(4).getSequenceNumber(), 2)
                t.is(id(5).getSequenceNumber(), 3)

                t.matchGridCellContent(lockedGrid, 0, 2, '2');
                next();
            }
        )
    })


    t.it('Should redraw the predecessor cells even that they are outside of the normal "sequential" refresh range', function(t) {
        // dep is from 4 -> 3, we order the last 2 rows, but the 1st row should also be refreshed
        taskStore.proxy.data = [
            { Id : 3, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
            { Id : 5, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
            { Id : 6, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
            { Id : 4, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 }
        ];

        taskStore.load();

        dependencyStore.loadData([{ From : 4, To: 3 }])

        t.chain(
            { waitForRowsVisible : gantt },

            {
                drag        : function () { return lockedView.getNode(id(4)) },
                to          : function () { return lockedView.getNode(id(6)) },
                toOffset    : [ '50%', '50%-3' ]
            },
            // need to wait for `>=refreshTimeout`
            { waitFor : 500 },
            function (next) {
                t.matchGridCellContent(lockedGrid, 0, 2, '3');
                next();
            }
        )
    })


});
