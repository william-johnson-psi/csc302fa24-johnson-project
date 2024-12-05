<?php
/*
File: api.php
Author: William Johnson
Date: N/A

The API for our web app, await incoming actions and perform the necessary chores when 
a certain action is received. Includes helpful signin, signout functions that change the 
PHP Session Storage. 
*/

require_once('db.php');

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
    /**
     * All JSON returns will have a object of 'success' => (boolean)
     */
    if ($action == 'signup') {
        // Salted Hash of Password using BCRYPT Algorithm 
        // Salted means adds random strings to the password, then encrypts with BCRYPT
        $saltedHash = password_hash($_POST['password'], PASSWORD_BCRYPT);
        echo json_encode(signup($_POST['username'], $saltedHash, $_POST['email']));
    } else if ($action == 'signin') {
        // Sign the user in, this FN is from db.php
        echo json_encode(signin($_POST));
    } else if ($action == 'signout') {
        echo json_encode(signout());
    } else if ($action == 'get-signin') {
        echo json_encode(signedInOrDie());
    } else if ($action == 'save-nonogram') {
        echo json_encode(saveNonogram($_SESSION['userId'], $_POST['ngName'] ,$_POST['rows'], $_POST['cols'], $_POST['ngData']));
    } else if ($action == 'get-nonogram') {
        echo json_encode(getNonogram($_POST['ngId']));
    } else if ($action == 'delete-nonogram') {
        echo json_encode(deleteNonogram($_POST['ngId']));
    } else if ($action == 'get-nonogram-list') {
        echo json_encode(getNonogramList());
    }
}

function signedInOrDie() {
    if (array_key_exists('signed-in', $_SESSION) && $_SESSION['signed-in']) {
        return [
            'success' => true, 
            'username' => $_SESSION['username'], 
            'userId' => $_SESSION['userId']
        ]; 
    } else {
        http_response_code(401);
        die(json_encode([
            'success' => false, 
            'error' => 'You must be signed in to perform this action'
        ]));
    }
}
/**
 * This is how we authenticate the password of our user, 
 * return true if successfully authenticated,
 * otherwise, kill the process and success state of false 
 * @param array $data
 */
function authenticateOrDie($data) {
    $userInfo = getUserByUsername($data['username']); 

    if ($userInfo['success'] && password_verify($data['password'], $userInfo['password'])) {
        return true;
    } 
    else {
        http_response_code(401); 
        die(json_encode([
            'success' => false,
            'error' => 'Invalid username or password'
        ]));
    }
}

/**
 * Authenticates input credentials and signs the user in. 
 * @param array-key $data Most likely will be passed in as a $_POST super global 
 * 
 * @return array ['success' => true] or ['success' => false] 
 */
function signin($data) {
    authenticateOrDie($_POST);
    $userInfo = getUserByUsername($data['username']);
    $_SESSION['signed-in'] = true; 
    $_SESSION['userId'] = $userInfo['id'];
    $_SESSION['username'] = $userInfo['username'];
    return ['success' => true];
}

/**
 * Modify $_SESSION, to sign the user out of Nonogrammer.
 */
function signOut() {
    $_SESSION['signed-in'] = false; 
    $_SESSION['userId'] = 'null';
    $_SESSION['username'] = 'null'; 
    return ['success' => true];
}
?>