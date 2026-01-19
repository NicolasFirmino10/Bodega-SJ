// Sistema de roteamento simples para evitar problemas de caminho

const APP_ROUTES = {
  home: '/pages/index/index.html',
  login: '/pages/login/login.html',
  register: '/pages/registro/registro.html',
  products: '/pages/produtos/produtos.html'
};

// Detectar a raiz da aplicação
function getBasePath() {
  const currentPath = window.location.pathname;
  
  // Se está em /pages/*, a raiz é o diretório pai
  if (currentPath.includes('/pages/')) {
    return currentPath.substring(0, currentPath.indexOf('/pages/'));
  }
  
  // Se está na raiz, retorna vazio
  return '';
}

// Navegar para uma rota
function navigateTo(routeName) {
  const basePath = getBasePath();
  const route = APP_ROUTES[routeName];
  
  if (route) {
    window.location.href = basePath + route;
  }
}

// Gerar URL correta para um recurso
function getUrl(routeName) {
  const basePath = getBasePath();
  const route = APP_ROUTES[routeName];
  
  if (route) {
    return basePath + route;
  }
  
  return '#';
}
