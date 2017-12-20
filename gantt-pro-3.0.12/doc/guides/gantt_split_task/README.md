#Splitting tasks

##Introduction

{@img split-task.png}

Sometimes a task is not worked on continuously, work may be stopped as planned or due to unexpected circumstances. For such scenarios,
Ext Gantt supports splitting tasks into segments. To split a task you have two options, either perform the action in the UI using the context menu option,
or call the task 'split' method of the Gnt.model.Task class. Here's how you call the split method manually

    var taskStore = new Gnt.data.TaskStore({
        root : {
            expanded : true,
            children : [{
                Id        : 1,
                StartDate : new Date(2014, 10, 3),
                EndDate   : new Date(2014, 10, 7),
                leaf      : true
            }]
        }
    });

    var task = taskStore.getById(1);
    console.log(task.getSegments()); // null - task is not segmented

    // Will split the task in two segments, 1 day + 3 days
    task.split(new Date(2014, 10, 4));

    console.log(task.getSegments().length) // => 2 segments now
    console.log(task.getSegments()[0].getDuration()) // 1
    console.log(task.getSegments()[1].getDuration()) // 3

All you have to do is to provide the date when you want the split to be made. By default, a gap of 1 task 'duration unit' will be introduced
after the split. The second split in the example above will hence start on November 5. You can control the gap by passing two additional
parameters after the split date, one for the duration, and another argument for the duration unit.

##Merging tasks

Merging a split tasks is just as easy as splitting. Simply drag two pieces togther in the UI and they will be merged automatically. You can
of course do the same via the Task API:

    var taskStore = new Gnt.data.TaskStore({
        root : {
            expanded : true,
            children : [{
                Id        : 1,
                StartDate : new Date(2014, 10, 3),
                EndDate   : new Date(2014, 10, 7),
                leaf      : true
            }]
        }
    });

    var task = taskStore.getById(1);
    console.log(task.getSegments()); // null - task is not segmented

    // Will split the task in two segments, 1 day + 3 days
    task.split(new Date(2014, 10, 4));

    // Will merge the two segments
    task.merge(task.getSegment(0), task.getSegment(1));

    console.log(task.getSegments()) // => null, no segments now

##Data structure

When loading data with segmented tasks, the JSON structure should look like this:

    {
        "Id"                : 11,
        "leaf"              : true,
        "Name"              : "Investigate",
        "PercentDone"       : 50,
        "StartDate"         : "2010-01-18",
        "Segments"          : [
            {
                "Id"                : 1,
                "StartDate"         : "2010-01-18",
                "Duration"          : 1
            },
            {
                "Id"                : 2,
                "StartDate"         : "2010-01-20",
                "Duration"          : 2
            },
            {
                "Id"                : 3,
                "StartDate"         : "2010-01-25",
                "Duration"          : 5
            }
        ]
    }

The segments themselves are not part of the TaskStore directly, and can only be queried on the task level. The same structure as above
will be used when tasks are serialized and sent to the server to be saved.