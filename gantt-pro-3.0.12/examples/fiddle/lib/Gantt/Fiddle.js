Ext.define('Gantt.Fiddle', {
    extend      : 'Ext.container.Container',
    
    requires            : [],
    
    gantt               : null,
    tasksTextArea       : null,
    depsTextArea        : null,
    
    tasksDataUrl        : null,
    depsDataUrl         : null,
    
    taskStore           : null,
    depStore            : null,
    
    taskCounter         : 0,
    
    
    initComponent : function () {
        
        this.taskStore = new Gnt.data.TaskStore({
            proxy : {
                type    : 'ajax',
                method  : 'GET',
                url     : this.tasksDataUrl || 'data/tasks.js',
                reader  : {
                    type    : 'json'
                }
            }
        });
    
        this.dependencyStore    = new Gnt.data.DependencyStore({
            proxy       : {
                type    : 'ajax',
                url     : this.depsDataUrl|| 'data/dependencies.js',
                method  : 'GET',
                reader  : {
                    type    : 'json'
                }
            }
        });
        
        
        Ext.apply(this, {
            layout      : 'border',
            
            items : [
                {
                    xtype           : 'ganttpanel',
                    itemId          : 'gantt',
                    
                    region          : 'center',
                    
                    viewPreset      : 'weekAndDayLetter',
            
                    columns         : [
                        {
                            dataIndex   : 'Id',
                            text        : 'Id',
                            width       : 50
                        },
                        {
                            xtype       : 'namecolumn',
                            width       : 150
                        },
                        {
                            xtype       : 'startdatecolumn',
                            width       : 70
                        },
                        {
                            xtype       : 'enddatecolumn',
                            width       : 70
                        },
                        {
                            xtype       : 'durationcolumn',
                            width       : 60
                        },
                        {
                            xtype       : 'addnewcolumn'
                        }
                    ],
                    taskStore           : this.taskStore,
                    dependencyStore     : this.dependencyStore
                },
                {
                    header      : false,
                    split       : true,
                    collapsible : true,
                    collapseMode    : 'mini',
                    region      : 'east',
                    width       : 400,
                    
                    layout      : 'border',
                    items       : [
                        {
                            title       : 'Tasks data',
                            layout      : 'fit',
                            region      : 'center',
                            
                            items       : [
                                {
                                    xtype       : 'textarea',
                                    id          : 'tasksDataArea',
                                    enableKeyEvents : true,
                                    stateful        : true,
                                    stateEvents     : [ 'change' ],
                                    listeners   : {
                                        keypress    : this.onTasksAreaKeyPress,
                                        scope       : this
                                    }
                                }
                            ],
                            
                            buttons     : [
                                {
                                    text        : 'Push to gantt',
                                    handler     : this.pushTasksToGantt,
                                    scope       : this
                                },
                                {
                                    text        : 'Pull from gantt'
                                }
                            ]
                        },
                        {
                            title       : 'Dependencies data',
                            layout      : 'fit',
                            region      : 'south',
                            split       : true,
                            collapsible : true,
                            height      : 300,
                            
                            items       : [
                                {
                                    xtype       : 'textarea',
                                    id          : 'depsDataArea',
                                    enableKeyEvents : true,
                                    stateful        : true,
                                    stateEvents     : [ 'change' ],
                                    listeners   : {
                                        keypress    : this.onDepsAreaKeyPress,
                                        scope       : this
                                    }
                                }
                            ],
                            
                            buttons     : [
                                {
                                    text        : 'Push to gantt',
                                    handler     : this.pushDepsToGantt,
                                    scope       : this
                                },
                                {
                                    text        : 'Pull from gantt'
                                }
                            ]
                        }
                    ]
                }
            ]
        })
        // eof Ext.apply
        
        this.callParent(arguments)
        
        this.gantt          = this.down('#gantt')
        this.tasksDataArea  = this.down('#tasksDataArea')
        this.depsDataArea   = this.down('#depsDataArea')
    },
    // eof initComponent
    
    
    onTasksAreaKeyPress : function (field, event) {
        //                                          Ext 5 bug?
        if ((event.getKey() == event.ENTER || event.getKey() == 10) && event.ctrlKey) this.pushTasksToGantt()
    },

    
    onDepsAreaKeyPress : function (field, event) {
        //                                          Ext 5 bug?
        if ((event.getKey() == event.ENTER || event.getKey() == 10) && event.ctrlKey) this.pushDepsToGantt()
    },
    
    
    pushTasksToGantt : function () {
        var tasksJson
        
        try {
            var text        = this.tasksDataArea.getValue()
            
            if (!text) text = []
            
            tasksJson       = Ext.JSON.decode(text)
        } catch (e) {
            Ext.Msg.alert('Error', 'Malformed JSON');
            
            return
        }
        
        if (Ext.typeOf(tasksJson) == 'array') tasksJson = {
            Id          : '__ROOT__',
            expanded    : true,
            children    : tasksJson
        }
        
        this.normalizeTaskEntry(tasksJson)
        
        this.taskStore.setRootNode(tasksJson)
        
        // hard-reset cache
        this.taskStore.lastTotalTimeSpan    = null;
        
        var totalTimeSpan       = this.taskStore.getTotalTimeSpan()
        
        if (totalTimeSpan.start && totalTimeSpan.end) {
            this.gantt.setTimeSpan(totalTimeSpan.start, totalTimeSpan.end)
        }
    },
    
    
    pushDepsToGantt : function () {
        var depsJson
        
        try {
            depsJson        = Ext.JSON.decode(this.depsDataArea.getValue())
        } catch (e) {
            Ext.Msg.alert('Error', 'Malformed JSON');
            
            return
        }
        
        if (Ext.typeOf(depsJson) != 'array') {
            Ext.Msg.alert('Error', 'Need an array');
            
            return
        }
        
        for (var i = 0; i < depsJson.length; i++) {
            this.normalizeDepEntry(depsJson[ i ])
        }
            
        this.dependencyStore.loadData(depsJson)
    },
    
    
    normalizeTaskEntry : function (entry) {
        if (entry.children) {
            if (!entry.hasOwnProperty('expanded')) entry.expanded = true
            
            for (var i = 0; i < entry.children.length; i++) {
                this.normalizeTaskEntry(entry.children[ i ])
            }
        } else
            entry.leaf = true
    },
    
    
    normalizeDepEntry : function (entry) {
    }
})
