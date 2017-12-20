<?php

namespace Bryntum\Gantt;

class CalendarDaySyncHandler extends \Bryntum\CRUD\SyncHandler
{

    private $gantt;
    private $calendarId;

    public function __construct(&$gantt)
    {
        $this->gantt = &$gantt;
    }

    public function setCalendarId($calendarId)
    {
        $this->calendarId = $calendarId;
    }

    public function prepareData(&$data)
    {
        $response = array();

        if (isset($data['Type'])) {
            $data['Typ'] = $data['Type'];
            unset($data['Type']);
        }
        if (isset($data['Date'])) {
            $data['Dt'] = $data['Date'];
            unset($data['Date']);
        }

        if (isset($data['Availability'])) {
            $data['Availability'] = implode('|', (array)$data['Availability']);
        }

        if ($this->calendarId) {
            $data['calendarId'] = $this->calendarId;
        }

        $phantomIdMap = &$this->gantt->phantomIdMap['calendars'];
        if (isset($phantomIdMap[$data['calendarId']])) {
            // use & return actual Id
            $data['calendarId'] = $response['calendarId'] = $phantomIdMap[$data['calendarId']];
        }

        return $response;
    }

    public function add(&$calendarDay)
    {
        $response = $this->prepareData($calendarDay);
        $this->gantt->saveCalendarDay($calendarDay);
        return $response;
    }

    public function update(&$calendarDay)
    {
        $response = $this->prepareData($calendarDay);
        $this->gantt->saveCalendarDay($calendarDay);
        return $response;
    }

    public function remove($calendarDay)
    {
        $response = array();
        $this->gantt->removeCalendarDays($calendarDay);
        return $response;
    }
}
