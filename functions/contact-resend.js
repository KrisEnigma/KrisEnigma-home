// Cloudflare Pages Function para enviar mails con Resend
// Guardar como functions/contact-resend.js



// Enviar correo usando Resend
export async function onRequestPost(context) {

    try {
        const { request, env } = context;
        // Log temporal para depuración de secret
        console.log('[DEBUG] RESEND_API_KEY exists:', !!env.RESEND_API_KEY);
        const data = await request.json();
    const { name, email, subject, message, urltrap, formStart } = data;

        // Honeypot anti-spam: si el campo urltrap está lleno, es spam
        if (urltrap && urltrap.trim() !== "") {
            return new Response(JSON.stringify({
                success: false,
                error: 'Spam detectado (honeypot)'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        // Validación de tiempo mínimo entre apertura y envío
        if (formStart) {
            const now = Date.now();
            const diff = now - Number(formStart);
            if (isNaN(diff) || diff < 3000) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Spam detectado (tiempo)'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        if (!name || !email || !subject || !message) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Todos los campos son requeridos'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Usar solo la variable de entorno RESEND_API_KEY
        const apiKey = env.RESEND_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Configuración de email no encontrada'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }


        // Log antes de importar y enviar
        console.log('[DEBUG] Importando Resend y enviando email...');
        const { Resend } = await import('resend');
        const resend = new Resend(apiKey);
        const emailPayload = {
            from: `${name} <noreply@krisenigma.com>`,
            to: ['contacto@krisenigma.com'],
            replyTo: email,
            subject: subject,
            html: `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Mensaje de contacto - KrisEnigma</title>
                </head>
                <body style="margin: 0; padding: 30px; background-color: #ffffff; font-family: Arial, sans-serif; color: #333333;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                    <tr><td style="padding-bottom: 12px;">
                    <span style="font-size: 16px; margin-right: 8px;">💬</span>
                    <strong style="color: #2d3748; font-size: 16px;">Mensaje de ${name}</strong>
                    </td></tr>
                    <tr><td style="padding: 20px; background-color: #faf5ff; border-left: 4px solid #7a53dd; border-radius: 8px; border: 1px solid #e9d5ff;">
                    <p style="margin: 0; color: #2d3748; font-size: 15px; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
                    </td></tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; background-color: #f8fffe; border: 1px solid #e0f2f1; border-radius: 8px;">
                    <tr><td style="padding: 20px; text-align: center; color: #4a5568; font-size: 14px;">📧 Email de contacto: <strong style="color: #2d3748;">${email}</strong></td></tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 40px; background-color: #2d3748; border-radius: 8px;">
                    <tr><td style="padding: 20px; text-align: center;">
                    <img src="https://krisenigma.com/krisenigma.png" alt="KrisEnigma" height="24" style="height: 24px; width: auto; display: block; margin: 0 auto 10px auto;" />
                    <p style="margin: 0; color: #a0aec0; font-size: 13px; line-height: 1.4;">
                        Mensaje enviado desde <strong style="color: #00e1af;">krisenigma.com</strong><br>
                        ${new Date().toLocaleDateString('es-ES', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                    </p>
                    </td></tr>
                    </table>
                </body>
                </html>
            `
        };
        console.log('[DEBUG] Payload a enviar:', JSON.stringify(emailPayload));
        let result;
        try {
            result = await resend.emails.send(emailPayload);
            console.log('[DEBUG] Respuesta de resend.emails.send:', JSON.stringify(result));
        } catch (err) {
            console.error('[DEBUG] Error en resend.emails.send:', err && err.message, err && err.stack, err);
            throw err;
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Email enviado exitosamente',
            id: result.data?.id,
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        // Log detallado para depuración en Cloudflare
        console.error("[Mailer Worker] Error:", error && error.message, error && error.stack, error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Error interno del servidor',
            details: error && error.message,
            stack: error && error.stack,
            raw: error
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Adaptación para formato Worker local (fetch handler)
export default {
    async fetch(request, env) {
        // Log temporal para depuración de secret en fetch handler
        console.log('[DEBUG] RESEND_API_KEY exists (fetch):', !!env.RESEND_API_KEY);
        if (request.method === 'OPTIONS') {
            // Responder a preflight CORS
            return new Response(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }
        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', {
                status: 405,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                }
            });
        }
        try {
            const data = await request.json();
            const { name, email, subject, message } = data;
            if (!name || !email || !subject || !message) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Todos los campos son requeridos'
                }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    }
                });
            }
            // Solo usar RESEND_API_KEY
            const apiKey = env.RESEND_API_KEY;
            if (!apiKey) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Configuración de email no encontrada'
                }), {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    }
                });
            }
            // ...existing code...
            const html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Mensaje de contacto - KrisEnigma</title>
            </head>
            <body style="margin: 0; padding: 30px; background-color: #ffffff; font-family: Arial, sans-serif; color: #333333;">
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                <tr><td style="padding-bottom: 12px;">
                <span style="font-size: 16px; margin-right: 8px;">💬</span>
                <strong style="color: #2d3748; font-size: 16px;">Mensaje de ${name}</strong>
                </td></tr>
                <tr><td style="padding: 20px; background-color: #faf5ff; border-left: 4px solid #7a53dd; border-radius: 8px; border: 1px solid #e9d5ff;">
                <p style="margin: 0; color: #2d3748; font-size: 15px; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
                </td></tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; background-color: #f8fffe; border: 1px solid #e0f2f1; border-radius: 8px;">
                <tr><td style="padding: 20px; text-align: center; color: #4a5568; font-size: 14px;">📧 Email de contacto: <strong style="color: #2d3748;">${email}</strong></td></tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 40px; background-color: #2d3748; border-radius: 8px;">
                <tr><td style="padding: 20px; text-align: center;">
                <img src="https://krisenigma.com/krisenigma.png" alt="KrisEnigma" height="24" style="height: 24px; width: auto; display: block; margin: 0 auto 10px auto;" />
                <p style="margin: 0; color: #a0aec0; font-size: 13px; line-height: 1.4;">
                    Mensaje enviado desde <strong style="color: #00e1af;">krisenigma.com</strong><br>
                    ${new Date().toLocaleDateString('es-ES', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
                </p>
                </td></tr>
                </table>
            </body>
            </html>
            `;
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey
                },
                body: JSON.stringify({
                    sender: {
                        name: name,
                        email: '9aa096001@smtp-brevo.com'
                    },
                    to: [
                        { email: 'contacto@krisenigma.com', name: 'KrisEnigma' }
                    ],
                    replyTo: { email: email, name: name },
                    subject: subject,
                    htmlContent: html
                })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Error al enviar el correo',
                    details: errorData
                }), {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    }
                });
            }
            const result = await response.json();
            return new Response(JSON.stringify({
                success: true,
                message: 'Email enviado exitosamente',
                id: result.messageId,
                timestamp: new Date().toISOString()
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        } catch (error) {
            // Log detallado para depuración en Cloudflare
            console.error("[Mailer Worker] Error (fetch handler):", error && error.message, error && error.stack, error);
            return new Response(JSON.stringify({
                success: false,
                error: 'Error interno del servidor',
                details: error && error.message,
                stack: error && error.stack,
                raw: error
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        }
    }
};
