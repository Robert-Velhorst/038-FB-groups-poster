const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('.desktop-nav');
menu?.addEventListener('click',()=>{
  const open=menu.getAttribute('aria-expanded')!=='true';
  menu.setAttribute('aria-expanded',String(open));
  menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  nav?.classList.toggle('open',open);
});
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  menu?.setAttribute('aria-expanded','false');
  menu?.setAttribute('aria-label','Open navigation');
  nav.classList.remove('open');
}));

