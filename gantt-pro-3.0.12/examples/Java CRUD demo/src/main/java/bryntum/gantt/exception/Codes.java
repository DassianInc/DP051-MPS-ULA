package bryntum.gantt.exception;

/**
 * Contains possible values of CrudException codes.
 */
public final class Codes {

    private Codes() {}

    /**
     * Error of task updating.
     */
    public static final int UPDATE_TASK = 100;
    /**
     * Error of task adding.
     */
    public static final int ADD_TASK = 101;
    /**
     * Error of task removing.
     */
    public static final int REMOVE_TASK = 102;
    /**
     * Error of tasks list getting.
     */
    public static final int GET_TASKS = 104;
    public static final int TASK_NOT_FOUND = 105;

    /**
     * Error of calendar days list getting.
     */
    public static final int GET_CALENDAR_DAYS = 110;
    /**
     * Error of calendar day updating.
     */
    public static final int UPDATE_CALENDAR_DAY = 111;
    /**
     * Error of calendar day adding.
     */
    public static final int ADD_CALENDAR_DAY = 112;
    /**
     * Error of calendar day removing.
     */
    public static final int REMOVE_CALENDARDAYS = 113;
    public static final int CALENDAR_DAY_NOT_FOUND = 114;
    /**
     * Error of calendars list getting.
     */
    public static final int GET_CALENDARS = 120;
    /**
     * Error of calendar updating.
     */
    public static final int UPDATE_CALENDAR = 121;
    /**
     * Error of calendar adding.
     */
    public static final int ADD_CALENDAR = 122;
    /**
     * Error of calendar removing.
     */
    public static final int REMOVE_CALENDAR = 123;
    public static final int CALENDAR_NOT_FOUND = 124;
    public static final int CALENDAR_HAS_CALENDARS = 125;
    public static final int CALENDAR_USED_BY_RESOURCE = 126;
    public static final int CALENDAR_USED_BY_TASK = 127;
    /**
     * Error of resource updating.
     */
    public static final int UPDATE_RESOURCE = 130;
    /**
     * Error of resource adding.
     */
    public static final int ADD_RESOURCE = 131;
    /**
     * Error of resource removing.
     */
    public static final int REMOVE_RESOURCE = 132;
    /**
     * Error of resources list getting.
     */
    public static final int GET_RESOURCES = 133;
    public static final int RESOURCE_NOT_FOUND = 134;
    public static final int REMOVE_USED_RESOURCE = 135;
    /**
     * Error of assignment updating.
     */
    public static final int UPDATE_ASSIGNMENT = 140;
    /**
     * Error of assignment adding.
     */
    public static final int ADD_ASSIGNMENT = 141;
    /**
     * Error of assignment removing.
     */
    public static final int REMOVE_ASSIGNMENT = 142;
    /**
     * Error of assignments list getting.
     */
    public static final int GET_ASSIGNMENTS = 143;
    // Cannot find assignment.
    public static final int ASSIGNMENT_NOT_FOUND = 144;
    /**
     * Error of dependency updating.
     */
    public static final int UPDATE_DEPENDENCY = 150;
    /**
     * Error of dependency adding.
     */
    public static final int ADD_DEPENDENCY = 151;
    /**
     * Error of dependency removing.
     */
    public static final int REMOVE_DEPENDENCY = 152;
    /**
     * Error of dependencies list getting.
     */
    public static final int GET_DEPENDENCIES = 153;
    //
    public static final int DEPENDENCY_NOT_FOUND = 154;

    /**
     * Error of task segment updating.
     */
    public static final int UPDATE_TASK_SEGMENT = 155;
    /**
     * Error of task segment adding.
     */
    public static final int ADD_TASK_SEGMENT = 156;
    /**
     * Error of bulk task segments removing.
     */
    public static final int REMOVE_TASK_SEGMENTS = 157;
    /**
     * Error of task segment retrieving.
     */
    public static final int GET_TASK_SEGMENTS = 158;
    public static final int TASK_SEGMENT_NOT_FOUND = 159;
    /**
     * Error of task segment removing.
     */
    public static final int REMOVE_TASK_SEGMENT = 160;

}
