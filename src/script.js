let scale = 1; // Initial scale

function updateElements() {
    const scrollPosition = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const rotation = (scrollPosition / maxScroll) * 90; // Rotate up to 90 degrees
    document.getElementById('door').style.transform = `translate(-50%, -50%) rotateY(${rotation}deg)`;

    const shouldAddClass = scrollPosition > 110;
    document.getElementById('click').classList.toggle('test', shouldAddClass);

    scale = 1 + scrollPosition / 400; // Change divisor to control zoom sensitivity

    // Apply the scale transform to each targeted element
    document.querySelectorAll('#click').forEach(element => {
        element.style.transform = `translate(-50%, -50%) scale(${scale})`;
    });
}

window.addEventListener('scroll', updateElements);

// Call updateElements initially to set initial state
updateElements();
