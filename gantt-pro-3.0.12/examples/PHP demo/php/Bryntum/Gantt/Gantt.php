<?php
namespace Bryntum\Gantt;

define(__NAMESPACE__.'\E_APP_UPDATE_TASK', 100);
define(__NAMESPACE__.'\E_APP_ADD_TASK', 101);
define(__NAMESPACE__.'\E_APP_REMOVE_TASK', 102);
define(__NAMESPACE__.'\E_APP_GET_TASKS', 104);
define(__NAMESPACE__.'\E_APP_TASK_NOT_FOUND', 105);
define(__NAMESPACE__.'\E_APP_GET_CALENDAR_DAYS', 110);
define(__NAMESPACE__.'\E_APP_UPDATE_CALENDAR_DAY', 111);
define(__NAMESPACE__.'\E_APP_ADD_CALENDAR_DAY', 112);
define(__NAMESPACE__.'\E_APP_REMOVE_CALENDAR_DAY', 113);
define(__NAMESPACE__.'\E_APP_CALENDAR_DAY_NOT_FOUND', 114);
define(__NAMESPACE__.'\E_APP_GET_CALENDARS', 120);
define(__NAMESPACE__.'\E_APP_UPDATE_CALENDAR', 121);
define(__NAMESPACE__.'\E_APP_ADD_CALENDAR', 122);
define(__NAMESPACE__.'\E_APP_REMOVE_CALENDAR', 123);
define(__NAMESPACE__.'\E_APP_CALENDAR_NOT_FOUND', 124);
define(__NAMESPACE__.'\E_APP_CALENDAR_HAS_CALENDARS', 125);
define(__NAMESPACE__.'\E_APP_CALENDAR_USED_BY_RESOURCE', 126);
define(__NAMESPACE__.'\E_APP_CALENDAR_USED_BY_TASK', 127);
define(__NAMESPACE__.'\E_APP_UPDATE_RESOURCE', 130);
define(__NAMESPACE__.'\E_APP_ADD_RESOURCE', 131);
define(__NAMESPACE__.'\E_APP_REMOVE_RESOURCE', 132);
define(__NAMESPACE__.'\E_APP_GET_RESOURCES', 133);
define(__NAMESPACE__.'\E_APP_RESOURCE_NOT_FOUND', 134);
define(__NAMESPACE__.'\E_APP_REMOVE_USED_RESOURCE', 135);
define(__NAMESPACE__.'\E_APP_UPDATE_ASSIGNMENT', 140);
define(__NAMESPACE__.'\E_APP_ADD_ASSIGNMENT', 141);
define(__NAMESPACE__.'\E_APP_REMOVE_ASSIGNMENT', 142);
define(__NAMESPACE__.'\E_APP_GET_ASSIGNMENTS', 143);
define(__NAMESPACE__.'\E_APP_ASSIGNMENT_NOT_FOUND', 144);
define(__NAMESPACE__.'\E_APP_UPDATE_DEPENDENCY', 150);
define(__NAMESPACE__.'\E_APP_ADD_DEPENDENCY', 151);
define(__NAMESPACE__.'\E_APP_REMOVE_DEPENDENCY', 152);
define(__NAMESPACE__.'\E_APP_GET_DEPENDENCIES', 153);
define(__NAMESPACE__.'\E_APP_DEPENDENCY_NOT_FOUND', 154);
define(__NAMESPACE__.'\E_APP_UPDATE_TASK_SEGMENT', 155);
define(__NAMESPACE__.'\E_APP_ADD_TASK_SEGMENT', 156);
define(__NAMESPACE__.'\E_APP_REMOVE_TASK_SEGMENTS', 157);
define(__NAMESPACE__.'\E_APP_GET_TASK_SEGMENTS', 158);
define(__NAMESPACE__.'\E_APP_TASK_SEGMENT_NOT_FOUND', 159);

class Gantt extends \Bryntum\CRUD\BaseDAO
{

    public function __construct($dsn, $dbuser, $dbpwd)
    {
        // call parent
        parent::__construct($dsn, $dbuser, $dbpwd);

        $this->initRowsHolders();
    }

    /**
     * Initializes structures to keep mapping between phantom and real Ids
     * and lists of implicitly updated and removed records dictionaries.
     */
    public function initRowsHolders()
    {
        $this->phantomIdMap = array(
            'tasks'     => array(),
            'calendars' => array(),
            'resources' => array(),
            'segments'  => array()
        );

        $this->updatedRows = array(
            'tasks'     => array(),
            'calendars' => array(),
            'resources' => array()
        );

        $this->removedRows = array(
            'tasks'         => array(),
            'calendars'     => array(),
            'calendardays'  => array(),
            'resources'     => array(),
            'assignments'   => array(),
            'dependencies'  => array()
        );
    }

    public function getProjectCalendarId()
    {
        return $this->getOption('projectCalendar');
    }

    /**
     * Creates or updates (depending on provided data) a task record.
     * If $data['Id'] is presented in provided data then this method will update corresponding task record otherwise it will create a new task.
     * @param $data array Data to be stored into a task record. It's an array where array keys are task field names.
     */
    public function saveTask(&$data)
    {
        if (@$data['Id']) {
            if (!$this->getTask($data['Id'])) {
                throw new \Exception('Cannot find task #'.$data['Id'], E_APP_TASK_NOT_FOUND);
            }

            if (!$this->update('tasks', $data, array('Id' => $data['Id']), true)) {
                throw new \Exception('Cannot update task #'.$data['Id'].'.', E_APP_UPDATE_TASK);
            }
        } else {
            if (!$this->insert('tasks', $data, true)) {
                throw new \Exception('Cannot create task.', E_APP_ADD_TASK);
            }

            $data['Id'] = $this->db->lastInsertId();
        }

        // if segments field passed
        if (isset($data['Segments'])) {
            $this->saveTaskSegments($data['Id'], $data['Segments']);
        }

        $this->updateRevision();
    }

    /**
     * Removes task record.
     */
    public function removeTask($data)
    {

        $id = intval($data['Id']);

        $children = $this->getTasks(array('parentId' => $id));
        //var_dump($children);

        foreach ((array)$children as $subTask) {
            $this->removeTask($subTask);
            // keep implicitly removed row Id
            $this->removedRows['tasks'][$subTask['Id']] = array('Id' => $subTask['Id']);
        }

        if (!$this->db->query('delete from tasks where Id = '.$id)) {
            throw new \Exception("Cannot remove task #$id.", E_APP_REMOVE_TASK);
        }

        $this->updateRevision();
    }

    public function getTask($id)
    {
        $tasks = $this->getTasks(array('Id' => $id));
        return $tasks ? $tasks[0] : false;
    }

    /**
     * Returns array of tasks.
     */
    public function getTasks($where = null)
    {
        $result = array();
        $byParent = array();
        $values = array();

        $cond = $where ? ' where '.self::buildWhere($where, $values) : '';

        $stmt = $this->db->prepare('select * from tasks '.$cond.' order by idx');

        if (!$stmt->execute($values)) {
            throw new \Exception('Cannot get tasks list.', E_APP_GET_TASKS);
        }

        while ($e = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $e['Id']            = intval($e['Id']);
            if ($e['parentId']) {
                $e['parentId']  = intval($e['parentId']);
            }
            $e['Duration']      = $e['Duration'] !== null ? floatval($e['Duration']) : null;
            $e['PercentDone']   = floatval($e['PercentDone']);
            $e['index']         = intval($e['idx']);
            $e['expanded']      = $e['expanded'] == 1;
            $e['Effort']        = $e['Effort'] !== null ? floatval($e['Effort']) : null;
            $e['Draggable']     = $e['Draggable'] == 1;
            $e['Resizable']     = $e['Resizable'] == 1;
            $e['Rollup']        = $e['Rollup'] == 1;
            $e['ManuallyScheduled'] = $e['ManuallyScheduled'] == 1;
            $e['Segments']      = $this->getTaskSegments($e['Id']);
            if (!count($e['Segments'])) {
                $e['Segments']  = null;
            }
            unset($e['idx']);

            if (!$where) {
                $parentId = $e['parentId'] ? $e['parentId'] : '';
                if (!isset($byParent[$parentId])) {
                    $byParent[$parentId] = array();
                }

                $byParent[$parentId][] = $e;
            } else {
                $result[] = $e;
            }

            unset($e['parentId']);
        }

        return $where ? $result : self::buildTree($byParent, '');
    }

    /**
     * Removes task segments.
     */
    public function removeTaskSegments($taskId, $where = null)
    {

        if ($taskId) {
            if (!$where) {
                $where = array();
            }

            $where['TaskId'] = $taskId;
        }

        $cond = $where ? ' where '.self::buildWhere($where, $values) : '';

        $stmt = $this->db->prepare('delete from task_segments '.$cond);

        if (!$stmt->execute($values)) {
            throw new \Exception("Cannot remove segments of task #$taskId.", E_APP_REMOVE_TASK_SEGMENTS);
        }

        $this->updateRevision();
    }

    public function saveTaskSegment(&$data)
    {
        if (@$data['Id']) {
            if (!$this->getTaskSegment($data['Id'])) {
                throw new \Exception('Cannot find task segment #'.$data['Id'], E_APP_TASK_SEGMENT_NOT_FOUND);
            }

            if (!$this->update('task_segments', $data, array('Id' => $data['Id']), true)) {
                throw new \Exception('Cannot update task segment #'.$data['Id'].'.', E_APP_UPDATE_TASK_SEGMENT);
            }
        } else {
            $phantomId = $data['PhantomId'];

            if (!$this->insert('task_segments', $data, true)) {
                throw new \Exception('Cannot create task segment.', E_APP_ADD_TASK_SEGMENT);
            }

            $data['Id'] = $this->db->lastInsertId();

            $this->phantomIdMap['segments'][$phantomId] = $data['Id'];
        }

        $this->updateRevision();
    }

    public function saveTaskSegments($taskId, &$segments)
    {
        // if no segments passed then remove all records
        if (!count($segments)) {
            $this->removeTaskSegments($taskId);

        } else {
            $ids = array();

            // apply segment changes (add/update)
            foreach ($segments as &$segment) {
                $segment['TaskId'] = $taskId;
                $this->saveTaskSegment($segment);
                // remember added/updated identifiers
                $ids[] = $segment['Id'];
            }

            // all segments except added/updated have to be removed
            if (count($ids)) {
                $stmt = $this->db->prepare('delete from task_segments where TaskId = ? and Id not in '. self::buildWhereIn($ids));

                if (!$stmt->execute(array_merge((Array)$taskId, $ids))) {
                    throw new \Exception("Cannot remove task segments [#$taskId].", E_APP_REMOVE_TASK_SEGMENTS);
                }

                $this->updateRevision();
            }
        }
    }

    public function getTaskSegment($id)
    {
        $segments = $this->getTaskSegments(null, array('Id' => $id));
        return $segments ? $segments[0] : false;
    }

    /**
     * Returns array of task segments
     */
    public function getTaskSegments($taskId, $where = null)
    {
        $result = array();
        $values = array();

        if ($taskId) {
            if (!$where) {
                $where = array();
            }

            $where['TaskId'] = $taskId;
        }

        $cond = $where ? ' where '.self::buildWhere($where, $values) : '';

        $stmt = $this->db->prepare('select * from task_segments '.$cond);

        if (!$stmt->execute($values)) {
            throw new \Exception('Cannot get task segments list.', E_APP_GET_TASK_SEGMENTS);
        }

        while ($e = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $e['Id']            = intval($e['Id']);
            $e['Duration']      = floatval($e['Duration']);
            unset($e['TaskId']);

            $result[] = $e;
        }

        return $result;
    }

    public function getCalendarDay($id)
    {
        $days = $this->getCalendarDays(array('Id' => $id));
        return $days ? $days[0] : false;
    }

    /**
     * Returns array of days for a specific calendar.
     */
    public function getCalendarDays($where = null)
    {
        $values = array();
        $cond = $where ? ' where '.self::buildWhere($where, $values) : '';

        $stmt = $this->db->prepare('select * from calendar_days '.$cond);

        if (!$stmt->execute($values)) {
            throw new \Exception('Cannot get calendar days list.', E_APP_GET_CALENDAR_DAYS);
        }

        $rows = array();
        while ($e = $stmt->fetch(\PDO::FETCH_ASSOC)) {

            $e['Id']            = intval($e['Id']);
            $e['Weekday']       = intval($e['Weekday']);
            // turn IsWorkingDay to boolean
            $e['IsWorkingDay']  = ($e['IsWorkingDay'] == 1);
            // map Dt and Typ columns to their "proper" names
            $e['Date']          = $e['Dt'];
            $e['Type']          = $e['Typ'];
            unset($e['Dt']);
            unset($e['Typ']);

            if ($e['Availability']) {
                $e['Availability'] = explode('|', $e['Availability']);
            }

            $rows[] = $e;
        }

        return $rows;
    }

    /**
     * Creates/updates calendar day record.
     */
    public function saveCalendarDay(&$data)
    {
        if (@$data['Id']) {
            if (!$this->getCalendarDay($data['Id'])) {
                throw new \Exception('Cannot find day #'.$data['Id'], E_APP_CALENDAR_DAY_NOT_FOUND);
            }

            if (!$this->update('calendar_days', $data, array('Id' => $data['Id']))) {
                throw new \Exception('Cannot update calendar day #'.$data['Id'].'.', E_APP_UPDATE_CALENDAR_DAY);
            }

        } else {
            if (!$this->insert('calendar_days', $data)) {
                throw new \Exception('Cannot create calendar day.', E_APP_ADD_CALENDAR_DAY);
            }

            $data['Id'] = $this->db->lastInsertId();
        }

        $this->updateRevision();
    }

    /**
     * Removes calendar day record(s).
     */
    public function removeCalendarDays($data)
    {
        $sql = 'delete from calendar_days where ';
        if (@$data['Id']) {
            $sql .= ' Id = '.intval($data['Id']);
        } elseif (@$data['calendarId']) {
            $sql .= ' calendarId = '.intval($data['calendarId']);
        }

        if (!$this->db->query($sql)) {
            throw new \Exception('Cannot remove calendar #'.$data['Id'].'.', E_APP_REMOVE_CALENDARDAYS);
        }

        $this->updateRevision();
    }

    public function getCalendar($id)
    {
        $calendars = $this->getCalendars(array('Id' => $id));
        return $calendars ? $calendars[0] : false;
    }

    /**
     * Returns array of calendars.
     */
    public function getCalendars($where = null)
    {
        $result = array();
        $byParent = array();
        $values = array();

        $cond = $where ? ' where '.self::buildWhere($where, $values) : '';

        $stmt = $this->db->prepare('select * from calendars '.$cond);

        if (!$stmt->execute($values)) {
            throw new \Exception('Cannot get calendars list.', E_APP_GET_CALENDARS);
        }

        while ($e = $stmt->fetch(\PDO::FETCH_ASSOC)) {

            $days = &$this->getCalendarDays(array('calendarId' => @$e['Id']));

            $e['Days'] = array('rows' => $days, 'total' => $this->getFoundRows());

            $e['DaysPerMonth']          = intval($e['DaysPerMonth']);
            $e['DaysPerWeek']           = intval($e['DaysPerWeek']);
            $e['HoursPerDay']           = intval($e['HoursPerDay']);
            $e['WeekendsAreWorkdays']   = ($e['WeekendsAreWorkdays'] == 1);
            $e['WeekendFirstDay']       = intval($e['WeekendFirstDay']);
            $e['WeekendSecondDay']      = intval($e['WeekendSecondDay']);
            if ($e['DefaultAvailability']) {
                $e['DefaultAvailability'] = explode('|', $e['DefaultAvailability']);
            }

            if (!$where) {
                $parentId = $e['parentId'] ? $e['parentId'] : '';

                if (!isset($byParent[$parentId])) {
                    $byParent[$parentId] = array();
                }

                $byParent[$parentId][] = $e;
            } else {
                $result[] = $e;
            }
        }

        return $where ? $result : self::buildTree($byParent, '');
    }

    /**
     * Creates/updates calendar record.
     */
    public function saveCalendar(&$data)
    {
        if (@$data['Id']) {
            if (!$this->getCalendar($data['Id'])) {
                throw new \Exception('Cannot find calendar #'.$data['Id'], E_APP_CALENDAR_NOT_FOUND);
            }

            if (!$this->update('calendars', $data, array('Id' => $data['Id']), true)) {
                throw new \Exception('Cannot update calendar #'.$data['Id'].'.', E_APP_UPDATE_CALENDAR);
            }

        } else {
            if (!$this->insert('calendars', $data, true)) {
                throw new \Exception('Cannot create calendar.', E_APP_ADD_CALENDAR);
            }

            $data['Id'] = $this->db->lastInsertId();
        }

        $this->updateRevision();
    }

    /**
     * Removes calendar record.
     */
    public function removeCalendar($data, $force = false)
    {
        $id = intval($data['Id']);

        $children = $this->getCalendars(array('parentId' => $id));
        $resources = $this->getResources(array('CalendarId' => $id));
        $tasks = $this->getTasks(array('CalendarId' => $id));

        if ($force) {
            foreach ((array)$children as $child) {
                $c = array('Id' => $child['Id'], 'parentId' => null);
                $this->saveCalendar($c);
                // keep implicitly updated record info
                $this->updatedRows['calendars'][$c['Id']] = $c;
            }
            foreach ((array)$resources as $resource) {
                $r = array('Id' => $resource['Id'], 'CalendarId' => null);
                $this->saveResource($r);
                // keep implicitly updated record info
                $this->updatedRows['resources'][$r['Id']] = $r;
            }
            foreach ((array)$tasks as $task) {
                $t = array('Id' => $child['Id'], 'CalendarId' => null);
                $this->saveTask($t);
                // keep implicitly updated record info
                $this->updatedRows['tasks'][$t['Id']] = $t;
            }

        } else {
            if ($children) {
                throw new \Exception('Cannot remove calendar #'. $id .' it has child calendars', E_APP_CALENDAR_HAS_CALENDARS);
            }

            if ($resources) {
                throw new \Exception('Cannot remove calendar #'. $id .' it\'s used by a resource', E_APP_CALENDAR_USED_BY_RESOURCE);
            }

            if ($tasks) {
                throw new \Exception('Cannot remove calendar #'. $id .' it\'s used by a task', E_APP_CALENDAR_USED_BY_TASK);
            }
        }

        $this->removeCalendarDays(array('calendarId' => $data['Id']));

        if (!$this->db->query('delete from calendars where Id = '.intval($data['Id']))) {
            throw new \Exception('Cannot remove calendar #'.$data['Id'].'.', E_APP_REMOVE_CALENDAR);
        }

        $this->updateRevision();
    }

    /**
     * Creates/updates resource record.
     */
    public function saveResource(&$data)
    {
        if (@$data['Id']) {
            if (!$this->getResource($data['Id'])) {
                throw new \Exception('Cannot find resource #'.$data['Id'], E_APP_RESOURCE_NOT_FOUND);
            }

            if (!$this->update('resources', $data, array('Id' => $data['Id']))) {
                throw new \Exception('Cannot update resource #'.$data['Id'].'.', E_APP_UPDATE_RESOURCE);
            }

        } else {
            if (!$this->insert('resources', $data)) {
                throw new \Exception('Cannot create resource.', E_APP_ADD_RESOURCE);
            }

            $data['Id'] = $this->db->lastInsertId();
        }

        $this->updateRevision();
    }

    /**
     * Removes resource record.
     */
    public function removeResource($data, $force = false)
    {
        $id = $data['Id'];

        $assignments = $this->getAssignments(array('ResourceId' => $id));

        if ($assignments && !$force) {
            throw new \Exception('Cannot remove resource being used #'.$id, E_APP_REMOVE_USED_RESOURCE);
        }

        foreach ($assignments as $assignment) {
            $this->removeAssignment($assignment);
            // keep implicitly removed row Id
            $this->removedRows['assignments'][$assignment['Id']] = array('Id' => $assignment['Id']);
        }

        if (!$this->db->query('delete from resources where Id = '.intval($data['Id']))) {
            throw new \Exception('Cannot remove resource #'.$data['Id'].'.', E_APP_REMOVE_RESOURCE);
        }

        $this->updateRevision();
    }

    public function getResource($id)
    {
        $resources = $this->getResources(array('Id' => $id));
        return $resources ? $resources[0] : false;
    }

    /**
     * Returns array of resources.
     */
    public function getResources($where = null)
    {
        $values = array();
        $cond = $where ? ' where '.self::buildWhere($where, $values) : '';

        $stmt = $this->db->prepare('select * from resources '.$cond);

        if (!$stmt->execute($values)) {
            throw new \Exception('Cannot get resources list.', E_APP_GET_RESOURCES);
        }

        $rows = array();
        while ($e = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $e['Id'] = intval($e['Id']);
            $rows[] = $e;
        }

        return $rows;
    }

    /**
     * Creates/updates assignment record.
     */
    public function saveAssignment(&$data)
    {
        if (@$data['Id']) {
            if (!$this->getAssignment($data['Id'])) {
                throw new \Exception('Cannot find assignment #'.$data['Id'], E_APP_ASSIGNMENT_NOT_FOUND);
            }

            if (!$this->update('assignments', $data, array('Id' => $data['Id']))) {
                throw new \Exception('Cannot update assignment #'.$data['Id'].'.', E_APP_UPDATE_ASSIGNMENT);
            }

        } else {
            if (!$this->insert('assignments', $data)) {
                throw new \Exception('Cannot create assignment.', E_APP_ADD_ASSIGNMENT);
            }

            $data['Id'] = $this->db->lastInsertId();
        }

        $this->updateRevision();
    }

    /**
     * Removes assignment record.
     */
    public function removeAssignment($data)
    {
        if (!$this->db->query('delete from assignments where Id = '.intval($data['Id']))) {
            throw new \Exception('Cannot remove assignment #'.$data['Id'].'.', E_APP_REMOVE_ASSIGNMENT);
        }

        $this->updateRevision();
    }

    public function getAssignment($id)
    {
        $assignments = $this->getAssignments(array('Id' => $id));
        return $assignments ? $assignments[0] : false;
    }

    /**
     * Returns array of assignments.
     */
    public function getAssignments($where = null)
    {
        $values = array();
        $cond = $where ? ' where '.self::buildWhere($where, $values) : '';

        $stmt = $this->db->prepare('select * from assignments '.$cond);

        if (!$stmt->execute($values)) {
            throw new \Exception('Cannot get assignments list.', E_APP_GET_ASSIGNMENTS);
        }

        $rows = array();
        while ($e = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $e['Id'] = intval($e['Id']);
            $rows[] = $e;
        }

        return $rows;
    }

    /**
     * Creates/updates dependency record.
     */
    public function saveDependency(&$data)
    {
        if (@$data['Id']) {
            if (!$this->getDependency($data['Id'])) {
                throw new \Exception('Cannot find dependency #'.$data['Id'], E_APP_DEPENDENCY_NOT_FOUND);
            }

            if (!$this->update('dependencies', $data, array('Id' => $data['Id']))) {
                throw new \Exception('Cannot update dependency #'.$data['Id'].'.', E_APP_UPDATE_DEPENDENCY);
            }

        } else {
            if (!$this->insert('dependencies', $data)) {
                throw new \Exception('Cannot create dependency.', E_APP_ADD_DEPENDENCY);
            }

            $data['Id'] = $this->db->lastInsertId();
        }

        $this->updateRevision();
    }

    /**
     * Removes dependency record.
     */
    public function removeDependency($data)
    {
        if (!$this->db->query('delete from dependencies where Id = '.intval($data['Id']))) {
            throw new \Exception('Cannot remove dependency #'.$data['Id'].'.', E_APP_REMOVE_DEPENDENCY);
        }

        $this->updateRevision();
    }

    public function getDependency($id)
    {
        $dependencies = $this->getDependencies(array('Id' => $id));
        return $dependencies ? $dependencies[0] : false;
    }

    /**
     * Returns array of dependencies.
     */
    public function getDependencies($where = null)
    {
        $values = array();
        $cond = $where ? ' where '.self::buildWhere($where, $values) : '';

        $stmt = $this->db->prepare('select * from dependencies '.$cond);

        if (!$stmt->execute($values)) {
            throw new \Exception('Cannot get dependencies list.', E_APP_GET_DEPENDENCIES);
        }

        $rows = array();
        while ($e = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $e['Id'] = intval($e['Id']);
            $e['From'] = intval($e['FromId']);
            $e['To'] = intval($e['ToId']);
            $e['Type'] = intval($e['Typ']);
            unset($e['FromId']);
            unset($e['ToId']);
            $rows[] = $e;
        }

        return $rows;
    }
}
