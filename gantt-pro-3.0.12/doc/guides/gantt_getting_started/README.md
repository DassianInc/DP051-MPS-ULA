#Getting Started with Ext Gantt 3

##Synopsys

HTML file: 

    <!DOCTYPE html>
    <html>
        <head>
            <link href="http://cdn.sencha.com/ext/gpl/5.1.0/packages/ext-theme-classic/build/resources/ext-theme-classic-all.css" rel="stylesheet" type="text/css"/>
            <link href="http://bryntum.com/examples/gantt-latest/resources/css/sch-gantt-all.css" rel="stylesheet" type="text/css" />

            <script src="http://cdn.sencha.com/ext/gpl/5.1.0/build/ext-all.js" type="text/javascript"></script>
            <script src="http://bryntum.com/examples/gantt-latest/gnt-all-debug.js" type="text/javascript"></script>
            
            <script src="synopsys.js" type="text/javascript"></script>
        </head>
        
        <body>
        </body>
    </html>    

synopsys.js:

    Ext.onReady(function(){
    
        var taskStore = Ext.create('Gnt.data.TaskStore', {
            autoLoad    : true,
            proxy       : {
                type    : 'memory',
                reader  : {
                    type: 'json'
                },
                
                data: [ 
                    { 
                        "StartDate" : "2010-01-18",
                        "EndDate" : "2010-02-02",
                        "Id" : 1,
                        "Name" : "Planning",
                        "expanded" : true,
                        "children" : [
                            { 
                                "StartDate" : "2010-01-18",
                                "EndDate" : "2010-01-26",
                                "Id" : 2,
                                "leaf" : true,
                                "Name" : "Investigate",
								"parentId" : 1
                            },
                            { 
                                "StartDate" : "2010-01-22",
                                "EndDate" : "2010-01-25",
                                "Id" : 3,
                                "leaf" : true,
                                "Name" : "Investigate2",
								"parentId" : 1
                            },
                            { 
                                "StartDate" : "2010-01-28",
                                "EndDate" : "2010-01-28",
                                "Id" : 4,
                                "leaf" : true,
                                "Name" : "Investigate3",
								"parentId" : 1
                            }
                        ]
                    }
                ]
                // eof data
            }
            // eof proxy
        });
        
        var ganttPanel = Ext.create('Gnt.panel.Gantt', {
            height      : 400,
            width       : 1000,
            
            viewPreset      : 'weekAndDayLetter',
            
            startDate       : new Date(2010, 0, 15),
            endDate         : Sch.util.Date.add(new Date(2010, 0, 15), Sch.util.Date.WEEK, 3),
    
            columns         : [
                {
                    xtype       : 'treecolumn',
                    header      : 'Tasks',
                    sortable    : false,
                    dataIndex   : 'Name',
                    width       : 200
                }
            ],
    
            taskStore       : taskStore
        });
        
        ganttPanel.render(Ext.getBody());
    });

##Introduction

The Ext Gantt is a custom Ext JS component which can display a set of tasks along with the dependencies between them.

To use this component, you first need your own license of the Ext JS framework. You can buy it or download a free trial for prototyping here: http://www.sencha.com/products/extjs

{@img gantt-panel.png}


##Data

The Gantt chart can accept and modify several datasets (listed below), some of them are required and some are optional. All these datasets are instances of special subclasses of {@link Ext.data.Store} and contain
collections of {@link Ext.data.Model models}.
Please refer to this guide <http://docs.sencha.com/extjs/5.0/core_concepts/data_package.html> for basic information about the Ext JS data package.

All datasets can be provided as configuration options for this class.

- {@link Gnt.panel.Gantt#taskStore taskStore} - The 'main' dataset (required) - an instance of a {@link Gnt.data.TaskStore}, containing the tree of tasks to display. Each task is represented by a
{@link Gnt.model.Task} instance. A Task can have any number of child tasks, in this case it will be a "parent" task, and its start and end dates are determined by its children.
- {@link Gnt.panel.Gantt#dependencyStore dependencyStore} (optional). A {@link Gnt.data.DependencyStore store} containing information about the dependencies between your tasks. Each dependency is represented by a {@link Gnt.model.Dependency} instance.
- {@link Gnt.panel.Gantt#resourceStore resourceStore}  (optional). A {@link Gnt.data.ResourceStore store} containing information about the resources that can be assigned to your tasks. Each resource is represented by a {@link Gnt.model.Resource} instance.
- {@link Gnt.panel.Gantt#assignmentStore assignmentStore} (optional). A {@link Gnt.data.AssignmentStore store} containing information about the resource assignments for your tasks. Each assignment is represented by a {@link Gnt.model.Assignment} instance.

In case you do not provide an optional data store, an empty one will be created for you. 

These data stores represent the "model" of your Gantt chart. All UI components (like this class) are bound to these data sources. Any time you manipulate the data, the 
visual presentation will be updated automatically.


##Calendar. Availability time.

{@img calendar.png}

A Calendar is represented with the {@link Gnt.data.Calendar} and {@link Gnt.data.calendar.BusinessTime} classes. 
A Calendar is essentially a collection of {@link Gnt.model.CalendarDay days}. Each day has a working/holiday {@link Gnt.model.CalendarDay#isWorkingDayField flag} and several "availability intervals".  
Availability intervals defines the time when a task can be performed or some resource is available. An interval can be specified with minute precision and every day may have more than one interval. 
Calendar also contains default availability for weekdays.

For example, one can specify that default business hours Monday through Friday are: 08:00-12:00, 13:00-17:00, but on August 19, working time is from 09:00 till 16:00.

There's also a "main" calendar for the whole project. In addition, **every task and resource may have its own calendar.**

When calculating the duration of a task, or when moving a task, any non-working time will be skipped and the 
appropriate parameter (duration/start date) will be adjusted. This is the default behavior and it can disabled on different levels. 

Use {@link Gnt.panel.Gantt#skipWeekendsDuringDragDrop skipWeekendsDuringDragDrop} option, when you want to move/resize tasks freely, but still want to take the non-working time into account for duration calculations.

Use {@link Gnt.panel.Gantt#weekendsAreWorkdays weekendsAreWorkdays} option, to completely disable this feature, treating all days as working.

And finally, see also the `SchedulingMode` field in the {@link Gnt.model.Task} definition - when set to "Manual" it will be possible to move the task around freely.

See also <a href="#!/guide/gantt_calendars">Using calendars guide</a>

##Time line header

The presentation of the header timeline can be customized using the {@link Gnt.panel.Gantt#viewPreset viewPreset} configuration option. 
You can pick from a list of predefined presets or register your own easily. Please refer to the {@link Sch.preset.Manager} documentation on how to do this.
The Gantt component supports up to 3 levels of headers, each with its own options set. You can show anything from milliseconds to years and output any date format or text.

##Observing Events

Virtually every component in the Gantt chart (the Gantt component itself, its data stores and even individual data entities), implements the Observable pattern.
In the Ext JS framework, this pattern is represented by the {@link Ext.util.Observable} mixin.

This means that you can listen for notifications about various events happening within the Gantt chart and provide your custom handlers (listeners) for them. For example:

    ganttPanel.on('taskclick', function (ganttPanel, task) {
        alert("You've clicked on the task named " + task.getName());
    }); 

The function provided as the 2nd argument to the `on` call, is the `listener function` and will be called when a user clicks on a task in the Gantt schedule. Please refer to the {@link Ext.util.Observable} documentation for details
about how you can customize the behaviour of the listeners and also see the events listed in this document.

##Rendering customization

There are several ways you can customize the presentation of the tasks, this section will briefly summarize them. Please also refer to the documentation of each option.

- You can style tasks easily using the {@link Gnt.model.Task#clsField}. When setting this property to a field in your dataset, the gantt view apply the value as a CSS to the containing task element.
See the advanced gantt example source code for further guidance.

        Ext.define('MyTaskModel', {
            extend : 'Gnt.model.Task',
        
            // A field in the dataset that will be added as a CSS class to each rendered task element
            clsField : 'TaskType',
            fields : [
                { name : 'TaskType', type : 'string' }
            ]
        });

Consuming this data:

	[{ 
		"EndDate" : "2010-02-02",
		"BaselineEndDate" : "2010-02-01",
		"Id" : 1,
		"Name" : "Planning",
		"PercentDone" : 40,
		"StartDate" : "2010-01-18",
		"BaselineStartDate" : "2010-01-13",
		"TaskType" : "Important",
		...
	}]

This will add an "Important" CSS class to the task element. 


- You can style dependencies just as easily using the {@link Gnt.model.Dependency#clsField}.

- {@link Gnt.panel.Gantt#eventRenderer eventRenderer} This function can be provided as a configuration option and will be called for each task at render time. It should return an object containing
placeholder values for some special properties used in the rendering phase. Available placeholders are:

    - `cls` - CSS class which will be added to the task bar element
    - `ctcls` - CSS class which will be added to the 'root' element containing the task bar and labels
    - `style` - inline style declaration applied to the task bar element
    - `progressBarStyle` - an inline CSS style to be applied to the progress bar of this task 
    - `leftLabel` - the content for the left label (usually being extracted from the task, using the {@link Gnt.panel.Gantt#leftLabelField leftLabelField} option. 
       You still need to provide some value for the `leftLabelField` to activate the labels rendering
    - `rightLabel` - the content for the right label (usually being extracted from the task, using the {@link Gnt.panel.Gantt#rightLabelField rightLabelField} option
       You still need to provide some value for the `rightLabelField` to activate the labels rendering
    - `basecls` - a CSS class to be add to the baseline DOM element, only applicable when the {@link Gnt.panel.Gantt#showBaseline showBaseline} option is true and the task contains baseline information 


Simple example:

	eventRenderer: function (taskRecord) {
		var cls = taskRecord.get('PercentDone') > 80 ? 'almostDone' : '';
        return {
            cls : almostDone
        };
    }

	.almostDone {
		background:green;
		border: lime;
	}

##Plugins and additional features

By itself, the Gantt panel is merely a renderer of data. To add interactivity you can enable/add various features and plugins to it. In the simplest case for example, task drag-and-drop functionality
can be activated with the {@link Gnt.panel.Gantt#enableTaskDragDrop enableTaskDragDrop} configuration option. Under the hood, it will add a drag and drop plugin for the scheduler.

To add a plugin manually, you need to pass an instance of the plugin in the `plugins` configuration option. For example, to add print support - enable the {@link Gnt.plugin.Printable print plugin}:

        var ganttPanel = Ext.create('Gnt.panel.Gantt', {
            ...
            taskStore       : taskStore,
            
            plugins         : [
                Ext.create('Gnt.plugin.Printable')
            ]
        });

A plugin may also have its own configuration options. You can pass several plugins at once in the 'plugins' array. For a list of available plugins, please examine the classes in the `Gnt.plugin` namespace.
You can also use some plugins from the `Sch.plugin` namespace.
