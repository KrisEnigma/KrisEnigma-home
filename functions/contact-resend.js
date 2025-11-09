// Cleaned contact-resend worker

// Shared helper: validate payload and anti-spam
function validatePayload(data) {
    const { name, email, subject, message, urltrap, formStart } = data || {};

    if (urltrap && String(urltrap).trim() !== "") {
        return { ok: false, status: 400, body: { success: false, error: 'Spam detectado (honeypot)' } };
    }

    if (formStart) {
        const now = Date.now();
        const diff = now - Number(formStart);
        if (isNaN(diff) || diff < 3000) {
            return { ok: false, status: 400, body: { success: false, error: 'Spam detectado (tiempo)' } };
        }
    }

    if (!name || !email || !subject || !message) {
        return { ok: false, status: 400, body: { success: false, error: 'Todos los campos son requeridos' } };
    }

    return { ok: true, values: { name, email, subject, message } };
}

// Build the HTML email body
function buildHtml(name, email, message) {
    return `<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mensaje de contacto - KrisEnigma</title>
    </head>
    <body style="margin:0;padding:30px;background:#fff;font-family:Arial,sans-serif;color:#333;">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;">
            <tr><td style="padding-bottom:12px;">
                <span style="font-size:16px;margin-right:8px;">💬</span>
                <strong style="color:#2d3748;font-size:16px;">Mensaje de ${name}</strong>
            </td></tr>
            <tr><td style="padding:20px;background:#faf5ff;border-left:4px solid #7a53dd;border-radius:8px;border:1px solid #e9d5ff;">
                <p style="margin:0;color:#2d3748;font-size:15px;line-height:1.6;">${String(message).replace(/\n/g, '<br>')}</p>
            </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;background:#f8fffe;border:1px solid #e0f2f1;border-radius:8px;">
            <tr><td style="padding:20px;text-align:center;color:#4a5568;font-size:14px;">📧 Email de contacto: <strong style="color:#2d3748;">${email}</strong></td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:40px;background:#2d3748;border-radius:8px;">
            <tr><td style="padding:20px;text-align:center;">
                <img src="https://krisenigma.com/krisenigma.png" alt="KrisEnigma" height="24" style="height:24px;width:auto;display:block;margin:0 auto 10px auto;" />
                <p style="margin:0;color:#a0aec0;font-size:13px;line-height:1.4;">Mensaje enviado desde <strong style="color:#00e1af;">krisenigma.com</strong><br>${new Date().toLocaleString('es-ES')}</p>
            </td></tr>
        </table>
    </body>
    </html>`;
}

// Pages Function handler
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        console.log('[DEBUG] RESEND_API_KEY exists (onRequestPost):', !!env.RESEND_API_KEY);

        const data = await request.json().catch(() => ({}));
        const validation = validatePayload(data);
        if (!validation.ok) {
            return new Response(JSON.stringify(validation.body), { status: validation.status, headers: { 'Content-Type': 'application/json' } });
        }

        const { name, email, subject, message } = validation.values;

        const apiKey = env.RESEND_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ success: false, error: 'Configuración de email no encontrada' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // Send email using Resend SDK (dynamic import)
        console.log('[DEBUG] Importando Resend SDK...');
        const { Resend } = await import('resend');
        const resend = new Resend(apiKey);

        const html = buildHtml(name, email, message);
        const payload = {
            from: `${name} <noreply@krisenigma.com>`,
            to: ['contacto@krisenigma.com'],
            replyTo: email,
            subject,
            html,
        };

        console.log('[DEBUG] Enviando email (onRequestPost) payload:', JSON.stringify({ from: payload.from, to: payload.to, replyTo: payload.replyTo, subject: payload.subject }));
        const result = await resend.emails.send(payload);
        console.log('[DEBUG] Resend response (onRequestPost):', JSON.stringify(result));

        return new Response(JSON.stringify({ success: true, message: 'Email enviado exitosamente', id: result?.data?.id, timestamp: new Date().toISOString() }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        console.error('[Mailer onRequestPost] Error:', err && err.message, err && err.stack, err);
        return new Response(JSON.stringify({ success: false, error: 'Error interno del servidor', details: err && err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

// Fallback export for Worker-style fetch handler (keeps compatibility with wrangler deploy)
export default {
    async fetch(request, env) {
        console.log('[DEBUG] RESEND_API_KEY exists (fetch):', !!env.RESEND_API_KEY);
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
        }

        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405, headers: { 'Access-Control-Allow-Origin': '*' } });
        }

        try {
            const data = await request.json().catch(() => ({}));
            const validation = validatePayload(data);
            if (!validation.ok) {
                return new Response(JSON.stringify(validation.body), { status: validation.status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
            }

            const { name, email, subject, message } = validation.values;
            const apiKey = env.RESEND_API_KEY;
            if (!apiKey) {
                return new Response(JSON.stringify({ success: false, error: 'Configuración de email no encontrada' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
            }

            const { Resend } = await import('resend');
            const resend = new Resend(apiKey);

            const html = buildHtml(name, email, message);
            const payload = {
                from: `${name} <noreply@krisenigma.com>`,
                to: ['contacto@krisenigma.com'],
                replyTo: email,
                subject,
                html,
            };

            console.log('[DEBUG fetch handler] Enviando payload:', JSON.stringify({ from: payload.from, to: payload.to, replyTo: payload.replyTo, subject: payload.subject }));
            const result = await resend.emails.send(payload);
            console.log('[DEBUG fetch handler] Resend response:', JSON.stringify(result));

            return new Response(JSON.stringify({ success: true, message: 'Email enviado exitosamente', id: result?.data?.id, timestamp: new Date().toISOString() }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        } catch (err) {
            console.error('[Mailer fetch handler] Error:', err && err.message, err && err.stack, err);
            return new Response(JSON.stringify({ success: false, error: 'Error interno del servidor', details: err && err.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }
    }
};
