StartTest(function(t) {

    // You can notice if layouts are performed that the dragged task gets 'stuck' initially, which should be avoided
    t.it('Should not cause a layout as drag is performed', function (t) {
        var gantt = t.getGantt({ renderTo : document.body });

        var layouts;

        t.chain(
            { waitForRowsVisible : gantt },

            function(next) {
                layouts = t.getTotalLayoutCounter();

                next()
            },

            { drag : '.sch-gantt-task', by : [ 20, 0 ], dragOnly : true },

            function(next) {
//                t.is(t.getTotalLayoutCounter(), layouts, 'No layouts caused')
            }
        )
    });
})
