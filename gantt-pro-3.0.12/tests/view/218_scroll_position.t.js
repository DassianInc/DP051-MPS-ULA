describe('Scroll position should be kept when data sources are updated', function (t) {

    var g = t.getGantt({
        width    : 300,
        height   : 200,
        lockedGridConfig : {
            width : 100
        },
        renderTo : Ext.getBody()
    });

    t.chain(
        { waitFor : 'rowsVisible' },
        { waitFor : 300 },

        function () {
            var lockedViewEl = g.lockedGrid.view.el.dom;
            var normalViewEl = g.normalGrid.view.el.dom;

            t.it('Should keep scroll for assignment store updates', function(t) {

                lockedViewEl.scrollTop = lockedViewEl.scrollLeft = 40;
                normalViewEl.scrollTop = normalViewEl.scrollLeft = 40;

                g.assignmentStore.removeAll();
                g.assignmentStore.add(
                        {
                            "Id"         : 2,
                            "TaskId"     : 12,
                            "ResourceId" : 1,
                            "Units"      : 100
                        }
                );
                g.assignmentStore.loadData(
                    [
                        {
                            "Id"         : 1,
                            "TaskId"     : 11,
                            "ResourceId" : 1,
                            "Units"      : 100
                        }
                    ]
                );

                t.is(lockedViewEl.scrollTop, 40, 'lockedViewEl Top ok')
                t.is(lockedViewEl.scrollLeft, 40, 'lockedViewEl Left ok')
                t.is(normalViewEl.scrollTop, 40, 'normalViewEl Top ok')
                t.is(normalViewEl.scrollLeft, 40, 'normalViewEl Left ok')
            })

            t.it('Should keep scroll for resource store updates', function(t) {

                lockedViewEl.scrollTop = lockedViewEl.scrollLeft = 40;
                normalViewEl.scrollTop = normalViewEl.scrollLeft = 40;

                g.resourceStore.removeAll();
                g.resourceStore.add(
                    {
                        "Id"         : 2,
                        "Name"       : "Bar"
                    }
                );
                g.resourceStore.loadData(
                    [
                        {
                            "Id"         : 1,
                            "Name"       : "Baz"
                        }
                    ]
                );

                t.is(lockedViewEl.scrollTop, 40, 'lockedViewEl Top ok')
                t.is(lockedViewEl.scrollLeft, 40, 'lockedViewEl Left ok')
                t.is(normalViewEl.scrollTop, 40, 'normalViewEl Top ok')
                t.is(normalViewEl.scrollLeft, 40, 'normalViewEl Left ok')
            })

            t.it('Should keep scroll for dependency store updates', function(t) {

                lockedViewEl.scrollTop = lockedViewEl.scrollLeft = 40;
                normalViewEl.scrollTop = normalViewEl.scrollLeft = 40;

                g.dependencyStore.removeAll();
                g.dependencyStore.add(
                    {
                        "Id"         : 2,
                        "Name"       : "Bar"
                    }
                );
                g.dependencyStore.loadData(
                    [
                        {
                            "Id"         : 1,
                            "Name"       : "Baz"
                        }
                    ]
                );

                t.is(lockedViewEl.scrollTop, 40, 'lockedViewEl Top ok')
                t.is(lockedViewEl.scrollLeft, 40, 'lockedViewEl Left ok')
                t.is(normalViewEl.scrollTop, 40, 'normalViewEl Top ok')
                t.is(normalViewEl.scrollLeft, 40, 'normalViewEl Left ok')
            })
        }
    )
})
