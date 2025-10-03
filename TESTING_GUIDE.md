# 🧪 **Payment System Testing Guide**

## **Easy Testing Without Stripe Account**

You can test the payment system completely without setting up a real Stripe account or going through KYC verification.

### **Step 1: Create Simple Environment File**

Create a `.env.local` file in your project root with these mock values:

```bash
# Mock Testing Environment - No real Stripe account needed
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_mock_key_for_testing
STRIPE_SECRET_KEY=sk_test_mock_key_for_testing
STRIPE_WEBHOOK_SECRET=whsec_mock_webhook_secret

# Add your Supabase keys here (if you have them)
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Step 2: Start the Development Server**

```bash
npm run dev
```

Your app will be available at: http://localhost:3002

### **Step 3: Test the Mock Payment Flow**

1. **Sign up/Login** to your account
2. **Browse listings** at http://localhost:3002/listings
3. **Click on any product** to view details
4. **Click "🧪 Mock Test Payment"** button (blue button)
5. **Fill out the mock payment form**:
   - Card Number: `4242 4242 4242 4242` (already filled)
   - Expiry: `12/25` (already filled)
   - CVC: `123` (already filled)
6. **Click "🧪 Mock Pay"** button
7. **Wait 2 seconds** for the mock processing
8. **You'll be redirected** to a success page

### **Step 4: What You'll See**

✅ **Mock Payment Form**: Complete payment interface with luxury styling
✅ **Order Summary**: Shows pricing, commission, and seller payout
✅ **Mock Processing**: 2-second delay simulating real payment
✅ **Success Redirect**: Takes you to order confirmation page
✅ **Console Logs**: Check browser console for mock payment details

### **Step 5: Test Different Scenarios**

#### **Test Card Numbers (Mock)**
- `4242 4242 4242 4242` - Success
- `4000 0000 0000 0002` - Declined (if you implement error handling)
- `4000 0000 0000 9995` - Insufficient funds

#### **Test Different Quantities**
- Change quantity in URL: `/mock-checkout?product=ID&quantity=5`
- See how pricing changes with quantity

### **What's Being Tested**

🧪 **Payment Flow**: Complete checkout process
🧪 **UI/UX**: Luxury payment form styling
🧪 **Calculations**: Commission, totals, seller payout
🧪 **Navigation**: Success/failure redirects
🧪 **Error Handling**: Form validation and error states
🧪 **Responsive Design**: Mobile/desktop layouts

### **Console Output**

Check your browser console to see:
```
Mock Stripe: Creating payment intent
Mock Payment Successful: {
  orderId: "order_1234567890",
  amount: 150.00,
  product: "Royal Kenyan Mangoes",
  buyer: "user@example.com"
}
```

### **Next Steps**

Once you're satisfied with the mock testing:

1. **Get real Stripe keys** (when ready)
2. **Replace mock values** in `.env.local`
3. **Test with real Stripe** using test mode
4. **Deploy to production** with live Stripe keys

### **Troubleshooting**

**❌ "Please sign in" error**: Make sure you're logged in
**❌ "Product not found"**: Create a test product listing first
**❌ Page not loading**: Check if development server is running
**❌ Styling issues**: Clear browser cache and refresh

### **Mock vs Real Payment**

| Feature | Mock Testing | Real Stripe |
|---------|-------------|-------------|
| Setup Time | 2 minutes | 30 minutes |
| Account Required | ❌ No | ✅ Yes |
| KYC Required | ❌ No | ✅ Yes |
| Real Money | ❌ No | ❌ No (test mode) |
| Full Testing | ✅ Yes | ✅ Yes |

**The mock testing gives you 90% of the functionality testing without any external setup!**

---

## **Quick Test Checklist**

- [ ] Development server running on port 3002
- [ ] User account created and logged in
- [ ] Product listing exists
- [ ] Mock checkout button visible
- [ ] Payment form loads correctly
- [ ] Mock payment processes successfully
- [ ] Success page displays
- [ ] Console shows mock payment logs

**Ready to test! 🚀**
