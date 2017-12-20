<?php

namespace Bryntum\Gantt;

class ResourceSyncHandler extends \Bryntum\CRUD\SyncHandler
{

    private $gantt;

    public function __construct(&$gantt)
    {
        $this->gantt = &$gantt;
        $this->phantomIdMap = &$gantt->phantomIdMap['resources'];
    }

    protected function prepareData(&$data)
    {
        $result = array();

        $phantomCals = $this->gantt->phantomIdMap['calendars'];

        // get newly created calendar Id if this is a reference to a phantom parent task
        if (isset($phantomCals[@$data['CalendarId']])) {
            // use & return actual Id
            $data['CalendarId'] = $result['CalendarId'] = $phantomCals[$data['CalendarId']];
            $result['CalendarId'] = intval($result['CalendarId']);
        }

        if (isset($data['CalendarId'])) {
            $data['CalendarId'] = $data['CalendarId'] ? intval($data['CalendarId']) : null;
        }

        if (@!$data['Id']) {
            unset($data[$this->phantomIdField]);
        }

        return $result;
    }

    public function add(&$resource)
    {
        $response = $this->prepareData($resource);
        $this->gantt->saveResource($resource);
        return $response;
    }

    public function update(&$resource)
    {
        $response = $this->prepareData($resource);
        $this->gantt->saveResource($resource);
        return $response;
    }

    public function remove($resource)
    {
        $response = array();
        $this->gantt->removeResource($resource);
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
