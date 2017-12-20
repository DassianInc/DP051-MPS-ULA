Ext.ns('App');

//Ext.Loader.setConfig({enabled: true, disableCaching : false });
//Ext.Loader.setPath('Gnt', '../../js/Gnt');
//Ext.Loader.setPath('Sch', '../../../ExtScheduler3.x/js/Sch');
Ext.Loader.setPath('MyApp', '.');

Ext.require([
    'MyApp.DemoGanttPanel'
]);

Ext.onReady(function() {
    Ext.QuickTips.init();
    
    App.Gantt.init();
});

App.Gantt = {
    
    // Initialize application
    init : function(serverCfg) {        
        this.gantt = this.createGantt();
        
        var vp = Ext.create("Ext.Viewport", {
            layout  : 'border',
            items   : [
                {
                    region      : 'north',
                    contentEl   : 'example-description',
                    bodyStyle   : 'padding:15px'
                },
                this.gantt
            ]
        });
    },
    
    createGantt : function() {
        
        
        Sch.preset.Manager.registerPreset("weekAndDayNarrow", {
            timeColumnWidth         : 35,
            rowHeight               : 24,          // Only used in horizontal orientation
            resourceColumnWidth     : 100,  // Only used in vertical orientation
            displayDateFormat       : 'Y-m-d',
            shiftUnit               : "WEEK",
            shiftIncrement          : 1,
            defaultSpan             : 1,       // By default, show 1 week
            timeResolution          : {
                unit        : "DAY",
                increment   : 1
            },
            headerConfig            : {
                bottom      : {
                    unit        : "DAY",
                    increment   : 1,
                    dateFormat  : 'd'
                },
                middle      : {
                    unit        : "WEEK",
                    dateFormat  : 'D d M',
                    align       : 'left'
                }
            }
        });
        
        var resourceStore       = Ext.create("Gnt.data.ResourceStore", {
            data    : [
                {"Id" : 1, "Name" : "Mats" },
                {"Id" : 2, "Name" : "Nickolay" },
                {"Id" : 3, "Name" : "Goran" },
                {"Id" : 4, "Name" : "Alex" },
                {"Id" : 5, "Name" : "Jakub" },
                {"Id" : 7, "Name" : "Juan" }
            ]
        });
    
        var assignmentStore     = Ext.create("Gnt.data.AssignmentStore", {
            resourceStore   : resourceStore,
//            proxy           : {
//                method  : 'GET',
//                type    : 'ajax',
//                api     : {
//                    read : 'assignmentdata.js'
//    //                uncomment and provide your urls to hook with server-side
//    //                ,
//    //                create : 'create.php',
//    //                update : 'update.php',
//    //                destroy : 'delete.php'
//                },
//                reader : {
//                    type : 'json',
//                    rootProperty : 'assignments'
//                }
//            },
            
            data    : [
                {
                    "Id"            : 1,
                    "TaskId"        : 1,
                    "ResourceId"    : 1,
                    "Units"         : 100
                },
                {
                    "Id"            : 2,
                    "TaskId"        : 1,
                    "ResourceId"    : 2,
                    "Units"         : 50
                },
                {
                    "Id"            : 3,
                    "TaskId"        : 2,
                    "ResourceId"    : 2,
                    "Units"         : 50
                },
                {
                    "Id"            : 4,
                    "TaskId"        : 4,
                    "ResourceId"    : 4,
                    "Units"         : 50
                },
                {
                    "Id"            : 5,
                    "TaskId"        : 6,
                    "ResourceId"    : 5,
                    "Units"         : 50
                }
            ]
            
//            ,
//            listeners : {
//                load : function() {
//                    // this is how you can load your stores from a single data package
//                    resourceStore.loadData(this.proxy.reader.jsonData.resources);
//                }
//            }
        });
        
        
        var calendar    = Ext.create('Gnt.data.calendar.BusinessTime', {
            calendarId      : 'Project',
            
            data    : [
                // will affect Task2 - weekend will be working day with non-standard availability
                {
                    Date            : new Date(2011, 6, 16),
                    IsWorkingDay    : true,
                    Availability    : [ '11:00-16:00', '17:00-20:00' ]
                },
                {
                    Date            : new Date(2011, 6, 17),
                    IsWorkingDay    : true,
                    Availability    : [ '12:00-16:00' ]
                }
            ]
        })
        
        var taskStore = Ext.create("Gnt.data.TaskStore", {
            sorters         : 'StartDate',
            
            calendar        : calendar,
            
            proxy : {
                type        : 'ajax',
                method      : 'GET',
                url         : 'tasks.json',
                reader      : { type : 'json' }
            }
        });
        
        var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
            autoLoad        : true,
            proxy           : {
                type        : 'ajax',
                url         : 'dependencies.json',
                method      : 'GET',
                reader      : { type : 'json' }
            }
        });
        
        var gantt = Ext.create("MyApp.DemoGanttPanel", {
            region          : 'center',
            selModel        : new Ext.selection.TreeModel({ ignoreRightMouseSelection : false, mode     : 'MULTI'}),
            
            taskStore       : taskStore,
            dependencyStore : dependencyStore,
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            
            //snapToIncrement : true,    // Uncomment this line to get snapping behavior for resizing/dragging.
            
            startDate       : new Date(2011, 5, 28), 
            endDate         : new Date(2011, 6, 30), 
            
            viewPreset      : 'weekAndDayNarrow'
        });
        
        return gantt;
    }
};

