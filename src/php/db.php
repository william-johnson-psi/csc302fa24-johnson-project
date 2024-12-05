<?php
/*
File: db.php
Author: William Johnson
Date: N/A

Manages our database for us. Contains all essential functions for data transfer between 
saving, and creating Nonograms/Users. As well as affirming our user is signed in. 
*/

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

/**
 * Create tables if not already created for this web app
 */
function createTables() {
    global $dbh;
    
    // Creating our table of users
    try{
    $dbh->exec('create table if not exists Users('.
        'id integer primary key autoincrement, '.
        'username text UNIQUE, '.
        'password text, '.
        'email text, '.
        'createdAt datetime default(datetime()), '.
        'updatedAt dateTime default(dateTime()))');
    } catch(PDOException $e) {
        echo "Error creating Users table: ".$e;
    }

    // Creating Nonogram Table 
    try {
        $dbh->exec('create table if not exists Nonograms('.
            'id integer primary key autoincrement, '.
            'userId integer, '.
            'name text, '.
            'nonogramData text, '.
            'rows integer, '.
            'cols integer, '.
            'createdAt datetime default(datetime()), '.
            'updatedAt dateTime default(dateTime()), '.
            'foreign key (userId) references Users(id))');
    } catch(PDOException $e) {
        echo "Error creating Nonograms table: ".$e; 
    }
}

/**
 * Signup a new user and add them to the database. 
 * 
 * @param string $username Username to add to DB. 
 * @param string $saltedPassword Salted Hashed Password to add to DB 
 * 
 * @return array {"success": true, "id": <id of new user>} or 
 *    {"success": false, "error": <error message>} 
 */

function signup($username, $saltedPassword, $email) {
    global $dbh; 
    $id = null; 
    try {
        /* Prepare statement for execution */
        $statement = $dbh->prepare('insert into Users(username, password, email) '.
            'values (:username, :password, :email)');
        /* Start inserting username and password params */
        $statement->execute([
            ':username' => $username, 
            ':password' => $saltedPassword,
            ':email' => $email
        ]);
        /* This grabs the last id that was inserted into DB */
        $id = $dbh->lastInsertId();
    } catch(PDOException $e) {
        /* Return an error if we did not add user successfully */
        return createError('Error signing up new user: '.$e);
    }

    /* We added our user, report the success and pass in the id too */ 
    return [
        'success' => true,
        'id' => $id
    ];
}

/**
 * Retrieve user information by their username in SQL DB.
 * 
 * @param string $username
 * @return array-key
 */
function getUserByUsername($username) {
    global $dbh;
    $userData = null; 
    try {
        $statement = $dbh->prepare('select * from Users where username = :username');
        $statement->execute([
            ':username' => $username
        ]);
        /* ASSOC means Associative Array  */
        /* Fetch our PHP data object, and put it in this associative array */
        $userData = $statement->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return createError('Error retrieving user. Did you enter the correct username?: '.$e);
    }

    /* We don't need to create and return a new array since userData is also an associative array */
    $userData['success'] = true; 
    return $userData;
}

/**
 * Save Nonogram Data to the DB 
 * 
 * @param int $userId User id of the user who saved this nonogram.
 * @param int $rows Amount of rows in nonogram 
 * @param int $cols Amount of cols in nonogram 
 * @param string $ngData Nonogram Data formatted like this. '0' = filled, '-'= blank.  : 00--0-0-0---000----000-0-0-00--
 * 
 * @return array-key ['success' => true] or ['success' => false, 'error' => 'message']
 */
function saveNonogram($userId, $name, $rows, $cols, $ngData) {
    global $dbh; 
    try {
        $statement = $dbh->prepare('insert into Nonograms(userId, name, nonogramData, rows, cols) '.
            'values (:userId, :name, :nonogramData, :rows, :cols)');
        $statement->execute([
            ':userId' => $userId,
            ':name' => $name,
            ':nonogramData' => $ngData, 
            ':rows' => $rows, 
            ':cols' => $cols,
        ]);
    } catch (PDOException $e) {
        return createError('Error saving nonogram');
    }
    return ['success' => true];
}

/**
 * Grab a list of nonograms created by the requesting user, each must match the $_SESSION userId
 * 
 * 
 */

/**
 * Grab the Nonogram by it's id, also make sure that the user ID of the Nonogram matches the one stored in $_SESSION
 * 
 * @param int $ngId The ID of the Nonogram we want to grab. 
 * 
 * @return array-key Associative Array of Nonogram Data, with success boolean. OR error message 
 */
function getNonogramList() {
    global $dbh; 
    try {
        $statement = $dbh->prepare('select * from Nonograms where userId = :userId');
        $statement->execute([
            ':userId' => $_SESSION['userId']
        ]); 
        $nonogramList = $statement->fetchAll(PDO::FETCH_ASSOC); 
    } catch (PDOException $e) {
        return createError("Error grabbing list of Nonograms");
    }
    $nonogramList['length'] = count($nonogramList);
    $nonogramList['success'] = true;
    return $nonogramList;

}
function getNonogram($ngId) {
    global $dbh; 
    try {
        $statement = $dbh->prepare('select * from Nonograms where id = :ngId');
        $statement->execute([
            ':ngId' => $ngId
        ]);
        $nonogramData = $statement->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return createError("Error retrieving nonogram");
    }

    /* Check if userId matches that of the Nonogram we grabbed, else unauthorized */
    if ($nonogramData['userId'] != $_SESSION['userId']) {
        http_response_code(401);
        return createError("Unauthorized to open requested nonogram");
    }

    $nonogramData["success"] = true; 
    return $nonogramData;
}

function deleteNonogram($ngId) {
    global $dbh; 
    /* I first want to get the requested nonogram for deletion, 
    and see if it's creator's userId, matches the logged in userId */
    $nonogramData = getNonogram($ngId);
    /* See if retrieving nonogram was successful */
    if (!$nonogramData["success"]) {
        return createError("Error retrieving Nonogram");
    }
    /* Ensure retrieved ngData userId, matches logged in user's Id */
    if ($nonogramData['userId'] != $_SESSION['userId']) {
        http_response_code(401); 
        return createError("Unauthorized to delete requested nonogram");
    }

    /* We made it this far, so proceed with deletion */
    try {
        $statement = $dbh->prepare('delete from Nonograms where id = :ngId');
        $statement->execute([
            'ngId' => $ngId
        ]);
    } catch (PDOException $e) {
        return createError('Error with deleting Nonogram');
    }

    return ['success' => true];
}

/* Create our SQL Tables */
createTables();
?>