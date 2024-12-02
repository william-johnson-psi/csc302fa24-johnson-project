var nonogramData = null;
var rows = 0;
var cols = 0;
curMode = 0; /* 0 = fill, 1 = cross, 2 = erase*/
$(document).ready(function() {

    /* Sync Row/Col values when user changes input */
    $(document).on('input', '#nonogram-gen-rows', updateColInput);
    $(document).on('input', '#nonogram-gen-cols', updateRowInput);

    /* Listener for beginning generation from img -> nonogram */
    $(document).on('click', '#convert-img-ng-btn', imageToNonogram)

    /* Changes strength of grayscale->nonogram as the user slides. */
    $(document).on('input', '#strength-slider', updateStrength);


    /* Click Listeners for mode buttons */
    $(document).on('click', '#btn-fill', () => changeMode(0, '#btn-fill', '#btn-cross', '#btn-erase'));
    $(document).on('click', '#btn-cross', () => changeMode(1, '#btn-cross', '#btn-fill', '#btn-erase'));
    $(document).on('click', '#btn-erase', () => changeMode(2, '#btn-erase', '#btn-fill', '#btn-cross'));
    /* For Nonogram Creation, Handle Filling, X'ing, or Erasing Cells */ 
    $(document).on('click', '.cell', changeCell);
})

function buildNonogram(nonogramData) {
    /* Set Grid*/
    grid = $('#tile-grid-cells'); 
    /* Clear Grid of all TD and TR*/
    grid.empty();

    /* Establish row of col data cells */
    grid.append('<tr id="column-data-cells>');
    /* Add empty table data to align rows/cols properly*/
    grid.append('<td></td>');
    /* TODO, fix redundant code, some of this code is in generateEmptyGrid, at this point just make a function */
    for (var i = 0; i < cols; i++) {
        grid.append('<td id="data-cell-col-' + i + '" class="cell-data-col"></td>');
    }
    grid.append ('<tr>');
    /* Create data cell rows and some of the rows of the grid themselves */
    for (var i = 0; i < rows; i++) {
        /* Create Row with ID */
        grid.append('<tr id="row-' + i + '">');
        /* Init Cur Row to Append to */
        curRow = $('#row-' + i);
        /* Add Data Cell at Beginning */
        curRow.append('<td class="cell-data-row" id="data-cell-row-' + i + '"></td>');
        for (var v = 0; v < cols; v++) {
            /* Append Cells to the Row we just created */
            /* This is where we use our NG data to decide whether or not it's filled/not filled  */ 
            if (nonogramData[i][v] == '0') {
                curRow.append('<td id="row-' + i + 'col-' + v + '" class="cell cell-filled"></td>');
            } else {
                curRow.append('<td id="row-' + i + 'col-' + v + '" class="cell cell-blank"></td>');
            }
        }
        /* Close Row */
        grid.append('</tr>');
    }
    updateDataCells();
}


async function imageToNonogram() {
    try {
        compressedGrayscaleData = await convertImgToGrayscaleData();
    } catch(error) {
        console.log('Issue with Converting & Compressing Img->GrayscaleData: ' + error);
    }
    nonogramData = convertGrayscaleToNonogram(compressedGrayscaleData, 0);
    buildNonogram(nonogramData);
    $('#strength-container').removeClass('hidden');
    $('#nonogram-submit-container').removeClass('hidden');
    $('#mode-container').removeClass('hidden');
}

function updateStrength() {
    strength = parseInt($(this).val());
    $('#strength-display').text('Strength: ' + strength);
    console.log(compressedGrayscaleData);
    nonogramData = convertGrayscaleToNonogram(compressedGrayscaleData, strength);
    buildNonogram(nonogramData);
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
    updateDataCells();
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
 * For creating a Nonogram, update *ALL* data cells with their respective values.    
 */
function updateDataCells() {
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
 * Converts AND Compresses image to Grayscale Data.
 * 
 * IMPORTANT: This function will automatically grab the image from the #file-input in img-to-nonogram.html,
 * it will also get the rows and cols from it's input boxes.
 * 
 * PRE-REQUISITE: This function must be called within an asynchronous function, and must use the (await) keyword.
 * 
 */
function convertImgToGrayscaleData(firstTime) {
    /* Enclose this all in a promise  */
    return new Promise((resolve, reject) => {
        /* Get file */
        file = $('#file-input')[0].files[0];
        /* Get Rows/Columns */
        rows = $("#nonogram-gen-rows").val();
        cols = $("#nonogram-gen-cols").val();
        /* Serialize into IMG object */
        image = new Image();
        /* Generate a temp URL for the image, with this URL we can access the image any time as it's stored in memory*/
        image.src = URL.createObjectURL(file);
        /* The canvas is how we can manipulate our image */
        canvas = $('#canvas')[0];
        /* the getContext will return a 2D drawing object, this provides us methods on manipulating the image */
        ctx = canvas.getContext('2d');
        /* Grid we use to hold grayscaled values */
        grayscaleGrid = [];  
        /* This value will be the result of a modulo with width/height and row/col 
        We need the image's width/height be dividable by the row/col */
        image.onload = () => {
            /* Images' dimensions must be the same width/height*/
            if (image.width != image.height) {
                console.log('Error: Images must have the same width/height');
                return;
            } 

            imgWidth = image.width-(image.width%cols);
            imgHeight = image.height-(image.height%rows);

            ctx.drawImage(image, 0, 0, image.width-(image.width%cols), image.height-(image.height%rows));
            imageData = ctx.getImageData(0, 0, image.width, image.height);
            pixelData = imageData.data; 
            /* Okay, here is the format of pixel data. 
            Pixel Data is an UNSTRUCTURED Array of [r, g, b, a, r, g, b, a, r, g, b, a]  
            Where each set of [r, g, b, a] is ONE pixel. 
            This means to go through each pixel in a for loop, you need to increment your index by 4 each time. 
            
            For our purposes, we only want to grayscale the image, so we'll only need the average of RGB, and we'll output that to a grid. */
            /* See how many pixels we iterated through, if we reach the end of the width, append a new list (go down a row) */
            pixelsIterated = 0;
            curRow = 0; 
            grayscaleGrid.push([]);
            for (var i = 0; i < pixelData.length; i+=4) {
                /* add grayscaled value to cur grid row */
                grayscaleGrid[curRow].push((pixelData[i] + pixelData[i+1] + pixelData[i+2])/3);
                pixelsIterated += 1; 
                /* are we about to go out of bounds? create a new row and go down */
                if (pixelsIterated >= imgWidth) {
                    grayscaleGrid.push([]);
                    curRow += 1;
                    pixelsIterated = 0;
                }
            }

            /* Here's the hard part, now we want to compress the grayscaled values, 
            to the rows and cols of the inputted Nonogram Rows/Columns */
            
            /* The best way to approach this, is to floor divide the image's width/height by the NG rows/cols into X increments, and then, 
            go through the image in X increments, and the average grayscale of X(increments) amount of pixels. EXAMPLE BELOW:*/

            /* (i.e) I have a 20x20 size image, and I want to convert it to a 5x5 Nonogram */
            /* hIncrement = 20 // 5  = 4, wIncrement = 20 // 5 = 4 - Maybe in the future we want to support different height/width images, but for now images must have their height and width equal
            Our increment is 4, so go through 4 of the pixels at a time in the size of a square i.e((0,0), (0,1), (1,0), (1,1)), average the grayscale vals, and add it to the compressed grid 
            Each time we add a compressed grayscale value, make sure we go down a row when (amountOfPixelsPlaced >= wIncrement */

            compressedGrayscaleGrid = []; 

            wIncrement = Math.floor(imgWidth/cols);
            hIncrement = Math.floor(imgHeight/rows);
            curCompressedRowIndex = 0;
            curUncompressedGrayscalePixels = [];

            /* r = current row, c = current col, h&w= how many (rows/cols) to (move over/go down) when collecting grayscale values*/
            for (var r = 0; r < imgHeight; r+=hIncrement) {
                compressedGrayscaleGrid.push([]);
                for (var c = 0; c < imgWidth; c+=wIncrement) {
                    /* Get Unompressed Row Pixels  */ 
                    for (var h = 0; h < hIncrement; h++) {
                        for (var w = 0; w < wIncrement; w++) {
                            // console.log('r: '+r+'h: ' + h  + '     rI: ' + (r+h) + '   cI: ' + (c+w)); /* Debug*/
                            curUncompressedGrayscalePixels.push(grayscaleGrid[r+h][c+w])
                        }
                    }
                    /* After getting all grayscale values for the section of pixels, push the average to the compressed grid*/
                    compressedGrayscaleGrid[curCompressedRowIndex].push(Math.floor(getArrayAverage(curUncompressedGrayscalePixels)));
                    curUncompressedGrayscalePixels = []; 
                }
                curCompressedRowIndex += 1;
            }
            /* We now have a compressedGrayscaleGrid, the next step is to decide how we deserialize this into Nonogram Data
            The approach I will try is to grab the MIN and MAX of the grayscale values in the grid  and then
            get the average of both, and using the average, decide which cell should appear as filled or blank. Also, 
            I will include a new variable called strength, which is an offset for the average, so the user can have more control on what is shown 
            
            This will all be done in the function called below, we reuse this function so we can have a strength slider on the website */
            resolve(compressedGrayscaleGrid);
            /* TODO, Figure out a way to return compressedGrayscaleGrid, or display the grid and all the logic in here.*/
        }
    });
}

/**
 * Converts grayscaleGrid data to Nonogram Data. 
 * 
 * @param {array<array<int>>} grayscaleGrid In the form of a 2D array, where each value is the brightness of a pixel. (i.e) [[255, 62, 170], [255, 255, 30], [0, 17, 32], [210, 190, 0]]
 * @param {int} strength Alters the decision of when to make a cell filled/crossed. Increasing strength will yield more shaded cells, and vice-versa. 
 * 
 * @returns Nonogram Data in the form of a 2D Array (i.e) [['0', '-', '0'], ['-', '0', '-'], ['0', '-', '0'], ['-', '0', '-']]
 */
function convertGrayscaleToNonogram(grayscaleGrid, strength ) {
    nonogramData = [];
    /* Spread Operator (...) allows us to pass everything in the list as an individual argument to min 
    .flat() gets rid of the 2D array structure, and keeps it to one-dimension (linear) */
    min = Math.min(...grayscaleGrid.flat());
    max = Math.max(...grayscaleGrid.flat());
    averageGray = (Math.floor((min + max) / 2)) + strength;  

    curGrayscaleValue = 0;

    for (var r = 0; r < grayscaleGrid.length; r++) {
        nonogramData.push([]);
        for (var c = 0; c < grayscaleGrid[r].length; c++) {
            curGrayscaleValue = grayscaleGrid[r][c];
            if (curGrayscaleValue < averageGray) {
                nonogramData[r].push('0');
            }
            else {
                nonogramData[r].push('-');
            }
        }
    }
    return nonogramData;
}


function getArrayAverage(num_array) {
    total = 0;
    for (var i = 0; i < num_array.length; i++) {
        total += num_array[i];
    }
    return total/num_array.length;
}