StartTest(function (t) {

    t.it('Indents/outdents multiple selected tasks', function (t) {

        var taskStore, gantt;

        var task = function (id) {
            return taskStore.getNodeById(id);
        };


        t.chain(
            { waitForRowsVisible : 'ganttpanel' },

            function (next) {
                gantt       = t.cq1('ganttpanel');
                taskStore   = gantt.getTaskStore();
                next();
            },

            {
                click : function () { return gantt.lockedGrid.view.getNode(task(12)); },
                // provide offset to click start of locked grid row
                // (otherwise it will try to click in the middle which is out of the visible area)
                offset : [ 10, '50%' ]
            },
            {
                click : function () { return gantt.lockedGrid.view.getNode(task(13)); },
                // hold SHIFT to enable multiselect
                options : { shiftKey : true },
                offset : [ 10, '50%' ]
            },

            { click : '>>advanced-viewport button[reference=indentTask]' },

            {
                waitFor : function () {
                    return task(12).parentNode === task(11) && task(13).parentNode === task(11);
                },
                desc    : 'Both tasks were indented'
            },

            { click : '>>advanced-viewport button[reference=outdentTask]' },

            {
                waitFor : function () {
                    return task(12).parentNode === task(1) && task(13).parentNode === task(1);
                },
                desc    : 'Both tasks were outdented back'
            },
            { click : '>>gantt-filter-field' },
            { type : '[DOWN]' }
        );

    })
});


