<?php

require 'UploadException.php';

try {

    if (!$_FILES['mpp-file']) {
        throw new Exception('Upload failed, probably the upload request exceeds the maximum allowed size');
    }

    if ($_FILES['mpp-file']['error'] !== UPLOAD_ERR_OK) {
        throw new Bryntum\UploadException($_FILES['mpp-file']['error']);
    }

    $file_tmp   = $_FILES['mpp-file']['tmp_name'];

    if (!is_uploaded_file($file_tmp)) {
        throw new Exception('Upload failed.');
    }

    $dir        = dirname(__FILE__);
    $move_path  = $dir .'/tmp/';

    if (!is_dir($move_path)) {
        throw new Exception('No such directory exists.');
    }

    $move_path .= $_FILES['mpp-file']['name'];

    if (!move_uploaded_file($file_tmp, $move_path)) {
        throw new Exception('Cannot save file. Please verify, that web-server user account has write permission to '. $move_path);
    }


    $json = shell_exec('java -jar '. escapeshellarg($dir.'/msprojectreader/dist/msprojectreader.jar') .' '. escapeshellarg($move_path) .' 1');

    if (!$json) {
        throw new Exception('Could not process uploaded file.');
    }

    // cleanup copied file
    unlink($move_path);

    echo '{"success": true, "data": '.$json.'}';

} catch (Exception $e) {

    header('Content-Type: application/json; charset=utf-8');

    die(json_encode(array(
        'success'   => false,
        'msg'       => $e->getMessage()
    )));

}
