<?php
// Setting Database Filename 
$dbName = 'data.db';

// Checking if we have a directory named www-data in home directory. 
// It will either use the www-data folder in the digdug web server 
// OR use it in the current location 

$matches = []; 
preg_match('#^/~([^/]*)#', $_SERVER['REQUEST_URI'], $matches);
$homeDir = count($matches) > 1 ? $matches[1] : ''; 
$dataDir = "home/$homeDir/www-data";
if (!file_exists($dataDir)) {
    $dataDir = __DIR__;
}
$dbh = new PDO("sqlite:$dataDir/$dbName");

// Debug, allows raising of exceptions 
$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

/**
 * Creates and returns a formatted error message 
 * 
 * @param string $message
 * @return array Associative array with error message and success state. 
 */
function createError($message) {
    return [
        'success' => false,
        'error' => $message
    ];
}

?>