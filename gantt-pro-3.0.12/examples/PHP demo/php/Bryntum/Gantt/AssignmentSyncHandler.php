<?php

namespace Bryntum\Gantt;

class AssignmentSyncHandler extends \Bryntum\CRUD\SyncHandler
{

    private $gantt;

    public function __construct(&$gantt)
    {
        $this->gantt = &$gantt;
    }

    protected function prepareData(&$data)
    {
        // initialize returning hash
        $result = array();

        $taskIds = $this->gantt->phantomIdMap['tasks'];
        // get newly created task Id if this is a reference to a phantom task
        if (isset($taskIds[@$data['TaskId']])) {
            // use & return actual Id
            $data['TaskId'] = $result['TaskId'] = $taskIds[$data['TaskId']];
        }

        $resourceIds = $this->gantt->phantomIdMap['resources'];
        // get newly created resource Id if this is a reference to a phantom resource
        if (isset($resourceIds[@$data['ResourceId']])) {
            // use & return actual Id
            $data['ResourceId'] = $result['ResourceId'] = $resourceIds[$data['ResourceId']];
        }

        return $result;
    }

    public function add(&$assignment)
    {
        $response = $this->prepareData($assignment);
        $this->gantt->saveAssignment($assignment);
        return $response;
    }

    public function update(&$assignment)
    {
        $response = $this->prepareData($assignment);
        $this->gantt->saveAssignment($assignment);
        return $response;
    }

    public function remove($assignment)
    {
        $response = array();
        $this->gantt->removeAssignment($assignment);
        return $response;
    }
}
