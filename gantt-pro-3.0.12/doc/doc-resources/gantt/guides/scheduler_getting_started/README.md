#Getting Started with Ext Scheduler 2

##Introduction

Ext Scheduler is custom ExtJS component which allows you to visualize and manage "resources" and their scheduled "events".
The concrete semantic of an *event* and *resource* is up to you. For example, an event can be a doctor's appointment, meeting or an airplane flight.
A resource, in turn, can be a doctor (a person in general), a meeting room or an airport gate. 

If you have never used Ext JS before, it's highly recommended that you start by visiting the <a href="http://www.sencha.com/learn/extjs/?4x">Ext JS Learning Center</a> to understand the basics of the underlying framework. 

To use this component, you first need your own license of the Ext JS framework. You can buy it or download a free trial for prototyping here: http://www.sencha.com/products/extjs

{@img ext-scheduler.png}


##Orientation

Depending from the orientation, a resource can be either a row or a column in the grid. Below you can see the same schedule in both horizontal and vertical orientation.
You can configure the orientation by setting the {@link Sch.panel.SchedulerGrid#orientation orientation} config property to 'horizontal' or 'vertical'. Additionally you can also change orientation during runtime by calling
the {@link Sch.panel.SchedulerGrid#setOrientation setOrientation} method.

{@img scheduler-grid-horizontal.png}
{@img scheduler-grid-vertical.png}

##Data

The information about events and resources should be provided to the scheduler configuration object as two separate data stores: `eventStore` and `resourceStore`. 
`eventStore` should be an instance of {@link Sch.data.EventStore}, and `resourceStore` - instance of {@link Sch.data.ResourceStore}.
Both of those classes are subclasses of {@link Ext.data.Store} class. Please refer to the {@link Ext.data.Store} documentation to find out the base interface.

Each data store is a collection of "models". Events and resources in the scheduler are represented with the {@link Sch.model.Event} and {@link Sch.model.Resource} classes.
Refer to their documentation for details on how you can add additional fields, or how you can customize the pre-defined fields.   

The two models are tied together via the 'Id' property on the Resource model and the 'ResourceId' property on the Event model. This image shows a typical class definition diagram for the two models:

{@img scheduler-stores.png}

Please refer to this guide <http://docs.sencha.com/ext-js/4-0/#/guide/data> for base information about Ext JS data package.

##Synopsys

HTML file:

    <!DOCTYPE html>
    <html>
        <head>
            <link href="../your_extjs_folder/resources/css/ext-all.css" rel="stylesheet" type="text/css" />
            <link href="/resources/css/sch-all.css" rel="stylesheet" type="text/css" />
            
            <script src="../your_extjs_folder/ext-all-debug.js" type="text/javascript"></script>
            <script src="/sch-all-debug.js" type="text/javascript"></script>
            
            <script type="text/javascript" src="synopsys.js"></script>
        </head>
        <body>
        </body>
    </html>

synopsys.js:

    Ext.onReady(function() {
    
        // Store holding all the resources
        var resourceStore = new Sch.data.ResourceStore({
            model   : 'Sch.model.Resource'
        });
        
        resourceStore.loadData([
            {
                Id      : 'a',
                Name    : 'Rob'
            },
            {
                Id      : 'b',
                Name    : 'Mike'
            }
        ]);
        
        // Store holding all the events
        var eventStore = new Sch.data.EventStore({
            model   : 'Sch.model.Event',
            
            data    :  [   
                {
                    ResourceId      : 'a',
                    Name            : 'Some task', 
                    StartDate       : '2010-05-22 10:00',
                    EndDate         : '2010-05-22 12:00'
                },
                {
                    ResourceId      : 'b',
                    Name            : 'Some other task', 
                    StartDate       : '2010-05-22 13:00',
                    EndDate         : '2010-05-22 16:00'
                }
            ]
        });
        
        var startDate = new Date(2010, 4, 22, 6);
        
        var scheduler = new Sch.panel.SchedulerGrid({
            width       : 600,
            height      : 200,
            
            // Setup view configuration
            startDate   : startDate,
            endDate     : Sch.util.Date.add(startDate, Sch.util.Date.HOUR, 24),
            
            viewPreset  : 'hourAndDay',
    
            // Setup your static columns
            columns     : [
                { header : 'Staff', width : 130, dataIndex : 'Name'}
            ],
    
            resourceStore   : resourceStore,
            eventStore      : eventStore
        });
        
        scheduler.render(Ext.getBody());
    });


##The scheduler timeline header 

{@img scheduler-timeline-header.png}

The presentation of the scheduler's timeline can be configured using the {@link Sch.panel.SchedulerGrid#viewPreset viewPreset} configuration option. 
You can choose from a list of pre-defined presets or create your own custom view preset. Each view preset can consist of 1-3 header {@link Sch.preset.ViewPresetHeaderRow rows}. 
Each row can be independently configured with its own dateFormat (or custom renderer), time unit and increment. The scheduler comes with several predefined view presets that you can use:

    "hourAndDay"
    "dayAndWeek"
    "weekAndDay"
    "weekAndMonth"
    "monthAndYear"
    "year"

If none of these suits your needs, you can easily create your own custom view presets too. Here's an example of a viewPreset:

    weekAndMonth : {
        timeColumnWidth : 100,
        rowHeight: 24,              // Only used in horizontal orientation
        resourceColumnWidth : 100,  // Only used in vertical orientation
        displayDateFormat : 'Y-m-d',
        shiftUnit : "WEEK",
        shiftIncrement : 5,
        defaultSpan : 6,            // By default, show 6 weeks
        
        timeResolution : {
            unit : "DAY",
            increment : 1
        },

        headerConfig : {
            middle : {
                unit : "WEEK",
                renderer : function(start, end, cfg) {
                    cfg.align = 'left';
                    return Ext.Date.format(start, 'd M');
                }
            },
            top : {
                unit : "MONTH",
                dateFormat : 'M Y'
            }
        }
    }

Please refer to the {@link Sch.preset.Manager} documentation for further information.

##Events

Virtually every sub-component in the scheduler (including the scheduler itself), implements the Observable pattern. In the Ext JS framework, this pattern is represented with the {@link Ext.util.Observable} mixin.

This means that you can be notified about various events, happening within the scheduler and provide your custom handlers (listeners) for them. For example:

    scheduler.on('eventclick', function (sch, event) {
        alert("You've clicked on " + event.get('Name') + ' event');
    }); 

The function provided as the 2nd argument to the `on` method call, will be called when a user clicks on an event in scheduler. Please refer to the {@link Ext.util.Observable} documentation for details
on how you can customize the behaviour of the listeners.

 
##Rendering customization

There are several ways you can customize the presentation of the events and time line itself. This section will briefly summarize them. Please also refer to the documentation of the each
option.

- {@link Sch.panel.SchedulerGrid#eventBarTextField eventBarTextField} This is the easiest way of defining which field in your model to display in each rendered event (defaults to 'Name'). 

- {@link Sch.panel.SchedulerGrid#eventRenderer eventRenderer} This function can be provided as the configuration option and will be called for each event. It can return a string or an object. 
String will be used as the "event body" and object will be passed to the `eventBodyTemplate` template (must be provided in this case). Returning string from this function is the simplest
method to customize the presentation of event. 

- {@link Sch.panel.SchedulerGrid#eventBodyTemplate eventBodyTemplate} - the template for "event body". The "event body" is the internal content of the event, w/o the wrapping markup. It still can contain arbitrary HTML. This template will
receive either the return value from `eventRenderer` or the whole data object of the event being rendered (each field will be available as the `{FieldName}` symbol).

- {@link Sch.panel.SchedulerGrid#eventTpl eventTpl} - the top-most event template, only override when you know what you are doing. 

- {@link Sch.panel.SchedulerGrid#timeCellRenderer timeCellRenderer} - can be used to customize the grid cells. This is a "normal" {@link Ext.grid.column.Column#renderer ExtJS column renderer}, but its returning value will be ignored. 


##Plugins and additional features

By itself, the scheduler is merely a visualizing tool. To make it more interactive you can enable/add various plugins to it. In the simplest case for example, the events drag and drop functionality
can be activated with the {@link Sch.panel.SchedulerGrid#enableEventDragDrop enableEventDragDrop} configuration option (defaults to true). Under the hood, it will add drag-and-drop support for each scheduled event.

To add a plugin manually, you need to pass the instance of the plugin in the `plugins` configuration option. For example, to enable the {@link Sch.plugin.Pan pan plugin}:

        var scheduler = Ext.create('Sch.panel.SchedulerGrid', {
            ...
    
            resourceStore   : resourceStore,
            eventStore      : eventStore,
            
            plugins         : [
                Ext.create('Sch.plugin.Pan', { enableVerticalPan : true })
            ]
        });

A plugin may have its own configuration options. You can pass several plugins at once. For the list of available plugins, please examine the classes in the `Sch.plugin` namespace.