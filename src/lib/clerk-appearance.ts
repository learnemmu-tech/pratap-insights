const developmentPreview = process.env.NODE_ENV === "development";

export const clerkAppearance = {
  options: {
    unsafe_disableDevelopmentModeWarnings: developmentPreview,
  },
  layout: {
    logoImageUrl: "/brand-mark.svg",
    logoPlacement: "inside" as const,
  },
  variables: {
    colorPrimary: "#c0623a",
    colorText: "#1c2b3a",
    colorTextSecondary: "#4a5568",
    colorBackground: "#FFFFFF",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#1c2b3a",
    colorNeutral: "#e2d9cc",
    borderRadius: "12px",
    fontFamily: "var(--font-inter), sans-serif",
    fontFamilyButtons: "var(--font-inter), sans-serif",
  },
  elements: {
    modalBackdrop: "bg-[#1c2b3a]/45",
    modalContent: "rounded-[20px] shadow-[0_24px_60px_rgba(23,44,67,0.16)]",
    card: "rounded-[20px] bg-white shadow-none",
    cardBox: "rounded-[20px] shadow-[0_24px_60px_rgba(23,44,67,0.16)]",
    logoBox: "flex h-12 items-center justify-center",
    logoImage: "h-10 w-auto",
    headerTitle: "font-display text-[1.65rem] font-semibold text-[#1c2b3a]",
    headerSubtitle: "text-sm leading-6 text-[#4a5568]",
    formFieldLabel: "text-sm font-medium text-[#1c2b3a]",
    formFieldInput: "h-11 rounded-[6px] border border-[#e2d9cc] text-[#1c2b3a] shadow-none",
    formButtonPrimary: "h-11 rounded-[6px] bg-[#c0623a] text-sm font-medium text-white shadow-none hover:bg-[#a8512f]",
    socialButtonsBlockButton: "h-12 rounded-xl border border-[#e2d9cc] bg-white shadow-none",
    socialButtonsBlockButtonText: "font-medium text-[#1c2b3a]",
    footerActionText: "text-[#4a5568]",
    footerActionLink: "font-semibold text-[#c0623a] hover:text-[#a8512f]",
    modalCloseButton: "text-[#4a5568] hover:bg-[#f5e8e2]",
    dividerLine: "bg-[#e2d9cc]",
    dividerText: "text-[#4a5568]",
  },
};
