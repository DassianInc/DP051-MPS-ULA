StartTest(function(t) {
    
    t.it('`replaceChild` method, called on task with 1 child, should not convert it into leaf', function (t) {
        with (t.getAllStoresDataSet(
            [
                {
                    Id          : 1,
                    children    : [
                        {
                            Id          : 11,
                            leaf        : true
                        }
                    ]
                }
            ]
        )) {
            t.notOk(id(1).isLeaf(), "Task1 is not leaf")
            
            id(1).replaceChild({ Name : 'new child' }, id(11))
            
            t.notOk(id(1).isLeaf(), "Task1 is still not leaf")
        }
    })
});
