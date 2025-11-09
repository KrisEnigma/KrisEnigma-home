// Contact modal client script (moved from ContactSection.astro)
// This file is served statically from /contact.js

// Solo cargar si no existe ya
if (!window.__krisContactModalLoaded) {
  window.__krisContactModalLoaded = true;

  document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("contactModal");
    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("contactForm");

    // Función para cerrar el modal
    function closeModal() {
      if (modal) {
        // Usar clases CSS para consistencia con ProjectModal
        modal.classList.add("opacity-0", "pointer-events-none");
        modal.querySelector(".transform")?.classList.add("scale-95");
        modal.querySelector(".transform")?.classList.remove("scale-100");

        // Restaurar scroll del body después de la animación
        setTimeout(() => {
          document.body.style.overflow = "auto";
        }, 300);
      }
    }

    // Cerrar modal al hacer clic en el botón X
    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    // Cerrar modal al hacer clic fuera del contenido
    if (modal) {
      modal.addEventListener("click", function (event) {
        if (event.target === modal) {
          closeModal();
        }
      });
    }

    // Cerrar modal con la tecla ESC
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        const currentModal = document.getElementById("contactModal");
        if (
          currentModal &&
          !currentModal.classList.contains("pointer-events-none")
        ) {
          closeModal();
        }
      }
    });

    // Guardar el timestamp de apertura del modal
    let formStartTimestamp = null;
    window.openContact = function () {
      const modal = document.getElementById("contactModal");
      if (modal) {
        modal.classList.remove("opacity-0", "pointer-events-none");
        modal.querySelector(".transform")?.classList.remove("scale-95");
        modal.querySelector(".transform")?.classList.add("scale-100");
        document.body.style.overflow = "hidden";
        // Guardar timestamp al abrir
        formStartTimestamp = Date.now();
      }
    };

    if (form) {
      form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const thankYouMessage = document.getElementById("thankyouMessage");
        const submitButton = form.querySelector('button[type="submit"]');

        // Validación manual antes de enviar
        let valid = true;
        // Limpiar errores previos
        if (thankYouMessage) {
          thankYouMessage.classList.add("hidden");
          thankYouMessage.textContent = "";
        }
        ["name", "email", "subject", "message"].forEach((field) => {
          const input = form.querySelector(`[name="${field}"]`);
          if (input) input.classList.remove("border-red-500");
        });

        // Validar nombre
        const name = form.name.value.trim();
        if (!name || name.length < 2) {
          valid = false;
          form.name.classList.add("border-red-500");
        }
        // Validar email
        const email = form.email.value.trim();
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!email || !emailRegex.test(email)) {
          valid = false;
          form.email.classList.add("border-red-500");
        }
        // Validar subject
        const subject = form.subject.value;
        if (!subject) {
          valid = false;
          form.subject.classList.add("border-red-500");
        }
        // Validar mensaje
        const message = form.message.value.trim();
        if (!message || message.length < 2) {
          valid = false;
          form.message.classList.add("border-red-500");
        }

        if (!valid) {
          if (thankYouMessage) {
            thankYouMessage.classList.remove("hidden");
            thankYouMessage.textContent =
              "Todos los campos son obligatorios.";
            thankYouMessage.className =
              "mt-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-center font-bold border border-red-500/30 text-sm";
          }
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Enviar Mensaje";
          }
          return;
        }

        // Cambiar texto del botón al enviar SOLO si la validación es exitosa
        if (valid && submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Enviando mensaje...";
        }

        // Envío del formulario
        // Honeypot
        const urltrap = form.urltrap ? form.urltrap.value : "";
        const data = {
          name,
          email,
          subject,
          message,
          urltrap,
          formStart: formStartTimestamp,
        };

        try {
          const response = await fetch("https://mailer.krisenigma.workers.dev/", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
              "Content-Type": "application/json",
            },
          });

          const result = await response.json();

          if (result.success) {
            // Mostrar mensaje de éxito
            if (thankYouMessage) {
              thankYouMessage.classList.remove("hidden");
              thankYouMessage.textContent =
                "¡Gracias por tu mensaje! Te responderé pronto.";
              thankYouMessage.className =
                "mt-4 p-3 rounded-lg bg-green-500/20 text-green-400 text-center font-bold border border-green-500/30 text-sm";
            }

            form.reset();

            // Cerrar modal después de 2 segundos
            setTimeout(() => {
              closeModal();
              // Ocultar mensaje después de cerrar
              setTimeout(() => {
                if (thankYouMessage) {
                  thankYouMessage.classList.add("hidden");
                }
              }, 300);
            }, 2000);
          } else {
            // Mostrar mensaje de error
            if (thankYouMessage) {
              thankYouMessage.classList.remove("hidden");
              thankYouMessage.textContent =
                result.error ||
                "Error al enviar el mensaje. Inténtalo de nuevo.";
              thankYouMessage.className =
                "mt-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-center font-bold border border-red-500/30 text-sm";
            }
          }
        } catch (error) {
          console.error("Error al enviar el formulario:", error);
          // Mostrar mensaje de error
          if (thankYouMessage) {
            thankYouMessage.classList.remove("hidden");
            thankYouMessage.textContent =
              "Error de conexión. Inténtalo de nuevo.";
            thankYouMessage.className =
              "mt-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-center font-bold border border-red-500/30 text-sm";
          }
        }

        // Restaurar el botón
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Enviar Mensaje";
        }
      });
    }
  });
}
