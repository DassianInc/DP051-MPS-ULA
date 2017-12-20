package msprojectreader;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;
import java.util.Hashtable;
import java.text.SimpleDateFormat;

import net.sf.mpxj.ProjectFile;
import net.sf.mpxj.Resource;
import net.sf.mpxj.Relation;
import net.sf.mpxj.Task;
import net.sf.mpxj.Table;
import net.sf.mpxj.Column;
import net.sf.mpxj.ResourceAssignment;
import net.sf.mpxj.mpp.MPPReader;

/**
 *
 * @author Jakub Siemiatkowski
 * @sasklacz
 * Bryntum AB 2012
 */
public class Main {
    private static JSONArray taskChildrenArray = new JSONArray();
    private static JSONArray dependencyArray = new JSONArray();
    private static JSONArray assignmentArray = new JSONArray();
    private static JSONArray resourceArray = new JSONArray();
    private static JSONArray columnArray = new JSONArray();

    private static JSONObject taskObject = new JSONObject();
    private static JSONObject taskChildrenObject;
    private static JSONObject dependencyObject;
    private static JSONObject assignmentObject;
    private static JSONObject resourceObject;
    private static JSONObject columnObject;
    private static JSONObject resultObject = new JSONObject();

    private static String resultString;
    private static String errorMsg;
    private static Boolean toString = true;
    static Hashtable<String, String> dependencyTypes = new Hashtable<String, String>();
    static Hashtable<String, String> columnTypes = new Hashtable<String, String>();
    static Hashtable<String, String> columnIndexNames = new Hashtable<String, String>();

    public static void main(String[] args) {
        String path = null;
        String dest = null;
        String usageMsg = "Usage: java -jar path_to_mpp_file path_to_target.json or 1 (to return string)";
        errorMsg = "There was an exception raised during the operation. Exception message: ";

        try {
            path = args[0];
            dest = new String(args[1]);
            toString = dest.equals("1");
        } catch (Exception e) {
            System.out.println(errorMsg + e);
            System.exit(0);
        }

        if (path != null && dest != null) {
            resultString = readProject(path, dest);
            if (toString) {
                System.out.println(resultString);
            }
        } else {
            System.out.println(usageMsg);
            System.exit(0);
        }
    }

    private static JSONObject getTaskData(Task task, JSONObject object){
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

        try {
            object.put("Id", task.getUniqueID());
            object.put("Name", task.getName());
            object.put("StartDate", dateFormat.format(task.getStart()));
            object.put("EndDate", dateFormat.format(task.getFinish()));
            object.put("Duration", task.getDuration().toString().replaceAll("(?!\\.)[\\D]", ""));
            object.put("DurationUnit", task.getDuration().getUnits());
            object.put("PercentDone", task.getPercentageComplete());
            object.put("Milestone", task.getMilestone());

            if (task.getBaselineStart() != null){
                object.put("BaselineStartDate", task.getBaselineStart());
            } else {
                object.put("BaselineStartDate", object.get("StartDate"));
            }
            if (task.getBaselineFinish() != null){
                object.put("BaselineEndDate", task.getBaselineFinish());
            } else {
                object.put("BaselineEndDate", object.get("EndDate"));
            }
            if (task.getBaselineDuration() != null){
                object.put("BaselineDuration", task.getBaselineDuration());
            } else {
                object.put("BaselineDuration", object.get("Duration"));
            }

            object.put("leaf", true);
        } catch (JSONException e) {
            System.out.println(errorMsg + e);
            System.exit(0);
        }

        return object;
    }

    public static String readProjectFile(ProjectFile projectFile) {
        String retString = "";
        Task firstTask = projectFile.getChildTasks().get(0);

        for (Task task : firstTask.getChildTasks()) {
            taskChildrenObject = new JSONObject();
            getTaskData(task, taskChildrenObject);
            listHierarchy(task, taskChildrenObject);
            taskChildrenArray.put(taskChildrenObject);
        }

        int counter = 0;

        for (Task task : projectFile.getAllTasks()) {

            List<Relation> predecessors = task.getPredecessors();

            if (predecessors != null && predecessors.isEmpty() == false){
                for (Relation relation : predecessors){
                    dependencyObject = new JSONObject();

                    try {
                        dependencyObject.put("Id", counter++);
                        dependencyObject.put("To", relation.getSourceTask().getUniqueID());
                        dependencyObject.put("From", relation.getTargetTask().getUniqueID());
                        dependencyObject.put("Lag", relation.getLag().toString().replaceAll("(?!\\.)[\\D]", ""));
                        dependencyObject.put("Type", getDependencyType(relation.getType().toString()));
                        dependencyArray.put(dependencyObject);
                    } catch (JSONException e) {
                        System.out.println(errorMsg + e);
                        System.exit(0);
                    }
                }
            }
        }

        for (Resource resource : projectFile.getAllResources()) {
            resourceObject = new JSONObject();

            try {
                resourceObject.put("Id", resource.getUniqueID());
                resourceObject.put("Name", (resource.getName() != null ? resource.getName() : "New resource"));
                resourceArray.put(resourceObject);
            } catch (JSONException e) {
                System.out.println(errorMsg + e);
                System.exit(0);
            }

            for (ResourceAssignment assignment : resource.getTaskAssignments()) {
                assignmentObject = new JSONObject();

                try {
                    assignmentObject.put("Id", assignment.getUniqueID());
                    assignmentObject.put("ResourceId", resource.getUniqueID());
                    assignmentObject.put("TaskId", assignment.getTask().getUniqueID());
                    assignmentObject.put("Units", assignment.getUnits());
                    assignmentArray.put(assignmentObject);
                } catch (JSONException e) {
                    System.out.println(errorMsg + e);
                    System.exit(0);
                }
            }
        }

        String fieldType = null;

        try {
            Iterator<Table> i = projectFile.getTables().iterator();
            if (i.hasNext()) {
                Table table = i.next();

                for (Column column : table.getColumns()) {
                    columnObject = new JSONObject();

                    fieldType = column.getFieldType().toString();
                    String columnType = getColumnType(fieldType);
                    // skip unknown columns
                    if (columnType.equals("")) continue;

                    columnObject.put("xtype", columnType);

                    String index = getColumnIndexName(fieldType);
                    // if we have model field name to use
                    if (!index.equals("")) {
                        columnObject.put("dataIndex", index);
                        // for non-bryntum columns let's copy header
                        if (columnType.equals("treecolumn") || columnType.equals("gridcolumn")) {
                            columnObject.put("header", column.getTitle());
                        }
                    }
                    //columnObject.put("width", column.getWidth()+"0");

                    columnArray.put(columnObject);
                }
            }
        } catch (JSONException e) {
            System.out.println(errorMsg + e);
            System.exit(0);
        }

        try {
            taskObject.put("children", taskChildrenArray);
            taskObject.put("Name", "Root Node");
            resultObject.put("tasks", taskObject);
            resultObject.put("dependencies", dependencyArray);
            resultObject.put("assignments", assignmentArray);
            resultObject.put("resources", resourceArray);
            resultObject.put("columns", columnArray);

            retString = resultObject.toString(4);
        } catch (JSONException e) {
            System.out.println(errorMsg + e);
            System.exit(0);
        }

        return retString;
    }

    private static void listHierarchy(Task task, JSONObject object) {
        JSONArray childrenArray = new JSONArray();

        for (Task child : task.getChildTasks()) {
            JSONObject childObject = new JSONObject();
            getTaskData(child, childObject);
            childrenArray.put(childObject);
            try {
                object.put("children", childrenArray);
                object.put("leaf", false);
            } catch (JSONException e) {
                System.out.println(errorMsg + e);
                System.exit(0);
            }

            listHierarchy(child, childObject);
        }
    }

    static void mapValue(Hashtable<String, String> table, String key, String value) {
        table.put(key, value);
    }

    static void initMappings() {
        // dependency types codes
        mapValue(dependencyTypes, "FF", "3");
        mapValue(dependencyTypes, "FS", "2");
        mapValue(dependencyTypes, "SF", "1");
        mapValue(dependencyTypes, "SS", "0");

        // list of known columns
        mapValue(columnTypes, "Task Name", "namecolumn");
        mapValue(columnTypes, "Baseline Start", "gridcolumn");
        mapValue(columnTypes, "Baseline Finish", "gridcolumn");
        mapValue(columnTypes, "Duration", "durationcolumn");
        // we cannot map this column yet since it uses fake task ID
        // while bryntum gantt uses real IDs only
        //mapValue(columnTypes, "Predecessors", "predecessorcolumn");
        mapValue(columnTypes, "Start", "startdatecolumn");
        mapValue(columnTypes, "Finish", "enddatecolumn");
        mapValue(columnTypes, "% Complete", "percentdonecolumn");
        mapValue(columnTypes, "Resource Names", "resourceassignmentcolumn");
        mapValue(columnTypes, "Early Start", "earlystartdatecolumn");
        mapValue(columnTypes, "Early Finish", "earlyenddatecolumn");
        mapValue(columnTypes, "Late Start", "latestartdatecolumn");
        mapValue(columnTypes, "Late Finish", "lateenddatecolumn");
        mapValue(columnTypes, "Total Slack", "slackcolumn");
        // some of columns should have dataIndex pointing to task field
        mapValue(columnIndexNames, "Baseline Start", "BaselineStartDate");
        mapValue(columnIndexNames, "Baseline Finish", "BaselineEndDate");
    }

    static int getDependencyType(String content) {
        Object ret = dependencyTypes.get(content);
        return Integer.parseInt(ret.toString());
    }

    static String getColumnType(String content) {
        if (content == null) return "";
        if (!columnTypes.containsKey(content)) return "";
        return columnTypes.get(content).toString();
    }

    static String getColumnIndexName(String content) {
        if (content == null) return "";
        if (!columnIndexNames.containsKey(content)) return "";
        return columnIndexNames.get(content).toString();
    }

    private static String readProject(String path, String destination) {
        MPPReader reader = new MPPReader();
        ProjectFile projectFile;

        initMappings();

        try {
            projectFile = reader.read(path);
            resultString = readProjectFile(projectFile);

            if (!toString) {
                try {
                    BufferedWriter out = new BufferedWriter(new FileWriter(destination));
                    out.write(resultString);
                    out.close();
                } catch (IOException e) {
                    System.out.println(errorMsg + e);
                    System.exit(0);
                }
            }
        } catch (Exception e) {
            System.out.println(errorMsg);
            e.printStackTrace();
            System.exit(0);
        }

        return resultString;
    }
}
