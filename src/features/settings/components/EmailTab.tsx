"use client";

import { useState, useEffect } from "react";
import { Mail, Send, Loader2, CheckCircle, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/http";

interface EmailSettings {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromName: string;
  fromAddress: string;
  replyTo: string;
}

interface EmailTabProps {
  saving: boolean;
}

export function EmailTab({ saving }: EmailTabProps) {
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/settings/email");
      setSettings(res.data.data);
    } catch (error) {
      toast.error("Failed to load email settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!settings) return;
    setToggling(true);
    try {
      await apiClient.patch("/admin/settings/email", { enabled: !settings.enabled });
      setSettings((prev) => (prev ? { ...prev, enabled: !prev.enabled } : prev));
      toast.success(settings.enabled ? "Email disabled" : "Email enabled");
    } catch (error) {
      toast.error("Failed to toggle email");
    } finally {
      setToggling(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error("Enter an email address to test");
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await apiClient.post("/admin/settings/email/test", { to: testEmail });
      if (res.data.success) {
        setTestResult("success");
        toast.success("Test email sent successfully!");
      } else {
        setTestResult("error");
        toast.error(res.data.message || "Failed to send test email");
      }
    } catch (error) {
      setTestResult("error");
      toast.error("Failed to send test email");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-sm text-gray-500">Loading email settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Email Service</h2>
        <p className="text-sm text-gray-500 mt-1">
          SMTP is configured via environment variables on the server. Use this panel to toggle email on/off and test the connection.
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${settings?.enabled ? "bg-green-50" : "bg-gray-100"}`}>
              {settings?.enabled ? (
                <Wifi className="h-6 w-6 text-green-600" />
              ) : (
                <WifiOff className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Email Service {settings?.enabled ? "Active" : "Disabled"}
              </h3>
              <p className="text-sm text-gray-500">
                {settings?.enabled
                  ? "Transactional emails are being sent via SMTP"
                  : "Email sending is currently turned off"}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings?.enabled ? "bg-green-600" : "bg-gray-300"
            } ${toggling ? "opacity-50" : ""}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings?.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Configuration Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Mail className="h-5 w-5 mr-2 text-gray-400" />
          Current Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="SMTP Host" value={settings?.host || "Not configured"} />
          <InfoRow label="Port" value={settings?.port?.toString() || "587"} />
          <InfoRow label="Username" value={settings?.username || "Not configured"} />
          <InfoRow label="SSL/TLS" value={settings?.secure ? "Enabled (465)" : "Disabled (587)"} />
          <InfoRow label="From Name" value={settings?.fromName || "Roti Dukaan"} />
          <InfoRow label="From Email" value={settings?.fromAddress || "Not configured"} />
          <InfoRow label="Reply-To" value={settings?.replyTo || "Not configured"} />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          To update SMTP credentials, modify the EMAIL_* variables in the server&apos;s .env file and restart the backend.
        </p>
      </div>

      {/* Test Email */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Send className="h-5 w-5 mr-2 text-gray-400" />
          Test Email
        </h3>
        <p className="text-sm text-gray-500">
          Send a test email to verify SMTP is working correctly.
        </p>
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleTestEmail}
            disabled={testing || !testEmail || !settings?.enabled}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>Send Test</span>
          </button>
        </div>
        {testResult === "success" && (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Test email sent successfully! Check your inbox.</span>
          </div>
        )}
        {testResult === "error" && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Failed to send test email. Verify your SMTP settings and restart the server.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</span>
      <span className="text-sm text-gray-900 mt-1">{value || "—"}</span>
    </div>
  );
}
