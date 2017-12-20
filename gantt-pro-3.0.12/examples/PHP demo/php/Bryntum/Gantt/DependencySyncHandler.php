<?php

namespace Bryntum\Gantt;

class DependencySyncHandler extends \Bryntum\CRUD\SyncHandler
{

    private $gantt;

    public function __construct(&$gantt)
    {
        $this->gantt = &$gantt;
    }

    protected function prepareData(&$data)
    {
        // initialize response part related to the record
        $response = array();

        $taskIds = $this->gantt->phantomIdMap['tasks'];

        if (isset($data['Type'])) {
            $data['Typ'] = $data['Type'];
            unset($data['Type']);
        }

        if (isset($data['From'])) {
            $data['FromId'] = $data['From'];
            unset($data['From']);

            // get newly created task Ids if these are references to phantom tasks
            if (isset($taskIds[$data['FromId']])) {
                // use & return actual Id
                $data['FromId'] = $response['From'] = $taskIds[$data['FromId']];
            }
        }

        if (isset($data['To'])) {
            $data['ToId'] = $data['To'];
            unset($data['To']);

            if (isset($taskIds[$data['ToId']])) {
                // use & return actual Id
                $data['ToId'] = $response['To'] = $taskIds[$data['ToId']];
            }
        }

        return $response;
    }

    public function add(&$dependency)
    {
        $response = $this->prepareData($dependency);
        $this->gantt->saveDependency($dependency);
        return $response;
    }

    public function update(&$dependency)
    {
        $response = $this->prepareData($dependency);
        $this->gantt->saveDependency($dependency);
        return $response;
    }

    public function remove($dependency)
    {
        $response = array();
        $this->gantt->removeDependency($dependency);
        return $response;
    }
}
