const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navigationItems = document.querySelectorAll(".nav-links a");
const revealItems = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("main section[id]");
const form = document.querySelector(".contact-form");
const feedback = document.querySelector(".form-feedback");
const yearElement = document.querySelector("#current-year");
const planTriggers = document.querySelectorAll(".plan-trigger");
const planField = form?.querySelector('input[name="plano"]');
const formFields = form ? [...form.querySelectorAll("input, textarea")] : [];

const whatsappNumber = "5511994017014";

const closeMenu = () => {
  if (!navLinks || !menuToggle) return;
  navLinks.classList.remove("open");
  menuToggle.classList.remove("active");
  menuToggle.setAttribute("aria-expanded", "false");
};

const openMenu = () => {
  if (!navLinks || !menuToggle) return;
  navLinks.classList.add("open");
  menuToggle.classList.add("active");
  menuToggle.setAttribute("aria-expanded", "true");
};

const setFeedback = (message, type = "success") => {
  if (!feedback) return;
  feedback.textContent = message;
  feedback.classList.remove("is-error", "is-success");
  feedback.classList.add(type === "error" ? "is-error" : "is-success");
};

const markFieldValidity = (field) => {
  const hasValue = field.value.trim().length > 0;
  const isEmail = field.type === "email";
  const isValidEmail = !isEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
  const isValid = hasValue && isValidEmail;

  field.classList.toggle("invalid", !isValid);
  return isValid;
};

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    if (navLinks.classList.contains("open")) {
      closeMenu();
      return;
    }

    openMenu();
  });

  navigationItems.forEach((item) => {
    item.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navigationItems.forEach((link) => {
          const shouldActivate = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", shouldActivate);
        });
      });
    },
    {
      threshold: 0.45,
      rootMargin: "-15% 0px -30% 0px",
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

planTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (!planField) return;

    const selectedPlan = trigger.dataset.plan || "";
    planField.value = selectedPlan;
    setFeedback(`Plano selecionado: ${selectedPlan}. Complete seus dados para continuar.`, "success");
  });
});

formFields.forEach((field) => {
  field.addEventListener("input", () => {
    field.classList.remove("invalid");

    if (feedback?.textContent) {
      feedback.textContent = "";
      feedback.classList.remove("is-error", "is-success");
    }
  });
});

if (form && feedback) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const invalidFields = formFields.filter((field) => {
      if (field.type === "hidden") return false;
      return !markFieldValidity(field);
    });

    if (invalidFields.length > 0) {
      setFeedback("Preencha nome, e-mail valido e mensagem para continuar.", "error");
      invalidFields[0].focus();
      return;
    }

    const formData = new FormData(form);
    const selectedPlan = formData.get("plano")?.toString().trim();
    const name = formData.get("nome")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const message = formData.get("mensagem")?.toString().trim();
    const submitButton = form.querySelector('button[type="submit"]');
    const whatsappButton = form.querySelector(".btn-whatsapp");

    formData.set(
      "mensagem",
      [
        selectedPlan ? `Plano de interesse: ${selectedPlan}` : "Plano de interesse: nao informado",
        `Nome: ${name}`,
        `Email: ${email}`,
        `Mensagem: ${message}`,
      ].join("\n")
    );

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
    }

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Falha no envio");
      }

      const whatsappMessage = [
        "Ola, Starkfit!",
        `Nome: ${name}`,
        `Email: ${email}`,
        selectedPlan ? `Plano de interesse: ${selectedPlan}` : "Plano de interesse: ainda nao definido",
        `Mensagem: ${message}`,
      ].join("\n");

      if (whatsappButton) {
        whatsappButton.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
      }

      setFeedback("Mensagem enviada com sucesso. As informacoes foram encaminhadas por e-mail.", "success");
      form.reset();
    } catch (error) {
      setFeedback("Nao foi possivel enviar o e-mail agora. Tente novamente ou use o WhatsApp.", "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Enviar Mensagem";
      }
    }
  });
}

if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}
