package bryntum.crud.request;

import java.text.DateFormat;
import java.text.ParseException;
import java.util.Date;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

import org.apache.log4j.Logger;

import static bryntum.crud.exception.Codes.*;
import bryntum.crud.domain.General;
import bryntum.crud.exception.CrudException;
import bryntum.crud.response.SyncStoreResponse;

/**
 * An object used by controller to apply changes specified in sync request to a store.
 * Classes extending this abstraction should perform actual work using DAO to get, add, update and removed
 * real specific records.
 *
 * @param <T> Domain describing specific store.
 */
public abstract class SyncStoreRequestHandler<T extends General> {

    static protected Logger log = Logger.getLogger(SyncStoreRequestHandler.class.getName());

    DateFormat dateFormat;

    /**
     * Constructs a new SyncStoreRequest, given a dateFormat to parse text to a date.
     * Date format is required to use `strToDate` method.
     */
    public SyncStoreRequestHandler(DateFormat dateFormat) {
        super();
        this.dateFormat = dateFormat;
    }

    /**
     * Constructs a new SyncStoreRequest.
     */
    public SyncStoreRequestHandler() {
        super();
    }

    /**
     * Parses text from a string to produce a `Date`.
     * This method can be used in actual `getRecord` implementation to
     * convert corresponding fields from `changes` Map into a proper dates.
     * @param date A `String` to be parsed.
     * @return A `Date` parsed from a the string.
     * @throws ParseException If text cannot be parsed into a date.
     */
    protected Date strToDate(String date) throws ParseException {
        if (date == null) return null;
        return dateFormat.parse(date);
    }

    /**
     * Gets record using data from changes set.
     * Basically this method must extract record identifier from transfered data
     * and get corresponding domain instance using DAO methods.
     * Note: Since this method is used to find existing record to be updated
     * it also can be used to apply provided changes to the found domain instance.
     * So `update` method will accept already updated domain instance. Or merging of changes
     * to found domain can be implemented in `update` method. Decision is up to developer.
     * @param changes Record changes data.
     * @return Instance of record.
     */
    public abstract T getRecord(Map<String, Object> changes);

    /**
     * Adds record.
     * This method must call DAO to persist a record.
     * @param record Record to add.
     * @return Record data to respond.
     * @throws CrudException
     */
    public abstract Map<String, Object> add(T record) throws CrudException;

    /**
     * Updates record.
     * This method must call DAO to persist a record changes.
     * @param record Record to update.
     * @return Record data to respond. By default it's a record identifier.
     * @throws CrudException
     */
    public abstract Map<String, Object> update(T record, Map<String, Object> changes) throws CrudException;

    /**
     * Removes record.
     * This method must call DAO to remove a record.
     * @param record Record to remove.
     * @return Record data to respond.
     * @throws CrudException
     */
    public abstract Map<String, Object> remove(T record) throws CrudException;

    /**
     * Performs post processing of the data returned by `add` method.
     * Adds the processed record phantom and real identifiers.
     * @param record The added record.
     * @param result The response part related to the record.
     * @return Processed response.
     */
    protected Map<String, Object> onRecordAdded(T record, Map<String, Object> result) {
        result.put(record.getPhantomIdField(), record.getPhantomId());
        result.put("Id", record.getId());

        return result;
    }

    /**
     * Performs post processing of the data returned by `update` method.
     * Adds the processed record real identifier.
     * @param record The updated record.
     * @param result The response part related to the record.
     * @return Processed response.
     */
    protected Map<String, Object> onRecordUpdated(T record, Map<String, Object> result) {
        result.put("Id", record.getId());

        return result;
    }

    /**
     * Performs post processing of the data returned by `remove` method.
     * Adds the processed record real identifier.
     * @param record The removed record.
     * @param result The response part related to the record.
     * @return Processed response.
     */
    protected Map<String, Object> onRecordRemoved(T record, Map<String, Object> result) {
        result.put("Id", record.getId());

        return result;
    }


    protected SyncStoreResponse onAddedHandled(SyncStoreResponse response) {
        return response;
    }

    protected SyncStoreResponse onUpdatedHandled(SyncStoreResponse response) {
        return response;
    }

    protected SyncStoreResponse onRemovedHandled(SyncStoreResponse response) {
        return response;
    }

    protected SyncStoreResponse onHandled(SyncStoreResponse response) {
        return response;
    }

    /**
     * Performs adding of requested records.
     * @param request Request holding store changes.
     * @param response Response to put adding results to.
     * @return Response object.
     * @throws CrudException
     */
    public SyncStoreResponse handleAdded(SyncStoreRequest<T> request, SyncStoreResponse response)
            throws CrudException
    {
        List<Map<String, Object>> added = new ArrayList<Map<String, Object>>();

        SyncStoreResponse resp = response != null ? response : new SyncStoreResponse();

        if (request.added != null) {
            for (T row : request.added) {
                added.add(onRecordAdded(row, add(row)));
            }
        }

        if (added.size() > 0) {
            resp.setRows(added, true);
        }

        return onAddedHandled(resp);
    }

    /**
     * Performs updating of requested records.
     * @param request Request holding store changes.
     * @param response Response to put adding results to.
     * @return Response object.
     * @throws CrudException
     */
    public SyncStoreResponse handleUpdated(SyncStoreRequest<T> request, SyncStoreResponse response)
            throws CrudException
    {
        List<Map<String, Object>> updated = new ArrayList<Map<String, Object>>();

        SyncStoreResponse resp = response != null ? response : new SyncStoreResponse();

        if (request.updated != null) {
            for (Map<String, Object> row : request.updated) {
                T record = getRecord(row);
                updated.add(onRecordUpdated(record, update(record, row)));
            }
        }

        if (updated.size() > 0) {
            resp.setRows(updated, true);
        }

        return onUpdatedHandled(resp);
    }

    /**
     * Performs removing of requested records.
     * @param request Request holding store changes.
     * @param response Response to put adding results to.
     * @return Response object.
     * @throws CrudException
     */
    public SyncStoreResponse handleRemoved(SyncStoreRequest<T> request, SyncStoreResponse response)
            throws CrudException
    {
        List<Map<String, Object>> removed = new ArrayList<Map<String, Object>>();

        SyncStoreResponse resp = response != null ? response : new SyncStoreResponse();

        if (request.removed != null) {
            for (T row : request.removed) {
                removed.add(onRecordRemoved(row, remove(row)));
            }
        }

        if (removed.size() > 0) {
            resp.setRemoved(removed, true);
        }

        return onRemovedHandled(resp);
    }

    /**
     * Applies changes passed in a sync request to the store.
     * @param request A sync request.
     * @return Response object for the applied changes.
     * @throws CrudException with NO_SYNC_DATA code when sync request does not contain any changes.
     */
    public SyncStoreResponse handle(SyncStoreRequest<T> request, Rows mode) throws CrudException {
        SyncStoreResponse res = new SyncStoreResponse();

        if (mode == Rows.ALL || mode == Rows.ADDED || mode == Rows.ADDED_AND_UPDATED) handleAdded(request, res);
        if (mode == Rows.ALL || mode == Rows.UPDATED || mode == Rows.ADDED_AND_UPDATED) handleUpdated(request, res);
        if (mode == Rows.ALL || mode == Rows.REMOVED) handleRemoved(request, res);

        if (mode == Rows.ALL) {
            if (!res.hasRows() && !res.hasRemoved()) throw new CrudException("No data to save.", NO_SYNC_DATA);
        }

        return onHandled(res);
    }
}
