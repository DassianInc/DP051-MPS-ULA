# Task constraints

## Introduction

When working with tasks in a large project schedule, some tasks usually have date constraints attached to them. For example, 
Santa Claus must finish delivering all gifts before end of Christmas (a Finish-No-Later-Than constraint). 

Ext Gantt supports six types of task constraints:

* Must-Start-On (alias `muststarton`)
* Must-Finish-On (alias `mustfinishon`)
* Start-No-Earlier-Than (alias `startnoearlierthan`)
* Start-No-Later-Than (alias `startnolaterthan`)
* Finish-No-Earlier-Than (alias `finishnoearlierthan`)
* Finish-No-Later-Than (alias `finishnolaterthan`)

Each of the constraints listed above is defined by a type (a string) and a target date. Therefore, two new fields have been added to the {@link Gnt.modelTask Task model} class - `ConstraintType` and `ConstraintDate`.
In your data, you simply set these two fields to define your task constraints. Example task with a "Must-Start-On" constraint:
    
    {
        "Id"                : 123,
        "leaf"              : true,
        "Name"              : "Some Task",
        "Duration"          : 10,
        "PercentDone"       : 50,
        "ConstraintType"    : "muststarton",
        "ConstraintDate"    : "2010-01-18",
        "StartDate"         : "2010-01-18"
    }
    
As you see, the constraint is defined and "satisfied" since the task starts on the same date as the constraint date. To let your users
define and change constraints, simply include the two constraint columns and enable cell editing.

    
    var gantt = new Gnt.panel.Gantt({
        columns       : [
            {
                xtype : 'namecolumn'
            },
            {
                xtype : 'constrainttypecolumn'
            },
            {
                xtype : 'constraintdatecolumn'
            }
        ],

        plugins : 'cellediting',
        ...
    });
    
Now if the user modifies a constraint, or the task start date, end date or duration - a prompt will be shown presenting the user 
with the following options:

* Cancel the change and do nothing
* Remove the constraint
* Move the task to satisfy the constraint

{@img constraint1.png}

If the user checks the "Don't ask again" checkbox and hits the Ok-button, the same action will be applied to all future constraints violations. (Note: This 
flag is not persisted during page reloads).

You can of course also change a constraint manually using the {@link Gnt.model.Task#setConstraint Task API}. If a constraint is violated by your change, the 
constraint resolution window will popup to allow the user to take the correct action.

    var task = taskStore.getNodeById(1);
    
    task.setStartDate(new Date(2014, 1, 1);
    
    // Constraint already satisfied
    task.setConstraint('muststarton', new Date(2014, 1, 1);

    // Will show the constraint resolution window, since the constraint is no longer fulfilled
    task.setStartDate(new Date(2014, 1, 2);


The constraint information can also be edited in the {@link Gnt.plugin.TaskEditor} window, under the Advanced tab.


## API details and asynchronous behavior

Constraints verification is now built-in into the Gantt data layer. Regular methods that affect the start or end date of a task
(like {@link Gnt.model.Task#setStartDate setStartDate}, {@link Gnt.model.Task#setDuration setDuration} etc) now check for possible constraint conflicts and allow a user to resolve them. Since receving user
input to such a conflict resolution is not synchronous, all such methods has been made asynchronous in the general case. These methods all accept a
callback, which will be called after all the changes caused by the method has completed. This also includes changes in the positions of any dependent tasks.
If constraints are not used, all methods remain synchronous so backward compatibility is fully preserved.

Every time a constraint conflict happens, a {@link Gnt.data.TaskStore#constraintconflict constraintconflict} event is fired by the {@link Gnt.data.TaskStore task store}.
