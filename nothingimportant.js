document.getElementById('backgroundButton').addEventListener('click', function () {
    const backgroundElement = document.querySelector('.background');
    const buttonImage = document.querySelector('#backgroundButton img');
    const button = document.getElementById('backgroundButton');

    if (backgroundElement.classList.contains('animated-background')) {
        backgroundElement.classList.remove('animated-background');
        backgroundElement.style.background = '#16181C';
        buttonImage.src = '/images/animationoff.svg';
    } else {
        backgroundElement.classList.add('animated-background');
        backgroundElement.style.background = ''; // Reset to initial state defined in CSS
        buttonImage.src = '/images/animation.svg';
    }

    // Add rotate class to button
    button.classList.add('rotate');

    // Remove rotate class after animation completes
    button.addEventListener('animationend', function () {
        button.classList.remove('rotate');
    }, { once: true });
});


window.addEventListener('scroll', function () {
    var scrollPosition = window.scrollY;
    var item2 = document.querySelector('.navbar');

    if (scrollPosition > 15) {
        item2.style.backgroundColor = 'var(--elementColor4)';
        item2.style.borderRadius = '0px 0px 35px 35px';
    } else {
        item2.style.borderRadius = '';
        item2.style.backgroundColor = '';
    }
});