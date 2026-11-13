"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; 
import { useRouter } from "next/navigation";
import PaymentModal from "./PaymentModal";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaymentData {
  card_number: string;
  pin: string;
  payment_method: string;
  pay_now: boolean;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
    password: "",
    confirm_password: "",
    privileged_user: false, 
  });
  const [paymentData, setPaymentData] = useState<PaymentData>({
    card_number: "",
    pin: "",
    payment_method: "VISA",
    pay_now: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [error, setError] = useState("");
  const [bio, setBio] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePaymentConfirm = (data: PaymentData) => {
    setPaymentData(data);
    setIsPaymentProcessing(true);
    
    setTimeout(() => {
      setIsPaymentProcessing(false);
      setShowPaymentModal(false);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Lozinke se ne poklapaju");
      setIsLoading(false);
      return;
    }

    if (formData.privileged_user && (!paymentData.card_number || !paymentData.pin)) {
      setError("Molimo popunite podatke za plaćanje za premijum nalog");
      setIsLoading(false);
      return;
    }

    try {
      const registrationData = formData.privileged_user 
        ? { 
      ...formData, 
      privileged_user: formData.privileged_user.toString(), 
      payment_data: paymentData 
    }
  : { 
      ...formData, 
      privileged_user: 'false' 
    };

      const result = await signIn("signup", {
        ...registrationData,
        redirect: false,
      });

      if (result?.error) {
        setError("Došlo je do greške pri registraciji");
      } else {
        handleClose();
      }
    } catch (error) {
      setError("Došlo je do greške pri registraciji");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowPaymentModal(false);
    onClose();
    router.replace(window.location.pathname); 
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setFormData(prev => ({ ...prev, privileged_user: false }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white border shadow-sm rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Registracija korisnika
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              <X className="bg-red-600 text-white rounded-sm shadow-sm" size={28} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  name="first_name"
                  placeholder="Unesite vaše ime"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  name="last_name"
                  placeholder="Unesite vaše prezime"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Unesite vašu mejl adresu"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="tel"
                  name="phone_number"
                  placeholder="Unesite vaš broj telefona"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Unesite vašu lozinku"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-12"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  placeholder="Potvrdi lozinku"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="pl-10 pr-12"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-3 border shadow-sm border-gray-200 text-gray-400 rounded-md"
                required
                disabled={isLoading}
              >
                <option value="">Izaberite pol</option>
                <option value="MALE">Muški</option>
                <option value="FEMALE">Ženski</option>
              </select>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-6">
              <div className="p-4 border border-gray-200 rounded-md">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Postanite premijum korisnik već danas!
                </h3>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="privileged_user" 
                    name="privileged_user" 
                    checked={formData.privileged_user}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({ ...prev, privileged_user: checked }));
                      if (checked) setShowPaymentModal(true);
                    }}
                    disabled={isLoading}
                  />
                  <label htmlFor="privileged_user" className="text-sm text-gray-700">
                    Unapredi svoj nalog
                  </label>
                </div>
                {formData.privileged_user && paymentData.card_number && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ Plaćanje je pripremljeno
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Dodajte biografiju:
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Opišite sebe..."
                  className="w-full p-3 border border-gray-300 rounded-md min-h-[120px]"
                  disabled={isLoading}
                />
              </div>
              
              <div className="">
                <Button
                  type="submit"
                  className="max-w-3xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Registracija..." : "Registruj se"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClosePaymentModal}
        onConfirm={handlePaymentConfirm}
        initialData={paymentData}
        isLoading={isPaymentProcessing}
      />
    </>
  );
}