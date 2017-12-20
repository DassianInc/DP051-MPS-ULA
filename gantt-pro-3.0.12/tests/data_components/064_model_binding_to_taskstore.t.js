StartTest(function(t) {

    // This test covers these overrides in TaskModel, afterEdit, afterReject, afterCommit

    var ts = Ext.create('Ext.data.TreeStore', {
        fields : ['foo'],
        root : {
            expanded : true
        }
    });

    var newParent = new Gnt.model.Task({ leaf : false });
    var newChild = new Gnt.model.Task({ leaf : true });

    newParent.appendChild(newChild);
    ts.getRootNode().appendChild(newParent);

    t.is(newParent.getTaskStore(), ts, 'Parent model added should be bound to a store');
})
