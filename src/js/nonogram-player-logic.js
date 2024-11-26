nonogramId = undefined;
nonogramName = null;
nonogramRawData = null;
nonogramParsedData = [];
nonogramRows = null;
nonogramCols = null; 

$(document).ready(function() {
    urlGetParams = new URLSearchParams(window.location.search);
    /* Grab the nonogram id in url params */
    if ((urlGetParams.get('ngSuccessfullyLoaded') != null) && (urlGetParams.get('ngId') != null)) {
        nonogramId = urlGetParams.get('ngId');
    }

    /* Make the async request to api for our NG data */
    $.ajax({
        url: '../php/api.php',
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
                generateNonogram();
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

    /* Begin creating empty table, and populate data cells */ 
})

/**
 * Generate a nonogram grid with the rows and cols grabbed from the database. 
 * Keep the data cells empty.
 */
function generateNonogram() {
    /* Set Grid */
    grid = $('#tile-grid-cells');

    /* Before creating rows, establish row of col data cells */
    grid.append('<tr id="column-data-cells">')
    /* Adding an empty table data to align rows/cols properly, because in HTML the row data cells can mess up the alignment */
    grid.append('<td></td>');
    for (var i = 0; i < nonogramCols; i++) {
        grid.append('<td id="data-cell-col-' + i + '" class="cell-data-col"></td>');
    }
    grid.append('</tr>');
    
    /* Here, we create the data-cell-rows as well as the rows of the grid themselves.*/
    for (var i = 0; i < nonogramRows; i++) {
        /* Create Row with ID */
        grid.append('<tr id="row-' + i + '">');
        /* Init Cur Row to Append to */
        curRow = $('#row-' + i);
        /* Add Data Cell at Beginning */
        curRow.append('<td class="cell-data-row" id="data-cell-row-' + i + '"></td>');
        for (var v = 0; v < nonogramCols; v++) {
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




