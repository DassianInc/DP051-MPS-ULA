Ext.define("MyApp.view.GanttToolbar", {
    extend      : 'Ext.Toolbar',
    alias       : 'widget.gantttoolbar',
    cls         : 'gantt-toolbar',

    items :[
        {
            iconCls : 'icon-backward',
            handler : function() {
                this.gantt.shiftPrevious();
            }
        },
        {
            iconCls : 'icon-forward',
            handler : function() {
                this.gantt.shiftNext();
            }
        },
        {
            iconCls : 'icon-plus',
            handler : function() {
                this.gantt.zoomIn();
            }
        },
        {
            iconCls : 'icon-minus',
            handler : function() {
                this.gantt.zoomOut();
            }
        },
        {
            text : 'Weeks',
            handler : function() {
                this.gantt.switchViewPreset('weekAndDayLetter');
            }
        },{
            text : 'Months',
            handler : function() {
                this.gantt.switchViewPreset('monthAndYear');
            }
        },
        {
            text : 'Years',
            handler : function() {
                this.gantt.switchViewPreset('year', new Date(this.gantt.getStart().getFullYear(), 1, 1), new Date(this.gantt.getStart().getFullYear()+5, 1, 1));
            }
        },
        '->',
        {
            text : 'Collapse all',
            handler : function() {
                this.gantt.collapseAll();
            }
        },
        {
            text : 'Expand all',
            handler : function() {
                this.gantt.expandAll();
            }
        },
        {
            text          : 'View full screen',
            // Experimental, not X-browser
            _fullScreenFn : (function() {
                var docElm = document.documentElement;

                if (docElm.requestFullscreen)       return "requestFullscreen";
                if (docElm.mozRequestFullScreen)    return "mozRequestFullScreen";
                if (docElm.webkitRequestFullScreen) return "webkitRequestFullScreen";
                if (docElm.msRequestFullscreen)     return "msRequestFullscreen";

            })(),
            handler : function(btn) {
                if (btn._fullScreenFn) {
                    this.gantt.el.down('.x-panel-body').dom[btn._fullScreenFn]();
                }
            }
        },
        {
            iconCls : 'icon-calendar',
            text    : 'Edit working time',
            handler : function(){
                var editorWindow  = new Gnt.widget.calendar.CalendarWindow({
                    calendar        : this.gantt.taskStore.getCalendar()
                });

                editorWindow.show();
            }
        },
        {
            xtype       : 'textfield',
            emptyText   : 'Find task...',
            width       : 150,
            enableKeyEvents : true,
            listeners : {
                keyup : {
                    fn      : function(field, e) {
                        var value   = field.getValue();
                        var regexp  = new RegExp(Ext.String.escapeRegex(value), 'i')
                        var gantt = field.scope.gantt;

                        if (value) {
                            gantt.taskStore.filterTreeBy(function (task) {
                                return regexp.test(task.get('Name'))
                            });
                        } else {
                            gantt.taskStore.clearTreeFilter();
                        }
                    },
                    buffer  : 300
                },
                specialkey : {
                    fn : function(field, e) {
                        if (e.getKey() === e.ESC) {
                            var gantt = field.scope.gantt;

                            field.reset();
                            gantt.taskStore.clearTreeFilter();
                        }
                    }
                }
            }
        },
        {
            text : 'Save',
            handler : function() {
                // please setup proper crudManager.sync.url before uncommenting this line
                // this.gantt.crudManager.sync();
            }
        }
    ],

    initComponent : function() {
        this.defaults = { scale : 'medium', scope : this };

        this.callParent(arguments);
    }
});
