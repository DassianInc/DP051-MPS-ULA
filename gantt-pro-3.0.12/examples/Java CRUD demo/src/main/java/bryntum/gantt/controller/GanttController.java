package bryntum.gantt.controller;

import java.text.DateFormat;
import java.util.ArrayList;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import bryntum.crud.jackson.CrudObjectMapper;
import bryntum.crud.request.Rows;
import bryntum.crud.response.ErrorResponse;
import bryntum.crud.response.GeneralResponse;
import bryntum.crud.response.SyncStoreResponse;
import bryntum.gantt.request.GanttLoadRequest;
import bryntum.gantt.request.GanttSyncRequest;
import bryntum.gantt.dao.Gantt;
import bryntum.gantt.request.handler.*;
import bryntum.gantt.response.*;

/**
 * The controller object, receiving requests, processing them and returning corresponding responses.
 */
@Controller
public class GanttController {

    /**
     * Data access singleton object.
     */
    protected Gantt gantt;

    /**
     * A Jackson ObjectMapper instance used to encode/decode JSON.
     */
    protected final CrudObjectMapper objectMapper;

    private final DateFormat dateFormat;

    /**
     * Constructs new GanttController, given DAO object to deal with
     * stores and date format to encode/decode dates to/from JSON properly.
     * Note: Used as a bean.
     * @param gantt The DAO object to work with the stores.
     * @param objectMapper A Jackson ObjectMapper instance used to encode/decode JSON.
     */
    public GanttController(Gantt gantt, CrudObjectMapper objectMapper) {
        super();
        this.gantt = gantt;
        this.objectMapper = objectMapper;
        this.dateFormat = objectMapper.getDeserializationConfig().getDateFormat();
    }

    /**
     * Processes JSON encoded load request.
     * @param json Request body string.
     * @return Response.
     * @throws Exception
     */
    @RequestMapping(value = "/load", method = RequestMethod.GET)
    public GeneralResponse load(@RequestParam("q") String json) {

        Long requestId = null;

        try {
            // decode request object
            GanttLoadRequest loadRequest = null;
            try {
                loadRequest = objectMapper.readValue(json, GanttLoadRequest.class);
            } catch (Exception e) {
                throw new RuntimeException("Invalid load JSON");
            }

            // get request identifier
            requestId = loadRequest.requestId;

            // initialize response object
            GanttLoadResponse loadResponse = new GanttLoadResponse(requestId);

            // if a corresponding store is requested then add it to the response object

            if (loadRequest.calendars != null) {
                loadResponse.setCalendars(gantt.getCalendars(true), gantt.getProjectCalendarId());
            }
            if (loadRequest.resources != null) {
                loadResponse.setResources(gantt.getResources());
            }
            if (loadRequest.tasks != null) {
                loadResponse.setTasks(gantt.getTasks());
            }
            if (loadRequest.assignments != null) {
                loadResponse.setAssignments(gantt.getAssignments());
            }
            if (loadRequest.dependencies != null) {
                loadResponse.setDependencies(gantt.getDependencies());
            }

            // put current server revision to the response
            loadResponse.setRevision(gantt.util.getRevision());

            return loadResponse;

        // handle exceptions
        } catch (Exception e) {
            return new ErrorResponse(e, requestId);
        }

    }

    /**
     * Helper method to apply implicit server initiated changes to the store response.
     * @param store Store identifier.
     * @param resp Response part related to the store.
     * @return Modified store response.
     */
    protected SyncStoreResponse addModifiedRows(String store, SyncStoreResponse resp) {
        Map<Integer, Map<String, Object>> updated = gantt.util.getUpdatedRows(store);
        if (updated != null && updated.size() > 0) {
            if (resp == null) resp = new SyncStoreResponse();
            resp.setRows(new ArrayList<Map<String, Object>>(updated.values()), true);
        }

        Map<Integer, Map<String, Object>> removed = gantt.util.getRemovedRows(store);
        if (removed != null && removed.size() > 0) {
            if (resp == null) resp = new SyncStoreResponse();
            resp.setRemoved(new ArrayList<Map<String, Object>>(removed.values()), true);
        }

        return resp;
    }

    /**
     * Processes JSON encoded sync request.
     * @param json Request body string.
     * @return Response.
     * @throws Exception
     */
    @RequestMapping(value = "/sync", method = RequestMethod.POST)
    public GeneralResponse sync(@RequestBody String json) {

        Long requestId = null;

        try {
            // initialize thread specific phantom to real Id maps
            gantt.initPhantomIdMaps();

            // decode request object
            GanttSyncRequest syncRequest = null;
            try {
                syncRequest = objectMapper.readValue(json, GanttSyncRequest.class);
            } catch (Exception e) {
                throw new RuntimeException("Invalid sync JSON");
            }

            // get request identifier
            requestId = syncRequest.requestId;

            // initialize response object
            GanttSyncResponse syncResponse = new GanttSyncResponse(requestId);

            // Here we reject client's changes if we suspect that they are out-dated
            // considering difference between server and client revisions.
            // You can get rid of this call if you don't need such behavior.
            gantt.util.checkRevision(syncRequest.revision);

            // first let's process added and updated records

            CalendarSyncHandler calendarHandler = null;
            if (syncRequest.calendars != null)
            {
                calendarHandler = new CalendarSyncHandler(gantt, dateFormat, objectMapper);
                syncResponse.setCalendars(calendarHandler.handle(syncRequest.calendars, Rows.ADDED_AND_UPDATED));
            }
            ResourceSyncHandler resourcesHandler = null;
            if (syncRequest.resources != null)
            {
                resourcesHandler = new ResourceSyncHandler(gantt);
                syncResponse.setResources(resourcesHandler.handle(syncRequest.resources, Rows.ADDED_AND_UPDATED));
            }
            TaskSyncHandler taskHandler = null;
            if (syncRequest.tasks != null)
            {
                taskHandler = new TaskSyncHandler(gantt, dateFormat);
                syncResponse.setTasks(taskHandler.handle(syncRequest.tasks, Rows.ADDED_AND_UPDATED));
            }
            AssignmentSyncHandler assignmentHandler = null;
            if (syncRequest.assignments != null)
            {
                assignmentHandler = new AssignmentSyncHandler(gantt);
                syncResponse.setAssignments(assignmentHandler.handle(syncRequest.assignments, Rows.ADDED_AND_UPDATED));
            }
            DependencySyncHandler dependencyHandler = null;
            if (syncRequest.dependencies != null)
            {
                dependencyHandler = new DependencySyncHandler(gantt);
                syncResponse.setDependencies(dependencyHandler.handle(syncRequest.dependencies, Rows.ADDED_AND_UPDATED));
            }

            // then let's process records removals

            if (dependencyHandler != null)
                syncResponse.setDependencies(dependencyHandler.handleRemoved(syncRequest.dependencies, syncResponse.getDependencies()));

            if (assignmentHandler != null)
                syncResponse.setAssignments(assignmentHandler.handleRemoved(syncRequest.assignments, syncResponse.getAssignments()));

            if (taskHandler != null)
                syncResponse.setTasks(taskHandler.handleRemoved(syncRequest.tasks, syncResponse.getTasks()));

            if (resourcesHandler != null)
                syncResponse.setResources(resourcesHandler.handleRemoved(syncRequest.resources, syncResponse.getResources()));

            if (calendarHandler != null)
                syncResponse.setCalendars(calendarHandler.handleRemoved(syncRequest.calendars, syncResponse.getCalendars()));

            // we also return implicit modifications made by server
            // (implicit records updates/removals caused by data references)

            syncResponse.setCalendars(addModifiedRows("calendars", syncResponse.getCalendars()));
            syncResponse.setTasks(addModifiedRows("tasks", syncResponse.getTasks()));
            syncResponse.setResources(addModifiedRows("resources", syncResponse.getResources()));
            syncResponse.setAssignments(addModifiedRows("assignments", syncResponse.getAssignments()));
            syncResponse.setDependencies(addModifiedRows("dependencies", syncResponse.getDependencies()));

            // put current server revision to the response
            syncResponse.setRevision(gantt.util.getRevision());

            return syncResponse;

        // handle exceptions
        } catch (Exception e) {
            return new ErrorResponse(e, requestId);
        }
    }

    /**
     * Back-end test handler providing database cleanup.
     *
     * TODO: WARNING! This code clears the database. Please get rid of this code before running it on production.
     */
    @RequestMapping(value = "/reset")
    public void processReset() throws Exception {
        gantt.reset();
    }
}
