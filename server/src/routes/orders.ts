import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post('/confirmation', async (req: express.Request, res: express.Response) => {
    const { email, orderNumber, totalAmount, currency, items, shippingAddress } = req.body;

    console.log(`[Email] Sending order confirmation to ${email} for Order ${orderNumber}`);

    // Create Transporter (Mock if no credentials, or use Ethereal for dev)
    // In production, use process.env.SMTP_HOST etc.
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER || 'ethereal_user',
            pass: process.env.SMTP_PASS || 'ethereal_pass'
        }
    });

    const mailOptions = {
        from: `Nelo Marketplace <${process.env.SMTP_FROM_EMAIL || 'noreply@nelo.com'}>`,
        to: email,
        subject: `Confirmation de commande #${orderNumber}`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h1 style="color: #0d9488;">Merci pour votre commande !</h1>
                <p>Bonjour,</p>
                <p>Nous avons bien reçu votre commande <strong>#${orderNumber}</strong>.</p>
                
                <h3>Détails de la livraison</h3>
                <p>${shippingAddress}</p>
                
                <h3>Résumé</h3>
                <ul>
                    ${items.map((item: any) => `<li>${item.quantity}x ${item.product.title} - ${item.product.price}</li>`).join('')}
                </ul>
                
                <p><strong>Total: ${totalAmount} ${currency}</strong></p>
                
                <p>Nous vous préviendrons dès que votre colis sera expédié.</p>
                <br>
                <p>L'équipe Nelo</p>
            </div>
        `
    };

    try {
        // If credentials are mostly present, try sending
        // Otherwise just log success to avoid crashing dev env without SMTP
        if (process.env.SMTP_HOST) {
            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
        } else {
            console.log('SMTP not configured, skipping actual email send.');
            console.log('Email Payload:', JSON.stringify(mailOptions, null, 2));
        }

        res.json({ success: true, message: 'Confirmation email sent' });
    } catch (error: any) {
        console.error('Error sending email:', error);
        // Do not fail the request just because email failed? 
        // Or maybe warn.
        res.status(200).json({ success: false, warning: 'Email failed', error: error.message });
    }
});

export default router;
