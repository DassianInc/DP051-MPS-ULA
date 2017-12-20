# Using CRUD manager with Ext Scheduler

## Intro

This guide describes how to use the CRUD manager with Ext Scheduler.
It contains only Scheduler specific details. For general information on CRUD manager implementation and architecture
see [this guide](#!/guide/crud_manager).

The class implementing the _CRUD manager_ (or "CM") for Ext Scheduler is called {@link Sch.data.CrudManager}.
It uses {@link Sch.crud.transport.Ajax AJAX} as transport system and {@link Sch.crud.encoder.Json JSON} as the encoding format.

## Benefits of using the CRUD manager

In previous versions of our code base, you had to load and save data using the standard Ext JS data package. This would involve
setting proxies on data stores and handling load and save on each such store. This approach worked, but had a few drawbacks:

- To load data into the Scheduler, two ajax requests were typically required (one for the EventStore, and one for the ResourceStore)
- Hard to use database transactions on the server side.

For performance reasons, obvisously we'd like the loading process to use a single request that returns the resources and all their events.
This is now easy to achieve since the CM loads the data in one request. When it comes to saving changes, you normally want to have an
 "all-or-nothing" transaction-based approach to persisting updates in your database. This is not feasible if you're using two separate ajax requests.

## Stores

There are two stores used in Scheduler: resources and events store. To register them in with the {@link Sch.data.CrudManager} instance, simply pass the {@link Sch.data.CrudManager#resourceStore resourceStore} and
{@link Sch.data.CrudManager#eventStore eventStore} respectively.

    var crudManager = new Sch.data.CrudManager({
        autoLoad        : true,
        resourceStore   : resourceStore,
        eventStore      : eventStore,
        transport       : {
            load    : {
                url     : 'php/read.php'
            },
            sync    : {
                url     : 'php/save.php'
            }
        }
    });

You can let the CM handle loading/saving for any other custom stores of yours. To do this, simply provide your additional stores using the {@link Sch.data.CrudManager#stores stores} config:

    var crudManager = new Sch.data.CrudManager({
        autoLoad        : true,
        resourceStore   : resourceStore,
        eventStore      : eventStore,
        stores          : [ store1, store2, store3 ],
        transport       : {
            load    : {
                url     : 'php/read.php'
            },
            sync    : {
                url     : 'php/save.php'
            }
        }
    });

Or add them programmatically using the {@link Sch.data.CrudManager#addStore addStore} method:

    crudManager.addStore([ store2, store3 ]);

## Implementation

In order to start using the CM with your Scheduler implmenetation, all you need to do is to create the CRUD manager and configure it with an "eventStore", a "resourceStore", and "load" and "save" URLs:

    var crudManager = Ext.create('Sch.data.CrudManager', {
        autoLoad        : true,
        resourceStore   : resourceStore,
        eventStore      : eventStore,
        transport       : {
            load    : {
                url     : 'php/read.php'
            },
            sync    : {
                url     : 'php/save.php'
            }
        }
    });

In the above example, the loading will start automatically since the CM is configured with the {@link Sch.data.CrudManager#autoLoad autoLoad} config set to `true`.
There is also a {@link Sch.data.CrudManager#method-load load} method to invoke the loading manually:

    crudManager.load(function (response) {
        alert('Data loaded...');
    })

To persist changes, there is an {@link Sch.data.CrudManager#autoSync autoSync} config for automatic save after a data change
and of course you can also call {@link Sch.data.CrudManager#method-sync sync} method manually:

    crudManager.sync(function (response) {
        alert('Changes saved...');
    });

Any {@link Sch.panel.SchedulerGrid} or {@link Sch.panel.SchedulerTree} instances can be configured to use the _CRUD manager_ by providing the
{@link Sch.panel.SchedulerGrid#crudManager crudManager} config. In this case you don't need to specify {@link Sch.panel.SchedulerGrid#resourceStore resourceStore} and {@link Sch.panel.SchedulerGrid#eventStore eventStore}
on the panel. They will be taken from the provided {@link Sch.panel.SchedulerGrid#crudManager crudManager}. Your stores should not be using the
autoLoad or autoSync settings, since this is now handled by the CM they belong to.

    var scheduler = new Sch.panel.SchedulerGrid({
        viewPreset          : 'dayAndWeek',
        startDate           : new Date(2014, 0, 1),
        endDate             : new Date(2014, 1, 1),
        width               : 800,
        height              : 350,
        // Tell the scheduler to use our CRUD manager
        crudManager         : crudManager
    });


## Error handling

See [details on error handling in general guide](#!/guide/crud_manager-section-5).

## Writing own server-side implementation.

The CM doesn't require any specific backend, meaning you can implement the server-side parts in any platform. The only requirement is to follow [the requests and responses structure convention](#!/guide/crud_manager-section-3).
