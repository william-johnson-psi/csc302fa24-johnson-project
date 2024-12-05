/*
File: saved-nonograms-logic.js
Author: William Johnson
Date: N/A

Request and load all nonograms into the table. The server will verify which user is logged in by itsself. 
Load the edit, play, and delete links too. 
*/

$(document).ready(function() {
    displayNonogramList();

    $(document).on('click', '#btn-delete', deleteNonogramEntry);
})

/**
 * Display all saved Nonograms and include actions to play, edit, and delete. 
 * 
 * PLAY - Redirects to ../pages/play-nonogram.html - with web parameters ngSuccessfullyLoaded=boolean, and ngId=int 
 * EDIT - Redirects to ../manual-creator.html - with web parameters isUsingSavedNG=boolean, and ngId=int 
 * DELETE - Make a request to the API to delete a Nonogram within the DB. 
 */
function displayNonogramList() {
    $.ajax({
        url: 'php/api.php',
        method: 'POST', 
        data: {action : 'get-nonogram-list'},
        dataType: 'json', 
        success: function(data) {
            if (data.success) {
                table = $('#saved-nonograms-table');
                for (var i = 0; i < data.length; i++) {
                    table.append('<tr id="object-' + data[i].id + '">');
                    curTableObject = $('#object-' + data[i].id);
                    curTableObject.append('<td><a href="manual-creator.html?isUsingSavedNG=true&ngId=' + data[i].id + '">' + data[i].name + '</a></td>');
                    curTableObject.append('<td id="ng-id">' + data[i].id + '</td>');
                    curTableObject.append('<td>' + data[i].rows + 'x' + data[i].cols + '</td>');
                    curTableObject.append('<td><a href="play-nonogram.html?ngSuccessfullyLoaded=true&ngId=' + data[i].id + '">PLAY' + '</a><span>  |  </span>' + 
                        '<a href="manual-creator.html?isUsingSavedNG=true&ngId=' + data[i].id + '">EDIT</a><span>  |  </span>' + 
                        '<a href="" id="btn-delete">DELETE</a>' +
                        '</td>'
                    );
                    table.append('</tr>');
                }    
            }
        },
        error: function(jqXHR, status, error) {
            console.log('Error in retrieving Nonogram list: ' + error)
            console.log(jqXHR);
        }
    })
}

function deleteNonogramEntry() {
    $.ajax({
        url: 'php/api.php',
        method: 'POST', 
        data: {
            action:'delete-nonogram',
            ngId:$($(this).parent().siblings()[1]).text() /* Access CLICKED <a> element, go to parent -> siblings -> ACCESS INDEX 1 ON TABLE ROW, Convert to JQUERY Element, get it's value */
        },
        dataType: 'json',
        success: function() {
        },
        error: function() {

        }
    })
}