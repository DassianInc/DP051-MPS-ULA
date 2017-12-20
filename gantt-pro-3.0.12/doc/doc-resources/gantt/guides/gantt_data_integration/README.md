#Data integration

##Introduction

This guide will show you how to integrate the Ext Gantt component with your server (CRUD). The guide is generic and does not assume you're using a
particular backend or database. The only pre-requisites is that you need to know how to communicate from a browser to your server using Ajax.
For further guidance, you may also want to look at the ASP.NET and PHP samples available in the SDK/examples folder.

The guide is divided into 4 parts showing how each of the Create, Read, Update and Delete operations are done.


First let's define a store ([TaskStore][0]) with an Ajax proxy which will communicate with our backend scripts :

    var taskStore = new Gnt.data.TaskStore({
        proxy : {
            type    : 'ajax',
            method  : 'POST',
            reader  : {
                type : 'json'
            }, 
            api: {
                read    : 't-read.php',
                create  : 't-create.php',
                destroy : 't-destroy.php',
                update  : 't-update.php'
            },
            writer : {
                type        : 'json',
                root        : 'data',
                encode      : true,
                allowSingle : false
            }
        }
    });

For more details about setting up a data proxy for a store, please consult the [Sencha documentation][1]. 
Note the DataWriter `allowSingle` config - if set to false, records sent to the server will always be wrapped in an array.
Also note the DataWriter `root` config - it defines the name of the request parameter that will store the array of data (when encode is true).

##Reading

{@img task_read.png}

In Ext Gantt 2+, we use flat arrays of records for all CRUD operations except when reading the task tree.
When initially loading data into the Gantt chart, the server should return an array of the root level tasks. Each task that contain subtasks should contain
a nested 'children' array member. If a node has no children, the 'children' parameter shouldn't exist and its leaf property should be set to 'true'.

### Read: Server request

The client issues a GET (unless you defined otherwise in the 'actionMethods' config of your proxy) and passes a 'node' param which is empty for the initial load.
If you only want to load a certain number of levels in your tree, you can indicate that there are child nodes by setting leaf to false, and include no child nodes.
When such a node is expanded, you will be passed the node id as the 'node' param.

    GET http://localhost/ExtGantt2.x/examples/advanced/tasks.js?node=&

### Read: Server response

This is a sample response from the server when loading a page with a structure shown on the image (some parameters were removed to improve readability):

    [
       {
          "Id":"14",
          "parentId":"null",
          "leaf":"false",
          "Name":"T1",
          "StartDate":"2012-06-27T00:00:00",
          "EndDate":"2012-06-29T00:00:00",
          "Duration":"2",
          "DurationUnit":"d",
          "children":[
             {
                "Id":"22",
                "parentId":"14",
                "leaf":"true",
                "Name":"T2",
                "StartDate":"2012-06-27T00:00:00",
                "EndDate":"2012-06-29T00:00:00",
                "Duration":"2",
                "DurationUnit":"d",
             }
          ]
       }
    ]

##Creating

Let's continue to add a new task under the `T2` task.

{@img task_add.png}

When adding new tasks, the server script should expect an input of flat array of records. The response should also be a flat structure of the created
nodes.

### Create: Request

This is a sample request to the server when adding one new task (note that the Id parameter is sent as null):

    [
        {
            "Id": null,
            "parentId": "14",
            "leaf": true,
            "StartDate": "2012-06-27T00:00:00",
            "EndDate": "2012-06-29T00:00:00",
            "Name": "New task",
            "Duration": 2,
            "PercentDone": 0,
            "BaselineStartDate": null,
            "BaselineEndDate": null,
            "BaselinePercentDone": 0,
            "DurationUnit": "d"
        }
    ]


For each record to create, you need to update the `Id` property with the new value assigned by the database.
When all tasks are added and have received their propers Ids, encode the array to JSON and return it as the response.
Note: The order of the tasks that you return to the client must be maintained.

### Create: Response

This is a response from the server after adding a single task (note that the Id field is now set):

    [
       {
          "Id":45,
          "parentId":"14",
          "leaf":true,
          "StartDate":"2012-06-27T00:00:00",
          "EndDate":"2012-06-29T00:00:00",
          "Name":"New task",
          "Duration":2,
          "PercentDone":0,
          "ManuallyScheduled":false,
          "SchedulingMode":"Normal",
          "BaselineStartDate":null,
          "BaselineEndDate":null,
          "BaselinePercentDone":0,
          "DurationUnit":"d"
       }
    ]

##Updating

Now let's rename our `New task` to `T3` :

{@img task_update_1.png}

and the structure after confirming the change :

{@img task_update_2.png}

###Update: Request

This is a simple request to the server when updating one task:

    [
        {
            "Id": 45,
            "parentId": "14",
            "leaf": true,
            "StartDate": "2012-06-27T00:00:00",
            "EndDate": "2012-06-29T00:00:00",
            "Name": "T3",
            "Duration": 2,
            "PercentDone": 0,
            "BaselineStartDate": null,
            "BaselineEndDate": null,
            "BaselinePercentDone": 0,
            "DurationUnit": "d"
        }
    ]


###Update : Response

When the server has saved all tasks, it should encode the array to JSON and return it as the response.
Here is the response from the server after updating one task (it's identical to the request, but the server could also make changes to the data of course):
Note: The order of the tasks that you return to the client must be maintained.

    [
        {
            "Id": 45,
            "parentId": "14",
            "leaf": true,
            "StartDate": "2012-06-27T00:00:00",
            "EndDate": "2012-06-29T00:00:00",
            "Name": "T3",
            "Duration": 2,
            "PercentDone": 0,
            "BaselineStartDate": null,
            "BaselineEndDate": null,
            "BaselinePercentDone": 0,
            "DurationUnit": "d"
        }
    ]

##Delete

###Delete: Request

This is a simple request to the server when deleting one task (T3) :

    [
        {
            "Id": 45,
            "parentId": "14",
            "leaf": true,
            "StartDate": "2012-06-27T00:00:00",
            "EndDate": "2012-06-29T00:00:00",
            "Name": "T3",
            "Duration": 2,
            "BaselineStartDate": null,
            "BaselineEndDate": null,
            "BaselinePercentDone": 0,
        }
    ]

The server should simply remove all database entries corresponding to the id's found in the incoming array.

###Delete: Response

The response from the server after deleting one or more tasks is simple, it should only return a success property:

    '{"success": true}'

##Summing up

This guide shows you how to do simple CRUD for your tasks. The same request/response conventions apply to other stores, such DependencyStore and AssignmentStore.
If you have specific needs to handle data integrity, you may want to consider sending all the updated content from the client to the server in one request.
This also enables you to use a database transaction for your operation. You can ask each store for its new, updated and removed records and then build a
custom request object such as:

    saveData : function() {
        var newTasks = ...; // Get from task store, encode
        var updatedTasks = ...; // Get from task store, encode
        var removedTasks = ...; // Get from task store, encode

        var newDependencies = ...; // Get from dependency store, encode
        var updatedDependencies = ...; // Get from dependency store, encode
        var removedDependencies = ...; // Get from dependency store, encode

        var data = {
           tasks : {
               "new"       : newTasks,
               updated     : updatedTasks,
               removed     : removedTasks
           },

           dependencies : {
               "new"       : newDependencies,
               updated     : updatedDependencies,
               removed     : removedDependencies
           }
       };

       Ext.Ajax.request({
            url         : 'YOUR_SAVE_URL',
            method      : 'POST',
            jsonData    : data,

            success     : function (response) {
                // we're done!
            }
        });
    }



[0]: http://bryntum.com/docs/#!/api/Gnt.data.TaskStore
[1]: http://docs.sencha.com/ext-js/4-1/#!/api/Ext.data.proxy.Proxy