package bryntum.crud.request;

/**
 * Describes possible modes of sync request handling by specifying
 * which records have to be processed.
 */
public enum Rows {
    /**
     * Perform records adding.
     */
    ADDED,
    /**
     * Perform records updating.
     */
    UPDATED,
    /**
     * Perform records adding and updating.
     */
    ADDED_AND_UPDATED,
    /**
     * Perform records removing.
     */
    REMOVED,
    /**
     * Perform all requested changes.
     */
    ALL
}
