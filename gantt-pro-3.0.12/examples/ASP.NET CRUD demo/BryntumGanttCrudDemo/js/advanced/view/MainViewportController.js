Ext.define('Gnt.examples.advanced.view.MainViewportController', {
    extend : 'Ext.app.ViewController',
    alias  : 'controller.advanced-viewport',

    requires : ['Gnt.widget.calendar.CalendarManagerWindow'],

    control : {
        '#'                                  : { afterrender : 'onAfterRender' },
        'button[reference=shiftPrevious]'    : { click : 'onShiftPrevious' },
        'button[reference=shiftNext]'        : { click : 'onShiftNext' },
        'button[reference=collapseAll]'      : { click : 'onCollapseAll' },
        'button[reference=expandAll]'        : { click : 'onExpandAll' },
        'button[reference=zoomOut]'          : { click : 'onZoomOut' },
        'button[reference=zoomIn]'           : { click : 'onZoomIn' },
        'button[reference=zoomToFit]'        : { click : 'onZoomToFit' },
        'button[reference=viewFullScreen]'   : { click : 'onFullScreen' },
        'button[reference=criticalPath]'     : { click : 'onHighlightCriticlaPath' },
        'button[reference=addTask]'          : { click : 'onAddTask' },
        'button[reference=removeSelected]'   : { click : 'onRemoveSelectedTasks' },
        'button[reference=indentTask]'       : { click : 'onIndent' },
        'button[reference=outdentTask]'      : { click : 'onOutdent' },
        'button[reference=manageCalendars]'  : { click : 'onManageCalendars' },
        'button[reference=saveChanges]'      : { click : 'onSaveChanges' },
        'button[reference=print]'            : { click : 'onPrint' },
        'button[reference=toggleGrouping]'   : { click : 'onToggleGrouping' },
        'button[reference=toggleRollup]'     : { click : 'onToggleRollup' },
        'button[reference=highlightLong]'    : { click : 'onHighlightLongTasks' },
        'button[reference=filterTasks]'      : { click : 'onFilterTasks' },
        'button[reference=clearTasksFilter]' : { click : 'onClearTasksFilter' },
        'button[reference=scrollToLast]'     : { click : 'onScrollToLast' },
        'combo[reference=langSelector]'      : { select : 'onLanguageSelected' }
    },

    getGantt : function () {
        return this.getView().lookupReference('gantt');
    },

    onShiftPrevious : function () {
        this.getGantt().shiftPrevious();
    },

    onShiftNext : function () {
        this.getGantt().shiftNext();
    },

    onCollapseAll : function () {
        this.getGantt().collapseAll();
    },

    onExpandAll : function () {
        this.getGantt().expandAll();
    },

    onZoomOut : function () {
        this.getGantt().zoomOut();
    },

    onZoomIn : function () {
        this.getGantt().zoomIn();
    },

    onZoomToFit : function () {
        this.getGantt().zoomToFit(null, { leftMargin : 100, rightMargin : 100 });
    },

    onFullScreen : function () {
        this.getGantt().getEl().down('.x-panel-body').dom[this.getFullscreenFn()](Element.ALLOW_KEYBOARD_INPUT);
    },

    // Experimental, not X-browser
    getFullscreenFn : function () {
        var docElm = document.documentElement,
            fn;

        if (docElm.requestFullscreen) {
            fn = "requestFullscreen";
        }
        else if (docElm.mozRequestFullScreen) {
            fn = "mozRequestFullScreen";
        }
        else if (docElm.webkitRequestFullScreen) {
            fn = "webkitRequestFullScreen";
        }
        else if (docElm.msRequestFullscreen) {
            fn = "msRequestFullscreen";
        }

        return fn;
    },

    onHighlightCriticlaPath : function (btn) {
        var v = this.getGantt().getSchedulingView();
        if (btn.pressed) {
            v.highlightCriticalPaths(true);
        } else {
            v.unhighlightCriticalPaths(true);
        }
    },

    onAddTask : function () {
        var gantt        = this.getGantt(),
            viewModel    = this.getViewModel(),
            selectedTask = viewModel.get('selectedTask'),
            node         = selectedTask.isLeaf() ? selectedTask.parentNode : selectedTask;

        var record = node.appendChild({
            Name : 'New Task',
            leaf : true
        });

        gantt.getSelectionModel().select(record);

        gantt.getSchedulingView().scrollEventIntoView(record, false, false, function () {
            gantt.lockedGrid.getPlugin('editingInterface').startEdit(record, 1);
        });
    },

    onRemoveSelectedTasks : function () {
        var selected = this.getGantt().getSelection();

        // filter out attempts to remove children of a readonly task
        var tasks = Ext.Array.filter(selected, function (task) {
            return !task.parentNode || !task.parentNode.isReadOnly();
        });

        Ext.Array.forEach([].concat(tasks), function (task) {
            task.remove();
        });
    },

    onIndent : function () {
        var gantt = this.getGantt();

        // filter out attempts to get into a readonly task
        var tasks = Ext.Array.filter(gantt.getSelection(), function (task) {
            return !task.previousSibling.isReadOnly();
        });

        gantt.getTaskStore().indent([].concat(tasks));
    },

    onOutdent : function () {
        var gantt = this.getGantt();

        // filter out readonly tasks
        var tasks = Ext.Array.filter(gantt.getSelection(), function (task) { return !task.isReadOnly(); });

        gantt.getTaskStore().outdent([].concat(tasks));
    },

    onSaveChanges : function () {
        this.getGantt().crudManager.sync();
    },

    onLanguageSelected : function (field, record) {
        this.fireEvent('locale-change', record.get('id'), record);
    },

    onToggleGrouping : function () {
        var taPlugin = this.getGantt().getPlugin('taskarea');
        taPlugin.setEnabled(!taPlugin.getEnabled());
    },

    onToggleRollup : function () {
        var gantt = this.getGantt();
        gantt.setShowRollupTasks(!gantt.showRollupTasks);
    },

    onHighlightLongTasks : function () {
        var gantt = this.getGantt();

        gantt.taskStore.queryBy(function (task) {
            if (task.data.leaf && task.getDuration() > 8) {
                var el = gantt.getSchedulingView().getElementFromEventRecord(task);
                el && el.frame('lime');
            }
        });
    },

    onFilterTasks : function () {
        this.getGantt().taskStore.filterTreeBy(function (task) {
            return task.getPercentDone() <= 30;
        });
    },

    onClearTasksFilter : function () {
        this.getGantt().taskStore.clearTreeFilter();
    },

    onScrollToLast : function () {
        var latestEndDate = new Date(0),
            gantt         = this.getGantt(),
            latest;

        gantt.taskStore.getRoot().cascadeBy(function (task) {
            if (task.get('EndDate') >= latestEndDate) {
                latestEndDate = task.get('EndDate');
                latest        = task;
            }
        });
        gantt.getSchedulingView().scrollEventIntoView(latest, true);
    },

    onAfterRender : function () {
        var me        = this,
            viewModel = me.getViewModel(),
            taskStore = viewModel.get('taskStore');

        viewModel.set('fullscreenEnabled', !!this.getFullscreenFn());

        me.mon(taskStore, 'filter-set', function () {
            viewModel.set('filterSet', true);
        });
        me.mon(taskStore, 'filter-clear', function () {
            viewModel.set('filterSet', false);
        });
    },

    onManageCalendars : function () {
        var gantt = this.getGantt();

        this.calendarsWindow = new Gnt.widget.calendar.CalendarManagerWindow({
            calendarManager : gantt.getTaskStore().calendarManager,
            modal           : true
        });

        this.calendarsWindow.show();
    },

    onPrint : function () {
        var gantt = this.getGantt();
        gantt.print();
    }
});
