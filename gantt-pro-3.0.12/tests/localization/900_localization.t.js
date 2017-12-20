StartTest(function(t) {

    Sch.util.Date.setUnitNames({
        YEAR    : { single: 'år', plural: 'år', abbrev: 'år' },
        QUARTER : { single: 'kvartal', plural: 'kvartaler', abbrev: 'Kvt' },
        MONTH   : { single: 'månede', plural: 'måneder', abbrev: 'mdr' },
        WEEK    : { single: 'uge', plural: 'uger', abbrev: 'uge' },
        DAY     : { single: 'dag', plural: 'dage', abbrev: 'd' },
        HOUR    : { single: 'time', plural: 'timer', abbrev: 't' },
        MINUTE  : { single: 'minut', plural: 'minutter', abbrev: 'min' },
        SECOND  : { single: 'sekund', plural: 'sekunder', abbrev: 's' },
        MILLI   : { single: 'ms', plural: 'ms', abbrev: 'ms' }
    });

    Gnt.util.DurationParser.prototype.unitsRegex = {
        MILLI       : /^ms$|^mil/i,
        SECOND      : /^s$|^sek/i,
        MINUTE      : /^m$|^min/i,
        HOUR        : /^t$|^tim/i,
        DAY         : /^d$|^dag/i,
        WEEK        : /^v$|^ve|^vecka/i,
        MONTH       : /^må|^mån/i,
        QUARTER     : /^kv$|^kva/i,
        YEAR        : /^år/i
    };

    var edit = new Sch.plugin.TreeCellEditing();

    var g = t.getGantt({
        renderTo    : Ext.getBody(),
        plugins     : edit,
        columns     : [{ xtype : 'treecolumn'}, { xtype : 'durationcolumn'}]
    });

    t.waitForRowsVisible(g, function() {
        var task = g.taskStore.getRootNode().firstChild;

        t.diag('Verify basic rendering');
        task.set('leaf', true);

        task.setDuration(1, Sch.util.Date.YEAR);
        t.matchGridCellContent(g.lockedGrid, 0, 1, '1 år', 'YEAR ok');

        task.setDuration(1, Sch.util.Date.QUARTER);
        t.matchGridCellContent(g.lockedGrid, 0, 1, '1 kvartal', 'QUARTER ok');

        task.setDuration(1, Sch.util.Date.MONTH);
        t.matchGridCellContent(g.lockedGrid, 0, 1, '1 månede', 'MONTH ok');

        task.setDuration(1, Sch.util.Date.WEEK);
        t.matchGridCellContent(g.lockedGrid, 0, 1, '1 uge', 'WEEK ok');

        task.setDuration(1, Sch.util.Date.DAY);
        t.matchGridCellContent(g.lockedGrid, 0, 1, '1 dag', 'DAY ok');

        task.setDuration(1, Sch.util.Date.HOUR);
        t.matchGridCellContent(g.lockedGrid, 0, 1, '1 time', 'HOUR ok');

        task.setDuration(1, Sch.util.Date.MINUTE);
        t.matchGridCellContent(g.lockedGrid, 0, 1, '1 minut', 'MINUTE ok');

        task.setDuration(1, Sch.util.Date.SECOND);
        t.matchGridCellContent(g.lockedGrid, 0, 1, '1 sekund', 'SECOND ok');

        task.setDuration(1, Sch.util.Date.MILLI);
        t.matchGridCellContent(g.lockedGrid, 0, 1, '1 ms', 'MILLI ok');

        // Verify duration editor
        task.setDuration(1, Sch.util.Date.QUARTER);

        edit.startEditByPosition({ row : 0, column : 1});

        t.waitForCQVisible('durationfield', function() {

            t.click('durationfield => .x-form-spinner-up');

            edit.completeEdit();

            t.matchGridCellContent(g.lockedGrid, 0, 1, '2 kvartaler', 'QUARTER ok after edit');
        });

    });
})
