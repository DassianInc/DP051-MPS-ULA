package bryntum.gantt.request;

import bryntum.crud.request.SyncRequest;
import bryntum.crud.request.SyncStoreRequest;
import bryntum.gantt.domain.*;

public class GanttSyncRequest extends SyncRequest {

    public SyncStoreRequest<CalendarSyncRequest> calendars;

    public SyncStoreRequest<Resource> resources;

    public SyncStoreRequest<Task> tasks;

    public SyncStoreRequest<Assignment> assignments;

    public SyncStoreRequest<Dependency> dependencies;

}
