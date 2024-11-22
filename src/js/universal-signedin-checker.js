/**
 * THIS FILE ASSUMES WE WILL HAVE THE FOLLOWING ON THE LOADED PAGE:
 * 
 * #profile-menu : Top right corner of a page, displaying username and id 
 */


$(document).ready(function() {
    console.log('ran');
    getSignedInUserInfo(
    /* data success */
    function(data) {
        $('#profile-menu').text(data.username + ' (' + data.userId + ')');
    },
    /* data error */
    function() {
        $('#profile-menu').text('Logged Out');
    },
    /* error */
    function() {
        $('#profile-menu').text('Logged Out');
    })
})