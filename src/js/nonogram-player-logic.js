nonogramId = undefined;
nonogramName = null;
nonogramRawData = null;
nonogramParsedData = [];
nonogramRows = null;
nonogramCols = null; 
attempts = 0;

/* for the curMode, 0=fill, 1=cross, 2=erase */
curMode = 0;
$(document).ready(function() {
    urlGetParams = new URLSearchParams(window.location.search);
    /* Grab the nonogram id in url params */
    if ((urlGetParams.get('ngSuccessfullyLoaded') != null) && (urlGetParams.get('ngId') != null)) {
        nonogramId = urlGetParams.get('ngId');
    }

    /* Make the async request to api for our NG data */
    $.ajax({
        url: 'php/api.php',
        method: 'POST',
        data: {action:'get-nonogram', ngId:nonogramId},
        dataType: 'json', 
        success: function(data) {
            if (data.success) {
                /* Once we get the NG, update necessary fields */
                nonogramRows = data.rows; 
                nonogramCols = data.cols;   
                nonogramName = data.name;
                nonogramRawData = data.nonogramData;
                nonogramParsedData = parseNonogramData(nonogramRawData, nonogramRows, nonogramCols);
                /* create ng grid */
                generateNonogram(nonogramRows, nonogramCols);
                /* populate data cells of generated ng */
                populateDataCells(nonogramParsedData, nonogramRows, nonogramCols);
            }
            else {
                console.log('Issue with retrieving Nonogram');
            }
        },
        error: function(jqXHR, status, error) {
            console.log('Error retrieving Nonogram: ' + error);
            console.log(jqXHR);
        }
    })

    /* Click Listeners for mode buttons */
    $(document).on('click', '#btn-fill', () => changeMode(0, '#btn-fill', '#btn-cross', '#btn-erase'));
    $(document).on('click', '#btn-cross', () => changeMode(1, '#btn-cross', '#btn-fill', '#btn-erase'));
    $(document).on('click', '#btn-erase', () => changeMode(2, '#btn-erase', '#btn-fill', '#btn-cross'));

    /* Click Listener for each cell*/
    $(document).on('click', '.cell', changeCell);

    /* Submission Checker */
    $(document).on('click', '#btn-check-solution', checkSolution);
})

/**
 * Generate a nonogram grid with the rows and cols grabbed from the database. 
 * Keep the data cells empty.
 */
function generateNonogram(rows, cols) {
    /* Set Grid */
    grid = $('#tile-grid-cells');

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
            /* Append Cells to the Row we just created */
            curRow.append('<td id="row-' + i + 'col-' + v + '" class="cell cell-blank"></td>');
        }
        /* Close Row */
        grid.append('</tr>');
    }
}


function populateDataCells(grid, rows, cols) {
    /* TODO: Populate Data Cells*/
    curDataCell = null; 

    /* Populate row data cells */
    for (var i = 0; i < rows; i++) {
        curDataCell = $('#data-cell-row-'+ i);
        curDataCell.text(buildRowSequenceString(getRowSequence(grid, cols, i)));
    }

    /* Populate col data cells */
    for (var i = 0; i < cols; i++) {
        curDataCell = $('#data-cell-col-' + i); 
        curDataCell.text(buildColSequenceString(getColSequence(grid, rows, i)));
    }
}

/**
 *  Given the parsed grid, and the row index, get the set the Nonogram sequence in that row 
 * 
 * @param {Array<Array<string>>} grid Parsed Nonogram Data as a 2D Array 
 * @param {int} cols Amount of columns in the Nonogram
 * @param {int} row_index Which row we want to get the sequence for 
 * 
 * @returns {Array<int>} Array of Ints (i.e [3, 2, 6])
 */
function getRowSequence(grid, cols, row_index) {
    sequence = []; 
    curShadedCells = 0;
    for (var i = 0; i < cols; i++) {
        if (grid[row_index][i] == '0') {
            curShadedCells += 1; 
            /* If on last cell of row, push to sequence because we are the end */
            if (i == cols-1) {
                sequence.push(curShadedCells);
            }
        }
        else if (curShadedCells != 0) {
            sequence.push(curShadedCells);
            curShadedCells = 0; 
        }
    }
    return sequence;
}


/**
 *  Given the parsed grid, and the col index, get the set the Nonogram sequence in that row 
 * 
 * @param {Array<Array<string>>} grid Parsed Nonogram Data as a 2D Array 
 * @param {int} rows Amount of rows in the Nonogram
 * @param {int} col_index Which row we want to get the sequence for 
 * 
 * @returns {Array<int>} Array of Ints (i.e [3, 2, 6])
 */
function getColSequence(grid, rows, col_index) {
    sequence = []; 
    curShadedCells = 0;
    for (var i = 0; i < rows; i++) {
        if (grid[i][col_index] == '0') {
            curShadedCells += 1; 
            /* If on last cell of row, push to sequence because we are the end */
            if (i == rows-1) {
                sequence.push(curShadedCells);
            }
        }
        else if (curShadedCells != 0) {
            sequence.push(curShadedCells);
            curShadedCells = 0; 
        }
    }
    return sequence;
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
 * Parse Nonogram data into a 2D Array with '0' being filled, and '-' being blank.
 * 
 * @param {String} rawNonogramData Linear string that contains how the Nonogram is structured i.e '00-00-0-000-'
 * @param {int} rows Amount of rows in the Nonogram
 * @param {col} cols Amount of cols in the Nonogram 
 * 
 * @return {array} 2D Array with each element within the inner array(s) being a '0' or '-'. 
 */
function parseNonogramData(rawNonogramData, rows, cols) {
    /* We want to keep track of the index character in the raw data we are on*/
    curIndex = 0;
    nonogramData = [];
    for (var r = 0; r < rows; r++) {
        /* Create a new empty list for a new row */
        nonogramData.push([]);
        for (var c = 0; c < cols; c++) {
            /* Access our raw data, and append what is there */
            nonogramData[r].push(rawNonogramData[curIndex]);
            curIndex += 1;
        }
    }
    return nonogramData;
    /* nonogramParsedData is global, so nothing else needs to be done. */
}


/**
 * Change the cell click mode to that of fill, cross, or erase. 
 * Automatically modify CSS classes of mode buttons and update mode value
 * @param {String} mode A string that equals "fill" or "cross", or "erase". Use this to set the active mode 
 * @param {*} on_btn_id ID of the button to make appear as ON
 * @param {*} off_btn_id_one ID of the button to make appear as OFF 
 * @param {*} off_btn_id_two ID of the second button to make appear as OFF 
 */
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
 * Using the global curMode, 
 */
function changeCell() {
    curCell = $(this);
    switch(curMode) {
        case 0:
            curCell.removeClass('cell-blank');
            curCell.removeClass('cell-crossed');
            curCell.addClass('cell-filled');
            curCell.text('');
            return;
        case 1:
            curCell.removeClass('cell-blank');
            curCell.removeClass('cell-filled');
            curCell.addClass('cell-crossed');
            curCell.text('X');
            return;
        case 2:
            curCell.removeClass('cell-filled');
            curCell.removeClass('cell-crossed');
            curCell.addClass('cell-blank');
            curCell.text('');
            return;
    }
}


/**
 * Checks the solution of the active state of the Nonogram. W
 */
function checkSolution() {
    /* Add an attempt */
    attempts += 1;
    mistakes = 0;
    isIncorrect = false; 
    isCurCellFilled = false;
    for (var r = 0; r < nonogramRows; r++) {
        for (var c = 0; c < nonogramCols; c++) {
            isCurCellFilled = $('#row-' + r + 'col-' + c).hasClass('cell-filled');
            /* First, let's see if user filled an incorrect cell */
            if (isCurCellFilled && (nonogramParsedData[r][c] == '-')) {
                mistakes += 1;
            }
            /* Also see if active state empty cell doesn't match state filled cell, 
            don't count this as a mistake, but understand this is now incorrect */
            else if (!isCurCellFilled && (nonogramParsedData[r][c] == '0')) {
                isIncorrect = true; 
            }
        }
    }

    if ((mistakes == 0) && !isIncorrect) {
        $('#win-state-text').removeClass('incorrect');
        $('#win-state-text').addClass('correct');
        $('#win-state-text').text('Solution Correct!');
        $('#nonogram-solution-info').removeClass('incorrect');
        $('#nonogram-solution-info').text('Nonogram Name: ' + nonogramName);
    }
    else {
        $('#win-state-text').removeClass('correct');
        $('#win-state-text').addClass('incorrect');
        $('#win-state-text').text('Incorrect!');

        $('#nonogram-solution-info').addClass('incorrect');
        $('#nonogram-solution-info').text('Attempts: ' + attempts + '   Mistakes Found: ' + mistakes);
    }
}