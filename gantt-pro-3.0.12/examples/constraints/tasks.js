[
    { "BaselineEndDate"     : "2010-02-01",
        "Id"                : 1,
        "Name"              : "Planning",
        "PercentDone"       : 40,
        "StartDate"         : "2010-01-18",
        "BaselineStartDate" : "2010-01-13",
        "Duration"          : 8,
        "expanded"          : true,
        "children"          : [
            {
                "BaselineEndDate"   : "2010-01-28",
                "Id"                : 11,
                "leaf"              : true,
                "Name"              : "Constrained Task",
                "ConstraintType"    : "muststarton",
                "ConstraintDate"    : "2010-01-18",
                "PercentDone"       : 40,
                "StartDate"         : "2010-01-18",
                "BaselineStartDate" : "2010-01-20",
                "Duration"          : 3
            },
            {
                "BaselineEndDate"   : "2010-02-01",
                "Id"                : 12,
                "leaf"              : true,
                "Name"              : "Some other task",
                "ConstraintType"    : "startnolaterthan",
                "ConstraintDate"    : "2010-01-23",
                "PercentDone"       : 40,
                "StartDate"         : "2010-01-21",
                "BaselineStartDate" : "2010-01-25",
                "Duration"          : 3
            },
            {
                "BaselineEndDate"   : "2010-02-01",
                "Id"                : 13,
                "leaf"              : true,
                "Name"              : "Fix bug",
                "PercentDone"       : 40,
                "StartDate"         : "2010-01-26",
                "BaselineStartDate" : "2010-01-25",
                "Duration"          : 2
            },
            {
                "BaselineEndDate"   : "2010-02-04",
                "Id"                : 14,
                "leaf"              : true,
                "Name"              : "Report issue to vendor",
                "PercentDone"       : 40,
                "StartDate"         : "2010-01-28",
                "BaselineStartDate" : "2010-02-04",
                "Duration"          : 0
            }
        ]
    }
]