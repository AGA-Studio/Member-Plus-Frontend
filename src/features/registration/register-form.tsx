"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { TextField } from "@/components/ui/text-field";
import { loginWithBackend } from "@/features/auth/auth-client";
import { useEntryTransition } from "@/features/auth/entry-transition";
import { TurnstileWidget } from "@/features/auth/turnstile-widget";
import { revealClasses } from "@/lib/motion";
import {
  passwordMinLength,
  registrationFieldOrder,
  validateRegistration,
  type RegistrationErrors,
  type RegistrationFailure,
  type RegistrationValues,
} from "@/lib/registration";
import type { Plan } from "@/lib/domain";
import { PlanPicker } from "./plan-picker";
import { registerBusiness } from "./registration-client";
import { useTurnstile } from "./use-turnstile";

type FormFailure = Exclude<RegistrationFailure, { kind: "fields" }>;

type FormSectionProps = {
  title: string;
  index: number;
  children: ReactNode;
};

function FormSection({ title, index, children }: FormSectionProps) {
  return (
    <fieldset className={revealClasses(index)}>
      <legend className="mb-4 font-display text-subheading font-semibold text-foreground">{title}</legend>
      <div className="flex flex-col gap-5">{children}</div>
    </fieldset>
  );
}

const emptyValues: RegistrationValues = {
  businessName: "",
  adminName: "",
  email: "",
  password: "",
  passwordConfirmation: "",
  acceptsPrivacy: false,
};

type RegisterFormProps = {
  plans: Plan[];
  turnstileSiteKey: string;
};

export function RegisterForm({ plans, turnstileSiteKey }: RegisterFormProps) {
  const t = useTranslations("registration");
  const locale = useLocale();
  const router = useRouter();
  const { begin } = useEntryTransition();
  const turnstile = useTurnstile();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [created, setCreated] = useState(false);
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [failure, setFailure] = useState<FormFailure | null>(null);
  const [planId, setPlanId] = useState<number | null>(null);
  const widgetEnabled = turnstileSiteKey !== "";
  const waitingForWidget = widgetEnabled && turnstile.status === "pending";
  const defaultPlan = plans.find((plan) => plan.isDefault) ?? plans[0];
  const selectedPlan = plans.find((plan) => plan.id === planId) ?? defaultPlan;
  const privacyPath = locale.startsWith("en") ? "/en/privacy" : "/privacidad";
  const busy = pending || created;

  function update<Field extends keyof RegistrationValues>(field: Field, value: RegistrationValues[Field]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function showFieldErrors(nextErrors: RegistrationErrors) {
    setErrors(nextErrors);
    const firstInvalid = registrationFieldOrder.find((field) => nextErrors[field]);
    const element = firstInvalid ? formRef.current?.elements.namedItem(firstInvalid) : null;
    if (element instanceof HTMLElement) element.focus();
  }

  async function enterNewAccount(email: string) {
    const loginToken = widgetEnabled ? await turnstile.requestFreshToken() : null;
    const login = await loginWithBackend(email, values.password, loginToken);

    if (login.ok) {
      const playsIntro = begin("accountCreated");
      router.replace(playsIntro ? "/panel" : "/panel?toast=accountCreated");
      router.refresh();
      return;
    }

    const query = new URLSearchParams({ correo: email, toast: "accountCreatedSignIn" });
    router.replace(`/login?${query}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure(null);

    const nextErrors = validateRegistration(values);
    if (Object.keys(nextErrors).length > 0) {
      showFieldErrors(nextErrors);
      return;
    }

    startTransition(async () => {
      const outcome = await registerBusiness(values, selectedPlan.id, turnstile.token);

      if (outcome.ok) {
        setCreated(true);
        await enterNewAccount(outcome.email);
        return;
      }

      if (widgetEnabled) turnstile.reset();

      if (outcome.failure.kind === "fields") {
        showFieldErrors(outcome.failure.errors);
        return;
      }

      setFailure(outcome.failure);
      if (outcome.failure.kind === "planInvalid") router.refresh();
    });
  }

  const failureMessage = failure
    ? failure.kind === "rateLimited"
      ? t("failures.rateLimited", { minutes: failure.minutes })
      : t(`failures.${failure.kind}`)
    : null;

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <FormSection title={t("sections.business")} index={1}>
        <TextField
          name="businessName"
          label={t("fields.businessName")}
          placeholder={t("fields.businessNamePlaceholder")}
          autoComplete="organization"
          value={values.businessName}
          onChange={(event) => update("businessName", event.target.value)}
          error={errors.businessName ? t(`errors.${errors.businessName}`) : undefined}
        />
      </FormSection>

      <FormSection title={t("sections.account")} index={2}>
        <TextField
          name="adminName"
          label={t("fields.adminName")}
          placeholder={t("fields.adminNamePlaceholder")}
          autoComplete="name"
          value={values.adminName}
          onChange={(event) => update("adminName", event.target.value)}
          error={errors.adminName ? t(`errors.${errors.adminName}`) : undefined}
        />
        <TextField
          name="email"
          type="email"
          label={t("fields.email")}
          placeholder={t("fields.emailPlaceholder")}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          error={errors.email ? t(`errors.${errors.email}`) : undefined}
        />
        <TextField
          name="password"
          type="password"
          label={t("fields.password")}
          hint={t("fields.passwordHint", { count: passwordMinLength })}
          autoComplete="new-password"
          value={values.password}
          onChange={(event) => update("password", event.target.value)}
          error={errors.password ? t(`errors.${errors.password}`) : undefined}
        />
        <TextField
          name="passwordConfirmation"
          type="password"
          label={t("fields.passwordConfirmation")}
          autoComplete="new-password"
          value={values.passwordConfirmation}
          onChange={(event) => update("passwordConfirmation", event.target.value)}
          error={errors.passwordConfirmation ? t(`errors.${errors.passwordConfirmation}`) : undefined}
        />
      </FormSection>

      <FormSection title={t("sections.plan")} index={3}>
        <PlanPicker plans={plans} selectedId={selectedPlan.id} onSelect={setPlanId} />
        {selectedPlan.trialDays > 0 ? (
          <Alert key={selectedPlan.id} tone="info">
            {t("plans.trialNote", { plan: defaultPlan.name })}
          </Alert>
        ) : null}
      </FormSection>

      <div className={`flex flex-col gap-4 ${revealClasses(4)}`}>
        <CheckboxField
          name="acceptsPrivacy"
          checked={values.acceptsPrivacy}
          onChange={(event) => update("acceptsPrivacy", event.target.checked)}
          error={errors.acceptsPrivacy ? t(`errors.${errors.acceptsPrivacy}`) : undefined}
        >
          {t.rich("privacy", {
            link: (chunks) => (
              <a
                href={privacyPath}
                target="_blank"
                rel="noopener"
                className="font-semibold text-primary-text underline underline-offset-4"
              >
                {chunks}
              </a>
            ),
          })}
        </CheckboxField>
        {widgetEnabled ? (
          <div className="flex flex-col gap-2">
            <TurnstileWidget
              siteKey={turnstileSiteKey}
              resetCount={turnstile.resetCount}
              onToken={turnstile.onToken}
              onStatusChange={turnstile.onStatusChange}
            />
            {turnstile.status === "unavailable" ? (
              <p role="status" className="text-sm text-muted">
                {t("turnstileUnavailable")}
              </p>
            ) : null}
          </div>
        ) : null}
        {failureMessage ? <Alert tone="danger">{failureMessage}</Alert> : null}
        <Button type="submit" size="lg" fullWidth loading={busy} disabled={waitingForWidget}>
          {busy ? t("submitting") : t("submit")}
        </Button>
        <p className="text-center text-sm text-muted">
          {t("haveAccount")}{" "}
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center font-semibold text-primary-text underline-offset-4 transition-transform duration-150 ease-out hover:underline active:scale-97"
          >
            {t("signIn")}
          </Link>
        </p>
      </div>
    </form>
  );
}
