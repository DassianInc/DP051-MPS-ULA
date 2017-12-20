StartTest(function(t) {
    
    var doTestPart1 = function (t, buffered) {
        var gantt = t.getGantt({
            renderTo    : Ext.getBody(),
            height      : 200,
            taskStore   : new Gnt.data.TaskStore({
                root : {
                    children : [
                        {   // 1
                            leaf    : true,
                            Name    : '1'
                        },
                        {       // 2
                            expanded    : true,
                            Name        : '2',
                            children    : [
                                {   // 3
                                    expanded : true,
                                    Name        : '3',
                                    children : [
                                        {   // 4
                                            leaf    : true,
                                            Name    : '4'
                                        },
                                        {   // 5
                                            leaf    : true,
                                            Name    : '5'
                                        }
                                    ]
                                }
                            ]
                        },
                        {       // 6
                            expanded : false,
                            Name    : '6',
                            children : [
                                {   // 7
                                    leaf    : true,
                                    Name    : '7'
                                },
                                {   // 8
                                    leaf    : true,
                                    Name    : '8'
                                }
                            ]
                        },
                        {   // 9
                            leaf    : true,
                            Name    : '9'
                        }
                    ]
                }
            }),
            plugins     : buffered ? 'bufferedrenderer' : [],
            lockedViewConfig : {
                // Enable node reordering in the locked grid
                plugins     : {
                    ptype           : 'treeviewdragdrop',
                    containerScroll : true
                }
            },
            columns : [
                {
                    xtype : 'namecolumn'
                },
                {
                    xtype : 'sequencecolumn'
                },
                // having extra column that relies on the same update mechanism is good for testing, because it causes additional side effects
                {
                    xtype       : 'predecessorcolumn',
                    useSequenceNumber : true,
                    text        : 'Sequence predecessor'
                }
            ]
        });

        var verifySequentialOrder   = function (t, count) {
            for (var i = 0; i < count; i++)
                t.matchGridCellContent(gantt.lockedGrid, i, 1, i + 1, 'Sequence ok');
        }

        t.chain(
            { waitFor : 'rowsVisible', args : gantt },

            function (next) {
                var locked      = gantt.lockedGrid;
                var lockedView  = locked.getView()
                var root        = gantt.taskStore.getRootNode();

                var id          = function (id) { return gantt.taskStore.getNodeById(id) }

                t.it('Should render correct sequence code', function(t) {
                    t.matchGridCellContent(locked, 0, 1, '1', '1');
                    t.matchGridCellContent(locked, 1, 1, '2', '2');
                    t.matchGridCellContent(locked, 2, 1, '3', '3');
                    t.matchGridCellContent(locked, 3, 1, '4', '4');
                    t.matchGridCellContent(locked, 4, 1, '5', '5');
                    t.matchGridCellContent(locked, 5, 1, '6', '6');
                    t.matchGridCellContent(locked, 6, 1, '9', '9');
                });

                t.it('Should render correct sequence code after remove leaf', function(t) {
                    root.removeChild(root.childNodes[0]);
                    t.matchGridCellContent(locked, 0, 1, '1', '1');
                    t.matchGridCellContent(locked, 1, 1, '2', '2');
                    t.matchGridCellContent(locked, 2, 1, '3', '3');
                    t.matchGridCellContent(locked, 3, 1, '4', '4');
                    t.matchGridCellContent(locked, 4, 1, '5', '5');
                    t.matchGridCellContent(locked, 5, 1, '8', '8');
                });

                t.it('Should render correct sequence code after collapse', function(t) {
                    root.childNodes[0].collapse();
                    t.matchGridCellContent(locked, 0, 1, '1', '1');
                    t.matchGridCellContent(locked, 1, 1, '5', '5');
                    t.matchGridCellContent(locked, 2, 1, '8', '8');
                });

                t.it('Should render correct sequence code after remove branch', function(t) {
                    root.removeChild(root.childNodes[1]);
                    t.matchGridCellContent(locked, 0, 1, '1', '1');
                    t.matchGridCellContent(locked, 1, 1, '5', '5');
                });

                t.it('Should render correct sequence code after add leaf', function(t) {
                    root.insertChild(0, {
                        Name    : 'New1',
                        leaf    : true
                    });
                    // same as original
                    t.matchGridCellContent(locked, 0, 1, '1', '1');
                    t.matchGridCellContent(locked, 1, 1, '2', '2');
                    t.matchGridCellContent(locked, 2, 1, '6', '6');
                });

                t.it('Should render correct sequence code after add child', function(t) {
                    root.insertChild(1, {
                        Id          : 100,
                        Name        : 100,
                        expanded    : true,
                        children    : [
                            {
                                leaf    : true,
                                Id      : 101,
                                Name    : 101
                            }
                        ]
                    });
                    // same as original
                    t.matchGridCellContent(locked, 0, 1, '1', '1');
                    t.matchGridCellContent(locked, 1, 1, '2', '2');
                    t.matchGridCellContent(locked, 2, 1, '3', '3');
                    t.matchGridCellContent(locked, 3, 1, '4', '4');
                    t.matchGridCellContent(locked, 4, 1, '8', '8');
                });

                t.it('Should show correct sequence code after re-ordering of the tasks', function(t) {
                    root.insertChild(0, {
                        expanded    : true,
                        children    : [
                            {
                                leaf        : true,
                                Id          : 'Source',
                                Name        : 'Source'
                            },
                            {
                                leaf        : true,
                                Id          : 'Target',
                                Name        : 'Target'
                            }
                        ]
                    });

                    t.chain(
                        {
                            drag        : function () { return lockedView.getNode(id('Source')) },
                            to          : function () { return lockedView.getNode(id('Target')) },
                            toOffset    : [ '50%', '50%+3' ]
                        },
                        function () {
                            verifySequentialOrder(t, 4)
                        }
                    )
                });
            }
        )
        // eof chain
    }
    // eof doTestPart1
    
    var doTestPart2 = function (t, buffered) {
        function verify() {
            for (var i = 0; i < gantt.lockedGrid.view.store.getCount(); i++)
                t.matchGridCellContent(gantt.lockedGrid, i, 1, i + 1, i + 1 + ' row ok');
        }

        var gantt = t.getGantt({
            renderTo    : Ext.getBody(),
            height      : 200,

            taskStore   : new Gnt.data.TaskStore({
                root : {
                    children : Ext.Array.map([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18], function(i) { return { Id : i, Name : i, leaf : true }; })
                }
            }),

            dependencyStore : new Gnt.data.DependencyStore({
                data : Ext.Array.map([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18], function(i) { return { From : i - 1, To : i }; })
            }),

            plugins     : buffered ? 'bufferedrenderer' : [],

            columns : [
                {
                    xtype : 'namecolumn'
                },
                {
                    xtype : 'sequencecolumn'
                },

                // having extra column that relies on the same update mechanism is good for testing, because it causes additional side effects
                {
                    xtype               : 'predecessorcolumn',
                    useSequenceNumber   : true,
                    text                : 'Predecessor'
                }
            ]
        });
        
        var id      = t.getLocatorById(gantt.taskStore)

        t.chain(
            { waitFor : 'rowsVisible', args : gantt },

            function(next) {
                verify();
                
                t.is(id(11).getSequenceNumber(), 11, 'Sequnce number should be correct before indent')
                
                id(10).indent();
                
                t.is(id(11).getSequenceNumber(), 11, 'Sequnce number should be correct after indent')
                
                verify();
                next();
            },

            function(next) {
                id(9).indent();

                verify();
                next();
            },

            function(next) {
                id(8).indent();

                verify();
                next();
            },

            function(next) {
                id(8).outdent();

                verify();
                next();
            },

            function(next) {
                id(9).outdent();

                verify();
                next();
            },

            function(next) {
                id(10).outdent();

                verify();
                next();
            }
        )
    }
    // eof doTestPart2 

    t.it('CRUD should work with regular rendering', function(t) {
        doTestPart1(t, false)
    });

    t.it('CRUD should work with buffered rendering', function(t) {
        doTestPart1(t, true)
    });

    t.it('Indentation should work with regular rendering', function(t) {
        doTestPart2(t, false)
    })

    t.it('Indentation should work with buffered rendering', function(t) {
        doTestPart2(t, true)
    })
});
