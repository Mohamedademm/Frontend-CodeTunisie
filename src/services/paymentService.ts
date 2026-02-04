import api from './api';

export interface PaymentPlan {
    duration: '1month' | '3months' | '1year';
    price: number;
    discount?: number;
}

export interface Payment {
    _id: string;
    user: string;
    amount: number;
    currency: string;
    paymentMethod: 'card' | 'd17';
    transactionId: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    premiumDuration: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentRequest {
    plan: '1month' | '3months' | '1year';
    paymentMethod: 'card' | 'd17';
}

export interface PaymentResponse {
    payment: Payment;
    paymentUrl?: string;
    message: string;
}

export const paymentService = {
    // Get available pricing plans
    async getPlans(): Promise<PaymentPlan[]> {
        const response = await api.get('/payment/plans');
        return response.data.plans;
    },

    // Create payment
    async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
        const response = await api.post('/payment/create', paymentData);
        return response.data;
    },

    // Verify payment status
    async verifyPayment(transactionId: string): Promise<Payment> {
        const response = await api.get(`/payment/verify/${transactionId}`);
        return response.data.payment;
    },

    // Get payment history
    async getPaymentHistory(): Promise<Payment[]> {
        const response = await api.get('/payment/history');
        return response.data.payments;
    },
};
