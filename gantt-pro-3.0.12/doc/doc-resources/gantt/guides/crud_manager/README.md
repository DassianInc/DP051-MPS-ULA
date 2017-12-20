# Introducing the CRUD manager

## Introduction

The main idea behind the _CRUD manager_ (or "CM") development is to bring _simplicity_ when dealing with loading/saving of multiple related datasets.
We wanted to create a central class which combining all the project stores into a single object. The core features of the Crud Manager provides:

- Load capability fo data belonging to any number of stores (in a single ajax request)
- Save capability pulling all changes in multiple stores (in a single ajax request)
- Clear and concise configuration setup (avoiding configuration on multiple individual ajax proxies)
- Low number of dependencies on Ext JS, its API will stay stable through future _ExtJS_ upgrades

All above targets were achieved by implementing the various _CRUD manager_ classes.

## Architecture

Under the hood, the _CRUD manager_ contains and manages a collection of stores.
The core of any _CRUD manager_ implementation is the {@link Sch.crud.AbstractManager} class.
To turn that abstract class into a final implementation it should be mixed in with two more classes:

- encoding system mixin
- transport system mixin

For example, the main {@link Sch.data.CrudManager} class uses _JSON_ encoding (provided by {@link Sch.crud.encoder.Json} )
and _AJAX_ as transport (provided by {@link Sch.crud.transport.Ajax}).

    var crudManager = Ext.create('Sch.data.CrudManager', {
        autoLoad    : true,
        stores      : [
            store1, store2, store3
        ],
        transport   : {
            load    : {
                url     : 'php/read.php'
            },
            sync    : {
                url     : 'php/save.php'
            }
        }
    });

The above {@link Sch.data.CrudManager} instance will load data for all its registered stores data in a single _AJAX_ request.
And any changes made to data in those stores will be sent to the server in one bulk request as well (more details {@link Sch.data.CrudManager#method-sync here}).

### Implementing a custom CRUD manager

Let's say that we wanted to implement own _CRUD manager_. For example to have another encoding (like _XML_ or some other format) or another transport mechanism.
Then we have to implement our own mixins supporting such corresponding systems. There are some requirements for the content of these mixins.

The encoding API mixin must have two methods:

- `encode` - encodes packages before they are sent to a server (from `Object` to a `String`)
- `decode` - decodes server responses (from `String` to an `Object`)

And the transport API mixin must implement following methods:

- `sendRequest` - send request to a server
- `cancelRequest` - cancels request

So we extend abstract {@link Sch.crud.AbstractManager} class and mix-in a custom encoder:

    Ext.define('MyEncoder', {
        encode : function (request) {
            ...
        },
        decode : function (response) {
            ...
        }
    });

    Ext.define('MyCrudManager', {
        extend          : 'Sch.crud.AbstractManager',
        // Use AJAX for requests transporting and our own encoding MyEncoder class
        mixins          : ['MyEncoder', 'Sch.crud.transport.Ajax']
    });

### Data revisions

The server interaction protocol supports a _server revision stamp_ (a number incremented after every data update on the server).
Based on this value, the server may reject a save-request containing possibly outdated data. This can be useful in case of highly concurrent
system implementations, offering you additional control on data integrity and consistency.

Yet this capability is optional and can be easily turned on or off depending on your requirements.

## Server communication

All server communications can be divided into two types:

- Loading data
- Saving data (an incremental update sent from client to server)

See the following sections for detailed description.

## Loading data

Data can either be loaded by calling the {@link Sch.crud.AbstractManager#method-load load} method or declaratively by setting the {@link Sch.crud.AbstractManager#autoLoad autoLoad} config to `true`.
A load request is of course performed asynchronously. To be notified of when the load operation is completed, simply specify a callback, or listen to the {@link Sch.crud.AbstractManager#event-load load event}.

When the data has been fetched, it's loaded to each of the stores in the same order as the stores are registered in the  _CRUD manager_.
Please take a look at the {@link Sch.crud.AbstractManager#addStore addStore} method for more details on how to register stores in a particular order.

### Load request structure

Let's take a closer look at the _load request_ data structure. The load request object has the following properties:

    {
        requestId   : 123890,
        type        : "load",
        stores      : [
            {
                storeId     : "store1",
                page        : 1,
                pageSize    : 2,
                someParam   : "abc"
            },
            "store2",
            "store3"
        ]
    }

Definitions:

- `requestId` - unique request identifier shipped with any request
- `type` - request type ('load' - for load requests)

The `stores` section holds the list of stores to be loaded. As the bare minimum, each store can be described by its identifier (as is done for `store2` and `store3` in the sample above)
but normally they are represented by an object holding a store identifier as well as several parameters.
These parameters can be provided in the {@link Sch.crud.AbstractManager#method-load load} method.

    crudManager.load({
        // specify request params for store1
        store1 : {
            page        : 2,
            someParam   : 'abc'
        }
    });

#### Pagination support

Pagination is supported through the  `page` and `pageSize` parameters when a store is loaded.
They are taken from each corresponding store and ignored in cases they do not make sense (e.g. for `Ext.data.TreeStore`).

**Note:** There is a special {@link Sch.widget.PagingToolbar} widget implementing a paging toolbar.
It should be used instead of the standard `Ext.toolbar.Paging` when dealing with a CRUD manager.

### Load response structure

The response for a load operation will look like this:

    {
        requestId   : 123890,
        revision    : 123,
        success     : true,

        store1      : {
            rows : [
                { Id : 9000, SomeField : 'xxxx', ... },
                { Id : 123, SomeField : 'yyyy', ... }
            ],
            metaData : {
                someProp : 789,
                anotherProp : "foo"
            },
            total : 5
        },

        store2      : {
            rows : [
                { Id : 1, Field1 : 'aaa', ... },
                { Id : 2, Field1 : 'bbb', ... }
            ],
            total : 2
        },

        store3      : {
            rows : [
                { Id : 1, Field2 : 'aaa', ... },
                { Id : 2, Field2 : 'bbb', ... }
            ],
            total : 2
        }
    }

Definitions:

- `requestId` - the request identifier
- `revision` - the _server revision stamp_ from client
- `success` - `true` to indicate a successful response, `false` if some server error occurred

The store data is placed under each corresponding store identifier. A store data section has:

- `rows` - An array of records
- `total` - The total number of records
- `metaData` - An optional object containing meta data for the store. This object will be assigned to the store's `metaData` property after loading.

## Saving data

A save operation is triggered by calling {@link Sch.crud.AbstractManager#method-sync sync} call or it can be invoked automatically after any data change
if the {@link Sch.crud.AbstractManager#autoSync autoSync} config is set to `true`. A sync request is naturally performed asynchronously. To be
  notified upon completion, either pass a callback or listen to the {@link Sch.crud.AbstractManager#event-sync sync event}.

After a save request is completed, the CRUD manager applies the server-side response to each individual store.

**Note: It's highly recommended to prevent a user from changing data in the stores while a sync operation is ongoing.
The _CRUD manager_ tries to queue additional sync requests if a user triggers sync before a prior request is done.
Data changes done in parallel with ongoing save requests may still lead to unwanted state of your data, so the recommendation is to.
 use GUI masking technique (like `loadMask` for grids) to prevent such scenarios.**

### Sync request structure

Here is an example of a _sync request_ object:

    {
        requestId   : 123890,
        type        : 'sync',
        revision    : 123,

        store1      : {
            added : [
                { $PhantomId : 'q1w2e3r4t5', SomeField : 'smth', ... },
                ...
            ],
            updated : [
                { Id : 123, SomeField : 'new value' },
                ...
            ],
            removed : [
                { Id : 345 },
                ...
            ]
        },

        store2      : {
            added : [...],
            updated :  [...],
            removed :  [...]
        }
    }

Definitions:

- `requestId` - A unique request identifier shipped with all requests
- `type` - The request type ('sync' - for sync requests)
- `revision` - A _server revision stamp_ from the client

For each store, the request has three sections `added`, `updated` and `removed` under which the updated records are placed.
The presence of each section is optional depending on the presence of such type of records.

Each added record is sent including the phantom identifier ({@link Sch.crud.AbstractManager#phantomIdField by default} the `$PhantomId`,  field name is used).
Each updated record includes an identifier as well as any updated field values only. And finally for removed records, only the ids are transfered.

### Sync response structure

An example of a _sync response_ object:

    {
        requestId   : 123890,
        success     : true,
        revision    : 124,
        store1      : {
            rows : [
                // processed phantom record initially sent from client
                { $PhantomId : 'q1w2e3r4t5', Id : 9000 },
                // processed updated record initially sent from client
                { Id : 123, SomeField2 : '2013-08-01' },
                // record added/updated by server logic (not sent from client)
                { Id : 124, SomeField : 'server generated', SomeField2 : '2013-08-01' }
                ...
            ],
            removed : [
                // processed removed record initially sent from client
                { Id : 345 },
                // record removed by server logic (not sent from client)
                { Id : 145 },
                ...
            ]
        },

        store2      : {
            rows : [...],
            removed : [...]
        }
    }

Definitions:

- `requestId` - The request identifier
- `success` - `true` to indicate a successful response, `false` if some server error occurred
- `revision` - The new _server revision stamp_ from server

For each store we have two sections: `rows` and `removed`, where:

- `rows` holds all records added or updated _by the server_.
As the bare minimum, for phantom records sent by the client, the server returns a combination of phantom Id and the new "real" Id (the Id assigned by the database).
If the server decides to update some other record as a side effect (either a phantom or a persisted one) or create a new one
it should return an object holding a combination of the real Id and those field values.
The field values will be applied to the corresponding store record on the client (new records will be created automatically).
- `removed` holds Ids of records removed _by the server_ whether initially sent from client or removed due to some server logic.

## Error handling

In case of a server-side error, the response object will look like this:

    {
        requestId : 123890,
        success   : false,
        message   : 'Error description goes here',
        code      : 13
    }

Definitions:

- `requestId` - The request identifier
- `success` - `false` indicating that a server error occurred
- `message` - The error message
- `code` - An optional error code

The {@link Sch.crud.AbstractManager#method-load load} and {@link Sch.crud.AbstractManager#method-sync sync} methods both have an `errback` argument where
the caller can specify a function to be called if an error occurs.

    var crudManager = new Sch.data.CrudManager({
        resourceStore   : resourceStore,
        eventStore      : eventStore,
        transport       : {
            load : {
                url : 'php/read.php'
            },
            sync : {
                url : 'php/save.php'
            }
        }
    });

    crudManager.load(null, function (response, rawResponse) {
        // let's show message box with error text
        Ext.Msg.show({
            title    : 'Error',
            msg      : response && response.message || 'Unknown error occurred',
            icon     : Ext.Msg.ERROR,
            buttons  : Ext.Msg.OK
        });
    });

Another option allowing a centralized handling of errors is to listen for the {@link Sch.crud.AbstractManager#loadfail loadfail} and {@link Sch.crud.AbstractManager#syncfail syncfail} events:

    // A central method to handle CRUD errors
    var processError = function (crud, response) {
        // error code
        var code = response && response.code;

        // here we can define some specific reaction on a particular error
        if (code == 13) {
            // for example re-load crudManager
            crudManager.load();

        // and for all other case we just display an error message
        } else {
            Ext.Msg.show({
                title    : 'Error',
                msg      : response && response.message || 'Unknown error occurred',
                icon     : Ext.Msg.ERROR,
                buttons  : Ext.Msg.OK
            });
        }
    };

    var crudManager     = new Sch.data.CrudManager({
        autoLoad        : true,
        resourceStore   : resourceStore,
        eventStore      : eventStore,
        transport       : {
            load : {
                url : 'php/read.php'
            },
            sync : {
                url : 'php/save.php'
            }
        },
        listeners       : {
            // listen to load request errors
            loadfail : processError,
            // listen to sync request errors
            syncfail : processError
        }
    });

