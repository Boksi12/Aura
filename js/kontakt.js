document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const msgInput = document.getElementById('message');
    const successMsg = document.getElementById('success-msg');
    const submitBtn = document.getElementById('submit-btn');

    const setError = (elementId, isError) => {
        const group = document.getElementById(`group-${elementId}`);
        if (isError) {
            group.classList.add('error');
        } else {
            group.classList.remove('error');
        }
    };

    const validateEmail = (email) => {
        const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(String(email).toLowerCase());
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault(); 
        successMsg.style.display = 'none';
        let isValid = true;
        if (nameInput.value.trim().length < 3) {
            setError('name', true);
            isValid = false;
        } else {
            setError('name', false);
        }
        if (!validateEmail(emailInput.value.trim())) {
            setError('email', true);
            isValid = false;
        } else {
            setError('email', false);
        }
        if (msgInput.value.trim().length < 10) {
            setError('message', true);
            isValid = false;
        } else {
            setError('message', false);
        }
        if (isValid) {
            submitBtn.textContent = 'Šalje se...';
            submitBtn.disabled = true;
            setTimeout(() => {
                form.reset();
                successMsg.style.display = 'block';
                submitBtn.textContent = 'Pošalji poruku';
                submitBtn.disabled = false;
            }, 1500);
        }
    });
    nameInput.addEventListener('input', () => setError('name', false));
    emailInput.addEventListener('input', () => setError('email', false));
    msgInput.addEventListener('input', () => setError('message', false));
});
