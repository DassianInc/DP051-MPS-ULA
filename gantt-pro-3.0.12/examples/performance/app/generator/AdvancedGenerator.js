Ext.define('Gnt.examples.performance.generator.AdvancedGenerator', function (thisClass) {

    var meta = Gnt.examples.performance.Functions.meta;

    var START_AT                    = new Date(),
        MIN_TASKS_DEPTH             = 1,
        MAX_TASKS_DEPTH             = 6,
        TASKS_DEPTH_STEP            = 1,
        MIN_TASKS_CHILDREN          = 1,
        MAX_TASKS_CHIDLREN          = 20,
        TASKS_CHILDREN_STEP         = 1,
        MIN_TASKS_BRANCHING_FACTOR  = 0.1,
        MAX_TASKS_BRANCHING_FACTOR  = 0.9,
        TASKS_BRANCHING_FACTOR_STEP = 0.05,
        MIN_TASKS_AMOUNT            = tasksAmountFormula(MIN_TASKS_CHILDREN, MIN_TASKS_DEPTH, MIN_TASKS_BRANCHING_FACTOR),
        MAX_TASKS_AMOUNT            = tasksAmountFormula(MAX_TASKS_CHIDLREN, MAX_TASKS_DEPTH, MAX_TASKS_BRANCHING_FACTOR);

    /**
     * We consider a tree as functional dependency between
     * - amount
     * - maxChildren (per branch)
     * - maxDepth
     * - branchingFactor:
     *
     *      tree(amount, maxChildren, maxDepth, branchingFactor)
     *
     * The total amount of nodes in a tree where each node might have N subnodes and a tree might have L levels is
     *
     *        (L+1)
     *       N     - 1
     *  TN = ---------
     *         N - 1
     *
     * for example, just for root, where L = 0 we will have (N - 1) / (N - 1) = 1, i.e. just root
     * for, N = 2 and L = 1 -> 3
     *
     * In our case each branch might have different amount of children up to NC. We can calculate medium amount
     * of children per branch:
     *
     *         1 + NC
     *  MEDC = ------
     *           2
     *
     * Also our tree generating algorithm uses rational branching factor less then 1, it means what part
     * of direct child nodes might be branches, thus
     *
     *  N = BF * MEDC
     *
     * but amount of nodes calculated using just the 1st formula, for our case, would count only part of the nodes.
     * For each parent node there might be leaf nodes which do not grow further in depth, and which are not covered
     * by N, instead they are M, where
     *
     *  M = (1 - BF) * MEDC
     *
     * so for each parent node there might be N + M children
     *
     * Amount of parent nodes in a tree, those which might have +M children, is calculated using same 1st formula
     * but tree depth must be decremented, thus
     *
     *         L
     *        N - 1
     *  TNb = -----, and must be greater then 0
     *        N - 1
     *
     * So total amount of all nodes is:
     *
     *  TA = TN + max(0, TNb) * M
     */
    function tasksAmountFormula(children, depth, branching) {
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
    }

    function calculateTreeGeneratingParams(amount, minDuration, maxDuration) {
        var minChildren         = MIN_TASKS_CHILDREN,
            maxChildren         = MAX_TASKS_CHIDLREN,
            childrenStep        = TASKS_CHILDREN_STEP,
            minBranchingFactor  = MIN_TASKS_BRANCHING_FACTOR,
            maxBranchingFactor  = MAX_TASKS_BRANCHING_FACTOR,
            branchingFactorStep = TASKS_BRANCHING_FACTOR_STEP,
            minDepth            = MIN_TASKS_DEPTH,
            maxDepth            = MAX_TASKS_DEPTH,
            depthStep           = TASKS_DEPTH_STEP,
            minAmount           = tasksAmountFormula(minChildren, minDepth, minBranchingFactor),
            maxAmount           = tasksAmountFormula(maxChildren, maxDepth, maxBranchingFactor),
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
                    expectedAmount = tasksAmountFormula(children, depth, branchingFactor);
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
            Id        : startIdx,
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
            Id        : idx,
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

    function generateTasks(params, rndFn) {
        var treeParams = calculateTreeGeneratingParams(params.tasks.amount, params.tasks.minDuration, params.tasks.maxDuration),
            root       = createTaskBranch(treeParams, START_AT, 0, 0, rndFn);

        return root;
    }

    function generateDependencies(params, rootTask, rndFn) {
        var leafs        = [],
            dependencies = [],
            linkRate     = params.dependencies.linkrate,
            i, len, task;

        function flatten(task) {
            var i, len, ch;

            if (task.leaf) {
                leafs.push(task);
            }
            else {
                for (ch = task.children, i = 0, len = ch.length; i < len; ++i) {
                    flatten(ch[i]);
                }
            }
        }

        flatten(rootTask);

        for (i = 0, len = leafs.length - 1; i < len; ++i) {
            (rndFn() <= linkRate) && dependencies.push({
                From : leafs[i].Id,
                To   : leafs[i + 1].Id
            });
        }

        return dependencies;
    }

    function generateResources(params, rndFn) {
        // params.resources.amount
    }

    function generateAssignments(params, tasks, resources, rndFn) {
        // params.resources.busyrate
    }

    function generateCalendar(params, rndFn) {
        // params.calendar.holidays
    }

    function generate(params, rndFn) {
        var me           = this,
            root         = generateTasks(params, rndFn),
            dependencies = generateDependencies(params, root, rndFn),
            resources,
            assignments,
            calendar;

        return {
            rootTask     : root,
            dependencies : dependencies,
            resources    : resources,
            assignments  : assignments,
            calendar     : calendar
        };
    }

    return {
        alias : 'datagenerator.advanced',

        title : 'Advanced',

        generateTasks : meta(
            // {{{ Meta
            {
                group  : 'Tasks',
                params : {
                    // {{{ tasks.amount
                    'tasks.amount' : {
                        fieldLabel    : 'Approximate amount',
                        xtype         : 'numberfield',
                        value         : Math.max(MIN_TASKS_AMOUNT, Math.min(200, MAX_TASKS_AMOUNT)),
                        minValue      : 1,
                        allowDecimals : false,
                        validator     : function(value) {
                            var result;

                            switch (true) {
                                case !Ext.isNumeric(value):
                                    result = "Amount must be a number";
                                    break;
                                case (value < MIN_TASKS_AMOUNT):
                                    result = "Amount can't be less than " + MIN_TASKS_AMOUNT;
                                    break;
                                case (value > MAX_TASKS_AMOUNT):
                                    result = "Amount can't be more that " + MAX_TASKS_AMOUNT;
                                    break;
                                default:
                                    result = true;
                            }

                            return result;
                        }
                    },
                    // }}}
                    // {{{ tasks.minDuration
                    'tasks.minDuration' : {
                        fieldLabel    : 'Minimum duration',
                        xtype         : 'numberfield',
                        value         : 1,
                        minValue      : 1,
                        allowDecimals : false,
                        validator     : function(value, get) {
                            var max    = get('tasks.maxDuration'),
                                result;

                            switch (true) {
                                case !Ext.isNumeric(value):
                                    result = "Minimum duration must be a number";
                                    break;
                                case (value < 1):
                                    result = "Minumum duration can't be less than 1";
                                    break;
                                case (Ext.isNumeric(max) && value > max):
                                    result = "Minumum duration can't be greter than maximum duration";
                                    break;
                                default:
                                    result = true;
                            }
                            return result;
                        }
                    },
                    // }}}
                    // {{{ tasks.maxDuration
                    'tasks.maxDuration' : {
                        fieldLabel    : 'Maximum duration',
                        xtype         : 'numberfield',
                        min           : 1,
                        value         : 10,
                        allowDecimals : false,
                        validator     : function(value, get) {
                            var min = get('tasks.minDuration'),
                                result;

                            switch (true) {
                                case !Ext.isNumeric(value):
                                    result= "Maximum duration must be a number";
                                    break;
                                case (Ext.isNumeric(min) && value < min):
                                    result = "Maximum duration can't be less than minimum duration";
                                    break;
                                case (value < 1):
                                    result = "Maximum duration can't be less than 1";
                                    break;
                                default:
                                    result = true;
                            }

                            return result;
                        }
                    }
                    // }}}
                }
            },
            // }}}
            generateTasks
        ),

        generateDependencies : meta(
            // {{{ Meta
            {
                group : 'Dependencies',
                params : {
                    'dependencies.linkrate' : {
                        fieldLabel    : 'Link rate',
                        xtype         : 'numberfield',
                        minValue      : 0,
                        maxValue      : 1,
                        value         : 0.5,
                        step          : 0.1,
                        allowDecimals : true
                    }
                }
            },
            // }}}
            generateDependencies
        ),

        generateResources : meta(
            // {{{ Meta
            {
                group  : 'Resources',
                params : {
                    'resources.amount' : {
                        fieldLabel    : 'Resources amount',
                        xtype         : 'numberfield',
                        minValue      : 0,
                        value         : 1,
                        allowDecimals : false
                    }
                }
            },
            // }}}
            generateResources
        ),

        generateAssignments : meta(
            // {{{ Meta
            {
                group  : 'Resources',
                params : {
                    'resources.busyrate' : {
                        fieldLabel       : 'Busy rate',
                        xtype            : 'numberfield',
                        minValue         : 0,
                        maxValue         : 1,
                        value            : 1,
                        step             : 0.1,
                        allowDecimals    : true
                    }
                }
            },
            // }}}
            generateAssignments
        ),

        generateCalendar : meta(
            // {{{ Meta
            {
                group  : 'Calendar',
                params : {
                    'calendar.holidays' : {
                        fieldLabel    : 'Amount of holidays',
                        xtype         : 'numberfield',
                        minValue      : 0,
                        maxValue      : 364,
                        value         : 0,
                        allowDecimals : false
                    }
                }
            },
            // }}}
            generateCalendar
        ),

        generate : generate
    };
});
