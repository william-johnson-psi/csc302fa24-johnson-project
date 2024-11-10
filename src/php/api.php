<?php
// Interpret outputs as JSON 
header('Content-type: application/json');
//  Allows access to session information
session_start();

// Debugging 
error_reporting(E_ALL);
ini_set('display errors', '1');

// Get/Run database 
require_once('db.php');


if (array_key_exists('action', $_POST)) {
    $action = $_POST['action']; 

    if ($action == 'signup') {
        // Salted Hash of Password using BCRYPT Algorithm 
        // Salted means adds random strings to the password, then encrypts with BCRYPT
        $saltedHash = password_hash($_POST['password'], PASSWORD_BCRYPT);
        echo json_encode(createUser($_POST['username'], $saltedHash));
    }
}

?>