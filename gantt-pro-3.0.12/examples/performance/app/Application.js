Ext.define('Gnt.examples.performance.Application', function(thisClass) {

    var AMOUNT           = 3000,
        MIN_DURATION     = 1,
        MAX_DURATION     = 10,
        START_AT         = new Date(),
        DEPS_COHESION    = 0,
        SEED             = 'Bryntum';

    function createRndFn(seed) {
        var rnd = new Math.seedrandom(seed);
        return function(min, max) {
            var result;

            switch (arguments.length) {
                case 2:
                    result = min + Math.floor((max - min) * rnd());
                    break;
                case 1:
                    result = Math.floor(min * rnd());
                    break;
                default:
                    result = rnd();
            }

            return result;
        };
    }

    function calculateTreeGeneratingParams(amount, minDuration, maxDuration) {
        // We consider a tree as functional dependency between
        // - amount
        // - maxChildren (per branch)
        // - maxDepth
        // - branchingFactor:
        //
        //      tree(amount, maxChildren, maxDepth, branchingFactor)
        //
        // The total amount of nodes in a tree where each node might have N subnodes and a tree might have L levels is
        //
        //        (L+1)
        //       N     - 1
        //  TN = ---------
        //         N - 1
        //
        // for example, just for root, where L = 0 we will have (N - 1) / (N - 1) = 1, i.e. just root
        // for, N = 2 and L = 1 -> 3
        //
        // In our case each branch might have different amount of children up to NC. We can calculate medium amount
        // of children per branch:
        //
        //         1 + NC
        //  MEDC = ------
        //           2
        //
        // Also our tree generating algorithm uses rational branching factor less then 1, it means what part
        // of direct child nodes might be branches, thus
        //
        //  N = BF * MEDC
        //
        // but amount of nodes calculated using just the 1st formula, for our case, would count only part of the nodes.
        // For each parent node there might be leaf nodes which do not grow further in depth, and which are not covered
        // by N, instead they are M, where
        //
        //  M = (1 - BF) * MEDC
        //
        // so for each parent node there might be N + M children
        //
        // Amount of parent nodes in a tree, those which might have +M children, is calculated using same 1st formula
        // but tree depth must be decremented, thus
        //
        //         L
        //        N - 1
        //  TNb = -----, and must be greater then 0
        //        N - 1
        //
        // So total amount of all nodes is:
        //
        //  TA = TN + max(0, TNb) * M
        //
        var formula = function(children, depth, branching) {
                var NC   = children,
                    BF   = branching,
                    L    = depth,
                    MEDC = (1 + NC) / 2,
                    N    = BF * MEDC,
                    M    = (1 - BF) * MEDC,
                    TN, TNb;

                TN  = N > 1 ? (Math.pow(N, L + 1) - 1) / (N - 1) : (L + 1);
                TNb = N > 1 ? (Math.pow(N, L)     - 1) / (N - 1) : L;

                return Math.round(TN + Math.max(0, TNb) * M);
            },
            minChildren         = 2,
            maxChildren         = 50,
            childrenStep        = 1,
            minBranchingFactor  = 0.2,
            maxBranchingFactor  = 0.9,
            branchingFactorStep = 0.05,
            minDepth            = 1,
            maxDepth            = 4,
            depthStep           = 1,
            minAmount           = formula(minChildren, minDepth, minBranchingFactor),
            maxAmount           = formula(maxChildren, maxDepth, maxBranchingFactor),
            expectedAmount, children, branchingFactor, depth;

        amount >= minAmount && amount <= maxAmount ||
            Ext.Error.raise('Can\'t calculate tree generation parameters for given amount: ' + amount);

        expectedAmount = 0;

        for (
            branchingFactor = minBranchingFactor;
            branchingFactor <= maxBranchingFactor && expectedAmount < amount;
            expectedAmount < amount && (branchingFactor += branchingFactorStep)
        ) {
            for (
                depth = minDepth;
                depth <= maxDepth && expectedAmount < amount;
                expectedAmount < amount && (depth += depthStep)
            ) {
                for (
                    children = minChildren;
                    children <= maxChildren && expectedAmount < amount;
                    expectedAmount < amount && (children += childrenStep)
                ) {
                    expectedAmount = formula(children, depth, branchingFactor);
                    //console.log('Expected amount', expectedAmount, 'children', children, 'depth', depth, 'branchingFactor', branchingFactor);
                }
            }
        }

        return {
            requestedAmount : amount,
            expectedAmount  : expectedAmount,
            maxChildren     : children,
            branchingFactor : branchingFactor,
            maxDepth        : depth,
            minDuration     : minDuration,
            maxDuration     : maxDuration
        };
    }

    function createTaskBranch(treeParams, startAt, startIdx, depth, rndFn) {
        var branch,
            duration = 0,
            children = [],
            childrenAmount,
            totalAmount = 0,
            i, task;

        branch = {
            leaf      : false,
            expanded  : true,
            Name      : createBranchName(startIdx),
            StartDate : startAt
        };

        totalAmount    = 1;
        childrenAmount = rndFn(1, treeParams.maxChildren + 1);

        for (i = 0; i < childrenAmount && depth < treeParams.maxDepth; i++) {
            if ((rndFn() <= treeParams.branchingFactor) && (depth + 1 < treeParams.maxDepth)) {
                task = createTaskBranch(treeParams, startAt, startIdx + totalAmount, depth + 1, rndFn);
            }
            else {
                task = createTaskLeaf(treeParams, startAt, startIdx + totalAmount, rndFn);
            }

            totalAmount += task.amount;
            startAt      = new Date(startAt.valueOf() + 24 * 60 * 60 * 1000 * (1 + task.Duration));
            duration    += task.Duration;
            children.push(task);
        }

        branch.children = children;
        branch.amount   = totalAmount;
        branch.Duration = duration;

        return branch;
    }

    function createTaskLeaf(treeParams, startAt, idx, rndFn) {
        return {
            leaf      : true,
            amount    : 1,
            Name      : createLeafName(idx),
            StartDate : startAt,
            Duration  : rndFn(treeParams.minDuration, treeParams.maxDuration + 1)
        };
    }

    function createBranchName(idx) {
        return 'Group ' + idx;
    }

    function createLeafName(idx) {
        return 'Task ' + idx;
    }

    function createTaskStore(amount, minDuration, maxDuration, startAt, startIdx, rndFn) {
        var treeParams = calculateTreeGeneratingParams(amount, minDuration, maxDuration),
            root = createTaskBranch(treeParams, startAt, startIdx, 0, rndFn);

        return Ext.create('Gnt.data.TaskStore', {
            root               : root,
            cascadeChanges     : false,
            recalculateParents : false
        });
    }

    function createDepsStore(cohesion) {
        return null;
    }

    function createGantt(startDate, taskStore, depsStore) {
        return Ext.create('Gnt.panel.Gantt', {
            title             : 'Gantt chart with ' + taskStore.getRoot().get('amount') + ' nodes',
            flex              : 1,
            viewPreset        : 'weekDateAndMonth',
            startDate         : startDate,
            taskStore         : taskStore,
            dependencyStore   : depsStore,
            highlightWeekends : false,
            infiniteScroll    : true,

            plugins           : [{ ptype : 'scheduler_pan' }],

            columns           : [{
                xtype : 'namecolumn',
                width : 200
            }, {
                xtype : 'startdatecolumn'
            }, {
                xtype : 'enddatecolumn'
            }],

            listeners : {
                'afterrender' : function(gantt) {
                    gantt.getSelectionModel().on('select', function(sm, record) {
                        gantt.normalGrid.getView().scrollEventIntoView(record);
                    });
                }
            }
        });
    }

    function launch() {
        /*
        var me        = this,
            viewport  = me.getMainView(),
            rndFn     = createRndFn(SEED),
            taskStore = createTaskStore(AMOUNT, MIN_DURATION, MAX_DURATION, START_AT, 0, rndFn),
            depsStore = createDepsStore(DEPS_COHESION, rndFn);

        viewport.add(createGantt(START_AT, taskStore, depsStore));
        */
    }

    return {
        extend   : 'Ext.app.Application',
        requires : ['Gnt.examples.performance.Functions'],
        launch   : launch
    };
});
