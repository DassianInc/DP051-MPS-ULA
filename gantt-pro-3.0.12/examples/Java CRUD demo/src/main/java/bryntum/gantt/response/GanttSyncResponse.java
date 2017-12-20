package bryntum.gantt.response;

import bryntum.crud.response.SyncResponse;
import bryntum.crud.response.SyncStoreResponse;

public class GanttSyncResponse extends SyncResponse {

    public GanttSyncResponse() {
        super();
    }

    public GanttSyncResponse(Long requestId) {
        super(requestId);
    }

    public void setCalendars(SyncStoreResponse calendars) {
        setStore("calendars", calendars);
    }

    public void setResources(SyncStoreResponse resources) {
        setStore("resources", resources);
    }

    public void setTasks(SyncStoreResponse tasks) {
        setStore("tasks", tasks);
    }

    public void setAssignments(SyncStoreResponse assignments) {
        setStore("assignments", assignments);
    }

    public void setDependencies(SyncStoreResponse dependencies) {
        setStore("dependencies", dependencies);
    }

    public SyncStoreResponse getDependencies() {
        return getStore("dependencies");
    }

    public SyncStoreResponse getAssignments() {
        return getStore("assignments");
    }

    public SyncStoreResponse getTasks() {
        return getStore("tasks");
    }

    public SyncStoreResponse getResources() {
        return getStore("resources");
    }

    public SyncStoreResponse getCalendars() {
        return getStore("calendars");
    }

}
