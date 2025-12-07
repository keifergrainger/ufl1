import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "Where is Protective Stadium located?",
        answer: "Protective Stadium is located at 1020 24th St N, Birmingham, AL 35203, in the heart of the Uptown entertainment district."
    },
    {
        question: "What is the bag policy?",
        answer: "Clear bags are required. Bags must be clear plastic, vinyl, or PVC and not exceed 12\" x 6\" x 12\". Small clutch bags no larger than 4.5\" x 6.5\" are also permitted."
    },
    {
        question: "When do gates open?",
        answer: "Gates typically open 90 minutes prior to kickoff. Please check the specific game details for any changes."
    },
    {
        question: "Is parking available onsite?",
        answer: "Yes, there are several parking decks and lots surrounding the complex. We recommend purchasing parking passes in advance via Ticketmaster."
    },
    {
        question: "Can I bring outside food or drink?",
        answer: "No outside food or beverages are allowed inside the stadium. Empty clear water bottles are permitted to be filled at water fountains."
    },
];

export default function FAQ() {
    return (
        <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
                    <AccordionTrigger className="text-lg font-bold text-white hover:text-secondary hover:no-underline text-left">
                        {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                        {faq.answer}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
