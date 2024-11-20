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
        'createdAt datetime default(datetime()), '.
        'updatedAt dateTime default(dateTime()))');
    } catch(PDOException $e) {
        echo "Error creating Users table: ".$e;
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

function signup($username, $saltedPassword) {
    global $dbh; 
    $id = null; 
    try {
        /* Prepare statement for execution */
        $statement = $dbh->prepare('insert into Users(username, password) '.
            'values (:username, :password)');
        /* Start inserting username and password params */
        $statement->execute([
            ':username' => $username, 
            ':password' => $saltedPassword
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


/* Create our SQL Tables */
createTables();
?>