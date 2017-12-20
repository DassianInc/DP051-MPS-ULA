<?php

try {
    // initialize application
    include 'init.php';

    // decode request object
    $request = json_decode($_GET['q'], true);

    $response = array(
        'success'   => false,
        'requestId' => $request['requestId']
    );

    // get request parameters for the stores
    $storeParams = array();
    foreach ($request['stores'] as $store) {
        if (is_array($store)) {
            // keep request params for the store
            $storeParams[$store['storeId']] = $store;
        } else {
            $storeParams[$store] = $store;
        }
    }

    // if calendar manager was requested for loading
    if (isset($storeParams['calendars'])) {
        // get rows
        $calendars = &$app->getCalendars();
        $response['calendars'] = array(
            'rows'      => $calendars,
            // we return project calendar identifier in the metaData section for the store
            'metaData'  => array(
                'projectCalendar' => $app->getProjectCalendarId()
            )
        );
    }
    // if resource store was requested for loading
    if (isset($storeParams['resources'])) {
        $response['resources'] = array(
            // get rows
            'rows'  => $app->getResources(),
            // get total number of found resources
            'total' => $app->getFoundRows()
        );
    }
    // if assignment store was requested for loading
    if (isset($storeParams['assignments'])) {
        $response['assignments'] = array(
            // get rows
            'rows'  => $app->getAssignments(),
            // get total number of found assignments
            'total' => $app->getFoundRows()
        );
    }
    // if dependency store was requested for loading
    if (isset($storeParams['dependencies'])) {
        $response['dependencies'] = array(
            // get rows
            'rows'  => $app->getDependencies(),
            // get total number of found dependencies
            'total' => $app->getFoundRows()
        );
    }
    // if task store was requested for loading
    if (isset($storeParams['tasks'])) {
        $response['tasks'] = array(
            // get rows
            'rows'  => $app->getTasks()
        );
    }

    $response['success'] = true;
    // return server revision mark
    $response['revision'] = $app->getRevision();
    die(json_encode($response));

// handle exceptions gracefully
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
    $response['code'] = $e->getCode();
    die(json_encode($response));
}
