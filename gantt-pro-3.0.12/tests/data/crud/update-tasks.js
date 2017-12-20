[{
    "clientId": 119,
    "Id": 119,
    "StartDate": "2010-02-08",
    "EndDate": "2010-02-16",
    "PercentDone": 0,
    "Name": "Parent 2",
    "Duration": 6,
    "DurationUnit": "d",
    "parentId": "root",
    "index": 3,
    "leaf": false
}, {
    "clientId": 120,
    "Id": 120,
    "leaf": true,
    "StartDate": "2010-02-08",
    "EndDate": "2010-02-17",
    "PercentDone": 0,
    "Name": "RootLeaf 3",
    "Duration": 7,
    "DurationUnit": "d",
    "parentId": "root",
    "index": 4
},{
     "clientId": 121,
     "Id": 121,
     "StartDate": "2010-02-08",
     "EndDate": "2010-02-16",
     "PercentDone": 0,
     "Name": "Child 3",
     "Duration": 6,
     "DurationUnit": "d",
     "parentId": 119,
     "index": 0,
     "leaf" : true         // Seems required as of 4.1
 }]