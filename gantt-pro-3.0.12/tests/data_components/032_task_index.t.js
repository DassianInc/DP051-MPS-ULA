StartTest(function(t) {
    
    var getDataSet = function () {
    
        var taskStore = Ext.create("Gnt.data.TaskStore", {
            proxy       : {
                type    : 'memory',
                reader  : {
                    type    : 'json'
                }
            },
            
            root        : {
                expanded    : false,
                
                children    : [
                    {
                        Id          : 1,
                        leaf        : true,
                        StartDate   : new Date(2011, 6, 1),
                        EndDate     : new Date(2011, 6, 5)
                    },
                    {
                        Id          : 123,
                        
                        StartDate   : new Date(2011, 6, 15),
                        EndDate     : new Date(2011, 6, 23),
                        
                        children    : [
                            {
                                Id          : 2,
                                leaf        : true,
                                
                                ManuallyScheduled   : true,
                                
                                StartDate   : new Date(2011, 6, 16),
                                EndDate     : new Date(2011, 6, 20)
                            },
                            {
                                Id          : 3,
                                leaf        : true,
                                StartDate   : new Date(2011, 6, 18),
                                EndDate     : new Date(2011, 6, 22)
                            }
                        ]
                    },
                    {
                        Id          : 4,
                        leaf        : true,
                        StartDate   : new Date(2011, 6, 25),
                        EndDate     : new Date(2011, 6, 28)
                    },
                    {
                        Id          : 5,
                        leaf        : true,
                        StartDate   : new Date(2011, 6, 28),
                        EndDate     : new Date(2011, 6, 28)
                    }
                ]
            }
        });
        
        return taskStore
    }
    
    var collectIndexes = function (node) {
        var indexes = []
        
        Ext.each(node.childNodes, function (childNode) {
            indexes.push(childNode.get('index'))
        })
        
        return indexes
    }
    
    var sequentialIndexes = function (length) {
        var indexes = []
        
        for (var i = 0; i < length; i++) indexes.push(i)
        
        return indexes
    }
    
    var indexesAreOk = function (node, desc) {
        t.isDeeply(collectIndexes(node), sequentialIndexes(node.childNodes.length), desc)
    } 
    
    
    //======================================================================================================================================================================================================================================================
    t.diag('Indexes are ok - initial')
    
    var taskStore           = getDataSet()
    
    indexesAreOk(taskStore.getRootNode(), '.. for root node')
    indexesAreOk(taskStore.getNodeById(123), '.. for `123` node')
    
    taskStore.getRootNode().insertChild(2, {})
    
    indexesAreOk(taskStore.getRootNode(), '.. for root node')
    
    taskStore.getRootNode().appendChild({})
    
    indexesAreOk(taskStore.getRootNode(), '.. for root node')
    
    taskStore.getNodeById(123).insertBefore({}, taskStore.getNodeById(3))
    
    indexesAreOk(taskStore.getNodeById(123), '.. for `123` node')
    
    
})    
