/**
 * THIS FILE ASSUMES WE WILL HAVE THE FOLLOWING ON THE LOADED PAGE:
 * 
 * #profile-menu : Top right corner of a page, displaying username and id 
 * 
 * #btn-signout: Button to the top right corner, allowing user to sign out. 
 */


$(document).ready(function() {
    console.log('ran');
    getSignedInUserInfo(
    /* data success */
    function(data) {
        $('#profile-menu').text(data.username + ' (' + data.userId + ')');
        $('#btn-signout').removeClass('hidden');
    },
    /* data error */
    function() {
        $('#profile-menu').text('Logged Out');
        // homeIfLoggedOut(window.location.pathname);
    },
    /* error */
    function() {
        $('#profile-menu').text('Logged Out');
        // homeIfLoggedOut(window.location.pathname);
    }) 

    /* Click Listener for Signing Out */
    $(document).on('click', '#btn-signout', () => {
        $.ajax({
            url: 'php/api.php',
            method: 'POST',
            data: {action: 'signout'},
            dataType: 'json',
            success: function(data) {
                if (data.success) {
                    console.log('Successfully signed out');
                    window.location.reload();
                }
                else {
                    console.log('Issue with signing out: ' + data.error);
                }
            },
            error: function(jqXHR, status, error) {
                console.log('Error with requesting sign out: ' + error);
                console.log(jqXHR);
            }
        })
    })
})


// function homeIfLoggedOut(pathname) {
//     console.log(pathname);
//     if (!pathname.includes('index.html')) {
//         window.location.href = '/index.html';
//     }
// }