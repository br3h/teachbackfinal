import { useCallback, useState } from "react";
import axios from "axios";
import { validateEmail } from "@/lib/email";

/**
 * useWaitlistForm — encapsulates the waitlist form's network + state logic.
 *
 * Inputs:
 *   - apiBase: backend URL prefix (e.g. https://example.com/api)
 *   - consentVersion: which version of the policies the user is consenting to
 *   - extras: object whose fields are sent along with the email (persona, mainGoal, subject)
 *
 * Returned state machine values (`status`):
 *   - "idle"      : no submission has been attempted, or the user is editing
 *   - "loading"   : POST in flight
 *   - "success"   : new signup accepted
 *   - "duplicate" : the email is already on the list
 *   - "error"     : validation or network failure
 */
export default function useWaitlistForm({ apiBase, consentVersion, extras }) {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const setError = useCallback((msg) => {
    setStatus("error");
    setMessage(msg);
  }, []);

  const reset = useCallback(() => {
    if (status !== "idle" && status !== "loading") {
      setStatus("idle");
      setMessage("");
    }
  }, [status]);

  const buildPayload = useCallback(
    () => ({
      email: email.trim().toLowerCase(),
      persona: extras?.persona || "",
      mainGoal: extras?.mainGoal || "",
      subject: extras?.subject || "",
      consentAccepted: true,
      consentVersion,
      hp,
      source: "landing-page",
    }),
    [email, extras, consentVersion, hp]
  );

  const interpretError = useCallback((err) => {
    const apiMsg =
      err?.response?.data?.detail || err?.response?.data?.message || null;
    if (err?.response?.status === 422) {
      return "That email does not look right. Please try again.";
    }
    if (err?.response?.status === 400 && typeof apiMsg === "string") {
      return apiMsg;
    }
    if (typeof apiMsg === "string") return apiMsg;
    return "Something went wrong. Please try again in a moment.";
  }, []);

  const submit = useCallback(
    async (e) => {
      if (e && typeof e.preventDefault === "function") e.preventDefault();
      if (status === "loading") return;

      const validationError = validateEmail(email);
      if (validationError) {
        setError(validationError);
        return;
      }
      if (!consent) {
        setError(
          "Please accept the Privacy Policy, Terms, and Data & Compliance Notice to continue."
        );
        return;
      }

      setStatus("loading");
      setMessage("");

      try {
        const res = await axios.post(`${apiBase}/waitlist`, buildPayload(), {
          timeout: 15000,
        });
        const data = res?.data || {};
        if (data.status === "duplicate") {
          setStatus("duplicate");
          setMessage(
            data.message ||
              "You're already on the waitlist. We'll email you when early access opens."
          );
        } else {
          setStatus("success");
          setMessage(
            data.message ||
              "You're on the list. We'll email you when early access opens."
          );
        }
      } catch (err) {
        setError(interpretError(err));
      }
    },
    [
      apiBase,
      buildPayload,
      consent,
      email,
      interpretError,
      setError,
      status,
    ]
  );

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isDuplicate = status === "duplicate";
  const isError = status === "error";
  const isDone = isSuccess || isDuplicate;
  const canSubmit =
    !isLoading && !isDone && consent && email.trim().length > 0;

  return {
    // state
    email,
    hp,
    consent,
    status,
    message,
    // setters
    setEmail,
    setHp,
    setConsent,
    // derived
    isLoading,
    isSuccess,
    isDuplicate,
    isError,
    isDone,
    canSubmit,
    // actions
    submit,
    reset,
  };
}
