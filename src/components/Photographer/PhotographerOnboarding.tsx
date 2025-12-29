"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Camera, User, Briefcase } from "lucide-react";
import PersonalDetails from "./PersonalDetails";
import SkillDetails from "./SkillDetails";
import PhotoSubmit from "./PhotoSubmit";

const steps = [
  { id: 1, title: "Personal Details", icon: User },
  { id: 2, title: "Skills", icon: Briefcase },
  { id: 3, title: "Portfolio", icon: Camera },
];

export default function PhotographerOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalDetails: {},
    skillDetails: {},
    photoSubmit: {},
  });

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const handleNext = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      [getCurrentStepKey()]: data,
    }));
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getCurrentStepKey = () => {
    switch (currentStep) {
      case 1:
        return "personalDetails";
      case 2:
        return "skillDetails";
      case 3:
        return "photoSubmit";
      default:
        return "personalDetails";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalDetails onNext={handleNext} data={formData.personalDetails} />;
      case 2:
        return <SkillDetails onNext={handleNext} onBack={handleBack} data={formData.skillDetails} />;
      case 3:
        return <PhotoSubmit onNext={handleNext} onBack={handleBack} data={formData.photoSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-lg p-6 md:p-8 mt-24 mb-20 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-center mb-2">Photographer Onboarding</h1>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                step.id === currentStep
                  ? "text-primary"
                  : step.id < currentStep
                  ? "text-primary/60"
                  : "text-muted-foreground"
              }`}
            >
              <step.icon className="h-6 w-6 mb-2" />
              <span className="text-sm hidden md:block">{step.title}</span>
            </div>
          ))}
        </div>
      </div>
      {renderStep()}
    </div>
  );
}