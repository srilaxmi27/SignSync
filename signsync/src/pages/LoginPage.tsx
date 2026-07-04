import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { isValidEmail } from "@/lib/utils";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!email) {
      nextErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
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
      await login(email, password);
      const redirectTo =
        (location.state as { from?: string } | null)?.from ?? "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch {
      setFormError("We couldn't log you in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      heading="Welcome back"
      subheading="Log in to continue your conversations."
      sidePoints={[
        "Real-time translation between sign and spoken language",
        "Session history saved automatically",
        "Works on any device with a camera",
      ]}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
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

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          icon={<Lock className="h-4.5 w-4.5" />}
          autoComplete="current-password"
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

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-ink-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-ink-900/20 text-signal-500 focus:ring-signal-400"
            />
            Remember me
          </label>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-sm font-semibold text-signal-600 hover:text-signal-700"
          >
            Forgot password?
          </a>
        </div>

        {formError && (
          <p role="alert" className="text-sm font-medium text-coral-600">
            {formError}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
          Log in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-signal-600 hover:text-signal-700">
          Sign up for free
        </Link>
      </p>
    </AuthLayout>
  );
}
