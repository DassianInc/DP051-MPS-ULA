<?php

namespace Bryntum\Gantt;

class CalendarSyncHandler extends \Bryntum\CRUD\SyncHandler
{

    protected $phantomIdField = 'PhantomId';
    private $gantt;
    private $calendarDayHandler;

    public function __construct(&$gantt)
    {
        $this->gantt = &$gantt;
        $this->phantomIdMap = &$gantt->phantomIdMap['calendars'];

        $this->calendarDayHandler = new CalendarDaySyncHandler($gantt);
    }

    protected function prepareData(&$data)
    {
        // initialize record related response part
        $response = array();

        if (isset($data['parentId']) && (strtolower($data['parentId']) == 'root')) {
            $data['parentId'] = null;
        }

        //var_dump( $this->phantomIdMap );

        if (isset($this->phantomIdMap[$data['PhantomParentId']])) {
            // use & return actual Id
            $data['parentId'] = $response['parentId'] = $this->phantomIdMap[$data['PhantomParentId']];
        }

        if (isset($data['DefaultAvailability'])) {
            $data['DefaultAvailability'] = implode('|', (array)$data['DefaultAvailability']);
        }

        return $response;
    }

    public function add(&$calendar)
    {
        $response = $this->prepareData($calendar);
        $this->gantt->saveCalendar($calendar);

        if (@$calendar['Days']) {
            $this->calendarDayHandler->setCalendarId($calendar['Id']);
            $response['Days'] = $this->calendarDayHandler->handle($calendar['Days']);
        }

        return $response;
    }

    public function update(&$calendar)
    {
        $response = $this->prepareData($calendar);
        $this->gantt->saveCalendar($calendar);

        if (@$calendar['Days']) {
            $this->calendarDayHandler->setCalendarId($calendar['Id']);
            $response['Days'] = $this->calendarDayHandler->handle($calendar['Days']);
        }

        return $response;
    }

    public function remove($calendar)
    {
        $response = array();
        $this->gantt->removeCalendar($calendar);
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
