const LoginPage = {
    handleLogin: async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        try {
            const response = await fetch('auth/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, remember })
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('user', JSON.stringify(result.user));
                App.showToast('✅ Autentificare reușită! Redirecționare...');

                setTimeout(() => {
                    if (result.user.role === 'producer') {
                        window.location.href = 'producer-dashboard.html';
                    } else if (result.user.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1500);
            } else {
                App.showToast('❌ ' + (result.message || 'Autentificare eșuată'));
            }
        } catch (error) {
            console.error('Login error:', error);
            App.showToast('❌ Eroare de conexiune. Încearcă din nou.');
        }
    }
};

const RegisterPage = {
    handleRegister: async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            App.showToast('❌ Parolele nu coincid');
            return;
        }

        if (password.length < 6) {
            App.showToast('❌ Parola trebuie să aibă minim 6 caractere');
            return;
        }

        try {
            const response = await fetch('auth/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password, role: 'customer' })
            });

            const result = await response.json();

            if (result.success) {
                App.showToast('✅ Cont creat cu succes! Autentificare automată...');

                // Auto-login after registration
                localStorage.setItem('user', JSON.stringify(result.user));

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                App.showToast('❌ ' + (result.message || 'Înregistrare eșuată'));
            }
        } catch (error) {
            console.error('Register error:', error);
            App.showToast('❌ Eroare de conexiune. Încearcă din nou.');
        }
    }
};

const ProducerRegisterPage = {
    handleRegister: async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const businessName = document.getElementById('business-name').value;
        const description = document.getElementById('description').value;
        const county = document.getElementById('county').value;
        const city = document.getElementById('city').value;

        if (password !== confirmPassword) {
            App.showToast('❌ Parolele nu coincid');
            return;
        }

        if (password.length < 6) {
            App.showToast('❌ Parola trebuie să aibă minim 6 caractere');
            return;
        }

        try {
            const response = await fetch('auth/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name, email, phone, password,
                    role: 'producer',
                    business_name: businessName,
                    description,
                    county,
                    city
                })
            });

            const result = await response.json();

            if (result.success) {
                App.showToast('✅ Cont producător creat! Autentificare automată...');

                // Auto-login after registration
                localStorage.setItem('user', JSON.stringify(result.user));

                setTimeout(() => {
                    window.location.href = 'producer-dashboard.html';
                }, 1500);
            } else {
                App.showToast('❌ ' + (result.message || 'Înregistrare eșuată'));
            }
        } catch (error) {
            console.error('Register error:', error);
            App.showToast('❌ Eroare de conexiune. Încearcă din nou.');
        }
    }
};
