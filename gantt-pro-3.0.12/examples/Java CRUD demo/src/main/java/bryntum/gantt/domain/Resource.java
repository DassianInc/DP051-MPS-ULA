package bryntum.gantt.domain;

import org.codehaus.jackson.annotate.JsonIgnore;
import org.codehaus.jackson.annotate.JsonProperty;

import bryntum.crud.domain.General;

public class Resource extends General {
    protected String name;
    protected Integer calendarId;
    protected String phantomCalendarId;

    @JsonProperty("Name")
    public String getName() {
        return name;
    }
    @JsonProperty("Name")
    public void setName(String name) {
        this.name = name;
    }

    @JsonProperty("CalendarId")
    public Integer getCalendarId() {
        return calendarId;
    }
    @JsonProperty("CalendarId")
    public void setCalendarId(Object calendarId) {
        if (calendarId == null) {
            this.calendarId = null;
            return;
        }

        if (calendarId instanceof Integer) {
            this.calendarId = (Integer)calendarId;
        } else if (calendarId instanceof String) {
            try {
                this.calendarId = Integer.valueOf((String)calendarId);
            } catch (NumberFormatException e) {
                this.calendarId = null;
            }
            phantomCalendarId = (String)calendarId;
        }
    }

    @JsonIgnore
    public String getPhantomCalendarId() {
        return phantomCalendarId;
    }

    @Override
    public String toString() {
        return "Resource { id: "+id+", name: "+name+", calendarId: "+calendarId+
            ", phantomCalendarId: "+phantomCalendarId+
            ", "+getPhantomIdField()+": "+phantomId+" }";
    }
}
