package bryntum.gantt.request;

import java.util.List;
import java.util.Map;

import org.codehaus.jackson.annotate.JsonProperty;

import bryntum.crud.request.LoadRequest;

/**
 * This class implements load request structure.
 */
public class GanttLoadRequest extends LoadRequest {

    /**
     * Calendars store request parameters.
     * Contains null if calendars store is not requested.
     */
    public Map<String, Object> calendars;

    /**
     * Resources store request parameters.
     * Contains null if resources store is not requested.
     */
    public Map<String, Object> resources;

    /**
     * Tasks store request parameters.
     * Contains null if tasks store is not requested.
     */
    public Map<String, Object> tasks;

    /**
     * Assignments store request parameters.
     * Contains null if assignments store is not requested.
     */
    public Map<String, Object> assignments;

    /**
     * Dependencies store request parameters.
     * Contains null if dependencies store is not requested.
     */
    public Map<String, Object> dependencies;

    /**
     * Sets all stores parameters.
     * Note: this method is invoked during request deserialization.
     * @param stores
     */
    @Override
    @JsonProperty("stores")
    public void setStores(List<Object> stores) {

        super.setStores(stores);

        // map known Gantt related stores properties to public fields
        calendars = getStoreParams("calendars");
        resources = getStoreParams("resources");
        tasks = getStoreParams("tasks");
        assignments = getStoreParams("assignments");
        dependencies = getStoreParams("dependencies");
    }
}
