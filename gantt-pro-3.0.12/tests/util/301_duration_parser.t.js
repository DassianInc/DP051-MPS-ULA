StartTest(function(t) { 
    var DATE = Sch.util.Date;
    
    var DP = new Gnt.util.DurationParser({
        parseNumberFn   : function() {
            return Gnt.widget.DurationField.prototype.parseValue.apply(this, arguments);
        }
    });

    t.isDeeply(DP.parse('3 d'),     { value : 3, unit : DATE.DAY },         '3 d'); 
    t.isDeeply(DP.parse('+3 d'),    { value : 3, unit : DATE.DAY },         '+3 d');
    t.isDeeply(DP.parse('-3 d'),    { value : -3, unit : DATE.DAY },        '-3 d');
    
    t.isDeeply(DP.parse('30days'),  { value : 30, unit : DATE.DAY },        '30days'); 
    t.isDeeply(DP.parse('2.5h'),    { value : 2.5, unit : DATE.HOUR },      '2.5h'); 
    t.isDeeply(DP.parse('+2.5h'),   { value : 2.5, unit : DATE.HOUR },      '+2.5h');
    t.isDeeply(DP.parse('-2.5h'),   { value : -2.5, unit : DATE.HOUR },     '-2.5h');
    
    t.isDeeply(DP.parse('0'),       { value : 0, unit : undefined },        '0'); 
    t.isDeeply(DP.parse('0d'),      { value : 0, unit : DATE.DAY },         '0d'); 
    t.isDeeply(DP.parse('3h'),      { value : 3, unit : DATE.HOUR },        '3h'); 
    t.isDeeply(DP.parse('3hour'),   { value : 3, unit : DATE.HOUR },        '3hour'); 
    t.isDeeply(DP.parse('3mo'),     { value : 3, unit : DATE.MONTH },       '3mo'); 
    t.isDeeply(DP.parse('3months'), { value : 3, unit : DATE.MONTH },       '3months'); 
    t.isDeeply(DP.parse('3m'),      { value : 3, unit : DATE.MINUTE },      '3m'); 
    t.isDeeply(DP.parse('3min'),    { value : 3, unit : DATE.MINUTE },      '3min'); 
    t.isDeeply(DP.parse('3w'),      { value : 3, unit : DATE.WEEK },        '3w'); 
    t.isDeeply(DP.parse('3week'),   { value : 3, unit : DATE.WEEK },        '3week'); 
    t.isDeeply(DP.parse('3s'),      { value : 3, unit : DATE.SECOND},       '3s'); 
    t.isDeeply(DP.parse('3sec'),    { value : 3, unit : DATE.SECOND},       '3sec'); 

    // Invalids
    t.is(DP.parse(''),      null,   'Empty string'); 
    t.is(DP.parse(null),    null,   'null'); 
    t.is(DP.parse('a'),     null,   'a'); 
    t.is(DP.parse('3a'),    null,   'invalid unit');
    
    var DP2 = new Gnt.util.DurationParser({
        allowDecimals   : false,
        
        parseNumberFn   : function() {
            return Gnt.widget.DurationField.prototype.parseValue.apply(this, arguments);
        }
    });

    t.isDeeply(DP2.parse('3 d'),     { value : 3, unit : DATE.DAY },         '3 d'); 
    t.isDeeply(DP2.parse('30days'),  { value : 30, unit : DATE.DAY },        '30days');
    
    t.isDeeply(DP2.parse('2.5h'),    null,      'Values with decimals are now invalid');
    
})    
