(() => {
  const menu = document.getElementById("mobile-menu");
  const openBtn = document.querySelector(".hamburger");
  const closeBtn = document.querySelector(".mobile-menu__close");

  if (!menu || !openBtn || !closeBtn) return;

  const openMenu = () => {
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  const closeMenu = () => {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  openBtn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);

  // click outside nav closes (optional; matches overlay behavior)
  menu.addEventListener("click", (e) => {
    const nav = menu.querySelector(".mobile-menu__nav");
    if (nav && !nav.contains(e.target) && e.target !== closeBtn) closeMenu();
  });

  // ESC closes
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) closeMenu();
  });

  // Mark current page with underline automatically
  const path = window.location.pathname.replace(/\/+$/, "");
  const links = menu.querySelectorAll("a.mobile-link");
  links.forEach((a) => {
    const href = (a.getAttribute("href") || "").replace(/\/+$/, "");
    // ignore external links
    if (!href.startsWith("http") && href === path) {
      a.setAttribute("aria-current", "page");
    }
  });
})();