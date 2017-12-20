StartTest({
    forceDOMVisible     : true
}, function(t) {
    var sched = t.getGantt2({
        renderTo    : document.body,
        width       : 200,
        forceFit    : true,
        plugins     : t.getAllPlugins()
    });

    t.chain(
        { action : 'drag', target : '.sch-gantt-task-bar', by : [10, 10] },

        function() {
            t.selectorNotExists('[class*="undefined"]', 'No "undefined" class selectors found in DOM')
            t.selectorNotExists('[id*="undefined"]', 'No "undefined" ids found in DOM')
            t.selectorNotExists('[class*="null"]', 'No "null" class selectors found in DOM')
            t.selectorNotExists('[id*="null"]', 'No "null" ids found in DOM')

            sched.destroy();
            t.selectorNotExists('[class*="sch-"]', 'No sch-XXX selectors found in DOM')
        }
    )
})
