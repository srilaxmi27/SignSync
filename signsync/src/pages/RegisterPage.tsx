import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { getPasswordStrength, isValidEmail } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const strength = getPasswordStrength(password);
  const strengthColors = ["bg-ink-300", "bg-coral-500", "bg-coral-400", "bg-signal-400", "bg-mint-500"];

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!name.trim()) {
      nextErrors.name = "Full name is required";
    }
    if (!email) {
      nextErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }
    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match";
    }
    if (!agreedToTerms) {
      nextErrors.terms = "You must accept the terms to continue";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/dashboard", { replace: true });
    } catch {
      setFormError("We couldn't create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      heading="Create your account"
      subheading="Start translating sign language in minutes."
      sidePoints={[
        "Free plan with unlimited daily practice sessions",
        "No credit card required to get started",
        "Cancel or upgrade any time",
      ]}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label="Full name"
          type="text"
          placeholder="Jordan Lee"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
          icon={<User className="h-4.5 w-4.5" />}
          autoComplete="name"
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          icon={<Mail className="h-4.5 w-4.5" />}
          autoComplete="email"
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
            icon={<Lock className="h-4.5 w-4.5" />}
            autoComplete="new-password"
            trailingAction={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-ink-400 hover:text-ink-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            }
          />
          {password && (
            <div className="mt-2 flex items-center gap-1.5">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1.5 flex-1 rounded-full bg-ink-900/10",
                    index < strength.score && strengthColors[strength.score]
                  )}
                />
              ))}
              <span className="ml-2 w-16 text-right text-xs font-medium text-ink-500">
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <Input
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={errors.confirmPassword}
          icon={<Lock className="h-4.5 w-4.5" />}
          autoComplete="new-password"
        />

        <div>
          <label className="flex items-start gap-2.5 text-sm text-ink-600">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(event) => setAgreedToTerms(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-ink-900/20 text-signal-500 focus:ring-signal-400"
            />
            <span>
              I agree to the{" "}
              <a href="#" className="font-semibold text-signal-600 hover:text-signal-700">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="font-semibold text-signal-600 hover:text-signal-700">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.terms && (
            <p className="mt-1.5 text-sm font-medium text-coral-600">{errors.terms}</p>
          )}
        </div>

        {formError && (
          <p role="alert" className="text-sm font-medium text-coral-600">
            {formError}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-signal-600 hover:text-signal-700">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
