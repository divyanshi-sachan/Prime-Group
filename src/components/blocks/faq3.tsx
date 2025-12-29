import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface Faq3Props {
  heading: string;
  description: string;
  items?: FaqItem[];
  supportHeading: string;
  supportDescription: string;
  supportButtonText: string;
  supportButtonUrl: string;
}

const faqItems = [
  {
    id: "faq-1",
    question: "What is the return policy?",
    answer:
      "You can return any item within 30 days of purchase for a full refund, provided it is in its original condition.",
  },
  {
    id: "faq-2",
    question: "How do I track my order?",
    answer:
      "Once your order is shipped, you will receive an email with a tracking number. You can use this number on our website to track your order.",
  },
  {
    id: "faq-3",
    question: "Do you offer international shipping?",
    answer:
      "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary depending on the destination.",
  },
  {
    id: "faq-4",
    question: "Can I change my order after it has been placed?",
    answer:
      "You can change your order within 24 hours of placing it by contacting our customer service team.",
  },
  {
    id: "faq-5",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and Apple Pay.",
  },
  {
    id: "faq-6",
    question: "How can I contact customer support?",
    answer:
      "You can reach our customer support team via email at support@example.com or by calling 1-800-123-4567.",
  },
  {
    id: "faq-7",
    question: "Are there any discounts for bulk purchases?",
    answer:
      "Yes, we offer discounts for bulk purchases. Please contact our sales team for more information.",
  },
];

const Faq3 = ({
  heading = "Frequently asked questions",
  description = "Find answers to common questions about our products. Can't find what you're looking for? Contact our support team.",
  items = faqItems,
  supportHeading = "Need more support?",
  supportDescription = "Our dedicated support team is here to help you with any questions or concerns. Get in touch with us for personalized assistance.",
  supportButtonText = "Contact Support",
  supportButtonUrl = "https://www.shadcnblocks.com",
}: Faq3Props) => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--pure-white)' }}>
      <div className="container mx-auto max-w-7xl space-y-16">
        <div className="mx-auto flex max-w-3xl flex-col text-center">
          <div className="inline-block mb-4 px-6 py-2 rounded-full w-fit mx-auto" style={{ backgroundColor: 'var(--primary-blue)' }}>
            <span className="text-sm font-montserrat font-semibold uppercase tracking-wide text-gold-gradient">
              Help Center
            </span>
          </div>
          <h2 className="mb-4 text-4xl sm:text-5xl md:text-6xl font-playfair-display font-bold text-gold-gradient" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)' }}>
            {heading}
          </h2>
          <p className="text-lg sm:text-xl font-montserrat" style={{ color: 'var(--primary-blue)' }}>{description}</p>
        </div>
        <Accordion
          type="single"
          collapsible
          className="mx-auto w-full lg:max-w-4xl space-y-4"
        >
          {items.map((item) => (
            <AccordionItem 
              key={item.id} 
              value={item.id}
              className="rounded-lg border-2 px-4 py-2 transition-all duration-300 hover:shadow-md"
              style={{ 
                borderColor: 'var(--accent-gold)',
                backgroundColor: 'var(--pure-white)'
              }}
            >
              <AccordionTrigger className="transition-all duration-200 hover:no-underline py-4">
                <div className="font-playfair-display font-bold text-left text-lg sm:text-xl" style={{ color: 'var(--primary-blue)' }}>
                  {item.question}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="font-montserrat text-base sm:text-lg leading-relaxed" style={{ color: 'var(--primary-blue)' }}>
                  {item.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mx-auto flex max-w-4xl flex-col items-center rounded-xl p-6 md:p-8 lg:p-10 text-center shadow-lg bg-gold-gradient">
          <div className="relative mb-6">
            <Avatar className="absolute mb-4 size-16 origin-bottom -translate-x-[60%] scale-[80%] border-2" style={{ borderColor: 'var(--primary-blue)' }}>
              <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" />
              <AvatarFallback>SU</AvatarFallback>
            </Avatar>
            <Avatar className="absolute mb-4 size-16 origin-bottom translate-x-[60%] scale-[80%] border-2" style={{ borderColor: 'var(--primary-blue)' }}>
              <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" />
              <AvatarFallback>SU</AvatarFallback>
            </Avatar>
            <Avatar className="mb-4 size-16 border-2" style={{ borderColor: 'var(--primary-blue)' }}>
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" />
              <AvatarFallback>SU</AvatarFallback>
            </Avatar>
          </div>
          <h3 className="mb-3 max-w-3xl font-playfair-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--primary-blue)', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)' }}>
            {supportHeading}
          </h3>
          <p className="mb-8 max-w-3xl font-montserrat text-base sm:text-lg" style={{ color: 'var(--primary-blue)' }}>
            {supportDescription}
          </p>
          <div className="flex w-full flex-col justify-center gap-2 sm:flex-row">
            <Button 
              className="w-full sm:w-auto px-8 py-6 text-base font-montserrat font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border-none" 
              style={{ 
                backgroundColor: 'var(--primary-blue)',
                color: 'var(--pure-white)'
              }}
              asChild
            >
              <a href={supportButtonUrl}>
                {supportButtonText}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Faq3 };
