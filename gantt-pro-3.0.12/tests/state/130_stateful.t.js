StartTest(function (t) {
    var cp = Ext.create('Ext.state.CookieProvider');
    cp.state = {};  // HACK, start from fresh state
    Ext.state.Manager.setProvider(cp);

    function getGantt() {
        return t.getGantt({
            renderTo         : Ext.getBody(),
            viewPreset       : 'weekAndMonth',
            startDate        : new Date(2011, 9, 3),
            endDate          : new Date(2011, 9, 17),
            lockedGridConfig : { width : 100 },
            id               : 'foo',         // Must set an id when state should be saved
            stateful         : true,    // State will be saved by the component
            saveDelay        : 0,   // saving state is async by default. argh
            // add plugins that extend Ext.Component and are stateful
            // if getState on these will fail exception will be thrown
            plugins          : [
                Ext.create('Gnt.plugin.TaskEditor'),
                Ext.create('Gnt.plugin.DependencyEditor'),
                Ext.create('Gnt.plugin.TaskContextMenu')
            ]
        });
    }

    var gantt = getGantt();

    t.is(gantt.viewPreset, 'weekAndMonth', 'Correct initial view preset');
    t.isDateEqual(gantt.getStart(), new Date(2011, 9, 3), 'Correct initial start date');
    t.isDateEqual(gantt.getEnd(), new Date(2011, 9, 17), 'Correct initial end date');
    t.is(gantt.lockedGrid.getWidth(), 100, 'Correct initial width');

    gantt.switchViewPreset('monthAndYear', new Date(2011, 9, 1), new Date(2011, 10, 1));

    gantt.destroy();

    gantt = getGantt();

    t.is(gantt.viewPreset, 'monthAndYear', 'Correct view preset applied from state');
    t.isDateEqual(gantt.getStart(), new Date(2011, 9, 1), 'Correct start date applied from state');
    t.isDateEqual(gantt.getEnd(), new Date(2011, 10, 1), 'Correct end date applied from state');
    t.is(gantt.lockedGrid.getWidth(), 100, 'Correct width after state restore');

})    
