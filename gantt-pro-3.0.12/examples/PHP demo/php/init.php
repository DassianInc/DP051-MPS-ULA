<?php

namespace Bryntum\Gantt;

// 4hrs
ini_set('session.gc_maxlifetime', 14400);

if (!session_id()) {
    session_start();
}

require 'config.php';

function autoload($class)
{
    $file = dirname(__FILE__).'/'.str_replace('\\', '/', $class).'.php';
    if (file_exists($file)) {
        //echo "\n".$file;
        require_once $file;
    }
}

spl_autoload_register('Bryntum\Gantt\autoload');

$app = new Gantt(DSN, DBUSERNAME, DBUSERPASSWORD);
if (!$app) {
    die('{ success: false, error : "Database connecting error" }');
}
