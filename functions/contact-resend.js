// Cloudflare Pages Function para enviar mails con Resend
// Guardar como functions/contact-resend.js

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const { Resend } = await import('resend');
        const data = await request.json();
        const { name, email, subject, message } = data;

        if (!name || !email || !subject || !message) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Todos los campos son requeridos'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

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

        const resend = new Resend(apiKey);
        const result = await resend.emails.send({
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
        });

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
        return new Response(JSON.stringify({
            success: false,
            error: 'Error interno del servidor',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Adaptación para formato Worker local (fetch handler)
export default {
    async fetch(request, env) {
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
            const { Resend } = await import('resend');
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
            const resend = new Resend(apiKey);
            const result = await resend.emails.send({
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
            });
            return new Response(JSON.stringify({
                success: true,
                message: 'Email enviado exitosamente',
                id: result.data?.id,
                timestamp: new Date().toISOString()
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Error interno del servidor',
                details: error.message
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
