/* jshint -W085 */
/* global taskStore, id */
StartTest(function(t) {

    t.describe("Linearization 'none' cycle cut strategy", function(t) {

        t.it("Should do nothing", function(t) {

            with (t.getAllStoresDataSet(
                [
                    { Id : 1, leaf : true },
                    { Id : 2, leaf : true }
                ],
                [
                    { From : 1, To : 2 },
                    { From : 2, To : 1 }
                ]
            )) {
                var calls = 0;

                t.livesOk(
                    function() {
                        taskStore.linearWalkDependentTasks(id(1), function (task, color) {
                            t.ok(calls < 1, [
                                "Single call to process should have been done since the data set is cycled entirely",
                                "and only first step with 'yellow' stage root node processing should be possible."
                            ].join(''));
                            calls++;
                        }, {
                            self        : true,
                            ancestors   : true,
                            descendants : true,
                            successors  : true,
                            cycles      : 'none'
                        });
                    },
                    "'none' cycle cutting strategy should silently ignore any cycles and throw no exception."
                );
            }

        });
    });

    t.describe("Linearization 'exception' cycle cut strategy", function(t) {

        t.it("Should throw exception in case there's a cycle found", function(t) {

            with (t.getAllStoresDataSet(
                [
                    { Id : 1, leaf : true },
                    { Id : 2, leaf : true }
                ],
                [
                    { From : 1, To : 2 },
                    { From : 2, To : 1 }
                ]
            )) {
                var calls = 0;

                t.throwsOk(
                    function() {
                        var prevConsoleError = window.console && window.console.error;

                        if (prevConsoleError) {
                            window.console.error = Ext.emptyFn;
                        }

                        try {
                            taskStore.linearWalkDependentTasks(id(1), function (task, color) {
                                t.ok(calls < 1, [
                                    "Single call to process should have been done since the data set is cycled entirely",
                                    "and only first step with 'yellow' stage root node processing should be possible."
                                ].join(''));
                                calls++;
                            }, {
                                self        : true,
                                ancestors   : true,
                                descendants : true,
                                successors  : true,
                                cycles      : 'exception'
                            });
                        }
                        catch (e) {
                            prevConsoleError && (window.console.error = prevConsoleError);
                            throw e;
                        }
                    },
                    "a cycle in the dependency chain",
                    "'exception' cycle cutting strategy should throw an exception if any cycle is found in the dependent tasks set."
                );
            }

        });
    });

    t.describe("Linearization 'cut' cycle cut strategy", function(t) {

        t.it("Should be able to cut simpliest (direct) cycles", function(t) {

            with (t.getAllStoresDataSet(
                [
                    { Id : 1, leaf : true },
                    { Id : 2, leaf : true }
                ],
                [
                    { From : 1, To : 2 },
                    { From : 2, To : 1 }
                ]
            )) {
                var calls = [];

                taskStore.linearWalkDependentTasks(id(1), function (task, color) {
                    calls.push([ task.getId(), color ]);
                }, {
                    self        : true,
                    ancestors   : true,
                    descendants : true,
                    successors  : true,
                    cycles      : 'cut'
                });

                t.is(calls.length, 4, [
                    "Total 4 calls should have been done, 2 calls for leaf nodes and 2 calls for root node 'yellow'",
                    "and 'green' stages"
                ].join(' '));
            }
        });

        t.it("Should be able to cut inderect cycles", function(t) {

            with (t.getAllStoresDataSet(
                [
                    { Id : 1, leaf : true },
                    { Id : 2, leaf : true },
                    { Id : 3, leaf : true }
                ],
                [
                    { From : 1, To : 2 },
                    { From : 2, To : 3 },
                    { From : 3, To : 1 }
                ]
            )) {
                var calls = [];

                taskStore.linearWalkDependentTasks(id(1), function (task, color) {
                    calls.push([ task.getId(), color ]);
                }, {
                    self        : true,
                    ancestors   : true,
                    descendants : true,
                    successors  : true,
                    cycles      : 'cut'
                });

                t.is(calls.length, 5, [
                    "Total 5 calls should have been done, 3 calls for leaf nodes and 2 calls for root node 'yellow'",
                    "and 'green' stages"
                ].join(' '));
            }
        });

        t.it("Must get rid of all possible cycles in dependent node set", function(t) {

            with (t.getAllStoresDataSet(
                [
                    { Id : 1, leaf : true },
                    { Id : 2, leaf : true },
                    { Id : 3, leaf : true },
                    { Id : 4, leaf : true },
                    { Id : 5, leaf : true },
                    { Id : 6, leaf : true },
                    { Id : 7, leaf : true },
                    { Id : 8, leaf : true }
                ],
                [
                    // First loop
                    { From : 1, To : 2 },
                    { From : 2, To : 3 },
                    { From : 3, To : 4 },
                    { From : 4, To : 1 },
                    // Second loop
                    { From : 5, To : 6 },
                    { From : 6, To : 7 },
                    { From : 7, To : 8 },
                    { From : 8, To : 5 },
                    // Both loops connected
                    { From : 5, To : 1 }
                ]
            )) {
                var calls = [];

                taskStore.linearWalkDependentTasks(id(5), function (task, color, sourceSet, depsData) {
                    calls.push([ task.getId(), color ]);
                }, {
                    self        : true,
                    ancestors   : true,
                    descendants : true,
                    successors  : true,
                    cycles      : 'cut'
                });

                t.is(calls.length, 10, [
                    "Total 10 calls should have been done, 8 calls for leaf nodes and 2 calls for root node 'yellow'",
                    "and 'green' stages"
                ].join(' '));
            }
        });

        t.it('Should be able to cut simple hierarchical cycels', function(t) {

            with (t.getAllStoresDataSet(
                [
                    { Id : 1, children : [
                        { Id : 2, leaf : true }
                    ] },
                    { Id : 3, children : [
                        { Id : 4, leaf : true }
                    ] }
                ],
                [
                    { From : 2, To : 3 },
                    { From : 4, To : 1 }
                ]
            )) {
                var calls = [];

                taskStore.linearWalkDependentTasks(id(1), function (task, color, sourceSet, depsData) {
                    calls.push([ task.getId(), color ]);
                }, {
                    self        : true,
                    ancestors   : true,
                    descendants : true,
                    successors  : true,
                    cycles      : 'cut'
                });

                t.is(calls.length, 8, [
                    "Total 8 calls should have been done, 2 calls for leaf nodes and 2 calls for each parent node",
                    "'yellow' and 'green' stages including the root node"
                ].join(' '));
            }
        });

        t.it("Should be able to cut simpliest hierarchical cycles (issue #1878)", function(t) {

            with (t.getAllStoresDataSet(
                [
                    { Id : 1, children : [
                        { Id : 2, leaf : true }
                    ]}
                ],
                [
                    { From : 1, To : 2 }
                ]
            )) {
                var calls = [];

                taskStore.linearWalkDependentTasks(id(1), function (task, color, sourceSet, depsData) {
                    calls.push([ task.getId(), color ]);
                }, {
                    self        : true,
                    ancestors   : true,
                    descendants : true,
                    successors  : true,
                    cycles      : 'cut'
                });

                t.is(calls.length, 5, [
                    "Total 5 calls should have been done, 1 call for leaf nodes and 2 calls for each parent node",
                    "'yellow' and 'green' stages including the root node"
                ].join(' '));
            }
        });

        t.it("Should be able to cut inderect hierarchical cycles (issue #1878)", function(t) {

            with (t.getAllStoresDataSet(
                [
                    { Id : 1, children : [
                        { Id : 2, children : [
                            { Id : 3, leaf : true }
                        ] }
                    ] }
                ],
                [
                    { From : 1, To : 3 }
                ]
            )) {
                var calls = [];

                taskStore.linearWalkDependentTasks(id(1), function (task, color, sourceSet, depsData) {
                    calls.push([ task.getId(), color ]);
                }, {
                    self        : true,
                    ancestors   : true,
                    descendants : true,
                    successors  : true,
                    cycles      : 'cut'
                });

                t.is(calls.length, 7, [
                    "Total 7 calls should have been done, 1 call for leaf nodes and 2 calls for each parent node",
                    "'yellow' and 'green' stages including the root node"
                ].join(' '));
            }

        });
    });
});
