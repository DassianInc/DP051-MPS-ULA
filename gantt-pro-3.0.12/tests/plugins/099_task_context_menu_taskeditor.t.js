StartTest(function (t) {

    // #1042 Ensures that Gnt.plugin.TaskContextMenu automatically adds `Task information...` menu entry if TaskEditor plugin is used

    t.it('Automatically adds `Task information...` menu entry if TaskEditor plugin is used',  function(t) {
        var editor  = Ext.create('Gnt.plugin.TaskEditor');

        var menu    = Ext.create('Gnt.plugin.TaskContextMenu', {
            triggerEvent : 'taskcontextmenu'
        });

        var g = t.getGantt({
            lockedGridConfig    : { width : 150 },
            viewPreset : 'weekAndDayLetter',
            renderTo   : Ext.getBody(),
            forceFit   : true,
            plugins    : [menu, editor]
        });

        t.chain(
            { waitFor       : 'tasksAndDependenciesToRender' },
            { rightClick    : t.getFirstTaskEl(g) },
            { waitFor       : 'ComponentVisible', args : menu },

            function (next) {
                var store = g.taskStore,
                    root = store.getRootNode();

                var firstTask = g.resolveTaskRecord(t.getFirstTaskEl(g));

                t.pass('Context menu shown after task bar contextmenu click');
                t.is(menu.items.getAt(0).text, Gnt.locale.En.l10n['Gnt.plugin.TaskContextMenu'].taskInformation, '1st menu entry is task editor call');
                t.ok(menu.items.getAt(1).text != Gnt.locale.En.l10n['Gnt.plugin.TaskContextMenu'].taskInformation, '2nd menu entry is some other');
            }
        );
    });
});
