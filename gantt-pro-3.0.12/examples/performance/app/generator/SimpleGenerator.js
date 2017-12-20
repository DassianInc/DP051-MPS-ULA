Ext.define('Gnt.examples.performance.generator.SimpleGenerator', function(thisClass) {

    var meta = Gnt.examples.performance.Functions.meta;

    var DEPENDENCIES_FROM_TO_SHIFT = 5;

    function generateTasks(params, rndFn) {

        var tasks = [],
            j, k,
            cn,
            id = 0,
            nbrTasks = params.tasks.amount,
            start = new Date(),
            end = new Date(start.valueOf() + 5 * 24 * 60 * 60 * 1000);

        for (var i = 0; i < nbrTasks / 100; i++) {

            tasks.push({
                Id        : ('p' + (++id)),
                Name      : 'Root task',
                StartDate : start,
                EndDate   : end,
                expanded  : true,
                children  : (function() {
                    cn = [];

                    for (j = 0; j < 99; j++) {
                        cn.push({
                            Id        : ++id,
                            Name      : 'Child task',
                            StartDate : start,
                            EndDate   : end,
                            leaf      : true
                        });
                    }

                    return cn;
                }())
            });
        }

        return {
            leaf : false,
            children : tasks,
            expanded : true,
            amount : nbrTasks,
            StartDate : start
        };
    }

    function generateDependencies(params, rootTask, rndFn) {
        var nbrDependencies = params.dependencies.amount,
            dependencies    = [],
            i;

        for (i = 1; i < nbrDependencies; i++) {
            dependencies.push({
                From : i,
                To   : i + DEPENDENCIES_FROM_TO_SHIFT
            });
        }

        return dependencies;
    }

    function generate(params, rndFn) {
        var me           = this,
            rootTask     = generateTasks(params, rndFn),
            dependencies = generateDependencies(params, rootTask, rndFn);

        return {
            rootTask     : rootTask,
            dependencies : dependencies
        };
    }

    return {
        alias : 'datagenerator.simple',

        title : 'Simple',

        generateTasks : meta(
            // {{{ Meta
            {
                group  : 'Parameters',
                params : {
                    'tasks.amount' : {
                        fieldLabel    : 'Tasks amount',
                        xtype         : 'numberfield',
                        minValue      : 200,
                        value         : 200,
                        allowDecimals : false
                    }
                }
            },
            // }}}
            generateTasks
        ),

        generateDependencies : meta(
            // {{{ Meta
            {
                group  : 'Parameters',
                params : {
                    'dependencies.amount' : {
                        fieldLabel    : 'Dependencies amount',
                        xtype         : 'numberfield',
                        minValue      : 0,
                        value         : 195,
                        allowDecimals : false,
                        validator     : function(value, get) {
                            var tasks = get('tasks.amount'),
                                result;

                            switch (true) {
                                case !Ext.isNumeric(value):
                                    result = "Amount must be a number";
                                    break;
                                case (value && (value > tasks - DEPENDENCIES_FROM_TO_SHIFT)):
                                    result = "Amount can't be more than " + (tasks - DEPENDENCIES_FROM_TO_SHIFT);
                                    break;
                                default:
                                    result = true;
                            }

                            return result;
                        }
                    }
                }
            },
            // }}}
            generateDependencies
        ),

        generate : generate
    };
});
