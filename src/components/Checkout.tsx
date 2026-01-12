import React, { useState } from 'react';
import { ArrowLeft, Upload, X, Check, Loader2 } from 'lucide-react';
import { CartItem, PaymentMethod, ServiceType } from '../types';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { useOrders } from '../hooks/useOrders';
import { uploadReceiptToCloudinary, compressImage } from '../lib/cloudinary';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack }) => {
  const { paymentMethods } = usePaymentMethods();
  const { createOrder, creating, error } = useOrders();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('pickup');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [rentalStartDate, setRentalStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [referenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [uiNotice, setUiNotice] = useState<string | null>(null);
  // Receipt upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Renter ID upload state
  const [renterIdFile, setRenterIdFile] = useState<File | null>(null);
  const [renterIdPreview, setRenterIdPreview] = useState<string | null>(null);
  const [renterIdUrl, setRenterIdUrl] = useState<string | null>(null);
  const [uploadingRenterId, setUploadingRenterId] = useState(false);

  const copyOrderDetails = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptFile(file);
    setUploadError(null);
    setReceiptUrl(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Background upload
    try {
      setUploadingReceipt(true);
      const compressedFile = await compressImage(file, 1200, 0.8);
      const url = await uploadReceiptToCloudinary(compressedFile);
      setReceiptUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload receipt');
    } finally {
      setUploadingReceipt(false);
    }
  };


  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    setReceiptUrl(null);
    setUploadError(null);
  };

  const handleRenterIdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRenterIdFile(file);
    setUploadError(null);
    setRenterIdUrl(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setRenterIdPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Background upload
    try {
      setUploadingRenterId(true);
      const compressedFile = await compressImage(file, 1200, 0.8);
      const url = await uploadReceiptToCloudinary(compressedFile);
      setRenterIdUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload Renter ID');
    } finally {
      setUploadingRenterId(false);
    }
  };

  const handleRemoveRenterId = () => {
    setRenterIdFile(null);
    setRenterIdPreview(null);
    setRenterIdUrl(null);
    setUploadError(null);
  };

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Set default payment method when payment methods are loaded
  React.useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethod) {
      setPaymentMethod(paymentMethods[0].id as PaymentMethod);
    }
  }, [paymentMethods, paymentMethod]);

  const selectedPaymentMethod = paymentMethods.find(method => method.id === paymentMethod);

  const handleProceedToPayment = () => {
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    // Upload Renter ID if selected but not yet uploaded
    let uploadedRenterIdUrl = renterIdUrl;
    if (renterIdFile && !uploadedRenterIdUrl) {
      try {
        setUploadingRenterId(true);
        setUploadError(null);
        setUiNotice('Verifying ID status (Uploading)...');
        const compressedFile = await compressImage(renterIdFile, 1200, 0.8);
        uploadedRenterIdUrl = await uploadReceiptToCloudinary(compressedFile);
        setRenterIdUrl(uploadedRenterIdUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload Renter ID';
        setUploadError(message);
        setUiNotice(`ID upload failed: ${message}.`);
        setUploadingRenterId(false);
        return;
      } finally {
        setUploadingRenterId(false);
      }
    }

    // Upload receipt if selected but not yet uploaded
    let uploadedReceiptUrl = receiptUrl;
    if (receiptFile && !uploadedReceiptUrl) {
      try {
        setUploadingReceipt(true);
        setUploadError(null);
        setUiNotice('Verifying receipt status (Uploading)...');
        const compressedFile = await compressImage(receiptFile, 1200, 0.8);
        uploadedReceiptUrl = await uploadReceiptToCloudinary(compressedFile);
        setReceiptUrl(uploadedReceiptUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload receipt';
        setUploadError(message);
        setUiNotice(`Receipt upload failed: ${message}.`);
        setUploadingReceipt(false);
        return;
      } finally {
        setUploadingReceipt(false);
      }
    }

    // Persist order to database
    let orderId: string;
    try {
      const mergedNotes = landmark ? `${notes ? notes + ' | ' : ''}Landmark: ${landmark}` : notes;
      const order = await createOrder({
        customerName,
        contactNumber,
        serviceType,
        address: serviceType === 'delivery' ? address : undefined,
        pickupTime: undefined,
        paymentMethod,
        referenceNumber,
        notes: mergedNotes,
        total: totalPrice,
        items: cartItems,
        receiptUrl: uploadedReceiptUrl ?? undefined,
        renterIdUrl: uploadedRenterIdUrl ?? undefined,
        rentalStartDate: rentalStartDate,
      });
      orderId = order.id;
    } catch (e) {
      const raw = e instanceof Error ? e.message : '';
      if (/insufficient stock/i.test(raw)) {
        setUiNotice(raw);
        return;
      }
      if (/rate limit/i.test(raw)) {
        setUiNotice('Too many orders: Please wait 1 minute before placing another order.');
      } else if (/missing identifiers/i.test(raw)) {
        setUiNotice('Too many orders: Please wait 1 minute before placing another order.');
      } else {
        setUiNotice('Too many orders: Please wait 1 minute before placing another order.');
      }
      return;
    }

    const orderDetails = `
🏕️ Recreational Gear rental Booking
📋 Order Code: #${orderId.slice(-8).toUpperCase()}

👤 Renter: ${customerName}
📞 Contact: ${contactNumber}
📅 Start Date: ${rentalStartDate}
📍 Service: ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
${serviceType === 'delivery' ? `🏠 Address: ${address}${landmark ? `\n🗺️ Landmark: ${landmark}` : ''}` : ''}


📋 ORDER DETAILS:
${cartItems.map(item => {
      let itemDetails = `• ${item.name}`;
      if (item.selectedVariation) {
        itemDetails += ` (${item.selectedVariation.name})`;
      }
      if (item.selectedAddOns && item.selectedAddOns.length > 0) {
        itemDetails += ` + ${item.selectedAddOns.map(addOn =>
          addOn.quantity && addOn.quantity > 1
            ? `${addOn.name} x${addOn.quantity}`
            : addOn.name
        ).join(', ')}`;
      }
      itemDetails += ` x${item.quantity} - ₱${item.totalPrice * item.quantity}`;
      return itemDetails;
    }).join('\n')}

📋 ITEM DESCRIPTIONS:
${cartItems.map(item => `💡 ${item.name}: ${item.description || 'N/A'}`).join('\n')}

💰 TOTAL: ₱${totalPrice}
${serviceType === 'delivery' ? `🛵 DELIVERY FEE:` : ''}

💳 Payment: ${selectedPaymentMethod?.name || paymentMethod}
${uploadedReceiptUrl ? `📸 Payment Receipt: ${uploadedReceiptUrl}` : '📸 Payment Screenshot: Please attach your payment receipt screenshot'}
${uploadedRenterIdUrl ? `🆔 Renter ID: ${uploadedRenterIdUrl}` : ''}

${notes ? `📝 Notes: ${notes}` : ''}

Please confirm this gear reservation. Thank you for choosing Recreational Gear rental! ⛰️

📋 Order Code: #${orderId.slice(-8).toUpperCase()}
    `.trim();

    const pageId = 'Recreationalgearrental';
    const encodedMessage = encodeURIComponent(orderDetails);
    const webLink = `https://m.me/${pageId}?text=${encodedMessage}`;

    // Best effort: copy order details so user can paste in Messenger if text cannot be prefilled
    await copyOrderDetails(orderDetails);

    // Use window.location for both mobile and desktop to avoid popup blocker
    // This will navigate away from the site but ensures the link always works
    window.location.href = webLink;

  };

  const isDetailsValid = customerName && contactNumber &&
    (serviceType !== 'delivery' || address) &&
    renterIdFile;

  if (step === 'details') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-12 border-b-4 border-secondary pb-8">
          <div>
            <h1 className="text-5xl font-black text-secondary uppercase tracking-tighter">Gear Reservation</h1>
            <p className="text-primary font-black uppercase tracking-widest text-[10px] mt-2">Step 1: Secure Your Equipment</p>
          </div>
          <button
            onClick={onBack}
            className="group flex items-center space-x-2 text-secondary font-black uppercase tracking-widest text-[10px] hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Update Bag</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white border border-secondary/10 p-8">
            <h2 className="text-xs font-black text-secondary uppercase tracking-[0.3em] mb-8 border-b border-secondary/10 pb-4">Reservation Summary</h2>

            <div className="space-y-6 mb-8">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between py-4 border-b border-secondary/5">
                  <div className="flex-1">
                    <h4 className="font-black text-secondary uppercase text-sm tracking-tight">{item.name}</h4>
                    {item.selectedVariation && (
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Duration: {item.selectedVariation.name}</p>
                    )}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Extras: {item.selectedAddOns.map(addOn => addOn.name).join(', ')}
                      </p>
                    )}
                    <p className="text-[10px] font-bold text-gray-500 mt-2">₱{item.totalPrice.toLocaleString()} UNIT VALUE</p>
                  </div>
                  <span className="font-black text-secondary">₱{(item.totalPrice * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <div className="flex items-end justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Investment</span>
                <span className="text-4xl font-black text-secondary">₱{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="bg-white border border-secondary/10 p-8 shadow-2xl">
            <h2 className="text-xs font-black text-secondary uppercase tracking-[0.3em] mb-8 border-b border-secondary/10 pb-4">Renter Information</h2>

            <form className="space-y-8">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Full Legal Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-0 py-3 border-b-2 border-gray-100 focus:border-primary bg-transparent text-secondary font-bold transition-all duration-300 outline-none"
                    placeholder="FirstName LastName"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Contact Number</label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-0 py-3 border-b-2 border-gray-100 focus:border-primary bg-transparent text-secondary font-bold transition-all duration-300 outline-none"
                    placeholder="09XX XXX XXXX"
                    required
                  />
                </div>
              </div>

              {/* Rental Start Date */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Starting Date of Renting</label>
                <input
                  type="date"
                  value={rentalStartDate}
                  onChange={(e) => setRentalStartDate(e.target.value)}
                  className="w-full px-0 py-3 border-b-2 border-gray-100 focus:border-primary bg-transparent text-secondary font-bold transition-all duration-300 outline-none"
                  required
                />
              </div>

              {/* Renter ID Upload */}
              <div className="border border-secondary/10 p-6">
                <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">🆔 Renter ID Verification</h4>
                <p className="text-[10px] text-gray-400 mb-4 font-black uppercase tracking-widest leading-relaxed">
                  Please upload a valid government-issued ID for verification.
                </p>

                {!renterIdPreview ? (
                  <div>
                    <label
                      htmlFor="renter-id-upload"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-100 cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center py-6">
                        <Upload className="h-6 w-6 text-gray-300 mb-3" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                          Upload ID Document
                        </p>
                      </div>
                      <input
                        id="renter-id-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleRenterIdFileChange}
                        required
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative overflow-hidden">
                      <img
                        src={renterIdPreview}
                        alt="ID preview"
                        className="w-full h-48 object-cover grayscale"
                      />
                      <button
                        onClick={handleRemoveRenterId}
                        className="absolute top-4 right-4 p-2 bg-secondary text-white hover:bg-primary transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {renterIdUrl ? (
                      <div className="flex items-center space-x-3 text-primary bg-primary/5 p-4">
                        <Check className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">ID Uploaded Successfully</span>
                      </div>
                    ) : uploadingRenterId ? (
                      <div className="flex items-center space-x-3 text-secondary bg-secondary/5 p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Uploading ID...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 text-gray-400 bg-gray-50 p-4">
                        <span className="text-[10px] font-black uppercase tracking-widest">ID Ready for Submission</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Rental Fulfillment</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'pickup', label: 'Pickup', icon: '⛰️' },
                    { value: 'delivery', label: 'Delivery', icon: '🛵' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setServiceType(option.value as ServiceType)}
                      className={`p-6 border-2 transition-all duration-300 text-left ${serviceType === option.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                        }`}
                    >
                      <div className="text-2xl mb-2 opacity-50 grayscale">{option.icon}</div>
                      <div className="text-xs font-black uppercase tracking-widest">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              {serviceType === 'delivery' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Delivery Basecamp</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-0 py-3 border-b-2 border-gray-100 focus:border-primary bg-transparent text-secondary font-bold transition-all duration-300 outline-none resize-none"
                      placeholder="Enter complete coordinate or address"
                      rows={2}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tactical Landmark</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-0 py-3 border-b-2 border-gray-100 focus:border-primary bg-transparent text-secondary font-bold transition-all duration-300 outline-none"
                      placeholder="e.g., Near the old pine tree"
                    />
                  </div>
                </div>
              )}

              {/* Special Notes */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Field Notes / Instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-0 py-3 border-b-2 border-gray-100 focus:border-primary bg-transparent text-secondary font-bold transition-all duration-300 outline-none resize-none"
                  placeholder="Requests for specific gear checks..."
                  rows={2}
                />
              </div>

              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={!isDetailsValid}
                className={`w-full py-6 font-black text-sm uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl ${isDetailsValid
                  ? 'bg-primary text-white hover:bg-secondary'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
              >
                Proceed to Verification
              </button>
            </form>
          </div>
        </div >
      </div >
    );
  }

  // Payment Step
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-12 border-b-4 border-secondary pb-8">
        <div>
          <h1 className="text-5xl font-black text-secondary uppercase tracking-tighter">Verification</h1>
          <p className="text-primary font-black uppercase tracking-widest text-[10px] mt-2">Step 2: Finalize Reservation</p>
        </div>
        <button
          onClick={() => setStep('details')}
          className="group flex items-center space-x-2 text-secondary font-black uppercase tracking-widest text-[10px] hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Edit Details</span>
        </button>
      </div>

      {uiNotice && (
        <div className="mb-8 p-6 bg-primary/5 border-l-4 border-primary">
          <p className="text-sm font-black text-primary uppercase tracking-widest">{uiNotice}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Payment Method Selection */}
        <div className="space-y-8">
          <div className="bg-white border border-secondary/10 p-8 shadow-2xl">
            <h2 className="text-xs font-black text-secondary uppercase tracking-[0.3em] mb-8 border-b border-secondary/10 pb-4">Payment Method</h2>

            <div className="grid grid-cols-1 gap-4 mb-8">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                  className={`p-6 border-2 transition-all duration-300 flex items-center justify-between ${paymentMethod === method.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                    }`}
                >
                  <span className="font-black uppercase tracking-widest text-xs">{method.name}</span>
                  <span className="text-2xl opacity-50">💳</span>
                </button>
              ))}
            </div>

            {/* Payment Details with QR Code */}
            {selectedPaymentMethod && (
              <div className="bg-secondary p-8 text-white mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-6">Payment Credentials</p>
                <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Account Name</p>
                      <p className="font-black uppercase tracking-tight">{selectedPaymentMethod.account_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Account Number</p>
                      <p className="font-mono text-xl font-black">{selectedPaymentMethod.account_number}</p>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Required Deposit</p>
                      <p className="text-4xl font-black text-primary">₱{totalPrice.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="bg-white p-2 flex-shrink-0">
                    <img
                      src={selectedPaymentMethod.qr_code_url}
                      alt={`${selectedPaymentMethod.name} QR Code`}
                      className="w-32 h-32"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Receipt Upload */}
            <div className="border border-secondary/10 p-6">
              <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">📸 Authentication Receipt</h4>

              {!receiptPreview ? (
                <div>
                  <label
                    htmlFor="receipt-upload"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-100 cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center py-6">
                      <Upload className="h-6 w-6 text-gray-300 mb-3" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                        Select Receipt Image
                      </p>
                    </div>
                    <input
                      id="receipt-upload"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                      onChange={handleReceiptFileChange}
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative overflow-hidden">
                    <img
                      src={receiptPreview}
                      alt="Receipt preview"
                      className="w-full h-48 object-cover grayscale"
                    />
                    <button
                      onClick={handleRemoveReceipt}
                      className="absolute top-4 right-4 p-2 bg-secondary text-white hover:bg-primary transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {receiptUrl ? (
                    <div className="flex items-center space-x-3 text-primary bg-primary/5 p-4">
                      <Check className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Receipt Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 text-secondary bg-secondary/5 p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Verification</span>
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest">
                      {uploadError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Renter ID Verification Preview (Consistency with Receipt) */}
            <div className="border border-secondary/10 p-6">
              <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">🆔 Renter ID Identification</h4>

              {!renterIdPreview ? (
                <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center space-x-2">
                  <X className="h-4 w-4" />
                  <span>Missing ID Identification</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative overflow-hidden">
                    <img
                      src={renterIdPreview}
                      alt="ID Identification Preview"
                      className="w-full h-48 object-cover grayscale"
                    />
                  </div>
                  {renterIdUrl ? (
                    <div className="flex items-center space-x-3 text-primary bg-primary/5 p-4">
                      <Check className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">ID Verified</span>
                    </div>
                  ) : uploadingRenterId ? (
                    <div className="flex items-center space-x-3 text-secondary bg-secondary/5 p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Verification</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 text-gray-400 bg-gray-50 p-4">
                      <span className="text-[10px] font-black uppercase tracking-widest">Ready for Submission</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-secondary/10 p-8">
          <h2 className="text-xs font-black text-secondary uppercase tracking-[0.3em] mb-8 border-b border-secondary/10 pb-4">Final Manifest</h2>

          <div className="space-y-6 mb-8">
            <div className="bg-secondary/5 p-6 border-l-4 border-secondary">
              <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] mb-4">Renter Profile</h4>
              <div className="space-y-2">
                <p className="text-xs font-black uppercase text-gray-500 tracking-tight">Name: <span className="text-secondary">{customerName}</span></p>
                <p className="text-xs font-black uppercase text-gray-500 tracking-tight">Contact: <span className="text-secondary">{contactNumber}</span></p>
                <p className="text-xs font-black uppercase text-gray-500 tracking-tight">Start Date: <span className="text-secondary">{rentalStartDate}</span></p>
                <p className="text-xs font-black uppercase text-gray-500 tracking-tight">Service: <span className="text-secondary">{serviceType}</span></p>
                {serviceType === 'delivery' && address && (
                  <p className="text-xs font-black uppercase text-gray-500 tracking-tight">Location: <span className="text-secondary">{address}</span></p>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between py-3 border-b border-secondary/5">
                  <div className="flex-1">
                    <h4 className="font-black text-secondary uppercase text-xs tracking-tight">{item.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-1">QTY: {item.quantity}</p>
                  </div>
                  <span className="font-black text-secondary text-sm">₱{(item.totalPrice * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 mb-8 border-t-4 border-secondary">
            <div className="flex items-end justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Investment</span>
              <span className="text-5xl font-black text-secondary">₱{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={creating || uploadingReceipt || uploadingRenterId}
            className={`w-full py-6 font-black text-sm uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl ${creating || uploadingReceipt || uploadingRenterId
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-secondary'
              }`}
          >
            {uploadingRenterId ? (
              <span className="flex items-center justify-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing ID...</span>
              </span>
            ) : uploadingReceipt ? (
              <span className="flex items-center justify-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing Receipt...</span>
              </span>
            ) : creating ? (
              'Creating Reservation...'
            ) : (
              'Confirm via Messenger'
            )}
          </button>

          {error && !uiNotice && (
            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest text-center mt-4">{error}</p>
          )}

          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center mt-6">
            Secure channel redirect to Facebook Messenger
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
