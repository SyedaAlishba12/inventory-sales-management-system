import { BenefitsSection } from "@/components/landing/benefits"; 
import { CallToActionSection } from "@/components/landing/cta"; 
import { FeaturesSection } from "@/components/landing/features"; 
import { LandingFooter } from "@/components/landing/footer"; 
import { HeroSection } from "@/components/landing/hero"; 
import { HowItWorksSection } from "@/components/landing/how-it-works"; 
import { LandingNavbar } from "@/components/landing/navbar"; 
 
export function LandingPage() { 
  return ( 
    <div className="min-h-screen bg-background text-foreground"> 
      <a href="#main-content" className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition focus:translate-y-0"> 
        Skip to content 
      </a> 
      <LandingNavbar /> 
      <main id="main-content"> 
        <HeroSection /> 
        <FeaturesSection /> 
        <BenefitsSection /> 
        <HowItWorksSection /> 
        <CallToActionSection /> 
      </main> 
      <LandingFooter /> 
    </div> 
  ); 
} 