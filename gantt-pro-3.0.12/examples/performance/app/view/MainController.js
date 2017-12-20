Ext.define('Gnt.examples.performance.view.MainController', function(thisClass) {

    var control = {
        'ganttpanel' : {
            'select' : {
                fn     : onTaskSelect$,
                buffer : 1
            }
        },
        'generator-parameters-form' : {
            'generate' : onGenerateDataRequest$
        }
    };

    function init$() {
        var me    = this,
            model = this.getViewModel(),
            taskStore,
            dependencyStore,
            resourceStore,
            assignmentStore,
            calendar,
            gantt, ganttContainer,
            perfmon, perfbus;

        // Initializing performance minitoring bus
        perfmon = me.lookupReference('perfmon');
        perfmon.setSensors({
            'data-clear'         : "Data clearing",
            'data-load'          : "Data loading",
            //'data-load-native'   : "Data loading (native)",
            'data-normalization' : "Data normalization",
            'gantt-tasks-render' : "Gantt tasks rendering",
            'gantt-deps-render'  : "Gantt dependencies rendering",
            'linearization'      : "Linearization",
            'propagate-changes'  : "Changes propagation"
        });
        perfbus = perfmon.getBus();

        // Setting generators related data
        model.set('seed', 'Bryntum');

        model.set('generators', {
            simple   : Ext.createByAlias('datagenerator.simple'),
            advanced : Ext.createByAlias('datagenerator.advanced')
        });

        // Gantt panel doesn't support ExtJS5 view model binding functionality, so we are to create it the old way
        dependencyStore = Ext.create('Gnt.data.DependencyStore', {
            proxy          : 'memory',
            performanceBus : perfbus
        });
        model.set('dependencyStore', dependencyStore);

        resourceStore = Ext.create('Gnt.data.ResourceStore', {
            proxy          : 'memory',
            performanceBus : perfbus
        });
        model.set('resourceStore',   resourceStore);

        assignmentStore = Ext.create('Gnt.data.AssignmentStore', {
            proxy          : 'memory',
            performanceBus : perfbus
        });
        model.set('assignmentStore', assignmentStore);

        calendar = Ext.create('Gnt.data.calendar.BusinessTime', {
            proxy          : 'memory',
            performanceBus : perfbus
        });
        model.set('calendar', calendar);

        taskStore = Ext.create('Gnt.examples.performance.gantt.data.TaskStore', {
            cascadeChanges     : false,
            recalculateParents : false,
            autoNormalizeNodes : false,

            root : {
                expanded : true
            },
            proxy           : 'memory',
            dependencyStore : dependencyStore,
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            calendar        : calendar,
            performanceBus  : perfbus
        });
        model.set('taskStore', taskStore);

        gantt = Ext.create('Gnt.examples.performance.gantt.panel.Gantt', {
            title             : 'Gantt chart',

            reference         : 'gantt',
            taskStore         : taskStore,

            viewPreset        : 'weekDateAndMonth',
            startDate         : new Date(),
            highlightWeekends : true,
            infiniteScroll    : true,
            columnLines       : true,
            rowLines          : true,

            plugins           : [ { ptype : 'scheduler_pan' } ],

            columns           : [{
                xtype : 'namecolumn',
                width : 200
            }, {
                xtype : 'startdatecolumn'
            }, {
                xtype : 'enddatecolumn'
            }],

            performanceBus : perfbus
        });

        ganttContainer = me.lookupReference('gantt-container');
        ganttContainer.add(gantt);
    }

    function onTaskSelect$(sm, task) {
        var me = this;
        me.lookupReference('gantt').normalGrid.getView().scrollEventIntoView(task);
    }

    function onGenerateDataRequest$(formPanel, generatorName, generator, generatorParams, seed) {
        var me              = this,
            perfmon         = me.lookupReference('perfmon'),
            perfbus         = perfmon.getBus(),
            gantt           = me.lookupReference('gantt'),
            model           = me.getViewModel(),
            data            = generateNewData(generator, generatorParams, seed),
            taskStore       = model.get('taskStore'),
            dependencyStore = model.get('dependencyStore'),
            resourceStore   = model.get('resourceStore'),
            assignmentStore = model.get('assignmentStore'),
            calendar        = model.get('calendar');

        // Clearing current data
        perfbus.fireEvent('data-clear', 'data-clear-done');
        dependencyStore.removeAll();
        assignmentStore.removeAll();
        resourceStore.removeAll();
        taskStore.getRoot().removeAll();
        calendar.removeAll();
        perfbus.fireEvent('data-clear-done');

        // Loading data
        perfbus.fireEvent('data-load', 'data-load-done');

        //console.profile('Data loading');

        data.holidays     && calendar.add(data.holidays);
        taskStore.beginUpdate();
        data.rootTask     && taskStore.getRoot().appendChild(Ext.clone(data.rootTask.children));
        taskStore.endUpdate();
        data.dependencies && dependencyStore.add(data.dependencies);
        data.resources    && resourceStore.add(data.resources);
        data.assignments  && assignmentStore.add(data.assignments);

        //console.profileEnd('Data loading');

        perfbus.fireEvent('data-load-done');

        /* To compare with native store
        var treeStore = Ext.create('Ext.data.TreeStore', {
            root : {expanded : true}
        });
        perfbus.fireEvent('data-load-native', 'data-load-native-done');
        treeStore.beginUpdate();
        treeStore.getRoot().appendChild(Ext.clone(data.rootTask.children));
        treeStore.endUpdate();
        perfbus.fireEvent('data-load-native-done');
        */

        gantt.setTitle("Gantt chart (" + taskStore.getCount() + " tasks)");
    }

    function generateNewData(generator, params, seed) {
        var RNDS  = Gnt.examples.performance.generator.Rnds,
            rndFn = Ext.isEmpty(seed) ? RNDS.createNative() : RNDS.createStable(seed);

        return generator.generate(params, rndFn);
    }

    return {
        extend  : 'Ext.app.ViewController',
        alias   : 'controller.main',
        uses    : [
            'Gnt.examples.performance.generator.Rnds',
            'Gnt.examples.performance.generator.SimpleGenerator',
            'Gnt.examples.performance.generator.AdvancedGenerator',
            'Gnt.examples.performance.perfmon.Bus',
            'Gnt.examples.performance.gantt.data.TaskStore',
            'Gnt.examples.performance.gantt.panel.Gantt'
        ],
        control : control,
        init    : init$
    };
});
