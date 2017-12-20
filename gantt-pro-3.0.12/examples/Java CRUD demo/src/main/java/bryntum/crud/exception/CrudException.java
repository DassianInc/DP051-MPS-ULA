package bryntum.crud.exception;

/**
 * Signals that an error has been reached unexpectedly while processing sync or load request.
 *
 * The code of error (returned by `getCode` method) might give an idea on the error reason.
 * @see Codes List of possible codes.
 */
public class CrudException extends Exception {

    private static final long serialVersionUID = 1592043893714772413L;

    /**
     * The error code.
     */
    protected int code;

    public CrudException(String message, int code) {
        super(message);
        this.code = code;
    }

    /**
     * Gets the error code.
     * @return The error code.
     * @see Codes List of possible codes.
     */
    public int getCode() {
        return code;
    }
}
