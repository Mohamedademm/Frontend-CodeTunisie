export const PRICING_PLANS = [
    {
        id: '1month',
        title: 'pricing.monthly.title',
        price: '40',
        currency: 'DT',
        duration: 'pricing.monthly.duration',
        description: 'pricing.monthly.description',
        badge: '',
        features: [
            'pricing.monthly.features.0',
            'pricing.monthly.features.1',
            'pricing.monthly.features.2',
            'pricing.monthly.features.3',
            'pricing.monthly.features.4'
        ]
    },
    {
        id: '3months',
        title: 'pricing.quarterly.title',
        price: '30',
        currency: 'DT',
        duration: 'pricing.quarterly.duration',
        description: 'pricing.quarterly.description',
        badge: 'pricing.quarterly.badge',
        discount: '-25%',
        features: [
            'pricing.quarterly.features.0',
            'pricing.quarterly.features.1',
            'pricing.quarterly.features.2',
            'pricing.quarterly.features.3',
            'pricing.quarterly.features.4'
        ]
    },
    {
        id: '1year',
        title: 'pricing.annual.title',
        price: '15',
        currency: 'DT',
        duration: 'pricing.annual.duration',
        description: 'pricing.annual.description',
        badge: 'pricing.annual.badge',
        discount: '-60%',
        features: [
            'pricing.annual.features.0',
            'pricing.annual.features.1',
            'pricing.annual.features.2',
            'pricing.annual.features.3',
            'pricing.annual.features.4'
        ]
    }
];

export const PAYMENT_METHODS = [
    {
        id: 'd17',
        name: 'D17',
        icon: 'Smartphone',
        description: 'payment.d17.description'
    },
    {
        id: 'card',
        name: 'payment.card.name',
        icon: 'CreditCard',
        description: 'payment.card.description'
    }
];
