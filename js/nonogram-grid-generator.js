minRowCols = 5;
maxRowCols = 50;

$(document).ready(function() {
    /* Handle changes in Row Col Input, we want Row and Col inputs to ALWAYS be equal to each-other. */
    $(document).on('input', '#nonogram-gen-rows', updateColInput);
    $(document).on('input', '#nonogram-gen-cols', updateRowInput);
    
    /* Handle Submit Button, then generating empty grid. */ 
    $(document).on('click', '#gen-nonogram-btn', generateEmptyGrid);
})


/**
 * When a Row Input is changed, set the Col Input to the Row Input 
 */
function updateColInput() {
    $('#nonogram-gen-cols').val($('#nonogram-gen-rows').val());
}

/**
 * When a Col Input is changed, set the Row Input to the Col Input
 */
function updateRowInput() {
    $('#nonogram-gen-rows').val($('#nonogram-gen-cols').val());
}

/**
 * If any input field violates Min/Maxes of Nonogram Input Fields, return a tuple. Refer below for more information
 * 
 * Return Value:
 *    [boolean, 0 or 1 or null] - 
 *    Item 0: 
 *        True/False whether if violation was found
 *    Item 1: 
 *        0 if it is a RowCol Min violation, 
 *        1 if it is a RowCol Max violation. 
 *        null if no violation found.
 *
 */
function checkMinMaxViolations() {
    row = $('#nonogram-gen-rows');
    col = $('#nonogram-gen-cols');
    if (row.val() < minRowCols || col.val() < minRowCols) {
        return [true, 0];
    }
    if (row.val() > maxRowCols || col.val() > maxRowCols) {
        return [true, 1];
    }
    return [false, null];
}

/**
 * With Row and Col Inputs #nonogram-gen-rows and #nonogram-gen-cols, append a grid layout to website
 */
function generateEmptyGrid() {
    /* Set Grid */
    grid = $('#tile-grid-cells');
    /* Get Row Col Amount from Input Fields in HTML File */ 
    violationChecker = checkMinMaxViolations();
    if (violationChecker[0]) {
        switch(violationChecker[1]) {
            case 0:
                rowAmount = 5;
                colAmount = 5;
                alert("Minimum Row/Col Value must be 5 or greater.\nAutomatically Setting Values to 5.");
                break;
            case 1:
                rowAmount = 50;
                colAmount = 50;
                alert("Maximum Row/Col Value mus tbe 50 or lower.\nAutomatically Setting Values to 50.");
                break;
        }
    }
    else {
        rowAmount = $('#nonogram-gen-rows').val();
        colAmount = $('#nonogram-gen-cols').val();
    }
    /* Clear Grid of all TD and TR */
    grid.empty(); 
    for (var i = 0; i < rowAmount; i++) {
        /* Create Row with ID */
        grid.append('<tr id="row-' + i + '">');
        for (var v = 0; v < colAmount; v++) {
            /* Append Cols to the Row we just created */
            $('#row-' + i).append('<td id="row-' + i + 'col-' + v + '" class="cell"></td>');
        }
        /* Close Row */
        grid.append('</tr>');
    }
}