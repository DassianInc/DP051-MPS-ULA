StartTest(function(t) {

    t.it('Widths should match for gantt + histogram', function(t) {
        t.waitForRowsVisible(function() {
            var gantt       = t.cq1('ganttpanel');

            t.chain(
                { click : ".x-btn" },

                { click : "ganttcalendar => .x-datepicker-date:contains(18)" },

                { type : "w" }
            )
        });
    });
});