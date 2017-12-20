package bryntum.gantt.response;

import org.codehaus.jackson.annotate.JsonProperty;

import bryntum.crud.response.LoadStoreResponse;
import bryntum.gantt.domain.Calendar;
import bryntum.gantt.domain.CalendarDay;

/**
 * This class is a wrapper over Calendar domain class used for proper calendar data serialization
 * during load response construction.
 * To be specific it builds calendar days data as a proper LoadStoreResponse instance.
 */
public class CalendarLoadResponse extends Calendar {

    @JsonProperty("Days")
    public LoadStoreResponse<CalendarDay> getDaysResponse() {
        return new LoadStoreResponse<CalendarDay>(days);
    }

}
