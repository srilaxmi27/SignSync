import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User, CheckCircle2 } from "lucide-react";
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

  const [name,             setName]             = useState("");
  const [email,            setEmail]            = useState("");
  const [password,         setPassword]         = useState("");
  const [confirmPassword,  setConfirmPassword]  = useState("");
  const [agreedToTerms,    setAgreedToTerms]    = useState(false);
  const [showPassword,     setShowPassword]     = useState(false);
  const [errors,           setErrors]           = useState<FormErrors>({});
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [formError,        setFormError]        = useState("");
  const [confirmSent,      setConfirmSent]      = useState(false);

  const strength = getPasswordStrength(password);
  const strengthColors = ["bg-ink-300", "bg-coral-500", "bg-coral-400", "bg-signal-400", "bg-mint-500"];

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!name.trim())                        nextErrors.name             = "Full name is required";
    if (!email)                              nextErrors.email            = "Email is required";
    else if (!isValidEmail(email))           nextErrors.email            = "Enter a valid email address";
    if (!password)                           nextErrors.password         = "Password is required";
    else if (password.length < 8)           nextErrors.password         = "Password must be at least 8 characters";
    if (confirmPassword !== password)        nextErrors.confirmPassword  = "Passwords do not match";
    if (!agreedToTerms)                      nextErrors.terms            = "You must accept the terms to continue";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const needsConfirmation = await register(name, email, password);
      if (needsConfirmation) {
        setConfirmSent(true);
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "Unknown error";
      // Map common Supabase errors to friendly messages
      if (raw.toLowerCase().includes("already registered") || raw.toLowerCase().includes("user already exists")) {
        setFormError("An account with this email already exists. Try logging in instead.");
      } else if (raw.toLowerCase().includes("password")) {
        setFormError("Password is too weak. Use at least 8 characters with mixed case and numbers.");
      } else {
        setFormError(raw);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Email confirmation sent screen ────────────────────────────────────────
  if (confirmSent) {
    return (
      <AuthLayout
        heading="Check your inbox"
        subheading="One more step to get started."
        sidePoints={[
          "Free plan with unlimited daily practice sessions",
          "No credit card required to get started",
          "Cancel or upgrade any time",
        ]}
      >
        <div className="flex flex-col items-center gap-5 py-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-signal-50">
            <CheckCircle2 className="h-10 w-10 text-signal-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink-900">Confirm your email</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              We sent a confirmation link to{" "}
              <span className="font-semibold text-ink-700">{email}</span>.
              Click the link in that email to activate your account.
            </p>
          </div>
          <div className="mt-2 w-full rounded-xl2 border border-signal-200 bg-signal-50 p-4 text-left text-sm text-ink-600">
            <p className="font-semibold text-ink-800">Didn't get the email?</p>
            <ul className="mt-1.5 list-disc pl-4 space-y-1 text-xs">
              <li>Check your spam / junk folder</li>
              <li>Wait up to 2 minutes for delivery</li>
              <li>Make sure <strong>{email}</strong> is correct</li>
            </ul>
          </div>
          <Link
            to="/login"
            className="mt-1 text-sm font-semibold text-signal-600 hover:text-signal-700 transition-colors"
          >
            Go to login →
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // ── Registration form ─────────────────────────────────────────────────────
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
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          icon={<User className="h-4 w-4" />}
          autoComplete="name"
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          icon={<Mail className="h-4 w-4" />}
          autoComplete="email"
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password (min. 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            icon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            trailingAction={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="text-ink-400 hover:text-ink-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          {password && (
            <div className="mt-2 flex items-center gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors duration-300 bg-ink-900/10",
                    i < strength.score && strengthColors[strength.score]
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
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          icon={<Lock className="h-4 w-4" />}
          autoComplete="new-password"
        />

        <div>
          <label className="flex items-start gap-2.5 text-sm text-ink-600 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-ink-900/20 text-signal-500 focus:ring-signal-400"
            />
            <span>
              I agree to the{" "}
              <a href="#" onClick={(e) => e.preventDefault()} className="font-semibold text-signal-600 hover:text-signal-700">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" onClick={(e) => e.preventDefault()} className="font-semibold text-signal-600 hover:text-signal-700">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.terms && (
            <p className="mt-1.5 text-sm font-medium text-coral-600">{errors.terms}</p>
          )}
        </div>

        {formError && (
          <p role="alert" className="rounded-xl bg-coral-500/8 px-4 py-3 text-sm font-medium text-coral-600">
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
