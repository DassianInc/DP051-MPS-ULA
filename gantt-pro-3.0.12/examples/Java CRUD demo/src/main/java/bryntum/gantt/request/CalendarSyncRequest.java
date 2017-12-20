package bryntum.gantt.request;

import org.codehaus.jackson.annotate.JsonProperty;

import bryntum.crud.request.SyncStoreRequest;
import bryntum.gantt.domain.Calendar;
import bryntum.gantt.domain.CalendarDay;

/**
 * This class is a wrapper over Calendar domain class used for proper calendar data deserialization
 * during sync request processing.
 * To be specific it adds embedded calendar days changes support.
 */
public class CalendarSyncRequest extends Calendar {

    /**
     * Sub-request containing changes of calendar days.
     */
    @JsonProperty("Days")
    public SyncStoreRequest<CalendarDay> daysRequest;

}
