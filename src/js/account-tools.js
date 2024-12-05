/*
File: account-tools.js
Author: William Johnson
Date: N/A

Gives us access to some account helper functions we can use universal on all pages.
*/


/**
 * THIS FILE SERVES AS A HUB FOR ALL FUNCTIONS RELATED TO GRABBING/USING ACCOUNT INFORMATION
 * 
 * NOTE THAT USER CREATION ONLY HAPPENS IN login-logic.js  
 * 
 * THE FUNCTIONS IN THIS FILE HANDLES EVERYTHING ELSE 
 * 
 */




/**
 * Grab the signed in user info, and pass it to the functions given  
 * 
 * Each object passed will have a 'success:boolean', use this to decide what to do with the received data.
 * 
 *      false indicates that the user is not signed in or there was an issue grabbing that information
 *      true indicates that the user is signed in, and you will have access to the information from the API
 * 
 * {data} will be passed to each given function, so be aware of this when creating a new function or lambda.
 * 
 * @param {function} dataSuccessFunction 
 * @param {function} dataErrorFunction 
 * @param {function} errorFunction 
 */
function getSignedInUserInfo(dataSuccessFunction, dataErrorFunction, errorFunction) {
    $.ajax({
        url: 'php/api.php',
        method: 'POST',
        data: {'action':'get-signin'},
        dataType: 'json',
        success: function(data) {
            if (data.success) {
                console.log('Grabbed User Info');
                dataSuccessFunction(data);
            }
            else {
                console.log(data.error);
                dataErrorFunction(data);
            }
        },
        error: function(jqXHR, status, error) {
            console.log('Error getting sign in information: ' + error);
            errorFunction({success:false});
            console.log(jqXHR);
        },
    })    
}
