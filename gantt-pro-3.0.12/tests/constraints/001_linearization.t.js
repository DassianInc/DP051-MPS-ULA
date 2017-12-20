/* global id, taskStore */
/* jshint -W085 */
StartTest(function(t) {

    var Ext = t.getExt();

    t.it('Linearizing independed tasks should just return same set of tasks', function (t) {
        with (t.getAllStoresDataSet(
            [
                {
                    Id              : 1,
                    leaf            : true
                },
                {
                    Id              : 2,
                    leaf            : true
                },
                {
                    Id              : 3,
                    leaf            : true
                }
            ]
        )) {
            var calls   = [];

            taskStore.linearWalkDependentTasks(id(1), function (task, color) {
                calls.push([ task.getId(), color ]);
            }, {
                self        : true,
                ancestors   : true,
                descendants : true,
                successors  : true
            });

            t.isDeeply(calls, [['root', 'yellow'], [1, 'green'], ['root', 'green']]);
        }
    });

    t.it('Linearizing dependent tasks should work', function (t) {
        with (t.getAllStoresDataSet(
            [
                {
                    Id              : 1,
                    leaf            : true
                },
                {
                    Id              : 2,
                    leaf            : true
                },
                {
                    Id              : 3,
                    leaf            : true
                }
            ],
            [
                {
                    From            : 3,
                    To              : 2
                },
                {
                    From            : 2,
                    To              : 1
                }
            ]
        )) {
            var calls   = [];

            taskStore.linearWalkDependentTasks(id(3), function (task, color) {
                calls.push([ task.getId(), color ]);
            }, {
                self        : true,
                ancestors   : true,
                descendants : true,
                successors  : true
            });

            t.isDeeply(calls, [
                ['root', 'yellow'], [3, 'green'], [2, 'green'], [1, 'green'], ['root', 'green']
            ]);
        }
    });

    t.it('Linearizing 2 independent sets of dependent tasks should work', function (t) {
        /* global id */
        with (t.getAllStoresDataSet(
            // Tasks
            [
                { Id : 1, leaf : true },
                { Id : 2, leaf : true },
                { Id : 3, leaf : true },
                { Id : 4, leaf : true },
                { Id : 5, leaf : true },
                { Id : 6, leaf : true }
            ],
            // Dependencies
            [
                { From : 3, To : 2 },
                { From : 2, To : 1 },
                { From : 6, To : 5 },
                { From : 5, To : 4 }
            ]
        )) {
            var calls,
                pos;

            calls = [];

            // As if we move the parent everyone simultaneously
            taskStore.linearWalkDependentTasks([  id(1), id(2), id(3), id(4), id(5), id(6) ], function (task, color) {
                calls.push([ task.getId(), color ]);
            }, {
                self        : true,
                ancestors   : true,
                descendants : true,
                successors  : true
            });

            t.is(calls.length, 8, "Total 8 nodes affected, root is a parent node, thus included into linearization twice, and 6 leafs");

            pos = {};
            Ext.Array.forEach(calls, function(call, index, all) {
                pos[(call[0] || 'root') + '-' + call[1]] = index;
            });

            t.ok(
                // Root yellow step goes first
                pos['root-yellow'] < pos['1-green'] &&
                pos['root-yellow'] < pos['2-green'] &&
                pos['root-yellow'] < pos['3-green'] &&
                pos['root-yellow'] < pos['4-green'] &&
                pos['root-yellow'] < pos['5-green'] &&
                pos['root-yellow'] < pos['6-green'] &&
                // Root green step goes last
                pos['root-green']  > pos['1-green'] &&
                pos['root-green']  > pos['2-green'] &&
                pos['root-green']  > pos['3-green'] &&
                pos['root-green']  > pos['4-green'] &&
                pos['root-green']  > pos['5-green'] &&
                pos['root-green']  > pos['6-green'] &&
                // 3 'green' step goes before 2 'green' step since 2 is successor of 3
                pos['3-green']     < pos['2-green'] &&
                // 2 'green' step goes before 1 'green' step since 1 is successor of 2
                pos['2-green']     < pos['1-green'] &&
                // 6 'green' step goes before 5 'green' step since 5 is successor of 6
                pos['6-green']     < pos['5-green'] &&
                // 5 'green' step goes before 4 'green' step since 4 is successor of 5
                pos['5-green']     < pos['4-green'],
                //
                "Relative step positions are correct"
            );
        }
    });


    t.it('Linearizing should work with tasks having several dependencies', function (t) {
        with (t.getAllStoresDataSet(
            [
                { Id : 1, leaf : true },
                { Id : 2, leaf : true },
                { Id : 3, leaf : true },
                { Id : 4, leaf : true }
            ],
            [
                { From : 1, To : 2 },
                { From : 1, To : 3 },
                { From : 2, To : 3 },
                { From : 2, To : 4 },
                { From : 3, To : 4 }
            ]
        )) {
            var calls   = [];

            taskStore.linearWalkDependentTasks(id(1), function (task, color) {
                calls.push([ task.getId(), color ]);
            }, {
                self        : true,
                ancestors   : true,
                descendants : true,
                successors  : true
            });

            t.isDeeply(calls, [
                ['root', 'yellow'], [1, 'green'], [2, 'green'], [3, 'green'], [4, 'green'], ['root', 'green']
            ]);
        }
    });

    t.it('Linearization of hierarchical structure should consider parent nodes depending on child nodes', function(t) {
        with (t.getAllStoresDataSet(
            [
                { Id : 1, children : [
                    { Id : 2, leaf : true },
                    { Id : 3, leaf : true },
                    { Id : 4, leaf : true }
                ]}
            ]
        )) {
            var calls,
                pos;

            calls = [];

            // As if we move the parent
            taskStore.linearWalkDependentTasks(id(1), function (task, color) {
                calls.push([ task.getId(), color ]);
            }, {
                self        : true,
                ancestors   : true,
                descendants : true,
                successors  : true
            });

            t.is(calls.length, 7, "Total 5 nodes affected, root and id(1) are parent nodes, thus included into linearization twice");

            pos = {};
            Ext.Array.forEach(calls, function(call, index, all) {
                pos[(call[0] || 'root') + '-' + call[1]] = index;
            });

            t.ok(pos['root-yellow'] < pos['1-green'], "Root 'yellow' step goes before 1 'green' step since root depends on 1");
            t.ok(pos['root-green']  > pos['1-green'], "Root 'green' step goes after 1 'green' step since root depends on 1");
            t.ok(
                pos['1-yellow'] < pos['2-green'] &&
                pos['1-yellow'] < pos['3-green'] &&
                pos['1-yellow'] < pos['4-green'],
                "1 'yellow' step goes before it's leaf nodes 'green' steps since 1 depends on it's leafs"
            );
            t.ok(
                pos['1-green'] > pos['2-green'] &&
                pos['1-green'] > pos['3-green'] &&
                pos['1-green'] > pos['4-green'],
                "1 'yellow' step goes after it's leaf nodes 'green' steps since 1 depends on it's leafs"
            );


            calls   = [];

            // As if we move any child
            taskStore.linearWalkDependentTasks(id(2), function (task, color) {
                calls.push([ task.getId(), color ]);
            });

            pos = {};
            Ext.Array.forEach(calls, function(call, index, all) {
                pos[(call[0] || 'root') + '-' + call[1]] = index;
            });

            t.ok(pos['root-yellow'] < pos['1-green'], "Root 'yellow' step goes before 1 'green' step since root depends on 1");
            t.ok(pos['root-green']  > pos['1-green'], "Root 'green' step goes after 1 'green' step since root depends on 1");
            t.ok(
                pos['1-yellow'] < pos['2-green'] &&
                pos['1-yellow'] < pos['3-green'] &&
                pos['1-yellow'] < pos['4-green'],
                "1 'yellow' step goes before it's leaf nodes 'green' steps since 1 depends on it's leafs"
            );
            t.ok(
                pos['1-green'] > pos['2-green'] &&
                pos['1-green'] > pos['3-green'] &&
                pos['1-green'] > pos['4-green'],
                "1 'yellow' step goes after it's leaf nodes 'green' steps since 1 depends on it's leafs"
            );
        }
    });

    t.it('Linearization of hierarchical structure should take into account parent node successors', function (t) {
        with (t.getAllStoresDataSet(
            [
                { Id : 1, children : [
                    { Id : 2, leaf : true }
                ]},
                { Id : 3, leaf : true },
                { Id : 4, leaf : true }
            ],
            [
                { From : 1, To : 4 },
                { From : 3, To : 4 }
            ]
        )) {
            var calls = [],
                pos   = {};

            // As if we move 1.
            taskStore.linearWalkDependentTasks(id(1), function (task, color) {
                calls.push([ task.getId(), color ]);
            }, {
                self        : true,
                ancestors   : true,
                descendants : true,
                successors  : true
            });

            pos = {};
            Ext.Array.forEach(calls, function(call, index, all) {
                pos[(call[0] || 'root') + '-' + call[1]] = index;
            });

            t.ok(
                 //  1 and 2 form hierarchy thus:
                 //   1 yellow as a parent of 2 goes before 2 green
                 pos['1-yellow'] < pos['2-green'] &&
                 //   1 green as a parent of 2 goes after 2 green
                 pos['1-green']  > pos['2-green'] &&
                 //  4 is successor of 1 thus:
                 //   4 green goes after 1 green
                 pos['4-green']  > pos['1-green'],
                 //  4 is successor of 3 but 3 is not involved in the action
                 "Relative step positions are correct"
            );
        }
    });


    t.it('Linearization of hierarchical structure with nested parents should work', function (t) {
        with (t.getAllStoresDataSet(
            [
                { Id : 1, children : [
                    { Id : 2, leaf : true },
                    { Id : 3, children : [
                        { Id : 4, leaf : true },
                        { Id : 5, leaf : true }
                    ]}
                ]}
            ],
            [
                { From : 2, To : 3 },
                { From : 4, To : 5 }
            ]
        )) {
            var calls = [],
                pos   = {};

            // As if we move 2
            taskStore.linearWalkDependentTasks(id(2), function (task, color) {
                calls.push([ task.getId(), color ]);
            }, {
                self        : true,
                ancestors   : true,
                descendants : true,
                successors  : true
            });

            pos = {};
            Ext.Array.forEach(calls, function(call, index, all) {
                pos[(call[0] || 'root') + '-' + call[1]] = index;
            });

            t.ok(
                // 1 is topmost parent (but root) so it's yellow step should go before 2, 3 green steps
                pos['1-yellow'] < pos['2-green'] &&
                pos['1-yellow'] < pos['3-green'] &&
                // and it's green step should go after
                pos['1-green']  > pos['2-green'] &&
                pos['1-green']  > pos['3-green'] &&
                // 3 is parent too, so it's yellow step should go before 4, 5 green steps
                pos['3-yellow'] < pos['4-green'] &&
                pos['3-yellow'] < pos['5-green'] &&
                // and it's green step should go after
                pos['3-green']  > pos['4-green'] &&
                pos['3-green']  > pos['5-green'] &&
                // 3 is successor of 2 and 3 is parent node thus it's yellow step should go after 2 green
                pos['3-yellow'] > pos['2-green'] &&
                // 5 is successor of 4 thus it's green step should go after 4 green
                pos['5-green']  > pos['4-green'],
                //
                "Relative step positions are correct"
            );
        }
    });


    t.it('Linearization of hierarchical structure with nested parents and complex dependencies should work', function (t) {
        with (t.getAllStoresDataSet(
            [
                { Id : 1, children : [
                    { Id : 2, children : [
                        { Id : 7, leaf : true }
                    ]},
                    { Id : 3, leaf : true }
                ]},
                { Id : 4, children : [
                    { Id : 5, leaf : true },
                    { Id : 6, leaf : true }
                ]}
            ],
            [
                { From : 2, To : 3 },
                { From : 7, To : 3 },
                { From : 1, To : 4 },
                { From : 5, To : 6 }
            ]
        )) {
            var calls = [],
                pos   = {};

            // As if we move the 1
            taskStore.linearWalkDependentTasks(id(1), function (task, color) {
                calls.push([ task.getId(), color ]);
            }, {
                self        : true,
                ancestors   : true,
                descendants : true,
                successors  : true
            });

            pos = {};
            Ext.Array.forEach(calls, function(call, index, all) {
                pos[(call[0] || 'root') + '-' + call[1]] = index;
            });

            t.ok(
                // 1 is parent thus it's yellow step goes before 2, 3 green ones
                pos['1-yellow'] < pos['2-green'] &&
                pos['1-yellow'] < pos['3-green'] &&
                // and it's green state goes after
                pos['1-green']  > pos['2-green'] &&
                pos['1-green']  > pos['3-green'] &&
                // 2 is parent thus it's yellow step goes before 7 green one
                pos['2-yellow'] < pos['7-green'] &&
                // and it's green state goes after
                pos['2-green']  > pos['7-green'] &&
                // 4 is involved via dependency and it's parent thus it's yellow step goes before 5, 6 green ones
                pos['4-yellow'] < pos['5-green'] &&
                pos['4-yellow'] < pos['6-green'] &&
                // and it's green goes after
                pos['4-green']  > pos['5-green'] &&
                pos['4-green']  > pos['6-green'] &&
                // 3 is successor of 7 thus it's green goes after 7's
                pos['3-green']  > pos['7-green'] &&
                // 3 is successor of 2 thus it's green goes after 2's
                pos['3-green']  > pos['2-green'] &&
                // 6 is successor of 5 thus it's green goes after 5's
                pos['6-green']  > pos['5-green'] &&
                // 4 is successor of 1 thus it's green goes after 1's
                pos['4-green']  > pos['1-green'],
                //
                "Relative step positions are correct"
            );
        }
    });


    t.it('Linearization of hierarchical structure with nested parents and more complex dependencies should work', function (t) {
        with (t.getAllStoresDataSet(
            [
                { Id : 1, children : [
                    { Id : 2, leaf : true }
                ]},
                { Id : 3, children : [
                    { Id : 4, leaf : true }
                ]}
            ],
            [
                { From : 2, To : 4 },
                { From : 1, To : 3 }
            ]
        )) {
            var calls = [],
                pos   = {};

            // As if we move 2
            taskStore.linearWalkDependentTasks(id(2), function (task, color) {
                calls.push([ task.getId(), color ]);
            }, {
                self        : true,
                ancestors   : true,
                descendants : true,
                successors  : true
            });

            pos = {};
            Ext.Array.forEach(calls, function(call, index, all) {
                pos[(call[0] || 'root') + '-' + call[1]] = index;
            });

            t.ok(
                // 1 is parent of 2 thus it's yellow step goes before 2's green
                pos['1-yellow'] < pos['2-green'] &&
                // and it's green state goes after 2's one
                pos['1-green']  > pos['2-green'] &&
                // 2 is successor of 1 and one is parent thus it's green step goes after 1's yellow
                pos['2-green']  > pos['1-yellow'] &&
                // 3 is parent of 4 and thus it's involved since 4 is successor of 2 thus 3's yellow step goes before 4's green
                pos['3-yellow'] < pos['4-green'] &&
                // and it's green step goes after 4's one
                pos['3-green']  > pos['4-green'] &&
                // 4 is successor of 2 thus it's green step goes after 2's one
                pos['4-green']  > pos['2-green'],
                //
                "Relative step positions are correct"
            );
        }
    });


    t.it('Linearization with cycle', function (t) {
        with (t.getAllStoresDataSet(
            [
                { Id : 1, children : [
                    { Id : 2, leaf : true }
                ]},
                { Id : 3, children : [
                    { Id : 4, leaf : true }
                ]}
            ],
            [
                { From : 2, To : 4 },
                { From : 1, To : 3 }
            ]
        )) {
            var calls = [];

            // As if we move the parent
            taskStore.linearWalkDependentTasks(id(2), function (task, color) {
                calls.push([ task.getId(), color ]);
            }, {
                self        : true,
                ancestors   : true,
                descendants : true,
                successors  : true,
                cycles      : 'cut'
            });

            t.is(calls.length, 8, "Cycle has been cut total linear sequence length is 8, 2 x 3 (parent nodes, root included) + 2 leaf nodes");
        }
    });

    t.it("Linearinzation of ancestor only hierarchy should work", function(t) {
        with (t.getAllStoresDataSet(
            [
                { Id : 1, children : [
                    { Id : 2, leaf : true },
                    { Id : 3, children : [
                        { Id : 4, leaf : true },
                        { Id : 5, leaf : true }
                    ]}
                ]}
            ],
            [
                { From : 2, To : 3 },
                { From : 4, To : 5 }
            ]
        )) {
            var calls = [],
                pos   = {};

            // As if we move a child and cascade changes is false, but recalculate parents is true
            taskStore.linearWalkDependentTasks(id(5), function (task, color) {
                calls.push([ task.getId(), color ]);
            }, {
                self      : true,
                ancestors : true
            });

            pos = {};
            Ext.Array.forEach(calls, function(call, index, all) {
                pos[(call[0] || 'root') + '-' + call[1]] = index;
            });

            // We update 5 and liniarize ancestors hierarchy only
            // thus our dependency tree is just
            // Root - 1 - 3 - 5, horizontal dependencies are ignored
            t.ok(
                // Root is parent of 1 thus it's yellow step goes before 1's green
                pos['root-yellow'] < pos['1-green'] &&
                // and it's green step goes after 1's one
                pos['root-green']  > pos['1-green'] &&
                // 1 is parent of 3 thus it's yellow step goes before 3's green
                pos['1-yellow']    < pos['3-green'] &&
                // and it's green step goes after 1's one
                pos['1-green']     > pos['3-green'] &&
                // 3 is parent of 5 thus it's yellow step goes before 5's green
                pos['3-yellow']    < pos['5-green'] &&
                // and it's green step goes after 5's one
                pos['3-green']     > pos['5-green'],
                //
                "Relative step positions are correct"
            );
        }
    });

    t.it("Linearinzation of several ancestor only hierarchies should work", function(t) {
        with (t.getAllStoresDataSet(
            [
                { Id : 1, children : [
                    { Id : 2, leaf : true },
                    { Id : 3, children : [
                        { Id : 4, leaf : true },
                        { Id : 5, leaf : true }
                    ]}
                ]},
                { Id : 6, children : [
                    { Id : 7, leaf : true }
                ]}
            ],
            [
                { From : 2, To : 3 },
                { From : 4, To : 5 },
                { From : 5, To : 7 }
            ]
        )) {
            var calls = [],
                pos   = {};

            // As if we move a child and cascade changes is false, but recalculate parents is true
            taskStore.linearWalkDependentTasks([ id(5), id(7) ], function (task, color) {
                calls.push([ task.getId(), color ]);
            }, {
                self      : true,
                ancestors : true
            });

            pos = {};
            Ext.Array.forEach(calls, function(call, index, all) {
                pos[(call[0] || 'root') + '-' + call[1]] = index;
            });

            // We update 5 and 7 and liniarize ancestors hierarchy only
            // thus our dependency tree is just
            // Root - 1 - 3 - 5 + Root - 6 - 7, horizontal dependencies are ignored
            t.ok(
                // Root is parent of 1 thus it's yellow step goes before 1's green
                pos['root-yellow'] < pos['1-green'] &&
                // and it's green step goes after 1's one
                pos['root-green']  > pos['1-green'] &&
                // 1 is parent of 3 thus it's yellow step goes before 3's green
                pos['1-yellow']    < pos['3-green'] &&
                // and it's green step goes after 1's one
                pos['1-green']     > pos['3-green'] &&
                // 3 is parent of 5 thus it's yellow step goes before 5's green
                pos['3-yellow']    < pos['5-green'] &&
                // and it's green step goes after 5's one
                pos['3-green']     > pos['5-green'] &&
                // Root is a parent of 6 thus it's yellow step goes before 6's green
                pos['root-yellow'] < pos['6-green'] &&
                // and it's green step goes after 6's one
                pos['root-green']  > pos['6-green'] &&
                // 6 is a parent of 6 thus it's yellow step goes before 7's green
                pos['6-yellow']    < pos['7-green'] &&
                // and it's green step goes after 7's one
                pos['6-green']     > pos['7-green'],
                //
                "Relative step positions are correct"
            );
        }
    });

    t.it([
        "Linearization of descendants only hierarchies should work"
    ].join(''), function(t) {
        with (t.getAllStoresDataSet(
            [
                { Id : 1, children : [
                    { Id : 2, leaf : true },
                    { Id : 3, children : [
                        { Id : 4, leaf : true },
                        { Id : 5, leaf : true }
                    ]}
                ]},
                { Id : 6, children : [
                    { Id : 7, leaf : true }
                ]}
            ],
            [
                { From : 2, To : 3 },
                { From : 4, To : 5 },
                { From : 5, To : 7 }
            ]
        )) {
            var calls = [],
                pos   = {};

            // As if we move a child and cascade changes is false, but recalculate parents is false, but move
            // parent as group is true
            taskStore.linearWalkDependentTasks([ id(3), id(6) ], function (task, color) {
                calls.push([ task.getId(), color ]);
            }, {
                self        : true,
                descendants : true
            });

            pos = {};
            Ext.Array.forEach(calls, function(call, index, all) {
                pos[(call[0] || 'root') + '-' + call[1]] = index;
            });

            // We update 3 and 6 and liniarize descendants hierarchy only
            // thus our dependency tree is just
            // 3 - 4 - 5 + 6 - 7, horizontal and vertical dependencies are ignored
            t.ok(
                // 3 is parent of 4 thus it's yellow step goes before 4's green
                pos['3-yellow']    < pos['4-green'] &&
                // and it's green step goes after 4's one
                pos['3-green']     > pos['4-green'] &&
                // 3 is parent of 5 thus it's yellow step goes before 5's green
                pos['3-yellow']    < pos['5-green'] &&
                // and it's green step goes after 5's one
                pos['3-green']     > pos['5-green'] &&
                // 6 is a parent of 7 thus it's yellow step goes before 7's green
                pos['6-yellow']    < pos['7-green'] &&
                // and it's green step goes after 7's one
                pos['6-green']     > pos['7-green'],
                //
                "Relative step positions are correct"
            );
        }
    });

    t.it([
        "Linearinzation of several ancestor/descendants only hierarchies should work for a task in the middle",
        "of hierarchy it should collect all it's ancestors and all it's children"
    ].join(''), function(t) {
        with (t.getAllStoresDataSet(
            [
                {
                    Id : 1,
                    children : [
                        { Id : 2, leaf : true }
                    ]
                }
            ]
        )) {
            var calls = [],
                pos   = {};

            // As if we move a child and cascade changes is false, but recalculate parents is true and
            // move parent as group is true
            taskStore.linearWalkDependentTasks([ id(1) ], function (task, color) {
                calls.push([ task.getId(), color ]);
            }, {
                self        : true,
                ancestors   : true,
                descendants : true
            });

            pos = {};
            Ext.Array.forEach(calls, function(call, index, all) {
                pos[(call[0] || 'root') + '-' + call[1]] = index;
            });

            t.ok(
                pos['root-yellow'] < pos['1-green'] &&
                pos['root-green']  > pos['1-green'] &&
                pos['1-yellow']    < pos['2-green'] &&
                pos['1-green']     > pos['2-green'],
                //
                "Relative step positions are correct"
            );
        }
    });

    t.it("Dependent tasks linearization of a task out of a task store should return sequence consisting of just that task", function(t) {
        with (t.getAllStoresDataSet([])) {
            var calls   = [];

            taskStore.linearWalkDependentTasks(new taskStore.model({Id : 1}), function (task, color) {
                calls.push([ task.getId(), color ]);
            });

            t.isDeeply(calls, [
                [ 1, 'green' ]
            ]);
        }
    });

    t.it("Ancestor hierarchy only dependent tasks linearization of a task out of a task store should return sequence consisting of just that task", function(t) {
        with (t.getAllStoresDataSet([])) {
            var calls   = [];

            taskStore.linearWalkDependentTasks(new taskStore.model({Id : 1}), function (task, color) {
                calls.push([ task.getId(), color ]);
            }, {
                self      : true,
                ancestors : true
            });

            t.isDeeply(calls, [
                [ 1, 'green' ]
            ]);
        }
    });

    t.it("Linearization of self nodes only should work", function(t) {
         with (t.getAllStoresDataSet(
            [
                { Id : 1, children : [
                    { Id : 2, leaf : true },
                    { Id : 3, children : [
                        { Id : 4, leaf : true },
                        { Id : 5, leaf : true }
                    ]}
                ]},
                { Id : 6, children : [
                    { Id : 7, leaf : true }
                ]}
            ],
            [
                { From : 2, To : 3 },
                { From : 4, To : 5 },
                { From : 5, To : 7 }
            ]
        )) {
            var calls = [],
                pos   = {};

            taskStore.linearWalkDependentTasks([ id(3), id(6) ], function (task, color) {
                calls.push([ task.getId(), color ]);
            }, {
                self        : true
            });

            pos = {};
            Ext.Array.forEach(calls, function(call, index, all) {
                pos[(call[0] || 'root') + '-' + call[1]] = index;
            });

            // We update 3 and 6 and liniarize self hierarchy only
            // thus our dependency tree is just 3 and 6
            t.ok(
                calls.length == 2 && ('3-green' in pos) && ('6-green' in pos),
                "Relative step positions are correct"
            );
        }
    });

    t.it("Linearization should not place child tasks before parent tasks in a walking sequence", function (t) {

        with (t.getAllStoresDataSet(
            [
                {
                  Id : 1, leaf : true
                },
                { Id : 6, children : [
                    { Id : 7, leaf : true },
                    { Id : 8, children : [
                        { Id : 9, leaf  :true }
                    ] }
                ]}
            ],
            [
                { From : 1, To : 6 }
            ]
        )) {

            var calls = [],
                pos   = {};

            taskStore.linearWalkDependentTasks([ id(1) ], function (task, color) {
                calls.push([ task.getId(), color ]);
            }, {
                self        : true,
                ancestors   : true,
                descendants : true,
                successors  : true
            });

            pos = {};
            Ext.Array.forEach(calls, function(call, index, all) {
                pos[(call[0] || 'root') + '-' + call[1]] = index;
            });

            t.ok(
                pos['8-yellow'] > pos['6-yellow'],
                "Relative step position is correct"
            );

        }
    });
});
