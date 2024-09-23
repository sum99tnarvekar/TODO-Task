const modal = document.getElementById('myModal');
const openModal = document.getElementById('openModal');
const closeModal = document.getElementsByClassName('close')[0];

// Open the modal when the "here" button is clicked
openModal.onclick = function() {
    modal.classList.add('show');
}

// Close the modal when the close button is clicked
closeModal.onclick = function() {
    modal.classList.remove('show');
}

// Close the modal when clicking outside of the modal
window.onclick = function(event) {
    if (event.target == modal) {
        modal.classList.remove('show');
    }
}

// Handle form submission
document.getElementById('form').addEventListener('submit', (event) => {
    event.preventDefault();
    // Logic to handle the form data goes here
    // After handling the data, hide the modal
    modal.classList.remove('show');
});