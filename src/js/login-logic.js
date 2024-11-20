$(document).ready(function() {
    /* Handle Form Submissions, this could be for signin, signup, and signout actions.
       This will grab and serialize the data from the form that was submitted  */
    $(document).on('submit', 'form', function(event) {
        event.preventDefault();
        form = $(this);
        action = form.attr('action');
        formData = form.serialize();
        
        $.ajax({
            url: '../php/api.php',
            method: 'POST',
            data: formData,
            dataType: 'json',
            success: function(data) {
                if (data.success) {
                    console.log('Successful action:');
                }
                else {
                    console.log('Successful Action but error in back-end with action |' + action + '|   Error: ' + data.error);
                }
            },
            error: function(jqXHR, status, error) {
                console.log('Error Triggered in API Action Handler: ' + error);
                console.log(jqXHR);
            },
        })
        location.reload(true);
    })

    /*On Page Load/Reload, check if we are signed in */
    $.ajax({
        url: '../php/api.php',
        method: 'POST',
        data: {'action':'get-signin'},
        dataType: 'json',
        success: function(data) {
            if (data.success) {
                sessionStorage.signedIn = true; 
                sessionStorage.username = data.username;
                sessionStorage.userId = data.userId;
                console.log('Successfully Signed In');
                toggleUserSession();
            }
            else {
                signoutUser();
                toggleUserSession();
                console.log(data.error);
            }
        },
        error: function(jqXHR, status, error) {
            console.log('Error getting sign in information: ' + error);
            console.log(jqXHR);
            signoutUser();
            toggleUserSession();
        },
    })

})

/**
 * Update sessionStorage values to sign a user out, and remove the information.
 */
function signoutUser() {
    sessionStorage.signedIn = false; 
    sessionStorage.username = 'null';
    sessionStorage.userId = 'null';
}
/**
 * In the Login Info page, *IF* the user is signed in
 * 1. Hide the sign-in and sign-up containers 
 * 2. Display the sign-out button
 * 3. Display a welcome message in the welcome-container 
 */
function toggleUserSession() {
    if (sessionStorage.signedIn === 'true') {
        $('#signin-container').addClass('hidden');
        $('#signup-container').addClass('hidden');
        $('#signout-container').removeClass('hidden');
        /* Now add the welcome message to the welcome-container */
        $('#welcome-container').append('<h2>Welcome ' + sessionStorage.username + ' (' + sessionStorage.userId + ') !</h2>')
    }
    else {
        $('signin-container').removeClass('hidden');
        $('signin-container').removeClass('hidden');
        $('#signout-container').removeClass('hidden');
        /* Empty the welcome message container */
        $('#welcome-container').empty();
    }
}