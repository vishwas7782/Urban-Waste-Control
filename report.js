const reportForm = document.querySelector('.report-section form');

reportForm.addEventListener('submit', function(e) {
    const description = document.getElementById('description').value;
    const image = document.getElementById('image').value;

    // Validate description length
    if (description.length < 10) {
        e.preventDefault();
        alert('Please provide a detailed description of the issue.');
        return;
    }

    // Validate word count in the description
    const wordCount = description.trim().split(/\s+/).length;
    if (wordCount < 5 || wordCount > 100) {
        e.preventDefault();
        alert('Description should contain between 5 and 100 words.');
        return;
    }


    // Image validation 
    if (image) {
        const imageFile = document.getElementById('image').files[0];
        const validImageTypes = ['image/jpeg', 'image/png'];
        const maxFileSize = 2 * 1024 * 1024; // 2MB
        
        if (!validImageTypes.includes(imageFile.type)) {
            e.preventDefault();
            alert('Please upload a valid image file (JPG or PNG).');
            return;
        }

        if (imageFile.size > maxFileSize) {
            e.preventDefault();
            alert('Image size should be less than 2MB.');
            return;
        }
    }
const specialCharPattern = /[!@#\$%\^\&*\)\(+=._-]+/;
const numericPattern = /\d+/;

if (specialCharPattern.test(description)) {
    e.preventDefault();
    alert('Please avoid using special characters in the description.');
    return;
}

if (numericPattern.test(description)) {
    e.preventDefault();
    alert('The description should not contain numbers.');
    return;
}


    // Everything passed!
    alert('Report submitted successfully!');
});
