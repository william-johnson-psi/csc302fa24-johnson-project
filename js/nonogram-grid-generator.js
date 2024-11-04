minRowCols = 5;
maxRowCols = 50;

$(document).ready(function() {
    /* Handle changes in Row Col Input, we want Row and Col inputs to ALWAYS be equal to each-other. */
    $(document).on('input', '#nonogram-gen-rows', updateColInput);
    $(document).on('input', '#nonogram-gen-cols', updateRowInput);
    
    /* Handle Submit Button, then generating empty grid. */ 
    $(document).on('click', '#gen-nonogram-btn', updateInputRowsCols);

    /* For Nonogram Creatiion, Handle Filling, X'ing, or Erasing Cells */ 
    $(document).on('click', '.cell', changeCell);
    /* Generate Grid */
    initGridPageLoad();

})




/**
 * Update Row/Col Inputs in the Session Storage.
 */
function updateInputRowsCols() {
    sessionStorage.inputRows = $('#nonogram-gen-rows').val();
    sessionStorage.inputCols = $('#nonogram-gen-cols').val();
}


/**
 * On Page Load, load default tile grid (5x5) or last submitted from sessionStorage
 */
function initGridPageLoad() {
    if (sessionStorage.inputRows === undefined || sessionStorage.inputCols === undefined) {
        sessionStorage.inputRows = 5;
        sessionStorage.inputCols = 5; 
    }

    /* Remember last used values for input boxes */
    $('#nonogram-gen-rows').val(sessionStorage.inputRows);
    $('#nonogram-gen-cols').val(sessionStorage.inputCols);
    generateEmptyGrid(sessionStorage.inputRows, sessionStorage.inputCols);
}


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
 * Modify Cell and change to either Filled, X'd, or Blank, in this respecive order.
 * 
 */
function changeCell() {
    curCell = $(this);
    if (curCell.hasClass("cell-blank")) {
        curCell.removeClass("cell-blank");
        curCell.addClass("cell-filled");
        return; 
    }

    if (curCell.hasClass("cell-filled")) {
        curCell.removeClass("cell-filled");
        curCell.addClass("cell-crossed");
        curCell.text('X');
        return;
    }

    if (curCell.hasClass("cell-crossed")) {
        curCell.removeClass("cell-crossed");
        curCell.addClass("cell-blank");
        curCell.text('');
        return;
    }
}

/**
 * With Row and Col Inputs #nonogram-gen-rows and #nonogram-gen-cols, append a grid layout to website
 * 
 * Parameters:
 *     rows : the amount of rows to create in nonogram
 *     cols : the amoutn of cols to create in nonogram.
 */
function generateEmptyGrid(rows, cols) {
    /* Set Grid */
    grid = $('#tile-grid-cells');
    /* Get Row Col Amount from Input Fields in HTML File */ 
    violationChecker = checkMinMaxViolations();
    if (violationChecker[0]) {
        switch(violationChecker[1]) {
            case 0:
                rows = 5;
                cols = 5;
                alert("Minimum Row/Col Value must be 5 or greater.\nAutomatically Setting Values to 5.");
                break;
            case 1:
                rows = 50;
                cols = 50;
                alert("Maximum Row/Col Value mus tbe 50 or lower.\nAutomatically Setting Values to 50.");
                break;
        }
    }
    /* Clear Grid of all TD and TR */
    grid.empty(); 

    /* Before creating rows, establish row of col data cells */
    grid.append('<tr id="column-data-cells">')
    /* Adding an empty table data to align rows/cols properly, because in HTML the row data cells can mess up the alignment */
    grid.append('<td></td>');
    for (var i = 0; i < cols; i++) {
        grid.append('<td id="data-cell-col-' + i + '" class="cell-data-col"></td>');
    }
    grid.append('</tr>');


    /* Here, we create the data-cell-rows as well as the rows of the grid themselves.*/
    for (var i = 0; i < rows; i++) {
        /* Create Row with ID */
        grid.append('<tr id="row-' + i + '">');
        /* Init Cur Row to Append to */
        curRow = $('#row-' + i);
        /* Add Data Cell at Beginning */
        curRow.append('<td class="cell-data-row" id="data-cell-row-' + i + '"></td>');
        for (var v = 0; v < cols; v++) {
            /* Append Cols to the Row we just created */
            curRow.append('<td id="row-' + i + 'col-' + v + '" class="cell cell-blank"></td>');
        }
        /* Close Row */
        grid.append('</tr>');
    }
}