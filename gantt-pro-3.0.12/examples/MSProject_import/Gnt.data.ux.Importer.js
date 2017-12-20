Ext.define('Gnt.data.ux.Importer', {
    extend : 'Ext.AbstractPlugin',

    taskStore       : null,
    dependencyStore : null,
    assignmentStore : null,
    resourceStore   : null,

    taskMap         : null,
    resourceMap     : null,

    syncBlock : function () {
        return false;
    },

    init : function (gantt) {
        this.taskStore = gantt.taskStore;
        this.dependencyStore = gantt.dependencyStore;
        this.resourceStore = gantt.resourceStore;
        this.assignmentStore = gantt.assignmentStore;

        this.taskModelIdProperty = this.taskStore.model.prototype.idProperty;
        this.resourceModelIdProperty = this.resourceStore.model.prototype.idProperty;
        this.assignmentModelIdProperty = this.assignmentStore.model.prototype.idProperty;
        this.assignmentModelTaskIdProperty = this.assignmentStore.model.prototype.taskIdField;
        this.assignmentModelResourceIdProperty = this.assignmentStore.model.prototype.resourceIdField;
        this.dependencyModelIdProperty = this.dependencyStore.model.prototype.idProperty;
        this.dependencyModelFromProperty = this.dependencyStore.model.prototype.fromField;
        this.dependencyModelToProperty = this.dependencyStore.model.prototype.toField;
    },

    /*
     * @param {Object} data A custom data set with 'tasks', 'dependencies', 'assignments' and 'resources' properties.
     * */
    importData : function (data) {
        this.taskMap = {};
        this.resourceMap = {};

        this.taskStore.on('beforesync', this.syncBlock);

        var tasks = this.getTaskTree(Ext.isArray(data.tasks) ? data.tasks : [data.tasks]);

        this.processResources(data);
        this.processDependencies(data);
        this.processAssignments(data);

        var newRoot = Ext.isArray(data.tasks) ? {} : tasks[0];
        newRoot.children = tasks;
        
        // if instance is passed then getTreeStore will return null 
        // http://www.sencha.com/forum/showthread.php?297640
        newRoot.isNode && newRoot.join(this.taskStore);
        
        this.taskStore.setRoot(newRoot);

        this.taskStore.un('beforesync', this.syncBlock);
    },

    /* RESOURCES */
    processResources : function(data) {
        var resources = [];

        Ext.Array.map(data.resources, this.processResource, this);

        this.resourceStore.loadData(resources);
    },

    processResource : function (resData) {
        var id = resData[this.resourceModelIdProperty];
        delete resData[this.resourceModelIdProperty];

        var resource = new this.resourceStore.model(resData);

        this.resourceMap[id] = resource;
        return resource;
    },
    /* EOF RESOURCES */

    /* DEPENDENCIES */
    processDependencies : function(data) {
        var deps = Ext.Array.map(data.dependencies, this.processDependency, this);

        this.dependencyStore.loadData(deps);
    },

    processDependency : function (depData) {
        var fromId = depData[this.dependencyModelFromProperty];
        var toId = depData[this.dependencyModelToProperty];
        delete depData[this.dependencyModelFromProperty];
        delete depData[this.dependencyModelToProperty];
        delete depData[this.dependencyModelIdProperty];
        var dep = new this.dependencyStore.model(depData);

        dep.setSourceTask(this.taskMap[fromId]);
        dep.setTargetTask(this.taskMap[toId]);

        return dep;
    },
    /* EOF DEPENDENCIES */

    /* ASSIGNMENTS */
    processAssignments : function(data) {
        Ext.Array.each(data.assignments, this.processAssignment, this);
    },

    processAssignment: function (asData) {
        var resourceId  = asData[this.assignmentModelResourceIdProperty];
        var taskId      = asData[this.assignmentModelTaskIdProperty];
        delete asData[this.assignmentModelIdProperty];
        delete asData[this.assignmentModelResourceIdProperty];
        delete asData[this.assignmentModelTaskIdProperty];

        this.taskMap[taskId].assign(this.resourceMap[resourceId], asData.Units);
    },
    /* EOF ASSIGNMENTS */

    /* TASKS  */
    getTaskTree : function (tasks) {
        return Ext.Array.map(tasks, this.processTask, this);
    },

    processTask : function (data) {
        var id = data[this.taskModelIdProperty];
        var children = data.children;

        delete data.children;
        delete data[this.taskModelIdProperty];

        var t = new this.taskStore.model(data);
        t.taskStore = this.taskStore;

        if (children) {
            t.appendChild(this.getTaskTree(children));
        }

        t._Id = id;
        this.taskMap[t._Id] = t;

        return t;
    }
    /* EOF TASKS  */
});