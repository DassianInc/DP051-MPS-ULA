StartTest(function (t) {
    var done = false;

    var createFn = function (record, start, end, e) {
        if (!done) {
            t.ok(arguments[0] instanceof Gnt.model.Task &&
            arguments[1] instanceof Date &&
            arguments[2] instanceof Date &&
            arguments[3] instanceof Ext.EventObjectImpl, 'Correct function arguments');
            done = true;
        }

        if (end > new Date(2010, 1, 5)) {
            return false;
        }

        return true;
    };

    var verifyTip = function(t) {
        var tipEl       = Ext.getBody().down('.sch-gantt-dragcreate-tip');
        var lastRowEl   = g.normalGrid.getView().getNode(7)

        t.isApprox(tipEl.getBottom(), Ext.fly(lastRowEl).getY(), 10, 'Tip placed vertically ok')
        t.isApprox(tipEl.getX(), Ext.fly(lastRowEl).getX(), 10, 'Tip placed horizontally ok')
    };

    var g = t.getGantt2({
        renderTo           : document.body,
        startDate          : new Date(2010, 1, 1),
        createValidatorFn  : createFn,
        enableDragCreation : true,

        root : {
            children : [
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {leaf : true}
            ]
        }
    });

    t.it('Should not create a task if validator returns false', function (t) {
        done = false;

        t.chain(
            {drag : '.x-grid-item:last-child .sch-timetd', fromOffset : [2, 2], by : [150, 0], dragOnly : true},

            function(next) {
                verifyTip(t);
                next();
            },

            { mouseUp : null },

            function () {
                t.is(g.getRootNode().lastChild.getStartDate(), null, 'StartDate read ok. Task not created.');
                t.is(g.getRootNode().lastChild.getEndDate(), null, 'EndDate read ok. Task not created.');
            }
        );
    })

    t.it('Should create a task if validator returns true', function (t) {
        done = false;

        t.chain(
            {drag : '.x-grid-item:last-child .sch-timetd', fromOffset : [2, 2], by : [75, 0], dragOnly : true},

            function(next) {
                verifyTip(t);
                next();
            },
            { mouseUp : null },

            function () {
                t.is(g.getRootNode().lastChild.getStartDate(), new Date(2010, 1, 1), 'StartDate read ok');
                t.isGreater(g.getRootNode().lastChild.getEndDate(), new Date(2010, 1, 2), 'EndDate read ok');
            }
        );
    });
});
