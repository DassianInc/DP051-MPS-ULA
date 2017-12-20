#Using calendars

##Introduction

Ext Gantt is very flexible in defining availability time for your tasks and resources.
Every task and resource can have their own *calendars*, specifying the time when they can be performed (or can work) - accurate down to minutes.
Additionally, calendars can form hierarchical structures, where every new child calendar can override the rules defined by its parents.
At the same time, if you don't need this level of precision and control, a few base options will configure the default behavior for everything.

##Project calendar and basic features

A Project calendar is the "main" instance of the {@link Gnt.data.Calendar} class, which affects the whole project and defines global rules.
For example, the days of the week that are defined as non-working time. It can be instantiated as any other Ext JS class and provided either to the {@link Gnt.data.TaskStore taskStore}
or to the {@link Gnt.panel.Gantt gantt panel} (the first option is preferable):

    var taskStore   = new Gnt.data.TaskStore({
        calendar    : new Gnt.data.Calendar({ ... })
    })
    // or
    var ganttPanel  = new Gnt.panel.Gantt({
        calendar    : new Gnt.data.Calendar({ ... }),
    })

And when using the [CRUD manager](#!/guide/gantt_crud_manager) with the {@link Gnt.data.CalendarManager calendar manager}, the project calendar will be set automatically:

    var taskStore   = new Gnt.data.TaskStore({
        calendarManager : new Gnt.data.CalendarManager({ ... })
    })

    var crud = new Gnt.data.CrudManager({
        // task store will get its calendar right after the calendarManager is loaded
        taskStore : taskStore,
        ...
    })

The Calendar class has various options, here are the most important ones:

- {@link Gnt.data.Calendar#daysPerMonth daysPerMonth}, {@link Gnt.data.Calendar#daysPerWeek daysPerWeek}, {@link Gnt.data.Calendar#hoursPerDay hoursPerDay} This group of
options define the conversion rules for duration and effort. They are needed since certain duration units cannot be converted to other units unambiguously.
For example a task with 1 month duration may mean 30, 31 or may be 28 days. A 1 day task can be 8 hours or 10 hours depending on how long your working day is. 
For such conversions, the calendar uses these options. **Please note**, for backward compatibility reasons {@link Gnt.data.Calendar} is configured with `hoursPerDay=24, daysPerWeek=7, daysPerMonth=30` settings.
For normal business time conversion rules (8 hours per day, etc), use {@link Gnt.data.calendar.BusinessTime}
- {@link Gnt.data.Calendar#defaultAvailability defaultAvailability} This option defines the time during the day, when work can be performed.
- {@link Gnt.data.Calendar#weekendsAreWorkdays weekendsAreWorkdays} Boolean option, indicating whether weekends should be considered as working days and included in the
task durations.

Some other options related to weekends and holidays:

- {@link Gnt.panel.Gantt#highlightWeekends highlightWeekends} `true` to highlight weekends and holidays visually in the Gantt chart
- {@link Gnt.data.TaskStore#skipWeekendsDuringDragDrop skipWeekendsDuringDragDrop} `true` to skip the weekends and holidays during drag and drop operations (move/resize).

##Calendar manager

The {@link Gnt.data.CalendarManager} is a class that implements a centralized storage of all the calendars related to the project.
Each record put into {@link Gnt.data.CalendarManager} instance, except the root node, is automatically linked to its {@link Gnt.data.Calendar calendar instance}
which can be retrieved by {@link #getCalendar} method.

    var calendarManager = Ext.create('Gnt.data.CalendarManager');

    ...

    // gets calendar instance having calendar Id equal to 'general'
    var calendar = calendarManager.getCalendar('general');

    // the same using the {@link Gnt.model.Calendar} {@link Gnt.model.Calendar#getCalendar getCalendar} method.
    calendar = calendarManager.getById('general').getCalendar();

When you add a new record, a new calendar is automatically created:

    // append a new record to the calendar manager
    var record = calendarManager.getRoot().appendChild({
        leaf                : true,
        Name                : 'New Calendar',
        DaysPerMonth        : 30,
        DaysPerWeek         : 7,
        HoursPerDay         : 24,
        WeekendsAreWorkdays : true,
        WeekendFirstDay     : 6,
        WeekendSecondDay    : 0,
        DefaultAvailability : [ '00:00-24:00' ]
    });

    // get newly created calendar to calendar2 variable
    var calendar2 = record.getCalendar();

The calendar manager is also able to work together with the [CRUD manager](#!/guide/gantt_crud_manager) which means that all calendars can be loaded in a single request.
Please read the [Calendar CRUD](#!/guide/gantt_calendars-section-4) chapter for details.

##Advanced features

### Individual days

Previous section described the basic features of calendars and was mostly talking about weekends. Now let's see how we can create an arbitrary day off in the calendar.

Internally, a calendar is represented by a subclass of the Ext.data.Store and can be loaded with a collection of {@link Gnt.model.CalendarDay} instances. Every day instance
can be of different types (see the `Type` field of the {@link Gnt.model.CalendarDay}):

- "Day override". Represents a certain date in the calendar, for example 2013/01/10. This type of day has the highest priority.
- "Week day override" sometimes called "week override" or "non-standard week". Represents a week day within a certain time span,
for example all Mondays between 2013/01/10 and 2013/02/10 (inclusive). This type has the next highest level of priority.
- "Week day". Represents a certain week day in the calendar, for example - all Mondays. It has the lowest priority among all the "special" days, but still
overrides the value of {@link Gnt.data.Calendar#defaultAvailability defaultAvailability} config option for that day.

Every calendar day instance also has the `Availability` field. It defines the working time for that day instance, for example : `[ '08:00-12:00', '13:00-17:00' ]`

So, to create a holiday in the calendar or adjust the working time for a certain day - simply add an appropriate calendar day instance to it:

    var calendar    = new Gnt.data.Calendar({
        defaultAvailability : [ '08:00-12:00', '13:00-17:00' ]
    })

    calendar.add([
        // a concrete date
        {
            Date            : new Date(2013, 0, 1),
            Name            : 'New year',
            Cls             : 'app-calendar-newyear'
        },
        {
            Date            : new Date(2013, 0, 5),
            Name            : 'Working Saturday',
            Cls             : 'app-calendar-workingsaturday',
            Availability    : [ '08:00-12:00', '13:00-16:00' ]
        },
        // A day of the week
        // Increases working time on all Mondays by one 1 hour
        {
            Weekday         : 1,
            Name            : 'All Mondays',
            Cls             : 'app-calendar-monday',
            Availability    : [ '07:00-12:00', '13:00-17:00' ]
        }
    ])

Note that you can also specify that some weekend days should actually be working days, using the `IsWorkingDay` field. In such cases, the `Availability` field is still required, or the Gantt chart won't schedule any tasks on that day.

"Week day overrides" consist of several days and also require the presence of a "main day". For their creation, it's recommended to use 
these API methods in the calendar: {@link Gnt.data.Calendar#addNonStandardWeek addNonStandardWeek}, {@link Gnt.data.Calendar#removeNonStandardWeek removeNonStandardWeek}.

You can visually edit the content of the calendar using the {@link Gnt.widget.calendar.Calendar} widget.

### Assigning individual calendars to tasks and resources

Tasks and resources may have their own calendars. If a calendar is assigned to a task, in defines the time when task can be performed.
If a calendar is assigned to a resource, in defines the time when the resource is available to perform tasks.

**Important**. If a task has no own calendar but has assigned resources, then it will use the calendars of the resources assigned to determine the time when it can be performed.
Such a task can only be performed during time spans when at least one assigned resource has working time defined.
If a task has its own calendar and has assigned resources, then it will use the *intersection* of the working time from igs own calendar and of the calendars of its resources to determine the time when it can be performed.
Such a task can be performed only when at least one assigned resource has working time defined *and* the task has working time defined.

To be assignable, the calendar need to have an unique {@link Gnt.data.Calendar#calendarId calendarId} property:

    var calendar1   = new Gnt.data.Calendar({
        calendarId      : 'calendar1'
    })

The value of this property can be provided in the `CalendarId` field of the {@link Gnt.model.Task} or {@link Gnt.model.Resource}.

### Parent-child relations between calendars

Calendars form a tree-like structure, using parent-child relations. The parent of a calendar can be specified with the {@link Gnt.data.Calendar#parent parent} property, or later
changed with the {@link Gnt.data.Calendar#setParent setParent} method:

    var calendar2   = new Gnt.data.Calendar({
        parent          : 'calendar1',
        calendarId      : 'calendar2'
    })

    var calendar3   = new Gnt.data.Calendar({
        calendarId      : 'calendar2'
    })

    calendar2.setParent(calendar3);

A child calendar will "inherit" the following configurations from its parent: "day overrides", "week days", "week day overrides" and even `defaultAvailability/weekendsAreWorkdays` configs.
Any child calendar days defined on the same dates as its parent calendar will override the parent.

Please note, that the `defaultAvailability/weekendsAreWorkdays` configs are inherited in case they were not provided when instantiating the calendar
and default values were used. If you need to override any of these configs - provide the value to the calendar, even if it's the same as default value:

    var childCalendar   = new Gnt.data.Calendar({
        parent                  : 'calendar1',
        // explicitly providing the value (even though `false` is default)
        // to override this config from parent
        weekendsAreWorkdays     : false
    })


Here's an example of how to use this feature: The main project calendar will contain "global" holidays (national holidays) and all other calendars of tasks and resources can be children of this global calendar.
This way, the calendars of tasks and resources can only contain those days that are specific for that task or resource and there's no need to re-define all the holidays.


##Calendar CRUD

When using calendars with individual days off ("day overrides"), always store the `Duration` field in your database. Moreover, it is recommended that you store
*only* `StartDate` and `Duration`, and *not* store the `EndDate` in the DB.

There are two approaches to interact with a server when it comes to calendars:

- classic _per-store_ approach
- CRUD manager usage

### Classic _per-store_ approach

This method relies on the classic _Sencha_ provided proxy classes when the user has to define a proxy for each individual store to give it the ability to interact with a server.
So in our case, the user will have to do it for each calendar instance he plans to deal with.

For performance and consistency reasons, it is recommended to load all your calendars **before** any other stores. The task store should always 
be loaded after calendars have been loaded. If you don't Gantt scheduling engine will need to re-adjust all tasks according to the calendars when they are loaded. 
When updating a task, gantt needs information about its assignments and dependencies, so any other stores should be already loaded. The correct order to load data:

1. Calendars (including setting the "calendarId" property).
2. Resource store, assignment store, dependencies store in any order
3. Task store.

There's no need to delay the loading of the task store. You can start several requests simultaneously, but remember to load the data into the stores in the correct order. The other option
is to make the initial loading package to contain all data.

The easiest way to edit the data in the calendar is to use the special widget: {@link Gnt.widget.calendar.Calendar}

### CRUD manager usage

The preferred option is to use a [CRUD manager](#!/guide/gantt_crud_manager) with a {@link Gnt.data.CalendarManager calendar manager}.
This setup will allow to load ** all the project calendars ** by a single batch request together with other project related stores (and persisting of changes will also be done in one request).
In this case you don't need to worry about things like loading order or the creation of individual calendars.
The [CRUD manager](#!/guide/gantt_crud_manager) class is aware of the correct loading order and
a {@link Gnt.data.CalendarManager calendar manager} will create all the project calendars properly.

    // centralized store of all the project calendars
    var calendarManager = Ext.create('Gnt.data.CalendarManager');

    var taskStore = Ext.create('Gnt.data.TaskStore', {
        calendarManager : calendarManager,
        resourceStore   : resourceStore,
        dependencyStore : dependencyStore,
        assignmentStore : assignmentStore
    });

    // centralized store of all the project stores
    // will automatically load calendarManager, resourceStore, dependencyStore,
    // assignmentStore and taskStore stores by a single batch request
    var crudManager = Ext.create('Gnt.data.CrudManager', {
        taskStore       : taskStore,
        ...
    });

##Cheatsheet

Lets review a few different scenarios and how you can configure your project for them:

1) **Requirements:** You are only interested in days for your tasks. Start time (12:00, 18:30 etc), end time doesn't matter in your case, only the date (2013/01/01, 2013/02/07).
You would like to *exclude* weekends when calculating the duration of a task and only count working time.

**Solution:** Use a plain {@link Gnt.data.Calendar} instance, possibly with adjusted duration conversion parameters.

2) **Requirements:** You are only interested in days for your tasks. Start time (12:00, 18:30 etc), end time doesn't matter in your case, only the date (2013/01/01, 2013/02/07).
You would like to *include* weekends when calculating the duration of a task and count any time.

**Solution:** Use a plain {@link Gnt.data.Calendar} instance, possibly with adjusted duration conversion parameters. Set {@link Gnt.data.Calendar#weekendsAreWorkdays weekendsAreWorkdays} to `true`

3) **Requirements:** You are only interested in days for your tasks. Start time (12:00, 18:30 etc), end time doesn't matter in your case, only the date (2013/01/01, 2013/02/07).
You would like to *exclude* weekends when calculating the duration of a task and only count working time. You would like to define some holidays, that will be global and those should be excluded
from the working time as well.

**Solution:** Use a plain {@link Gnt.data.Calendar} instance, with possibly adjusted duration conversion parameters. Add "day overrides" to it - one for each holiday.

4) **Requirements:** Start time and end time matters in your case, you would like to be precise (e.g., Task1 starts at 2013/01/01 15:00).
You would like to *exclude* the weekends and non-working time when calculating the duration of a task and only count working time. You need to define working time for every day.
Certain week days or days in the calendar can have different working time. Certain tasks or resources may have their own rules for working time.

**Solution:** Use a {@link Gnt.data.calendar.BusinessTime} instance, possibly with adjusted duration conversion parameters. Add "day overrides" to it - one for each holiday.
Add additional calendar instances (with "calendarId" property defined) for every task and resource that needs their own calendar (consider using parent-child relation between them and project calendar). Make use of
the {@link Gnt.widget.calendar.Calendar} classvfor editing calendar contents.
