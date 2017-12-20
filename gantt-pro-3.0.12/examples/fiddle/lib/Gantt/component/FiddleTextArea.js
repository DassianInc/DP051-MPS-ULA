Ext.define('Gantt.component.FiddleTextArea', {
    extend              : 'Ext.form.field.TextArea',
    
    initComponent : function () {
    
    
        Ext.apply(this, {
            enableKeyEvents : true,
            stateful        : true,
            stateEvents     : [ 'change' ],
            listeners   : {
                keypress    : this.onTasksAreaKeyPress,
                scope       : this
            }
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
