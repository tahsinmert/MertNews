import { json } from '@sveltejs/kit';

// In a real application, you would connect to a database or a service like Resend, Mailchimp, or SendGrid here.
// Example:
// import { Resend } from 'resend';
// const resend = new Resend(process.env.RESEND_API_KEY);

const subscribers = new Set(); // Temporary in-memory storage for demonstration

export async function POST({ request }) {
	try {
		const { email, categories, frequency } = await request.json();

		if (!email || !email.includes('@')) {
			return json({ success: false, message: 'Geçersiz e-posta adresi.' }, { status: 400 });
		}

		// Simulate network latency & API call
		await new Promise(resolve => setTimeout(resolve, 800));

		// Check if already subscribed
		if (subscribers.has(email)) {
			return json({ success: false, message: 'Bu e-posta adresi zaten kayıtlı.' }, { status: 409 });
		}

		// Save to our "database"
		subscribers.add(email);
		
		console.log('New Subscriber:', { email, categories, frequency });
		
		/* 
		* Real world implementation snippet:
		* 
		* await resend.emails.send({
		*   from: 'MertNews <onboarding@resend.dev>',
		*   to: [email],
		*   subject: 'MertNews - Aboneliğiniz Başarıyla Onaylandı',
		*   html: '<p>Aramıza hoş geldiniz! Seçtiğiniz kategorilerdeki en yeni haberleri size ileteceğiz.</p>'
		* });
		*/

		return json({ 
			success: true, 
			message: 'Başarıyla abone oldunuz. En güncel haberler yakında e-posta kutunuzda olacak.' 
		});

	} catch (error) {
		console.error('Subscription error:', error);
		return json({ success: false, message: 'Sunucu hatası, lütfen daha sonra tekrar deneyin.' }, { status: 500 });
	}
}
