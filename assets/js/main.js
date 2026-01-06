/**
 * Main JavaScript for Landing Page
 * Handles form validation, smooth scrolling, and interactions
 */

(function () {
  "use strict";

  // ========================================
  // DOM Content Loaded
  // ========================================
  document.addEventListener("DOMContentLoaded", function () {
    initSmoothScroll();
    initFormValidation();
    initAnimations();
    initLazyLoading();
  });

  // ========================================
  // Smooth Scroll for Anchor Links
  // ========================================
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
      link.addEventListener("click", function (e) {
        const href = this.getAttribute("href");

        // Ignore empty hash or just "#"
        if (href === "#" || href === "") return;

        const target = document.querySelector(href);

        if (target) {
          e.preventDefault();
          const offsetTop = target.offsetTop - 80; // Offset for fixed header if any

          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });

          // Update URL without jumping
          history.pushState(null, null, href);
        }
      });
    });
  }

  // ========================================
  // Form Validation & Submission
  // ========================================
  function initFormValidation() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const formMessage = document.getElementById("formMessage");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Bootstrap validation
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add("was-validated");
        return;
      }

      // Get form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";

      // Simulate form submission (replace with actual endpoint)
      setTimeout(() => {
        // Success
        showMessage(
          "success",
          "Mensagem enviada com sucesso! Retornaremos em breve."
        );
        form.reset();
        form.classList.remove("was-validated");

        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        // Log data (for demo purposes)
        console.log("Form data:", data);

        // In production, send to your backend:
        // fetch('/api/contact', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data)
        // })
        // .then(response => response.json())
        // .then(data => showMessage('success', 'Mensagem enviada!'))
        // .catch(error => showMessage('error', 'Erro ao enviar. Tente novamente.'));
      }, 1500);
    });

    function showMessage(type, message) {
      const messageDiv = document.getElementById("formMessage");
      messageDiv.className = `alert alert-${
        type === "success" ? "success" : "danger"
      } d-block`;
      messageDiv.textContent = message;

      // Auto hide after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("d-none");
      }, 5000);
    }
  }

  // ========================================
  // Intersection Observer for Animations
  // ========================================
  function initAnimations() {
    const animatedElements = document.querySelectorAll("[data-aos]");

    if (animatedElements.length === 0) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    let elementsToAnimate = [];

    const observer = new IntersectionObserver((entries) => {
      elementsToAnimate = entries
        .filter((e) => e.isIntersecting)
        .map((e) => e.target);

      // Batch updates with requestAnimationFrame to avoid layout thrashing
      if (elementsToAnimate.length > 0) {
        requestAnimationFrame(() => {
          elementsToAnimate.forEach((el) => {
            el.classList.add("fade-in");
            observer.unobserve(el);
          });
        });
      }
    }, observerOptions);

    animatedElements.forEach((el) => {
      observer.observe(el);
    });
  }

  // ========================================
  // Lazy Loading for Images
  // ========================================
  function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ("loading" in HTMLImageElement.prototype) {
      // Browser supports native lazy loading
      return;
    }

    // Fallback for browsers that don't support lazy loading
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }

  // ========================================
  // Phone Number Formatting (Brazilian)
  // ========================================
  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "");

      if (value.length > 11) {
        value = value.slice(0, 11);
      }

      if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
      } else if (value.length > 0) {
        value = value.replace(/^(\d*)/, "($1");
      }

      e.target.value = value;
    });
  }

  // ========================================
  // Scroll to Top Button (optional)
  // ========================================
  function initScrollToTop() {
    const scrollBtn = document.createElement("button");
    scrollBtn.innerHTML = "↑";
    scrollBtn.className = "scroll-to-top btn btn-primary rounded-circle";
    scrollBtn.setAttribute("aria-label", "Voltar ao topo");
    scrollBtn.style.cssText =
      "position: fixed; bottom: 20px; right: 20px; display: none; z-index: 1000; width: 50px; height: 50px;";

    document.body.appendChild(scrollBtn);

    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) {
        scrollBtn.style.display = "block";
      } else {
        scrollBtn.style.display = "none";
      }
    });

    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Uncomment to enable scroll to top button
  // initScrollToTop();
})();
