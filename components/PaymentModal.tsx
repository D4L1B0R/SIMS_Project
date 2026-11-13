"use client";

import { useState } from "react";
import { X, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaymentData {
  card_number: string;
  pin: string;
  payment_method: string;
  pay_now: boolean;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: PaymentData) => void;
  initialData?: PaymentData;
  isLoading?: boolean;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  initialData, 
  isLoading = false 
}: PaymentModalProps) {
  const [paymentData, setPaymentData] = useState<PaymentData>(
    initialData || {
      card_number: "",
      pin: "",
      payment_method: "VISA",
      pay_now: true,
    }
  );

  const handlePaymentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setPaymentData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setPaymentData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(paymentData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white border shadow-sm rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Plaćanje za premijum nalog
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X className="bg-red-600 text-white rounded-sm shadow-sm" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              name="card_number"
              placeholder="Broj kartice"
              value={paymentData.card_number}
              onChange={handlePaymentChange}
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="password"
              name="pin"
              placeholder="PIN"
              value={paymentData.pin}
              onChange={handlePaymentChange}
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="pay_now"
              name="pay_now"
              checked={paymentData.pay_now}
              onChange={handlePaymentChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={isLoading}
            />
            <label htmlFor="pay_now" className="text-sm text-gray-700">
              Plaćanje odmah
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Način plaćanja:
            </label>
            <div className="flex space-x-4">
              {["VISA", "PayPal", "MasterCard"].map((method) => (
                <label key={method} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="payment_method"
                    value={method}
                    checked={paymentData.payment_method === method}
                    onChange={handlePaymentChange}
                    className="text-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-700">{method}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Otkaži
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Obrada..." : "Potvrdi plaćanje"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}