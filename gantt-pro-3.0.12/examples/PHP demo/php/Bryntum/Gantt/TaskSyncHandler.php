<?php

namespace Bryntum\Gantt;

class TaskSyncHandler extends \Bryntum\CRUD\SyncHandler
{

    protected $phantomIdField = 'PhantomId';
    private $gantt;
    protected $isSegmentsProvided = false;

    public function __construct(&$gantt)
    {
        $this->gantt = &$gantt;
        $this->phantomIdMap = &$gantt->phantomIdMap['tasks'];
        $this->segmentsPhantomIdMap = &$gantt->phantomIdMap['segments'];
    }

    protected function prepareTask(&$data)
    {
        // initialize returning hash
        $result = array();

        $this->isSegmentsProvided = isset($data['Segments']);

        $data['leaf'] = @$data['leaf'] ? 1 : 0;

        if (isset($data['Duration'])) {
            $data['Duration'] = floatval($data['Duration']);
        }

        if (isset($data['Effort'])) {
            $data['Effort'] = floatval($data['Effort']);
        }

        if (isset($data['index'])) {
            $data['idx'] = intval($data['index']);
            unset($data['index']);
        }

        if (isset($data['expanded'])) {
            $data['expanded'] = intval($data['expanded']);
        }

        if (isset($data['ManuallyScheduled'])) {
            $data['ManuallyScheduled'] = intval($data['ManuallyScheduled']);
        }

        if (isset($data['Draggable'])) {
            $data['Draggable'] = intval($data['Draggable']);
        }

        if (isset($data['Resizable'])) {
            $data['Resizable'] = intval($data['Resizable']);
        }

        if (isset($data['Rollup'])) {
            $data['Rollup'] = intval($data['Rollup']);
        }

        if (isset($data['parentId']) && (strtolower($data['parentId']) == 'root')) {
            $data['parentId'] = null;
        }

        // get newly created task Id if this is a reference to a phantom parent task
        if (isset($this->phantomIdMap[@$data['PhantomParentId']])) {
            // use & return actual Id
            $data['parentId'] = $result['parentId'] = $this->phantomIdMap[$data['PhantomParentId']];
        }

        $phantomCals = &$this->gantt->phantomIdMap['calendars'];
        // get newly created calendar Id if this is a reference to a phantom parent task
        if (isset($phantomCals[@$data['CalendarId']])) {
            // use & return actual Id
            $data['CalendarId'] = $result['CalendarId'] = $phantomCals[$data['CalendarId']];
        }

        if (isset($data['CalendarId'])) {
            $data['CalendarId'] = $data['CalendarId'] ? intval($data['CalendarId']) : null;
        }

        return $result;
    }

    protected function appendSegmentsResponse(&$response, $segments)
    {
        if (count($segments)) {
            $segmentsResponse = array();

            foreach ($segments as $segment) {
                $segmentsResponse[] = array('PhantomId' => $segment[$this->phantomIdField], 'Id' => $segment['Id']);
            }

            $response['Segments'] = $segments;
        }
    }

    public function add(&$task)
    {
        $response = $this->prepareTask($task);
        $this->gantt->saveTask($task);

        if ($this->isSegmentsProvided) {
            $this->appendSegmentsResponse($response, $task['Segments']);
        }

        return $response;
    }

    public function update(&$task)
    {
        $response = $this->prepareTask($task);
        $this->gantt->saveTask($task);

        if ($this->isSegmentsProvided) {
            $this->appendSegmentsResponse($response, $task['Segments']);
        }

        return $response;
    }

    public function remove($task)
    {
        $response = array();
        $this->gantt->removeTask($task);
        return $response;
    }

    protected function onRecordAdded($record, &$recordResponse, $phantomId)
    {
        parent::onRecordAdded($record, $recordResponse, $phantomId);

        // let's keep phantom Id to real Id mapping
        $this->phantomIdMap[$phantomId] = $recordResponse['Id'];

        return $recordResponse;
    }
}
