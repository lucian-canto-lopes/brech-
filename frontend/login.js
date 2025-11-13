const form = document.getElementById('loginForm');
const errorBox = document.getElementById('loginError');
const successBox = document.getElementById('loginSuccess');

function show(el, msg){ el.textContent = msg; el.style.display = 'block'; }
function hide(el){ el.style.display = 'none'; el.textContent=''; }

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  hide(errorBox); hide(successBox);
  const email = form.email.value.trim();
  const password = form.password.value;
  if (!email || !password){
    return show(errorBox, 'Informe e-mail e senha.');
  }
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok){
      const err = await res.json().catch(()=>({message:'Erro no login'}));
      return show(errorBox, err.message || 'Credenciais inválidas');
    }
    const data = await res.json();
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userName', data.name || 'Usuário');
    show(successBox, 'Login realizado, redirecionando...');
    setTimeout(()=>{ window.location.href = '/index.html'; }, 800);
  } catch (err){
    show(errorBox, 'Falha ao conectar ao servidor.');
  }
});
