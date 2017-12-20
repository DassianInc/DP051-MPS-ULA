StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Setup');
    
    var g = t.getGantt({
        viewPreset      : 'weekAndDayLetter',
        renderTo : Ext.getBody(),
        startDate : new Date(2010, 0, 25),
        leftLabelField : {
            dataIndex : 'Name',
            editor : { xtype : 'textfield' }
        },
        rightLabelField : {
            dataIndex : 'Name',
            editor : { xtype : 'textfield' }
        }
    });
    
    t.waitForEventsToRender(g, function() {
        var labelEl = g.el.down('.sch-gantt-label-left');

        t.ok(labelEl, "Label el found in DOM");

        var xy = t.findCenter(labelEl),
            firstTask = g.taskStore.getRootNode().firstChild,
            taskName = firstTask.get('Name'),
            beforeStartCount = 0,
            beforeCompleteCount = 0,
            completeCount = 0;

        g.on({
            /**
            * @event labeledit_beforestartedit
            * Fires before editing is started for a field
            * @param {Gnt.view.Gantt} gantt The gantt panel instance
            * @param {Gnt.model.Task} taskRecord The task record 
            * @param {Mixed} value The field value being set
            * @param {Gnt.feature.LabelEditor} editor The editor instance
            */
            labeledit_beforestartedit : function(view, record, value, editor) {
                t.is(view, g.getSchedulingView(), 'Correct view found as first argument');
                t.is(record, firstTask, 'Correct task found as second argument');
                t.is(value, taskName, 'Correct string found as third argument');
                t.ok(editor instanceof Gnt.feature.LabelEditor, 'Correct object found as fourth argument');
                t.is(arguments.length, 4 + 1, 'Correct number of arguments');       // Observable always add 'options' as last argument
                beforeStartCount++;
            },

            /**
            * @event labeledit_beforecomplete
            * Fires after a change has been made to a label field, but before the change is reflected in the underlying field.
            * @param {Gnt.view.Gantt} gantt The gantt panel instance
            * @param {Mixed} value The current field value
            * @param {Mixed} startValue The original field value
            * @param {Gnt.model.Task} taskRecord The affected record 
            * @param {Gnt.feature.LabelEditor} editor The editor instance
            */
            labeledit_beforecomplete: function(view, newValue, oldValue, record, editor) {
                t.is(view, g.getSchedulingView(), 'Correct view found as first argument');
                t.is(oldValue, taskName, 'Correct string found as second argument');
                
                t.is(newValue, 'A', 'Correct new value found as third argument');    
                
                t.is(record, firstTask, 'Correct task found as fourth argument');
                t.ok(editor instanceof Gnt.feature.LabelEditor, 'Correct object found as fifth argument');
                t.is(arguments.length, 5 + 1, 'Correct number of arguments'); // Observable always add 'options' as last argument
                beforeCompleteCount++;
            },

            /**
            * @event labeledit_complete
            * Fires after editing is complete and any changed value has been written to the underlying field.
            * @param {Gnt.view.Gantt} gantt The gantt panel instance
            * @param {Mixed} value The current field value
            * @param {Mixed} startValue The original field value
            * @param {Gnt.model.Task} taskRecord The affected record 
            * @param {Gnt.feature.LabelEditor} editor The editor instance
            */
            labeledit_complete: function(view, newValue, oldValue, record, editor) {
                t.is(view, g.getSchedulingView(), 'Correct view found as first argument');
                t.is(oldValue, taskName, 'Correct string found as second argument');
                
                t.is(newValue, 'A', 'Correct new value found as third argument');    
                
                t.is(record, firstTask, 'Correct task found as fourth argument');
                t.ok(editor instanceof Gnt.feature.LabelEditor, 'Correct object found as fifth argument');
                t.is(arguments.length, 5 + 1, 'Correct number of arguments'); // Observable always add 'options' as last argument
                completeCount++;
            }
        });

        t.doubleClick(labelEl, function() {
        
            t.waitForSelectorAt(xy, 'input[type="text"]', function(foundEl) {

                t.is(beforeStartCount, 1, 'labeledit_beforestartedit was fired exactly once');
            
                // Set some new value in the text field
                foundEl.value = "A";
                t.type(foundEl, '[ENTER]');
            
                this.waitFor(
                    function() { return g.taskStore.getRootNode().firstChild.get('Name') === "A"; }, 
                    function() {
                        t.pass('Task record Name field updated correctly after pressing ENTER');    
                        t.is(beforeCompleteCount, 1, 'labeledit_beforecomplete was fired exactly once');    
                        t.is(completeCount, 1, 'labeledit_complete was fired exactly once');    
                        
                });
            });
        });
    });
})    
