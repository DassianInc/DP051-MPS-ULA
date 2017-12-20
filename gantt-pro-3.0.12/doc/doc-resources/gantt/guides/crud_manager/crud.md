Load request
===========

load request JSON:
    {
        requestId       : 123890,
        type            : 'load',
        stores          : [
            {
                storeId     : 'TaskStore',
                page        : 1,
                pageSize    : 10
            },
            'DependencyStore'
        ]
    }

load request XML:

    <load requestId="123890">
        <store id="TaskStore" page="1" pageSize="10"/>
        <store id="DependencyStore"/>
    </load>


Load response
=============

response JSON:

    {
        requestId       : 123890,
        revision        : 123,

        TaskStore       : {
            rows    : [
                { Id : 9000, SomeField : 'xxxx', ... },
                { Id : 123, SomeField : 'yyyy', ... }
            ]
        },

        DependencyStore : {
            rows    : [...]
        }
    }

response XML:

    <data requestId="123890" revision="123" success="true">

        <store id="TaskStore">
            <rows>
                <record>
                    <field id="Id">9000</field>
                    <field id="SomeField">xxxx</field>
                    ...
                </record>
                <record>
                    <field id="Id">123</field>
                    <field id="SomeField">yyyy</field>
                    ...
                </record>
            </rows>
        </store>

        <store id="DependencyStore">
            <rows>...</rows>
        </store>
    </data>


Sync request
============

sync request JSON:

    {
        requestId       : 123890,
        type            : 'update',
        revision        : 123,

        TaskStore       : {
            added           : [
                { PhantomId : 1, Name : 'smth', StartDate : ... }, ...
            ],
            updated         : [
                { Id : 123, Name : 'new name' }, ...
            ],
            removed         : [
                { Id : 345 }, ...
            ]
        },

        DependencyStore : {
            added           : [...],
            updated         : [...],
            removed         : [...]
        }
    }

sync request XML:

    <sync requestId="123890" revision="123">
        <store id="TaskStore">
            <added>
                <record>
                    <field id="PhantomId">1</field>
                    <field id="Name">smth</field>
                    ...
                </record>
                ...
            </added>
            <updated>
                <record>
                    <field id="Id">123</field>
                    <field id="Name">new name</field>
                    ...
                </record>
                ...
            </updated>
            <removed>
                <record>
                    <field id="Id">345</field>
                </record>
                ...
            </removed>
        </store>

        <store id="DependencyStore">
            <added>...</added>
            <updated>...</updated>
            <removed>...</removed>
        </store>
    </sync>


Sync response
=============

response JSON:

    {
        requestId       : 123890,
        success         : true,
        revision        : 124,
        TaskStore       : {
            rows    : [
                { PhantomId : 1, Id : 9000 },
                { Id : 123, SomeCustomServerProvidedField : '2013-08-01' }
            ],
            removed : [
                { Id : 345 }, ...
            ]
        },

        DependencyStore : {
            rows    : [...],
            removed : [...]
        }
    }

response XML:

    <data requestId="123890" success="true" revision="124">
        <store id="TaskStore">
            <rows>
                <record>
                    <field id="PhantomId">1</field>
                    <field id="Id">9000</field>
                </record>
                <record>
                    <field id="Id">123</field>
                    <field id="SomeCustomServerProvidedField">2013-08-01</field>
                </record>
            </rows>
            <removed>
                <record>
                    <field id="Id">345</field>
                </record>
                ...
            </removed>
        </store>

        <store id="DependencyStore">
            <rows>...</rows>
            <removed>...</removed>
        </store>
    </data>

Error handling
==============

{
    requestId : 123456,
    success   : false,
    message   : 'Error description goes here',
    code      : 13
}

XML response:

    <data requestId="123890" success="true" code="13">
        <message>Error description goes here</message>
    </data>


!!!TODO: move calendar samples to gantt doc:

sync request

{
    calendarManager : {
        added : [
            {
                Name    : 'smth1',
                Days    : {
                    $package    : true,
                    added       : [...],
                    updated     : [...],
                    removed     : [...]
                }
            },
            ...
        ],
        updated : [
            {
                Id      : 11,
                Name    : 'smth2',
                Days    : {
                    $package    : true,
                    added       : [...],
                    updated     : [...],
                    removed     : [...]
                }
            },
            ...
        ],
        removed : [...]
    }
}

load response

{
    'Id'                    : 'holidays-123',
    'ParentId'              : 'general-2',
    'Name'                  : 'Some super name',
    'DaysPerMonth'          : 30,
    'DaysPerWeek'           : 7,
    'HoursPerDay'           : 24,
    'WeekendsAreWorkdays'   : true,
    'WeekendFirstDay'       : 6,
    'WeekendSecondDay'      : 0,
    'DefaultAvailability'   : [ '00:00-24:00' ],
    'Days'                  : [
        {
            'Id'            : 1,
            'Date'          : ...,
            'Availability'  : [...]
        }
        {
            'Id'            : 2,
            'Date'          : ...,
            'Availability'  : [...]
        }
        {
            'Id'            : 3,
            'Date'          : ...,
            'Availability'  : [...]
        }
    ]
}
