StartTest(function (t) {
    t.diag('Rendering dependencies at the right edge should not affect the scrollable area width')

    var gantt = t.getGantt2({
        renderTo : document.body
    });

    var dep = gantt.dependencyStore.queryBy(function(d) {return d.data.Type === Gnt.model.Dependency.Type.EndToStart; }).first();
    var view = gantt.getSchedulingView();

    gantt.zoomToFit();

    t.chain(
        { action : 'moveCursorTo', target : function() { return view.getElementFromEventRecord(dep.getSourceTask()); } },

        function (next) {
            t._depTerminal = view.getElementFromEventRecord(dep.getSourceTask()).down('.sch-gantt-terminal-end')
            var el = view.getDependencyView().getElementsForDependency(dep).setHeight(20);

            this.moveCursorTo(t._depTerminal, next)
        },

        function (next) {
            t.elementIsTopElement(t._depTerminal, false, 'Should find terminal above dependency lines');
        }
    );
})    
