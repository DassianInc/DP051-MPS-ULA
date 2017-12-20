StartTest(function(t) { 
    var DepType = Gnt.model.Dependency.Type;
    
    var DP = new Gnt.util.DependencyParser({
        parseNumberFn   : function() {
            return Gnt.widget.DurationField.prototype.parseValue.apply(this, arguments);
        }
    });
    
    t.isDeeply(DP.parse('3'), [{
        taskId  : 3,
        type    : DepType.EndToStart
    }], '"3" should equal 3 FS'); 

    t.isDeeply(DP.parse('3FS'), [{
        taskId  : 3,
        type    : DepType.EndToStart
    }], '"3FS" should equal 3 FS'); 

    t.isDeeply(DP.parse('13FS+2'), [{
        taskId  : 13,
        type    : DepType.EndToStart,
        lag     : 2,
        lagUnit : Sch.util.Date.DAY
    }], '"13FS+2" should equal 13 FS + 2 days'); 

    t.isDeeply(DP.parse('3FS+12d'), [{
        taskId  : 3,
        type    : DepType.EndToStart,
        lag     : 12,
        lagUnit : Sch.util.Date.DAY
    }], '"3FS+2d" should equal 3 FS + 12 days'); 

    t.isDeeply(DP.parse('3fs-2H'), [{
        taskId  : 3,
        type    : DepType.EndToStart,
        lag     : -2,
        lagUnit : Sch.util.Date.HOUR
    }], '"3FS-2h" should equal 3 FS - 2 hours');
    
    t.isDeeply(DP.parse('-3fs-2H'), [{
        taskId  : -3,
        type    : DepType.EndToStart,
        lag     : -2,
        lagUnit : Sch.util.Date.HOUR
    }], '"-3FS-2h" should equal -3 FS - 2 hours'); 

    t.isDeeply(DP.parse('3;4'), [{
        taskId  : 3,
        type    : DepType.EndToStart 
    },{
        taskId  : 4,
        type    : DepType.EndToStart 
    }], '"3;4" should equal 3 FS and 4 FS');
    
    t.isDeeply(DP.parse('3+2'), [{
        taskId  : 3,
        type    : DepType.EndToStart,
        lag     : 2,
        lagUnit : Sch.util.Date.DAY
    }], '"3+2" should be FS by default');
    
    t.isDeeply(
        DP.parse('3FS ;  -13FF+2;  '), 
        [
            {
                taskId  : 3,
                type    : DepType.EndToStart 
            },
            {
                taskId  : -13,
                type    : DepType.EndToEnd,
                lag     : 2,
                lagUnit : Sch.util.Date.DAY
            }
        ], 
        'Parsing of several dependencies works'
    ); 
    

    t.isDeeply(DP.parse(''),      [], 'Empty string should return empty array'); 

    // Invalid input
    t.is(DP.parse('3+'),    null, '"3+" should return null'); 
    t.is(DP.parse('3FS+'),  null, '"3FS+" should return null'); 
    t.is(DP.parse('a'),     null, '"a" should return null'); 
    t.is(DP.parse('3FS+2zzds'),     null, 'Invalid duration should return null'); 
})    
