Ext.define('Gnt.examples.advanced.view.GanttPrimaryToolbar', {
    extend : 'Ext.Toolbar',
    xtype : 'gantt-primary-toolbar',
    mixins : ['Gnt.mixin.Localizable'],
    cls : 'gantt-primary-toolbar',
    defaults : {scale : 'medium', margin : '0 3 0 3'},

    initComponent : function () {

        this.items = [
            {
                tooltip   : this.L('previousTimespan'),
                reference : 'shiftPrevious',
                glyph     : 0xE801
            },
            {
                tooltip   : this.L('nextTimespan'),
                reference : 'shiftNext',
                glyph     : 0xE802
            },
            {
                tooltip   : this.L('collapseAll'),
                reference : 'collapseAll',
                glyph     : 0xE803,
                bind      : {
                    disabled : '{filterSet}'
                }
            },
            {
                tooltip   : this.L('expandAll'),
                reference : 'expandAll',
                glyph     : 0xE800,
                bind      : {
                    disabled : '{filterSet}'
                }
            },
            {
                tooltip   : this.L('zoomOut'),
                reference : 'zoomOut',
                glyph     : 0xE805
            },
            {
                tooltip   : this.L('zoomIn'),
                reference : 'zoomIn',
                glyph     : 0xE804
            },
            {
                tooltip   : this.L('zoomToFit'),
                reference : 'zoomToFit',
                glyph     : 0xE807
            },
            {
                tooltip : this.L('viewFullScreen'),
                reference : 'viewFullScreen',
                glyph : 0xE806,
                bind : {
                    disabled : '{!fullscreenEnabled}'
                }
            },
            {
                tooltip      : this.L('highlightCriticalPath'),
                reference    : 'criticalPath',
                glyph        : 0xE80D,
                enableToggle : true
            },
            {
                tooltip   : this.L('addNewTask'),
                reference : 'addTask',
                glyph     : 0xE80B,
                bind      : {
                    disabled : '{!selectedTask}'
                }
            },
            {
                tooltip   : this.L('removeSelectedTasks'),
                reference : 'removeSelected',
                glyph     : 0xE80A,
                bind      : {
                    disabled : '{!selectedTask}'
                }
            },
            {
                tooltip   : this.L('indent'),
                reference : 'indentTask',
                glyph     : 0xE809,
                bind      : {
                    disabled : '{!selectedTask}'
                }
            },
            {
                tooltip   : this.L('outdent'),
                reference : 'outdentTask',
                glyph     : 0xE808,
                bind      : {
                    disabled : '{!selectedTask}'
                }
            },

            {
                tooltip : this.L('manageCalendars'),
                reference : 'manageCalendars',
                glyph : 0xE80E,
                bind : {
                    hidden : '{!calendarManager}'
                }
            },

            {
                tooltip : this.L('saveChanges'),
                reference : 'saveChanges',
                glyph : 0xE80C,
                bind : {
                    hidden : '{!crud}',
                    disabled : '{!hasChanges}'
                }
            },
            {
                tooltip : this.L('print'),
                reference   : 'print',
                glyph       : 0xE80F
            },
            '->',
            this.L('language'),
            {
                xtype         : 'combo',
                reference     : 'langSelector',
                bind          : {
                    store : '{availableLocales}',
                    value : '{currentLocale}'
                },
                displayField  : 'title',
                valueField    : 'id',
                mode          : 'local',
                triggerAction : 'all',
                emptyText     : this.L('selectLanguage'),
                selectOnFocus : true
            },
            {
                text         : this.L('tryMore'),
                reference    : 'tryMore',
                enableToggle : true
            }
        ];

        this.callParent(arguments);

        // For testing
        this.items.each(function (cmp) {
            if (cmp.reference) cmp.itemId = cmp.reference;
        });
    }
});
