StartTest(function (t) {
    t.autoCheckGlobals = false;

    t.chain(
        {
            waitFor     : 'Selector',
            args        : '.sch-gantt-item'
        },
        function() {
            t.pass('Gantt CMD app rendered without exception');
            
            t.monkeyTest(t.cq1('ganttpanel').el, 10, null, t.done, t);
        }
    )

})
