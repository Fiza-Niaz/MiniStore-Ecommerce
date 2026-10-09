// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CartItem } from '@/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
    try {
        const { items }: { items: CartItem[] } = await req.json();

        // Map cart items to Stripe line items format
        const lineItems = items.map((item) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.title,
                    images: [item.image],
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents
            },
            quantity: item.quantity,
        }));

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/success`,
            cancel_url: `${req.headers.get('origin')}/cart`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}