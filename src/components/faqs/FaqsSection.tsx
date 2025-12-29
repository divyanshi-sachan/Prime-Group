import { Faq3 } from "@/components/blocks/faq3"

const demoData = {
  heading: "Frequently Asked Questions",
  description:
    "Find answers to common questions about our matrimonial services. Can't find what you're looking for? Our support team is here to help you.",
  items: [
    {
      id: "faq-1",
      question: "How do I create a profile on your platform?",
      answer:
        "Creating a profile is simple! Click on the 'Sign Up' button, fill in your basic information, upload your photos, and complete your profile details. Our team will verify your profile within 24-48 hours to ensure authenticity and security.",
    },
    {
      id: "faq-2",
      question: "How does the matching algorithm work?",
      answer:
        "Our advanced matching algorithm considers multiple factors including preferences, values, lifestyle, education, profession, and family background. We use AI-powered technology to suggest the most compatible matches based on your profile and preferences.",
    },
    {
      id: "faq-3",
      question: "Is my personal information safe and secure?",
      answer:
        "Absolutely! We take your privacy and security very seriously. All profiles are verified, and we use advanced encryption to protect your personal information. You have full control over what information is visible to other members.",
    },
    {
      id: "faq-4",
      question: "Can I search for matches on my own?",
      answer:
        "Yes! You can browse through verified profiles, use our advanced search filters, and connect with potential matches. We also provide personalized match suggestions based on your preferences.",
    },
    {
      id: "faq-5",
      question: "What support services do you offer?",
      answer:
        "We offer comprehensive support including profile verification, personalized matchmaking assistance, family consultation services, and guidance throughout your matrimonial journey. Our relationship experts are available to help you at every step.",
    },
    {
      id: "faq-6",
      question: "How much does it cost to use your services?",
      answer:
        "We offer various membership plans to suit different needs. Basic profiles are free, while premium memberships provide access to advanced features, priority support, and personalized matchmaking services. Contact us for detailed pricing information.",
    },
    {
      id: "faq-7",
      question: "Can I contact matches directly?",
      answer:
        "Yes, once you find a compatible match, you can initiate contact through our secure messaging platform. Premium members have access to direct contact features and can schedule video calls through our platform.",
    },
  ],
  supportHeading: "Still have questions?",
  supportDescription:
    "Our dedicated support team is here to help you with any questions or concerns about finding your perfect match. Get in touch with us for personalized assistance.",
  supportButtonText: "Contact Us",
  supportButtonUrl: "/contact-us",
};

function Faq3Demo() {
  return <Faq3 {...demoData} />;
}

export default Faq3Demo;
