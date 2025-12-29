export type FormData = {
    // Personal Details
    fullName: string;
    email: string;
    country: string;
    mobile: string;
    state: string;
    city: string;
    nearbyCities?: string;
    socialMedia?: string;
    portfolio?: string;
    
    // Skill Details
    skills: string[];
    experience: string;
    expertise: string;
    languages: string[];
    
    // Photo Submission
    photo?: File;
  }
  
  export type StepProps = {
    data: FormData;
    onNext: (data: Partial<FormData>) => void;
    onPrevious: () => void;
  }
  
  