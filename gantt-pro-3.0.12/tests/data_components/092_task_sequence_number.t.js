StartTest(function(t) {

    var taskStore = new Gnt.data.TaskStore({
        root : {
            children : [
                {   // 1
                    leaf : true
                },
                {       // 2
                    children : [
                        {   // 3
                            children : [
                                {   // 4
                                    leaf : true
                                },
                                {   // 5
                                    leaf : true
                                }
                            ]
                        }]
                },
                {   // 6
                    leaf : true
                }
            ]
        }
    });
    
    
    var root = taskStore.getRootNode();

    function verifySequentialNumbers(t, expectedCount) {
        // repeating `root` here, to be able to re-define it
        var root            = taskStore.getRootNode();
        
        var linearNodes     = []
        var linearNumbers   = []
        
        root.cascadeBy(function (node) {
            linearNumbers.push(node.getSequenceNumber())
            linearNodes.push(node)
        })
        
        var need            = []
        
        for (var i = 0; i <= expectedCount; i++) need.push(i)
        
        t.isDeeply(linearNumbers, need, "All sequential numbers are correct")
        
        t.is(root.getTotalCount(), expectedCount, "Total count calculates as expected");
        
        for (var i = 0; i <= expectedCount; i++) t.is(taskStore.getBySequenceNumber(i), linearNodes[ i ], "`getBySequenceNumber` works")
    }


    t.it('Initial tests', function(t) {
        verifySequentialNumbers(t, 6);

        t.isStrict(taskStore.getBySequenceNumber(NaN), null, 'getBySequenceNumber(NaN) should return null');
        t.isStrict(taskStore.getBySequenceNumber(-1), null, 'getBySequenceNumber(-1) should return null');
        t.isStrict(taskStore.getBySequenceNumber(root.getTotalCount() + 1), null, 'getBySequenceNumber(total + 1) should return null');
    });
    
    t.it('Verifying that collapse/expand does not change the sequential number', function(t) {
        root.childNodes[ 1 ].collapse()
        
        verifySequentialNumbers(t, 6);
        
        root.childNodes[ 1 ].expand()
        
        verifySequentialNumbers(t, 6);
    });

    t.it('Tests after removing leaf', function(t) {
        root.removeChild(root.firstChild);

        verifySequentialNumbers(t, 5);
    });

    t.it('Tests after removing branch leaf', function(t) {
        var branch = root.firstChild;

        branch.removeChild(branch.firstChild);

        verifySequentialNumbers(t, 2);
    });

    t.it('Tests after removing branch', function(t) {
        root.removeChild(root.firstChild);

        verifySequentialNumbers(t, 1);
    });

    t.it('Tests after adding leaf', function(t) {
        root.insertChild(0, {
            leaf : true
        });

        verifySequentialNumbers(t, 2);
    });

    t.it('Tests after adding branch', function(t) {
        root.insertChild(0, {
            expanded : true,
            children : [
                    {
                        leaf : true
                    },
                    {
                        leaf : true
                    }
                ]
        });

        verifySequentialNumbers(t, 5);
    });

    t.it('Tests after adding last branch leaf', function(t) {
        root.lastChild.insertChild(0, {
            leaf : true
        });

        verifySequentialNumbers(t, 6);
    });

    t.it('Tests after removing all of a branch', function(t) {
        root.firstChild.removeAll();
        verifySequentialNumbers(t, 4);
    });

    t.it('Tests after removing all', function(t) {
        root.removeAll();
        t.isStrict(root.getTotalCount(), 0, 'Total count should be zero');
    });
    
    t.it('Tests after indent', function(t) {
        taskStore.setRootNode({
            children        : [
                { Id      : 1 },
                { Id      : 2 },
                { Id      : 3 },
                { Id      : 4 }
            ]
        })
        
        var id      = t.getLocatorById(taskStore)
        
        id(3).indent()
        
        verifySequentialNumbers(t, 4);
    });
    
});
