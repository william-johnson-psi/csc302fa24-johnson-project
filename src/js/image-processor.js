

$(document).ready(function() {

    $(document).on('change', '#file-input', processImage)

})


function processImage() {
    console.log("hit");
    const imageReader = new FileReader();
    var imageInputElement = $('#file-input')[0];

    imageReader.onload = () => {
        $('#origin-image-display').attr('src', imageReader.result);
    }
    imageReader.readAsDataURL(imageInputElement.files[0]);
}

// For the HTML 
// <!-- <form>
// <label for="file-input">Select an image</label>
// <br>
// <input type="file" id="file-input" accept="image/*">
// </form>
// <img id="origin-image-display"> -->
