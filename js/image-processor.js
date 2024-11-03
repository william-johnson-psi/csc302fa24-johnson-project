

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