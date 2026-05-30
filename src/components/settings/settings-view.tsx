"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { AccountSection } from "@/components/settings/account-section";
import {
  Download,
  ExternalLink,
  Info,
  Mail,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { APP_NAME, FEEDBACK_EMAIL, SHEP_FULL_NAME, SHEP_NAME } from "@/lib/constants";
import { FEATURED_TRANSLATIONS } from "@/lib/bible-helloao";
import { clearAllShepherdData, downloadShepherdExport } from "@/lib/export-data";
import { useProfileStore } from "@/stores/profile-store";
import {
  useSettingsStore,
  type ThemePreference,
  type VoiceTone,
  type VoiceEngine,
} from "@/stores/settings-store";
import { SHEP_OPENAI_VOICES } from "@/lib/shep-voice";
import { useChatStore } from "@/stores/chat-store";

const TRANSLATION_OPTIONS = [
  ...FEATURED_TRANSLATIONS,
  { id: "eng_dra", name: "Douay-Rheims" },
  { id: "eng_gnv", name: "Geneva Bible" },
  { id: "eng_fbv", name: "Free Bible Version" },
];

export function SettingsView() {
  const { setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const name = useProfileStore((s) => s.name);
  const bio = useProfileStore((s) => s.bio);
  const photoUrl = useProfileStore((s) => s.photoUrl);
  const setName = useProfileStore((s) => s.setName);
  const setBio = useProfileStore((s) => s.setBio);
  const setPhotoUrl = useProfileStore((s) => s.setPhotoUrl);

  const defaultTranslation = useSettingsStore((s) => s.defaultTranslation);
  const themePreference = useSettingsStore((s) => s.themePreference);
  const voiceEnabled = useSettingsStore((s) => s.voiceEnabled);
  const voiceEngine = useSettingsStore((s) => s.voiceEngine);
  const openAiVoice = useSettingsStore((s) => s.openAiVoice);
  const voiceRate = useSettingsStore((s) => s.voiceRate);
  const voicePitch = useSettingsStore((s) => s.voicePitch);
  const voiceTone = useSettingsStore((s) => s.voiceTone);
  const setDefaultTranslation = useSettingsStore((s) => s.setDefaultTranslation);
  const setThemePreference = useSettingsStore((s) => s.setThemePreference);
  const setVoiceEnabled = useSettingsStore((s) => s.setVoiceEnabled);
  const setVoiceEngine = useSettingsStore((s) => s.setVoiceEngine);
  const setOpenAiVoice = useSettingsStore((s) => s.setOpenAiVoice);
  const setVoiceRate = useSettingsStore((s) => s.setVoiceRate);
  const setVoicePitch = useSettingsStore((s) => s.setVoicePitch);
  const setVoiceTone = useSettingsStore((s) => s.setVoiceTone);
  const highContrast = useSettingsStore((s) => s.highContrast);
  const setHighContrast = useSettingsStore((s) => s.setHighContrast);
  const ambientSoundEnabled = useSettingsStore((s) => s.ambientSoundEnabled);
  const setAmbientSoundEnabled = useSettingsStore((s) => s.setAmbientSoundEnabled);

  const clearMessages = useChatStore((s) => s.clearMessages);

  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (themePreference === "system") {
      setTheme("system");
    } else {
      setTheme(themePreference);
    }
  }, [themePreference, setTheme]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleThemeChange = (mode: ThemePreference) => {
    setThemePreference(mode);
    setTheme(mode === "system" ? "system" : mode);
  };

  const handleClearChat = () => {
    clearMessages();
    window.location.href = "/chat";
  };

  const handleDeleteAccount = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    clearAllShepherdData();
    window.location.reload();
  };

  return (
    <div className="space-y-4 pb-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <ProfileAvatar name={name} photoUrl={photoUrl} size="lg" />
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Change photo
              </Button>
              {photoUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPhotoUrl(null)}
                >
                  Remove photo
                </Button>
              )}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Display name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Bio
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short note about your faith journey…"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Bible preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Default translation
          </label>
          <select
            value={defaultTranslation}
            onChange={(e) => setDefaultTranslation(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
          >
            {TRANSLATION_OPTIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-[11px] text-muted-foreground">
            NIV and ESV require licensed providers and aren&apos;t on the free
            helloao API. NET, KJV, ASV, and others are available.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Voice ({SHEP_NAME})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingRow label="Text-to-speech" description="Shep speaks replies aloud">
            <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
          </SettingRow>
          <SettingRow
            label="Meadow ambient"
            description="Soft sanctuary soundscape in chat (toggle off anytime)"
          >
            <Switch
              checked={ambientSoundEnabled}
              onCheckedChange={setAmbientSoundEnabled}
            />
          </SettingRow>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Speech engine
            </label>
            <select
              value={voiceEngine}
              onChange={(e) => setVoiceEngine(e.target.value as VoiceEngine)}
              className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
            >
              <option value="openai">OpenAI — natural voice (recommended)</option>
              <option value="browser">Browser — built-in (robotic)</option>
            </select>
          </div>
          {voiceEngine === "openai" ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Shep&apos;s voice
              </label>
              <select
                value={openAiVoice}
                onChange={(e) => setOpenAiVoice(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
              >
                {Object.values(SHEP_OPENAI_VOICES).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {SHEP_OPENAI_VOICES[openAiVoice as keyof typeof SHEP_OPENAI_VOICES]
                  ?.description ??
                  SHEP_OPENAI_VOICES.nova.description}
              </p>
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Browser voice tone
              </label>
              <select
                value={voiceTone}
                onChange={(e) => setVoiceTone(e.target.value as VoiceTone)}
                className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
              >
                <option value="warm-female">Gentle (female)</option>
                <option value="warm-male">Warm (male)</option>
                <option value="system">System default</option>
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 flex justify-between text-xs font-medium text-muted-foreground">
              <span>Speech speed</span>
              <span>{voiceRate.toFixed(2)}×</span>
            </label>
            <input
              type="range"
              min={0.6}
              max={1.4}
              step={0.02}
              value={voiceRate}
              onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
              className="w-full accent-shepherd-sage"
            />
          </div>
          {voiceEngine === "browser" && (
            <div>
              <label className="mb-1 flex justify-between text-xs font-medium text-muted-foreground">
                <span>Pitch</span>
                <span>{voicePitch.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min={0.8}
                max={1.3}
                step={0.01}
                value={voicePitch}
                onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                className="w-full accent-shepherd-sage"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingRow
            label="Daily verse reminder"
            description="Morning encouragement — coming soon"
          >
            <Switch
              checked={false}
              disabled
              onCheckedChange={() => {}}
              aria-label="Daily verse reminder (coming soon)"
            />
          </SettingRow>
          <SettingRow
            label="Devotion reminder"
            description="Daily devotion nudge — coming soon"
          >
            <Switch
              checked={false}
              disabled
              onCheckedChange={() => {}}
              aria-label="Devotion reminder (coming soon)"
            />
          </SettingRow>
          <p className="text-[11px] text-muted-foreground">
            Push notifications aren&apos;t available yet. These toggles will activate once
            we add a notification backend with the PWA service worker.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {(["light", "dark", "system"] as ThemePreference[]).map((mode) => (
              <Button
                key={mode}
                variant={themePreference === mode ? "default" : "outline"}
                size="sm"
                className={
                  themePreference === mode
                    ? "bg-shepherd-sage hover:bg-shepherd-sage/90"
                    : ""
                }
                onClick={() => handleThemeChange(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Accessibility</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingRow
            label="High contrast mode"
            description="Stronger text and border contrast"
          >
            <Switch checked={highContrast} onCheckedChange={setHighContrast} />
          </SettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Account & data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Suspense
            fallback={
              <p className="text-xs text-muted-foreground">Loading account…</p>
            }
          >
            <AccountSection />
          </Suspense>
          <Separator />
          <Button variant="outline" className="w-full justify-start" onClick={downloadShepherdExport}>
            <Download className="size-4" />
            Export my data
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={handleClearChat}>
            <MessageSquare className="size-4" />
            Clear chat session
          </Button>
          <Button
            variant={confirmDelete ? "destructive" : "outline"}
            className="w-full justify-start"
            onClick={handleDeleteAccount}
          >
            <Trash2 className="size-4" />
            {confirmDelete ? "Tap again to delete all local data" : "Delete all local data"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">About & feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 size-4 shrink-0 text-shepherd-sage" />
            <p>
              {APP_NAME} is your gentle Bible companion with {SHEP_FULL_NAME}.
              Scripture via{" "}
              <a
                href="https://bible.helloao.org"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 text-shepherd-sage hover:underline"
              >
                bible.helloao.org
                <ExternalLink className="size-3" />
              </a>
            </p>
          </div>
          <Separator />
          <a
            href={`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(`${APP_NAME} Feedback`)}`}
            className="flex items-center gap-2 font-medium text-shepherd-sage hover:underline"
          >
            <Mail className="size-4" />
            Send feedback
          </a>
          <p className="text-xs">Version 0.1.0 · Data stored locally on this device</p>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
