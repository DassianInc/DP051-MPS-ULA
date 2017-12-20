package bryntum.gantt.domain;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;

import org.codehaus.jackson.annotate.JsonProperty;

import bryntum.crud.domain.General;

public class CalendarDay extends General {
    protected String name;
    protected int calendarId;
    protected String typ;
    protected Date dt;
    protected ArrayList<String> availability;
    protected int weekday;
    protected Date overrideStartDate;
    protected Date overrideEndDate;
    protected boolean isWorkingDay;
    protected String cls;

    @JsonProperty("Name")
    public String getName() {
        return name;
    }
    @JsonProperty("Name")
    public void setName(String name) {
        this.name = name;
    }

    @JsonProperty("CalendarId")
    public int getCalendarId() {
        return calendarId;
    }
    @JsonProperty("CalendarId")
    public void setCalendarId(int calendarId) {
        this.calendarId = calendarId;
    }

    @JsonProperty("Type")
    public String getType() {
        return typ;
    }
    @JsonProperty("Type")
    public void setType(String typ) {
        this.typ = typ;
    }

    @JsonProperty("Date")
    public Date getDate() {
        return dt;
    }
    @JsonProperty("Date")
    public void setDate(Date dt) {
        this.dt = dt;
    }

    @JsonProperty("Availability")
    public ArrayList<String> getAvailability() {
        return availability;
    }
    @JsonProperty("Availability")
    public void setAvailability(ArrayList<String> availability) {
        this.availability = availability;
    }
    public void setAvailability(String availability) {
        if (availability != null) {
            this.availability = new ArrayList<String>( Arrays.asList(availability.split("\\|")) );
        } else {
            this.availability = null;
        }
    }

    @JsonProperty("Weekday")
    public int getWeekday() {
        return weekday;
    }
    @JsonProperty("Weekday")
    public void setWeekday(int weekday) {
        this.weekday = weekday;
    }

    @JsonProperty("OverrideStartDate")
    public Date getOverrideStartDate() {
        return overrideStartDate;
    }
    @JsonProperty("OverrideStartDate")
    public void setOverrideStartDate(Date overrideStartDate) {
        this.overrideStartDate = overrideStartDate;
    }

    @JsonProperty("OverrideEndDate")
    public Date getOverrideEndDate() {
        return overrideEndDate;
    }
    @JsonProperty("OverrideEndDate")
    public void setOverrideEndDate(Date overrideEndDate) {
        this.overrideEndDate = overrideEndDate;
    }

    @JsonProperty("IsWorkingDay")
    public boolean isWorkingDay() {
        return isWorkingDay;
    }
    @JsonProperty("IsWorkingDay")
    public void setWorkingDay(boolean isWorkingDay) {
        this.isWorkingDay = isWorkingDay;
    }

    @JsonProperty("Cls")
    public String getCls() {
        return cls;
    }
    @JsonProperty("Cls")
    public void setCls(String cls) {
        this.cls = cls;
    }

    @Override
    public String toString() {
        return "CalendarDay { id: "+id+"name: "+name+", calendarId: "+calendarId+", typ: "+typ+
        ", dt: "+dt+", availability: "+availability+", weekday: "+weekday+", overrideStartDate: "+overrideStartDate+
        ", overrideEndDate: "+overrideEndDate+", isWorkingDay: "+isWorkingDay+
        ", cls: "+cls+", "+getPhantomIdField()+": "+phantomId+" }";
    }
}
