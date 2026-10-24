"use client";

// Forms for the proxy, OnBuy and Amazon. Used by the onboarding wizard and
// the Connections page. Secrets are never sent back to the browser: saved
// values show as a masked hint, and an empty password box keeps the old one.

import { useActionState, useId, useState } from "react";
import { ExternalLink, KeyRound, ShieldCheck } from "lucide-react";
import { TextField, SelectField, CheckboxField } from "@/components/app/field";
import { FormMessage, SubmitButton } from "@/components/app/form-bits";
import {
  addAmazonSelfAction,
  connectOnBuyAction,
  saveProxyAction,
  startAmazonOAuthAction,
  startImportAction,
  uploadCsvAction,
} from "@/server/actions/app";
import { cn } from "@/lib/utils";

function NextField({ next }: { next?: string }) {
  return next ? <input type="hidden" name="next" value={next} /> : null;
}

export function ProxyForm({ hostHint, savedType, savedPort, next }: { hostHint?: string; savedType?: string; savedPort?: number; next?: string }) {
  const id = useId();
  const [state, action] = useActionState(saveProxyAction, undefined);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-6">
      <NextField next={next} />
      <SelectField id={`${id}-type`} name="type" label="Type" defaultValue={savedType ?? "http"} className="sm:col-span-2">
        <option value="http">HTTP</option>
        <option value="https">HTTPS</option>
        <option value="socks5">SOCKS5</option>
        <option value="socks5h">SOCKS5 (remote DNS)</option>
      </SelectField>
      <TextField
        id={`${id}-host`}
        name="host"
        label="Host"
        placeholder={hostHint ? `Saved: ${hostHint}` : "proxy.example.com"}
        autoComplete="off"
        spellCheck={false}
        required
        className="sm:col-span-3"
      />
      <TextField id={`${id}-port`} name="port" label="Port" inputMode="numeric" defaultValue={savedPort ? String(savedPort) : ""} placeholder="8080" required className="sm:col-span-1" />
      <TextField id={`${id}-user`} name="username" label="Username" hint="Leave empty if the proxy has none." autoComplete="off" spellCheck={false} className="sm:col-span-3" />
      <TextField
        id={`${id}-pass`}
        name="password"
        type="password"
        label="Password"
        hint={hostHint ? "Leave empty to keep the saved password." : undefined}
        autoComplete="new-password"
        className="sm:col-span-3"
      />
      <div className="flex flex-col gap-3 sm:col-span-6">
        <FormMessage state={state} />
        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton variant="sea" pendingLabel="Testing the proxy…">
            <ShieldCheck aria-hidden="true" className="size-4" /> Save and test
          </SubmitButton>
          <p className="text-[13px] text-muted">We look up your exit IP through the proxy. Use a static IP proxy: OnBuy tokens only work from one address.</p>
        </div>
      </div>
    </form>
  );
}

export function OnBuyForm({ keyHint, next, disabled }: { keyHint?: string; next?: string; disabled?: boolean }) {
  const id = useId();
  const [state, action] = useActionState(connectOnBuyAction, undefined);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <NextField next={next} />
      <TextField
        id={`${id}-consumer`}
        name="consumerKey"
        label="Consumer key"
        placeholder={keyHint ? `Saved: ${keyHint}` : undefined}
        autoComplete="off"
        spellCheck={false}
        required
        disabled={disabled}
      />
      <TextField id={`${id}-secret`} name="secretKey" type="password" label="Secret key" autoComplete="new-password" required disabled={disabled} />
      <p className="text-[13px] text-muted sm:col-span-2">
        In OnBuy Seller Control Panel, open the API settings page under Listing → Imports &amp; Integrations. Use your live keys for live listings.
      </p>
      <div className="flex flex-col gap-3 sm:col-span-2">
        <FormMessage state={state} />
        <div>
          <SubmitButton variant="sea" pendingLabel="Checking with OnBuy…" disabled={disabled}>
            <KeyRound aria-hidden="true" className="size-4" /> {keyHint ? "Replace keys" : "Connect OnBuy"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

export function AmazonForms({ oauthAvailable, next, disabled }: { oauthAvailable: boolean; next?: string; disabled?: boolean }) {
  const id = useId();
  const [tab, setTab] = useState<"oauth" | "self">(oauthAvailable ? "oauth" : "self");
  const [oauthState, oauthAction] = useActionState(startAmazonOAuthAction, undefined);
  const [selfState, selfAction] = useActionState(addAmazonSelfAction, undefined);

  const tabButton = (key: "oauth" | "self", label: string) => (
    <button
      type="button"
      role="tab"
      id={`${id}-tab-${key}`}
      aria-selected={tab === key}
      aria-controls={`${id}-panel-${key}`}
      onClick={() => setTab(key)}
      className={cn("min-h-11 rounded-full px-4 text-sm font-semibold transition-colors", tab === key ? "bg-ink text-white" : "text-ink hover:bg-mint")}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div role="tablist" aria-label="How to connect Amazon" className="inline-flex flex-wrap gap-1 rounded-full bg-mist p-1">
        {tabButton("oauth", "Seller Central approval")}
        {tabButton("self", "My own app keys")}
      </div>

      {tab === "oauth" && (
        <div role="tabpanel" id={`${id}-panel-oauth`} aria-labelledby={`${id}-tab-oauth`} className="mt-5">
          {oauthAvailable ? (
            <form action={oauthAction} className="flex flex-col gap-4">
              <NextField next={next} />
              <TextField id={`${id}-label`} name="label" label="Name for this account" placeholder="Main Amazon account" maxLength={80} disabled={disabled} />
              <FormMessage state={oauthState} />
              <div className="flex flex-wrap items-center gap-3">
                <SubmitButton variant="sea" pendingLabel="Opening Seller Central…" disabled={disabled}>
                  Approve in Seller Central <ExternalLink aria-hidden="true" className="size-4" />
                </SubmitButton>
                <p className="text-[13px] text-muted">You&apos;ll sign in on Amazon and come straight back here.</p>
              </div>
            </form>
          ) : (
            <p className="rounded-xl bg-mist p-4 text-sm text-body">
              Seller Central approval isn&apos;t switched on for this server yet. Use your own app keys for now.
            </p>
          )}
        </div>
      )}

      {tab === "self" && (
        <form action={selfAction} role="tabpanel" id={`${id}-panel-self`} aria-labelledby={`${id}-tab-self`} className="mt-5 grid gap-4 sm:grid-cols-2">
          <NextField next={next} />
          <TextField id={`${id}-slabel`} name="label" label="Name for this account" placeholder="Main Amazon account" maxLength={80} className="sm:col-span-2" disabled={disabled} />
          <TextField id={`${id}-cid`} name="clientId" label="LWA client id" autoComplete="off" spellCheck={false} required disabled={disabled} />
          <TextField id={`${id}-csecret`} name="clientSecret" type="password" label="LWA client secret" autoComplete="new-password" required disabled={disabled} />
          <TextField
            id={`${id}-refresh`}
            name="refreshToken"
            type="password"
            label="Refresh token"
            hint="From self-authorising your private app in Seller Central. The app needs the Pricing role."
            autoComplete="new-password"
            required
            className="sm:col-span-2"
            disabled={disabled}
          />
          <div className="flex flex-col gap-3 sm:col-span-2">
            <FormMessage state={selfState} />
            <div>
              <SubmitButton variant="sea" pendingLabel="Checking with Amazon…" disabled={disabled}>
                <KeyRound aria-hidden="true" className="size-4" /> Connect Amazon
              </SubmitButton>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export function OnBuyImportForm({ disabled }: { disabled?: boolean }) {
  const id = useId();
  const [state, action] = useActionState(startImportAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <CheckboxField
        id={`${id}-archived`}
        name="includeArchived"
        label="Also bring back archived SKUs"
        hint="SKUs OnBuy once said don't exist. Leave this off unless you've relisted them."
        disabled={disabled}
      />
      <FormMessage state={state} />
      <div>
        <SubmitButton variant="sea" pendingLabel="Starting import…" disabled={disabled}>
          Import my OnBuy listings
        </SubmitButton>
      </div>
    </form>
  );
}

export function CsvImportForm() {
  const id = useId();
  const [state, action] = useActionState(uploadCsvAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-file`} className="text-sm font-semibold text-ink">
          CSV file
        </label>
        <input
          id={`${id}-file`}
          name="file"
          type="file"
          accept=".csv,text/csv,text/plain"
          required
          aria-describedby={`${id}-file-hint`}
          className="block w-full rounded-xl border-2 border-dashed border-line bg-white p-3 text-sm text-body file:mr-3 file:rounded-full file:border-0 file:bg-mint file:px-4 file:py-2 file:font-semibold file:text-sea-dark"
        />
        <p id={`${id}-file-hint`} className="text-[13px] text-muted">
          A <strong>sku</strong> column is required; <strong>asin</strong> and <strong>title</strong> are optional. Up to 50,000 rows, 5 MB.
        </p>
      </div>
      <FormMessage state={state} />
      <div>
        <SubmitButton variant="outline" pendingLabel="Uploading…">
          Upload CSV
        </SubmitButton>
      </div>
    </form>
  );
}
