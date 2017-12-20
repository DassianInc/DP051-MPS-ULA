StartTest(function(t) {
    
    // https://www.assembla.com/spaces/bryntum/tickets/1181#/activity/ticket:
    
    var editing = Ext.create('Sch.plugin.TreeCellEditing', { clicksToEdit: 2 });

    var g = t.getGantt({
        renderTo    : Ext.getBody(),
        plugins     : editing,
        lockedGridConfig : {
            width : 200
        },
        columns     : [
            { xtype : 'treecolumn', dataIndex : 'Name', field : {} },
            { xtype : 'startdatecolumn' },
            { xtype : 'enddatecolumn' },
            { xtype : 'durationcolumn' },

            // The addRowOnTab feature should work also when tabbing out of the last visible column if there are hidden columns after it
            { xtype : 'enddatecolumn', hidden : true }
        ]
    });
    
    var taskStore       = g.taskStore,
        lockedGrid      = g.lockedGrid,
        storeCount      = lockedGrid.view.store.getCount();

    t.chain(
        { waitForEventsToRender : g },
        
        { clickToEditCell : [lockedGrid, 1, 1]},
    
        function (next) {
            t.waitForEvent(lockedGrid.getView().el, 'scroll', next);
            lockedGrid.columns[2].el.scrollIntoView(lockedGrid.view.el);
        },

        { clickToEditCell : [lockedGrid, 1, 2]},

        { clickToEditCell : [lockedGrid, storeCount-1, 3]},

        { type : '[TAB]', target : '.x-field-focus input' },

        { waitFor : function() { return lockedGrid.view.el.dom.scrollLeft === 0; }},

        function (next) {
            t.is(lockedGrid.view.store.getCount(), storeCount + 1, '1 new model was added after tabbing out of last cell');
            t.is(lockedGrid.view.getNodes().length, storeCount + 1, '1 new row was rendered after tabbing out of last cell');

            t.is(lockedGrid.view.el.dom.scrollLeft, 0, 'Scroll should be reset to 0 to show the editor');
            next();
        },
        
        { type : '[TAB]', target : '.x-field-focus input' },

        function (next) {
            t.is(g.getTaskStore().getNewRecords().length, 1, 'Should find only 1 new model');

            next()
        },

        // Trigger another new row, which should after adding should cause scroll to reset
        { type : '[TAB]', target : '.x-field-focus input' },
        { type : '[TAB]', target : '.x-field-focus input' },
        { type : '[TAB]', target : '.x-field-focus input' },

        function (next) {
            t.is(g.getTaskStore().getNewRecords().length, 2, 'Should find 2 new models');
            t.is(lockedGrid.view.el.dom.scrollLeft, 0, 'Scroll should be reset to 0 to show the editor');
        }
    );
});
