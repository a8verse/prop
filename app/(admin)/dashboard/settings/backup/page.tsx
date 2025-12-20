"use client";

import { useState } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function BackupPage() {
  const [generating, setGenerating] = useState(false);

  const handleGenerateBackup = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/backup/generate");
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup-${new Date().toISOString().split("T")[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert("Backup generated and downloaded successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to generate backup");
      }
    } catch (error) {
      console.error("Error generating backup:", error);
      alert("An error occurred while generating backup");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Backup & Restore</h1>
      <p className="text-gray-600 mb-6">
        Generate a complete backup of your website including database, uploaded files, and configuration.
      </p>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">What&apos;s included in the backup:</h3>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Database dump (PostgreSQL)</li>
            <li>Uploaded images and files</li>
            <li>Configuration files</li>
            <li>Site settings</li>
          </ul>
        </div>

        <button
          onClick={handleGenerateBackup}
          disabled={generating}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          {generating ? "Generating Backup..." : "Generate & Download Backup"}
        </button>
      </div>
    </div>
  );
}

