// Mock Stripe for testing without actual Stripe account
export const mockStripe = {
  paymentIntents: {
    create: async (params: any) => {
      console.log('Mock Stripe: Creating payment intent', params);
      
      // Simulate successful payment intent creation
      return {
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_${Date.now()}_secret_mock`,
        status: 'requires_payment_method',
        amount: params.amount,
        currency: params.currency,
        metadata: params.metadata,
      };
    },
    retrieve: async (id: string) => {
      console.log('Mock Stripe: Retrieving payment intent', id);
      
      // Simulate successful payment
      return {
        id,
        status: 'succeeded',
        payment_method: 'pm_mock_card',
        metadata: {
          orderId: 'mock_order_id',
          buyerId: 'mock_buyer_id',
          sellerId: 'mock_seller_id',
        },
      };
    },
    confirm: async (id: string, params: any) => {
      console.log('Mock Stripe: Confirming payment intent', id, params);
      
      // Simulate successful payment confirmation
      return {
        id,
        status: 'succeeded',
        payment_method: 'pm_mock_card',
      };
    },
  },
  webhooks: {
    constructEvent: (body: string, signature: string, secret: string) => {
      console.log('Mock Stripe: Constructing webhook event');
      
      // Return a mock webhook event
      return {
        id: 'evt_mock_webhook',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_mock_payment_intent',
            status: 'succeeded',
            metadata: {
              orderId: 'mock_order_id',
              buyerId: 'mock_buyer_id',
              sellerId: 'mock_seller_id',
            },
          },
        },
      };
    },
  },
};

// Mock Stripe Elements for frontend
export const mockStripeElements = {
  confirmPayment: async (params: any) => {
    console.log('Mock Stripe: Confirming payment', params);
    
    // Simulate successful payment
    return {
      paymentIntent: {
        id: 'pi_mock_confirmed',
        status: 'succeeded',
      },
      error: null,
    };
  },
};

// Mock Stripe React hook
export const useStripe = () => {
  return {
    confirmPayment: mockStripeElements.confirmPayment,
    elements: mockStripeElements,
  };
};

export const useElements = () => {
  return mockStripeElements;
};

// Mock loadStripe function
export const loadStripe = async (publishableKey: string) => {
  console.log('Mock Stripe: Loading with key', publishableKey);
  
  return {
    confirmPayment: mockStripeElements.confirmPayment,
    elements: () => mockStripeElements,
  };
};

