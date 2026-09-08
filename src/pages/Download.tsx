import { useState } from "react";
import { Ic } from "../components/icons";
import { Chip, toast } from "../components/ui";
import { useT } from "../lib/i18n";

export default function DownloadPage({ nav }: { nav: (to: string) => void }) {
  const tt = useT();
  const [selectedOS, setSelectedOS] = useState<"windows" | "mac" | "linux" | null>(null);
  const [downloading, setDownloading] = useState(false);
  
  const handleDownload = () => {
    if (!selectedOS) {
      toast("Please select an operating system", "err");
      return;
    }
    
    setDownloading(true);
    
    // Créer le contenu du fichier README
    const readmeContent = `# VITECH School Management System

## Installation Instructions

### System Requirements
- Node.js 18 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Minimum 4GB RAM
- 500MB free disk space

### Installation Steps

1. **Install Node.js**
   - Download from: https://nodejs.org/
   - Install the LTS version (18.x or higher)

2. **Extract this package**
   - Extract the ZIP file to your desired location

3. **Run the installer**
   ${selectedOS === "windows" 
     ? '- Double-click on `install-windows.bat`\n   - Follow the on-screen instructions'
     : '- Open terminal in the extracted folder\n   - Run: `chmod +x install-mac-linux.sh`\n   - Run: `./install-mac-linux.sh`\n   - Follow the on-screen instructions'}

4. **Start the application**
   ${selectedOS === "windows"
     ? '- Double-click on `start-windows.bat`'
     : '- Run: `./start-mac-linux.sh`'}
   - Open your browser to: http://localhost:4173

5. **Login**
   - Default admin email: admin@vitech.academy
   - Default password: demo1234

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vitech.academy | demo1234 |
| Teacher | teacher@vitech.academy | demo1234 |
| Student | student@vitech.academy | demo1234 |
| Parent | parent@vitech.academy | demo1234 |

### Support

For support, visit: https://vitech.academy/support
Email: support@vitech.academy

### Version
VITECH School Management System v3.2.0
Released: ${new Date().toLocaleDateString()}

---

Thank you for choosing VITECH School Management System!
`;

    // Créer le script d'installation
    const installScript = selectedOS === "windows" 
      ? `@echo off
echo ============================================================
echo   VITECH School Management System - Installation
echo ============================================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed.
    echo Please download it from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js detected
node -v
echo.

echo [1/2] Installing dependencies...
call npm install --no-audit --no-fund
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)

echo.
echo [2/2] Building application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   INSTALLATION COMPLETE!
echo ============================================================
echo.
echo To start the application, run: start-windows.bat
echo.
pause
`
      : `#!/bin/bash
echo "============================================================"
echo "  VITECH School Management System - Installation"
echo "============================================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed."
    echo "Please download it from: https://nodejs.org/"
    exit 1
fi

echo "[OK] Node.js detected"
node -v
echo ""

echo "[1/2] Installing dependencies..."
npm install --no-audit --no-fund
if [ $? -ne 0 ]; then
    echo "[ERROR] npm install failed."
    exit 1
fi

echo ""
echo "[2/2] Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ERROR] Build failed."
    exit 1
fi

echo ""
echo "============================================================"
echo "  INSTALLATION COMPLETE!"
echo "============================================================"
echo ""
echo "To start the application, run: ./start-mac-linux.sh"
echo ""
`;

    // Créer le script de démarrage
    const startScript = selectedOS === "windows"
      ? `@echo off
echo ============================================================
echo   VITECH School - Local Server
echo   Open: http://localhost:4173
echo   Press Ctrl+C to stop
echo ============================================================
call npm run preview
`
      : `#!/bin/bash
echo "============================================================"
echo "  VITECH School - Local Server"
echo "  Open: http://localhost:4173"
echo "  Press Ctrl+C to stop"
echo "============================================================"
npm run preview
`;

    // Créer un fichier JSON avec toutes les informations
    const packageData = {
      name: "VITECH School Management System",
      version: "3.2.0",
      os: selectedOS,
      releaseDate: new Date().toISOString(),
      files: {
        "README.md": readmeContent,
        [selectedOS === "windows" ? "install-windows.bat" : "install-mac-linux.sh"]: installScript,
        [selectedOS === "windows" ? "start-windows.bat" : "start-mac-linux.sh"]: startScript,
      },
      instructions: {
        windows: [
          "1. Install Node.js from https://nodejs.org/",
          "2. Double-click install-windows.bat",
          "3. After installation, double-click start-windows.bat",
          "4. Open http://localhost:4173 in your browser",
          "5. Login with admin@vitech.academy / demo1234"
        ],
        mac: [
          "1. Install Node.js from https://nodejs.org/",
          "2. Open terminal in this folder",
          "3. Run: chmod +x install-mac-linux.sh",
          "4. Run: ./install-mac-linux.sh",
          "5. Run: chmod +x start-mac-linux.sh",
          "6. Run: ./start-mac-linux.sh",
          "7. Open http://localhost:4173 in your browser",
          "8. Login with admin@vitech.academy / demo1234"
        ],
        linux: [
          "1. Install Node.js from https://nodejs.org/",
          "2. Open terminal in this folder",
          "3. Run: chmod +x install-mac-linux.sh",
          "4. Run: ./install-mac-linux.sh",
          "5. Run: chmod +x start-mac-linux.sh",
          "6. Run: ./start-mac-linux.sh",
          "7. Open http://localhost:4173 in your browser",
          "8. Login with admin@vitech.academy / demo1234"
        ]
      }
    };

    // Télécharger le fichier
    const blob = new Blob([JSON.stringify(packageData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VITECH-School-${selectedOS}-installer.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setTimeout(() => {
      setDownloading(false);
      toast(`Download started for ${selectedOS === "windows" ? "Windows" : selectedOS === "mac" ? "macOS" : "Linux"}`);
    }, 500);
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
            
            <button 
              className="btn-p w-full" 
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  {tt("Preparing download...")}
                </>
              ) : (
                <>
                  <Ic n="download" size={16} />
                  {tt("Download")} ({selectedOS === "windows" ? "Windows" : selectedOS === "mac" ? "macOS" : "Linux"})
                </>
              )}
            </button>
            
            <div className="mt-5 p-4 rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800">
              <h3 className="font-bold text-[13px] mb-2">{tt("Installation instructions")}</h3>
              <ol className="text-[12px] text-ink-500 dark:text-ink-300 space-y-1 list-decimal list-inside">
                <li>Download the installer package</li>
                <li>Install Node.js from https://nodejs.org/</li>
                <li>Extract the downloaded file</li>
                <li>Run {selectedOS === "windows" ? "install-windows.bat" : "install-mac-linux.sh"}</li>
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
