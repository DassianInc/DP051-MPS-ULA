StartTest(function(t) {
    
    var taskStore = Ext.create("Gnt.data.TaskStore", {
        root        : {
            expanded        : true,
            children        : [
                {
                    Id          : 1,
                    leaf        : true
                },
                {
                    Id          : 2,
                    leaf        : true
                },
                {
                    Id          : 3,
                        
                    children    : [
                        {
                            Id          : 4,
                            Effort      : 5,
                            leaf        : true
                        },
                        {
                            Id          : 5,
                            leaf        : true
                        }
                    ]
                },
                {
                    Id          : 6,
                        
                    children    : [
                        {
                            Id          : 7,
                                
                            children    : [
                                {
                                    Id          : 8,
                                        
                                    children    : [
                                        {
                                            Id          : 9,
                                            leaf        : true
                                        },
                                        {
                                            Id          : 10,
                                            leaf        : true
                                        }
                                    ]
                                }
                                // eof 8
                            ]
                        }
                        // eof 7
                    ]
                }
                // eof 6
            ]
        }
    });
    
    //======================================================================================================================================================================================================================================================
    t.diag('Sanity')
    
    var root        = taskStore.getRootNode()
    var getNode     = function (id) { return taskStore.getNodeById(id) }
    
    t.is(getNode(3).getEffort(), 5, 'Initial effort is normalized')
    t.is(root.getEffort(), 5, 'Initial effort is normalized')
    
    getNode(10).setEffort(10)
    
    t.is(getNode(8).getEffort(), 10, 'Effort is propagated to parent')
    t.is(getNode(7).getEffort(), 10, 'Effort is propagated to parent')
    t.is(getNode(6).getEffort(), 10, 'Effort is propagated to parent')
    t.is(root.getEffort(), 15, 'Effort is propagated to parent')
    
    getNode(9).setEffort(1)
    
    t.is(getNode(8).getEffort(), 11, 'Effort is propagated to parent')
    t.is(getNode(7).getEffort(), 11, 'Effort is propagated to parent')
    t.is(getNode(6).getEffort(), 11, 'Effort is propagated to parent')
    t.is(root.getEffort(), 16, 'Effort is propagated to parent')
    
    getNode(2).setEffort(10)
    
    t.is(getNode(8).getEffort(), 11, 'Effort is propagated to parent')
    t.is(getNode(7).getEffort(), 11, 'Effort is propagated to parent')
    t.is(getNode(6).getEffort(), 11, 'Effort is propagated to parent')
    t.is(root.getEffort(), 26, 'Effort is propagated to parent')
    
    getNode(5).setEffort(10)
    
    t.is(getNode(8).getEffort(), 11, 'Effort is propagated to parent')
    t.is(getNode(7).getEffort(), 11, 'Effort is propagated to parent')
    t.is(getNode(6).getEffort(), 11, 'Effort is propagated to parent')
    t.is(getNode(3).getEffort(), 15, 'Effort is propagated to parent')
    t.is(root.getEffort(), 36, 'Effort is propagated to parent')
    
    

})    
