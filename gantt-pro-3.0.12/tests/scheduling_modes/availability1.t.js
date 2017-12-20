StartTest(function(t) {
    
    t.ok(Gnt.model.CalendarDay, 'Gnt.model.CalendarDay is here')

    
    t.it('Simple string as `Availability` field value should work', function (t) {
        // a day where availability is a simple string
        var day     = new Gnt.model.CalendarDay({
            Date            : new Date(),
            
            Availability    : '08:00-17:30'
        })
        
        t.isDeeply(day.getAvailability(), [
            {
                startTime   : new Date(0, 0, 0, 8, 0),
                endTime     : new Date(0, 0, 0, 17, 30)
            }
        ], 'Correctly parsed new availability')
    })
    

    t.it('Array of strings as `Availability` field value should work', function (t) {
        // a day where availability is a simple string
        var day     = new Gnt.model.CalendarDay({
            Date            : new Date(),
            
            Availability    : [ '08:00-17:30', '18:00-19:01' ]
        })
        
        t.isDeeply(day.getAvailability(), [
            {
                startTime   : new Date(0, 0, 0, 8, 0),
                endTime     : new Date(0, 0, 0, 17, 30)
            },
            {
                startTime   : new Date(0, 0, 0, 18, 0),
                endTime     : new Date(0, 0, 0, 19, 1)
            }
        ], 'Correctly parsed new availability')
    })
    
    t.it('24h availability should work', function (t) {
        var day     = new Gnt.model.CalendarDay({
            Date            : new Date(),
            
            Availability    : [ '00:00-24:00' ]
        })
        
        t.isDeeply(day.getAvailability(), [
            {
                startTime   : new Date(0, 0, 0, 0, 0),
                endTime     : new Date(0, 0, 1, 0, 0)
            }
        ], 'Correctly parsed 24h availability day')
        
        t.is(day.stringifyInterval(day.getAvailability()[ 0 ]), '00:00-24:00', "Correctly stringified back the 24 availability interval")
    })
    
})    
