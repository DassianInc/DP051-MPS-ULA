package bryntum.gantt.response;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import bryntum.crud.response.LoadResponse;
import bryntum.crud.response.LoadStoreResponse;
import bryntum.gantt.domain.*;

/**
 * This class implements response for the load request.
 */
public class GanttLoadResponse extends LoadResponse {

    public GanttLoadResponse() {
        this(null);
    }

    public GanttLoadResponse(Long requestId) {
        super(requestId);
    }

    /**
     * Sets list of calendars to be responded.
     * @param calendars List of calendars.
     * @param projectCalendar Project calendar identifier.
     */
    public void setCalendars(List<Calendar> calendars, Integer projectCalendar) {
        Map<String, Object> metaData = new HashMap<String, Object>();
        metaData.put("projectCalendar", projectCalendar);

        content.put("calendars", new LoadStoreResponse<Calendar>(calendars, false, metaData));
    }

    /**
     * Sets list of resources to be responded.
     * @param resources List of resources.
     */
    public void setResources(List<Resource> resources) {
        content.put("resources", new LoadStoreResponse<Resource>(resources));
    }

    /**
     * Sets list of tasks to be responded.
     * @param tasks List of tasks.
     */
    public void setTasks(List<Task> tasks) {
        content.put("tasks", new LoadStoreResponse<Task>(tasks, false));
    }

    /**
     * Sets list of assignments to be responded.
     * @param assignments List of assignments.
     */
    public void setAssignments(List<Assignment> assignments) {
        content.put("assignments", new LoadStoreResponse<Assignment>(assignments));
    }

    /**
     * Sets list of dependencies to be responded.
     * @param dependencies List of dependencies.
     */
    public void setDependencies(List<Dependency> dependencies) {
        content.put("dependencies", new LoadStoreResponse<Dependency>(dependencies));
    }

    @Override
    public String toString() {
        String result = "GanttLoadResponse { revision: "+revision;

        Iterator<Entry<String, Object>> it = content.entrySet().iterator();
        while (it.hasNext()) {
            Entry<String, Object> storeResponse = it.next();
            result += ", "+storeResponse.getKey()+" : "+storeResponse.getValue();
        }

        return result+" }";
    }

}
