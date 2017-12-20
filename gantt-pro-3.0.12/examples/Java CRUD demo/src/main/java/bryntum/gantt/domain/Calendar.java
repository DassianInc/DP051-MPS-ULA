package bryntum.gantt.domain;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.codehaus.jackson.annotate.JsonIgnore;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import org.codehaus.jackson.annotate.JsonProperty;

import bryntum.crud.domain.Node;

@JsonIgnoreProperties(ignoreUnknown=true)
public class Calendar extends Node {
    protected String name;
    protected int daysPerMonth;
    protected int daysPerWeek;
    protected int hoursPerDay;
    protected boolean weekendsAreWorkdays;
    protected int weekendFirstDay;
    protected int weekendSecondDay;
    protected List<String> defaultAvailability;
    protected List<CalendarDay> days;

    @JsonProperty("DaysPerMonth")
    public int getDaysPerMonth() {
        return daysPerMonth;
    }
    @JsonProperty("DaysPerMonth")
    public void setDaysPerMonth(int daysPerMonth) {
        this.daysPerMonth = daysPerMonth;
    }

    @JsonProperty("DaysPerWeek")
    public int getDaysPerWeek() {
        return daysPerWeek;
    }
    @JsonProperty("DaysPerWeek")
    public void setDaysPerWeek(int daysPerWeek) {
        this.daysPerWeek = daysPerWeek;
    }

    @JsonProperty("HoursPerDay")
    public int getHoursPerDay() {
        return hoursPerDay;
    }
    @JsonProperty("HoursPerDay")
    public void setHoursPerDay(int hoursPerDay) {
        this.hoursPerDay = hoursPerDay;
    }

    @JsonProperty("WeekendsAreWorkdays")
    public boolean isWeekendsAreWorkdays() {
        return weekendsAreWorkdays;
    }
    @JsonProperty("WeekendsAreWorkdays")
    public void setWeekendsAreWorkdays(boolean weekendsAreWorkdays) {
        this.weekendsAreWorkdays = weekendsAreWorkdays;
    }

    @JsonProperty("WeekendFirstDay")
    public int getWeekendFirstDay() {
        return weekendFirstDay;
    }
    @JsonProperty("WeekendFirstDay")
    public void setWeekendFirstDay(int weekendFirstDay) {
        this.weekendFirstDay = weekendFirstDay;
    }

    @JsonProperty("WeekendSecondDay")
    public int getWeekendSecondDay() {
        return weekendSecondDay;
    }
    @JsonProperty("WeekendSecondDay")
    public void setWeekendSecondDay(int weekendSecondDay) {
        this.weekendSecondDay = weekendSecondDay;
    }

    @JsonProperty("DefaultAvailability")
    public List<String> getDefaultAvailability() {
        return defaultAvailability;
    }
    @JsonProperty("DefaultAvailability")
    public void setDefaultAvailability(List<String> defaultAvailability) {
        this.defaultAvailability = defaultAvailability;
    }
    public void setDefaultAvailability(String defaultAvailability) {
        if (defaultAvailability != null) {
            this.defaultAvailability = new ArrayList<String>( Arrays.asList(defaultAvailability.split("\\|")) );
        } else {
            this.defaultAvailability = null;
        }
    }

    @JsonProperty("Name")
    public String getName() {
        return name;
    }
    @JsonProperty("Name")
    public void setName(String name) {
        this.name = name;
    }

    @JsonIgnore
    public List<CalendarDay> getDays() {
        return days;
    }
    @JsonIgnore
    public void setDays(List<CalendarDay> days) {
        this.days = days;
    }

    @Override
    public String toString() {
        return "Calendar { id: "+id+", parentId: "+parentId+", phantomParentId: "+phantomParentId+
            ", name: "+name+", daysPerMonth: "+daysPerMonth+", daysPerWeek: "+daysPerWeek+
            ", hoursPerDay: "+hoursPerDay+", weekendsAreWorkdays: "+weekendsAreWorkdays+
            ", weekendFirstDay: "+weekendFirstDay+", weekendSecondDay: "+weekendSecondDay+
            ", defaultAvailability: "+defaultAvailability+", days: "+days+", children: "+children+
            ", "+getPhantomIdField()+": "+phantomId+" }";
    }
}
