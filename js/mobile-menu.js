// Menu mobile responsivo

document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('nav-toggle');
  const navMobile = document.getElementById('nav-mobile');
  const navLinks = document.querySelectorAll('.nav-mobile__link');

  if (!navToggle || !navMobile) return;

  // Abrir/fechar menu ao clicar no hambúrguer
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMobile.classList.toggle('active');
  });

  // Fechar menu ao clicar em um link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMobile.classList.remove('active');
    });
  });

  // Fechar menu ao clicar fora dele
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header')) {
      navToggle.classList.remove('active');
      navMobile.classList.remove('active');
    }
  });

  // Fechar menu ao redimensionar a janela (voltar para desktop)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) {
      navToggle.classList.remove('active');
      navMobile.classList.remove('active');
    }
  });
});
