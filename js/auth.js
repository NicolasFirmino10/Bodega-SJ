// Sistema simplificado sem autenticação - Apenas carrinho

// Fazer logout
function logout() {
  // Limpar dados do carrinho
  localStorage.removeItem('cart');
  // Redirecionar para o início
  window.location.href = '/pages/index/index.html';
}

// Proteger páginas - Agora apenas redireciona se não estiver na página correta
function requireAuth() {
  // Sem autenticação - qualquer um pode acessar
  return true;
}

// Obter usuário atual (agora vazio)
function getCurrentUser() {
  return {
    name: 'Cliente',
    username: 'guest'
  };
}

// Verificar se está logado (sempre true agora)
function isLoggedIn() {
  return true;
}
