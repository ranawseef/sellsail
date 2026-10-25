"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Copy, Eye, EyeOff, KeyRound, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { revealTenantKeysAction, type RevealedKeys } from "@/server/admin/actions";

const HIDE_AFTER_S = 60;

function Secret({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] font-semibold text-muted">{label}</span>
      <div className="flex items-center gap-2 rounded-xl bg-ink px-3 py-2">
        <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-white" title={value}>
          {value || "—"}
        </code>
        {value && (
          <button
            type="button"
            aria-label={`Copy ${label}`}
            onClick={() => navigator.clipboard.writeText(value).then(() => toast.success(`${label} copied`))}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-[#c9ddd5] hover:bg-[#13261e] hover:text-white"
          >
            <Copy aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/** Shows a workspace's OnBuy keys and proxy login on request, then hides them again. */
export function RevealKeys({ tenantId }: { tenantId: number }) {
  const reduce = useReducedMotion();
  const [keys, setKeys] = useState<RevealedKeys | null>(null);
  const [left, setLeft] = useState(0);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!keys) return;
    const t = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setKeys(null);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [keys]);

  const reveal = () =>
    start(async () => {
      const res = await revealTenantKeysAction(tenantId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setKeys(res);
      setLeft(HIDE_AFTER_S);
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {keys ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setKeys(null)}>
            <EyeOff aria-hidden="true" className="size-4" /> Hide now
          </Button>
        ) : (
          <Button type="button" variant="ink" size="sm" onClick={reveal} disabled={pending}>
            {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Eye aria-hidden="true" className="size-4" />}
            {pending ? "Decrypting…" : "Reveal keys"}
          </Button>
        )}
        <span className="text-[13px] text-muted" aria-live="polite">
          {keys ? `Hiding in ${left}s` : "Each reveal is recorded in the audit log."}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {keys && (
          <motion.div
            key="keys"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? undefined : { opacity: 0, height: 0 }}
            className="grid gap-4 overflow-hidden sm:grid-cols-2"
          >
            <div className="flex flex-col gap-3 rounded-2xl bg-mist p-4">
              <p className="flex items-center gap-2 text-sm font-bold">
                <KeyRound aria-hidden="true" className="size-4 text-sea" /> OnBuy API keys
              </p>
              {keys.onbuy ? (
                <>
                  <Secret label="Consumer key" value={keys.onbuy.consumerKey} />
                  <Secret label="Secret key" value={keys.onbuy.secretKey} />
                </>
              ) : (
                <p className="text-sm text-muted">OnBuy isn&apos;t connected.</p>
              )}
            </div>
            <div className="flex flex-col gap-3 rounded-2xl bg-mist p-4">
              <p className="text-sm font-bold">Proxy</p>
              {keys.proxy ? (
                <>
                  <Secret label="Address" value={`${keys.proxy.type}://${keys.proxy.host}:${keys.proxy.port}`} />
                  <Secret label="Username" value={keys.proxy.username} />
                  <Secret label="Password" value={keys.proxy.password} />
                </>
              ) : (
                <p className="text-sm text-muted">No proxy: OnBuy calls go direct.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
