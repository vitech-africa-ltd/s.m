import { useState } from "react";
import { Ic } from "../components/icons";
import { Chip } from "../components/ui";
import { useT } from "../lib/i18n";

export default function DownloadPage({ nav }: { nav: (to: string) => void }) {
  const tt = useT();
  const [selectedOS, setSelectedOS] = useState<"windows" | "mac" | "linux" | null>(null);
  
  const handleDownload = () => {
    if (!selectedOS) return;
    
    // Create a simple installer package
    const packageInfo = {
      name: "VITECH School Management System",
      version: "3.2.0",
      os: selectedOS,
      releaseDate: new Date().toISOString(),
      instructions: `
VITECH School Management System - Desktop Installer

Installation Instructions:
1. Extract the downloaded ZIP file
2. Run the installer (${selectedOS === "windows" ? "install.bat" : "install.sh"})
3. Follow the on-screen instructions
4. Launch the application using ${selectedOS === "windows" ? "start.bat" : "start.sh"}

System Requirements:
- Node.js 18 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Minimum 4GB RAM
- 500MB free disk space

For support, visit: https://vitech.academy/support
      `
    };
    
    // Create and download the package
    const blob = new Blob([JSON.stringify(packageInfo, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VITECH-School-${selectedOS}-installer.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="min-h-screen grid-bg bg-paper dark:bg-ink-950 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <button className="btn-o btn-sm mb-6" onClick={() => nav("/")}>
          <Ic n="chevL" size={15} />{tt("Back to home")}
        </button>
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-ink-950 dark:bg-cobalt-600 text-gold-400 flex items-center justify-center mx-auto mb-4">
            <Ic n="download" size={40} />
          </div>
          <h1 className="font-display text-[32px] font-bold mb-2">{tt("Download Desktop App")}</h1>
          <p className="text-ink-400 text-[15px]">{tt("Install VITECH School on your computer")}</p>
        </div>
        
        <div className="panel p-6 mb-6">
          <h2 className="font-display font-bold text-[18px] mb-4">{tt("Select your operating system")}</h2>
          
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { os: "windows" as const, label: "Windows", icon: "💻", desc: "Windows 10/11" },
              { os: "mac" as const, label: "macOS", icon: "🍎", desc: "macOS 10.15+" },
              { os: "linux" as const, label: "Linux", icon: "🐧", desc: "Ubuntu, Fedora, etc." },
            ].map((option) => (
              <button
                key={option.os}
                onClick={() => setSelectedOS(option.os)}
                className={`rounded-xl border-2 p-5 text-left transition-all ${
                  selectedOS === option.os
                    ? "border-cobalt-500 bg-cobalt-50 dark:bg-cobalt-500/10"
                    : "border-ink-100 dark:border-ink-800 hover:border-cobalt-300"
                }`}
              >
                <div className="text-[32px] mb-2">{option.icon}</div>
                <div className="font-display font-bold text-[16px]">{option.label}</div>
                <div className="text-[12px] text-ink-400 mt-1">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>
        
        {selectedOS && (
          <div className="panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-bold text-[18px]">VITECH School v3.2.0</h2>
                <p className="text-[12px] text-ink-400 mt-1">
                  {selectedOS === "windows" ? "Windows" : selectedOS === "mac" ? "macOS" : "Linux"} installer
                </p>
              </div>
              <Chip tone="green">Latest</Chip>
            </div>
            
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 text-[13px]">
                <Ic n="check" size={16} className="text-emerald-500" />
                <span>Full offline functionality</span>
              </div>
              <div className="flex items-center gap-3 text-[13px]">
                <Ic n="check" size={16} className="text-emerald-500" />
                <span>Automatic updates</span>
              </div>
              <div className="flex items-center gap-3 text-[13px]">
                <Ic n="check" size={16} className="text-emerald-500" />
                <span>All features included</span>
              </div>
            </div>
            
            <button className="btn-p w-full" onClick={handleDownload}>
              <Ic n="download" size={16} />
              {tt("Download")} ({selectedOS === "windows" ? "Windows" : selectedOS === "mac" ? "macOS" : "Linux"})
            </button>
            
            <div className="mt-5 p-4 rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800">
              <h3 className="font-bold text-[13px] mb-2">{tt("Installation instructions")}</h3>
              <ol className="text-[12px] text-ink-500 dark:text-ink-300 space-y-1 list-decimal list-inside">
                <li>Download the installer package</li>
                <li>Extract the ZIP file</li>
                <li>Run {selectedOS === "windows" ? "install.bat" : "install.sh"}</li>
                <li>Follow the setup wizard</li>
                <li>Launch the application</li>
              </ol>
            </div>
          </div>
        )}
        
        <div className="panel p-6 mt-6">
          <h2 className="font-display font-bold text-[18px] mb-4">{tt("System requirements")}</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-[13px]">
            <div>
              <div className="font-bold mb-2">Minimum</div>
              <ul className="space-y-1 text-ink-500 dark:text-ink-300">
                <li>• Node.js 18+</li>
                <li>• 4GB RAM</li>
                <li>• 500MB disk space</li>
                <li>• Modern browser</li>
              </ul>
            </div>
            <div>
              <div className="font-bold mb-2">Recommended</div>
              <ul className="space-y-1 text-ink-500 dark:text-ink-300">
                <li>• Node.js 20+</li>
                <li>• 8GB RAM</li>
                <li>• 1GB disk space</li>
                <li>• SSD storage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
