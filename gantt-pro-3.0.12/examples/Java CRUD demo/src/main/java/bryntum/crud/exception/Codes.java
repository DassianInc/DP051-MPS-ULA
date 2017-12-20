package bryntum.crud.exception;

public final class Codes {

    private Codes() {}

    /**
     * Error of getting number of rows found by the last query.
     */
    public static final int FOUND_ROWS = 3;
    /**
     * Error of table columns list retrieving.
     */
    public static final int SHOW_COLUMNS = 4;
    /**
     * Error of revision updating.
     */
    public static final int UPDATE_REVISION = 6;
    /**
     * No changes passed in a sync request.
     */
    public static final int NO_SYNC_DATA = 7;
    /**
     * The data revision passed from client is older than server one.
     */
    public static final int OUTDATED_REVISION = 8;
    /**
     * Error of option getting.
     */
    public static final int GET_OPTION = 9;
    /**
     * Error of option setting.
     */
    public static final int SET_OPTION = 10;
}
