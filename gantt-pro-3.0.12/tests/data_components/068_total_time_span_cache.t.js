StartTest(function(t) {

    var setup = function () {
        return t.getAllStoresDataSet([
            { leaf : true, Id : 1, StartDate : new Date(2010, 1, 3), Duration : 2 },
            { leaf : true, Id : 2, StartDate : new Date(2010, 1, 9), Duration : 3 },
            { leaf : true, Id : 3, StartDate : new Date(2010, 1, 11), Duration : 4 },
            { leaf : true, Id : 4, StartDate : new Date(2010, 1, 4), Duration : 2 },
            { leaf : true, Id : 5, StartDate : new Date(2010, 1, 11), Duration : 7 }
        ], [
            { From : 1, To : 2, Type : 2, Lag : 2 },
            { From : 2, To : 3, Type : 2, Lag : -1 },
            { From : 4, To : 2, Type : 2, Lag : 0 }
        ])
    }
    
    t.it('Moving of earliest task in the project should update total time span', function (t) {
        with (setup()) {
            t.isDeeply(taskStore.getTotalTimeSpan(), { start : new Date(2010, 1, 3), end : new Date(2010, 1, 20)}, 'Correct initial time span');
            
            id(1).shift('d', -1);
    
            t.isDeeply(taskStore.getTotalTimeSpan(), { start : new Date(2010, 1, 2), end : new Date(2010, 1, 20)}, 'Correct time span');
    
            id(1).shift('d', 2);
    
            t.isDeeply(taskStore.getTotalTimeSpan(), { start : new Date(2010, 1, 4), end : new Date(2010, 1, 20)}, 'Correct time span');
        }
    });

    t.it('Moving of latest task in the project should update total time span', function (t) {
        with (setup()) {
            id(5).shift('d', 2);
    
            t.isDeeply(taskStore.getTotalTimeSpan(), { start : new Date(2010, 1, 3), end : new Date(2010, 1, 22)}, 'Correct time span');
    
            id(5).shift('d', -1);
    
            t.isDeeply(taskStore.getTotalTimeSpan(), { start : new Date(2010, 1, 3), end : new Date(2010, 1, 21)}, 'Correct time span');
        }
    });

    t.it('Deleting of latest task in the project should update total time span', function (t) {
        with (setup()) {
            id(5).remove(); //taskStore.remove(id(5));
    
            t.isDeeply(taskStore.getTotalTimeSpan(), { start : new Date(2010, 1, 3), end : new Date(2010, 1, 17)}, 'Correct time span');
        }
    });

    t.it('Inserting of earliest task in the project should update total time span', function (t) {
        with (setup()) {
            taskStore.append({ leaf : true, Id : 6, StartDate : new Date(2010, 1, 2), Duration : 2 });
            
            t.isDeeply(taskStore.getTotalTimeSpan(), { start : new Date(2010, 1, 2), end : new Date(2010, 1, 20)}, 'Correct time span');
        }
    });

    t.it('Moving of middle task out of project bounds should update total time span', function (t) {
        with (setup()) {
            id(2).setStartDate(new Date(2010, 1, 18));
    
            t.isDeeply(taskStore.getTotalTimeSpan(), { start : new Date(2010, 1, 3), end : new Date(2010, 1, 26)}, 'Correct time span');
        }
    });
});
