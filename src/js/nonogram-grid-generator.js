/*
File: nonogram-grid-generator.js
Author: William Johnson
Date: N/A

For manual-creator.html, allows the generation of a pre-made or empty grid. 
The nonogram can then be modified, and saved to the DB, so long as the user is 
logged in.
*/

minRowCols = 5;
maxRowCols = 50;
curMode = 0; /* 0 = fill, 1 = cross, 2 = erase*/
$(document).ready(function() {
    /* Handle changes in Row Col Input, we want Row and Col inputs to ALWAYS be equal to each-other. */
    $(document).on('input', '#nonogram-gen-rows', updateColInput);
    $(document).on('input', '#nonogram-gen-cols', updateRowInput);
    
    /* Handle Submit Button, then generating empty grid. */ 
    $(document).on('click', '#gen-nonogram-btn', updateInputRowsCols);
    /* Handle Saving Raw Nonogram Data */ 
    $(document).on('click', '#save-nonogram-btn', saveNonogram);
    /* Click Listeners for mode buttons */
    $(document).on('click', '#btn-fill', () => changeMode(0, '#btn-fill', '#btn-cross', '#btn-erase'));
    $(document).on('click', '#btn-cross', () => changeMode(1, '#btn-cross', '#btn-fill', '#btn-erase'));
    $(document).on('click', '#btn-erase', () => changeMode(2, '#btn-erase', '#btn-fill', '#btn-cross'));
    /* For Nonogram Creation, Handle Filling, X'ing, or Erasing Cells */ 
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
 * On Page Load, load default tile grid (5x5) or last submitted  row/col size from sessionStorage
 * OR, load requested saved Nonogram for user editting. 
 */
function initGridPageLoad() {
    urlGetParams = new URLSearchParams(window.location.search); 
    if ((urlGetParams.get('isUsingSavedNG') != null) && (urlGetParams.get('ngId') != null)) {
        $.ajax({
            url: 'php/api.php',
            method: 'POST', 
            data: {action:'get-nonogram', ngId : urlGetParams.get('ngId')},
            dataType: 'json',
            success: function(data) {
                if (data.success) {
                    sessionStorage.inputRows = data.rows;
                    sessionStorage.inputCols = data.cols;
                    generateGivenGrid(data);
                }
                else {
                    console.log('Error with retrieving Nonogram');
                }
            },
            error: function(jqXHR, status, error) {
                console.log('Error retrieving Nonogram: ' + error)
                console.log(jqXHR);
            }
        })
    }
    else {
        if (sessionStorage.inputRows === undefined || sessionStorage.inputCols === undefined) {
            sessionStorage.inputRows = 5;
            sessionStorage.inputCols = 5; 
        }
        /* Remember last used values for input boxes */
        $('#nonogram-gen-rows').val(sessionStorage.inputRows);
        $('#nonogram-gen-cols').val(sessionStorage.inputCols);
        generateEmptyGrid(sessionStorage.inputRows, sessionStorage.inputCols);    
    }

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
 * @returns {Array.<{0: boolean, 2: number}>}
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
 * Also, update all data cell
 * 
 */
function changeCell() {
    curCell = $(this);
    switch(curMode) {
        case 0:
            curCell.removeClass('cell-blank');
            curCell.removeClass('cell-crossed');
            curCell.addClass('cell-filled');
            curCell.text('');
            updateDataCells();
            return;
        case 1:
            curCell.removeClass('cell-blank');
            curCell.removeClass('cell-filled');
            curCell.addClass('cell-crossed');
            curCell.text('X');
            updateDataCells();
            return;
        case 2:
            curCell.removeClass('cell-filled');
            curCell.removeClass('cell-crossed');
            curCell.addClass('cell-blank');
            curCell.text('');
            updateDataCells();
            return;
    }
}


function changeMode(mode, on_btn_id, off_btn_id_one,off_btn_id_two) {
    curMode = mode; 

    $(on_btn_id).removeClass("mode-btn-unselected"); 
    $(on_btn_id).addClass("mode-btn-selected");

    $(off_btn_id_one).removeClass("mode-btn-selected");
    $(off_btn_id_one).addClass("mode-btn-unselected");

    $(off_btn_id_two).removeClass("mode-btn-selected");
    $(off_btn_id_two).addClass("mode-btn-unselected");
}


/**
 * With Row and Col Inputs #nonogram-gen-rows and #nonogram-gen-cols, append a grid layout to website
 * 
 *
 * @param {number} rows : the amount of rows to create in nonogram
 * @param {number} cols : the amount of cols to create in nonogram.
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
    grid.append('<td style="background-color:white;"></td>');
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
            /* Append Cells to the Row we just created */
            curRow.append('<td id="row-' + i + 'col-' + v + '" class="cell cell-blank"></td>');
        }
        /* Close Row */
        grid.append('</tr>');
    }
}

/**
 * With data being collected from the database, append the given grid layout to the website.
 * NOTE: data structure for ngData: 
 *      int id, int userID, string nonogramData, int rows, int cols, string createdAt, string updatedAt
 * 
 * @param {array} ngData Nonogram data retrieved from the database. 
 */
function generateGivenGrid(ngData) {
    /* Set Grid*/
    grid = $('#tile-grid-cells'); 
    /* This keeps track of the index we are on in our nonogramData */
    curCharIndex = 0;
    /* Clear Grid of all TD and TR*/
    grid.empty();

    /* Establish row of col data cells */
    grid.append('<tr id="column-data-cells>');
    /* Add empty table data to align rows/cols properly*/
    grid.append('<td style="background-color:white;"></td>');
    /* TODO, fix redundant code, some of this code is in generateEmptyGrid, at this point just make a function */
    for (var i = 0; i < ngData.cols; i++) {
        grid.append('<td id="data-cell-col-' + i + '" class="cell-data-col"></td>');
    }
    grid.append ('<tr>');

    /* Create data cell rows and some of the rows of the grid themselves */
    for (var i = 0; i < ngData.rows; i++) {
        /* Create Row with ID */
        grid.append('<tr id="row-' + i + '">');
        /* Init Cur Row to Append to */
        curRow = $('#row-' + i);
        /* Add Data Cell at Beginning */
        curRow.append('<td class="cell-data-row" id="data-cell-row-' + i + '"></td>');
        for (var v = 0; v < ngData.cols; v++) {
            /* Append Cells to the Row we just created */
            /* This is where we use our NG data to decide whether or not it's filled/not filled  */ 
            if (ngData.nonogramData[curCharIndex] == '0') {
                curRow.append('<td id="row-' + i + 'col-' + v + '" class="cell cell-filled"></td>');
            } else {
                curRow.append('<td id="row-' + i + 'col-' + v + '" class="cell cell-blank"></td>');
            }
            curCharIndex += 1;
        }
        /* Close Row */
        grid.append('</tr>');
    }
    updateDataCells();
}
/**
 * For creating a Nonogram, update *ALL* data cells with their respective values.    
 */
function updateDataCells() {
    rows = sessionStorage.inputRows;
    cols = sessionStorage.inputCols;
    curDataCell = null; 
    /* Let's start with updating row data cells */ 
    for (var i = 0; i < rows; i++) {        
        curDataCell = $('#data-cell-row-' + i);
        curDataCell.text(buildRowSequenceString(getRowSequence(i)));
    }

    /* Now update col cells */ 
    for (var i = 0; i < cols; i++) {
        curDataCell = $('#data-cell-col-' + i);
        curDataCell.text(buildColSequenceString(getColSequence(i))); 
    }
}


/**
 * Given a data-row-cell sequence, return a formatted string for the cell
 * Input will typically look like this: [2, 1 3] 
 * 
 * 
 * @param {Array.<number>} sequence: Sequence of ints in an array, you can use getRowSequence for this parameter. 
 * 
 * 
 * @returns {string} Formatted string, could look like "5 4 9 7 20"
 */
function buildRowSequenceString(sequence) {
    /* The string to display on the data cell, we will build this as the fn runs */
    formattedString = "";
    for (var i = 0; i < sequence.length; i++) {
        if (i == (sequence.length-1)) {
            formattedString += sequence[i];
        }
        else {
            formattedString += sequence[i] + " ";
        }
    }
    return formattedString;
}

/**
 * Given a data-row-cell sequence, return a formatted string for the cell
 * Input will typically look like this: [2, 1 3]
 * 
 * 
 * @param {Array.<number>} sequence: Sequence of ints in an array, you can use getColSequence for this parameter. 
 * 
 * 
 * @returns {string} Formatted string, could look like "5\n4\n9\n7\n20"
 */
function buildColSequenceString(sequence) {
    formattedString = "" 
    for (var i = 0; i < sequence.length; i++) {
        if (i == (sequence.length-1)) {
            formattedString += sequence[i];
        }
        else {
            formattedString += sequence[i] + '\n';
        }
    }
    return formattedString;
}

/**
 * Given a row number, find the sequence of filled cells in that row 
 * 
 * 
 * @param {number} row: A row index that is used to access a specific row in our grid structure.
 * 
 * 
 * @returns {Array.<number>} Array of Ints (i.e [20, 4, 7])
 */
function getRowSequence(row) {
    /* Getting current RowCol values */
    cols = sessionStorage.getItem('inputRows');
    /* Sequence of shaded cells will be updated as we go throught the row*/
    sequence = []; 
    /* This tracks the current sequence of adjacent shaded cells */
    curShadedCells = 0; 
    /* The current cell we are reviewing, and whether or not it's shaded */
    curCell = null;
    isShaded = false; 

    /* Go through the single row */
    for (var i = 0; i < cols; i++) {
        curCell = $('#row-' + row + 'col-' + i);
        /* If shaded, add on to the currently tracked adjacent cells total*/
        if (curCell.hasClass("cell-filled")) {
            curShadedCells += 1; 
            /* Check to see if we are on the last cell of the row, if so push to sequence because we are done.*/
            if (i == cols-1) {
                sequence.push(curShadedCells);
            }
        }
        /* We didn't find a shaded cell, push to the sequence if adjacent cells total is larger than zero, and reset */
        else if (curShadedCells != 0) {
            sequence.push(curShadedCells);
            curShadedCells = 0;
        }
    }
    
    return sequence;
}

/**
 * Given a col number, find the sequence of filled cells in that column
 * 
 * 
 * @param {number} col: A col index that is used to access a specific col in our grid structure. 
 * 
 * 
 * @returns {Array.<number>} Array of Ints (i.e [20, 4, 7])
 */
function getColSequence(col) {
    /* Getting current RowCol values */
    rows = sessionStorage.getItem('inputRows');
    /* Sequence of shaded cells will be updated as we go throught the row*/
    sequence = []; 
    /* This tracks the current sequence of adjacent shaded cells */
    curShadedCells = 0; 
    /* The current cell we are reviewing, and whether or not it's shaded */
    curCell = null;
    isShaded = false; 

    /* Go through the single row */
    for (var i = 0; i < rows; i++) {
        curCell = $('#row-' + i + 'col-' + col);
        isShaded = curCell.hasClass("cell-filled");
        /* If shaded, add on to the currently tracked adjacent cells total*/
        if (isShaded) {
            curShadedCells += 1; 
            /* Check to see if we are on the last cell of the row, if so push to sequence because we are done.*/
            if (i == rows-1) {
                sequence.push(curShadedCells);
            }
        }
        /* We didn't find a shaded cell, push to the sequence if adjacent cells total is larger than zero, and reset */
        else if (curShadedCells != 0) {
            sequence.push(curShadedCells);
            curShadedCells = 0;
        }
    }
    return sequence;
}

/**
 * Make a request to the API to save the present Nonogram to User. 
 */
function saveNonogram() {
    rawNonogramData = getNonogramData();
    console.log($('#name-nonogram-btn').val());
    userData = {
        action: 'save-nonogram',
        rows: rawNonogramData.rows,
        cols: rawNonogramData.cols, 
        ngData: rawNonogramData.nonogramData,
        ngName: $('#name-nonogram-btn').val()
    }
    $.ajax({
        url: 'php/api.php',
        method: 'POST', 
        data: userData,
        dataType: 'json',
        success: function(data) {
            if (data.success) {
                console.log('Nonogram Data successfully saved');
            }
            else {
                console.log('Nonogram data could not be saved');
            }
        },
        error: function(jqXHR, status, error) {
            console.log('Error when attempting to save Nonogram data: ' + error);
            console.log(jqXHR);
        }
    })
}


/**
 * Get the nonogram data in one long string and tell us how many rows/columns are in it as well.
 * 
 * Raw nonogram data will just be organized this:  0--00-00-00----00-0---00--00000--0-00--
 * Where 0 = filled cell, - = empty cell 
 * In an alogrithm that parses this, I imagine we would divvy our for loops based off the given rows/cols. 
 * 
 * @returns {array-key} {nonogram-data: string, rows: int, cols: int}
 * 
 */
function getNonogramData() {
    ngData = ''; 
    curCell = null;
    for (var i = 0; i < sessionStorage.inputRows; i++) {
        for (var v = 0; v < sessionStorage.inputCols; v++) {
            curCell = $('#row-' + i + 'col-' + v);
            if (curCell.hasClass('cell-filled')) {
                ngData += '0';
            }
            else {
                ngData += '-';
            }
        }
    }
    return {
        nonogramData: ngData, 
        rows: sessionStorage.inputRows,
        cols: sessionStorage.inputCols
    }
}