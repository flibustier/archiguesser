// Installation of the app on the home screen (PWA)

import { shallowRef } from "vue";

import { sendMilestone } from "./api";

// Chromium only: the event that lets a page open the installation dialog
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const installPrompt = shallowRef<BeforeInstallPromptEvent>();

export const isInstalled = (): boolean =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

// Safari on iPhone and iPad has no installation dialog: the player must use
// "Add to Home Screen" from the share menu. iPads present themselves as Macs.
export const isIOS = (): boolean =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

export const install = async () => {
  const prompt = installPrompt.value;
  if (!prompt) {
    return;
  }
  await prompt.prompt();
  await prompt.userChoice;
  // a prompt can only be used once
  installPrompt.value = undefined;
};

export const watchInstallation = () => {
  window.addEventListener("beforeinstallprompt", (event) => {
    installPrompt.value = event as BeforeInstallPromptEvent;
  });
  window.addEventListener("appinstalled", () => {
    installPrompt.value = undefined;
    sendMilestone("app-installed");
  });
  if (isInstalled() && !sessionStorage.getItem("appOpened")) {
    // once per launch of the installed app
    sessionStorage.setItem("appOpened", "1");
    sendMilestone("app-opened");
  }
};
