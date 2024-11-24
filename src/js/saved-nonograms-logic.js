$(document).ready(function() {
    displayNonogramList();
})

function displayNonogramList() {
    $.ajax({
        url: '../php/api.php',
        method: 'POST', 
        data: {action : 'get-nonogram-list'},
        dataType: 'json', 
        success: function(data) {
            if (data.success) {
                table = $('#saved-nonograms-table');
                console.log(data);
                for (var i = 0; i < data.length; i++) {
                    table.append('<tr id="object-' + data[i].id + '">');
                    curTableObject = $('#object-' + data[i].id);
                    curTableObject.append('<td><a href="../pages/manual-creator.html?isUsingSavedNG=true&ngId=' + data[i].id + '">Placeholder Name </a></td>');
                    curTableObject.append('<td>' + data[i].id + '</td>');
                    curTableObject.append('<td>' + data[i].rows + 'x' + data[i].cols);
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