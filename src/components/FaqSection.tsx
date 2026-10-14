import React from 'react';
import { VentureData } from '../types';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';

interface FaqSectionProps {
  venture: VentureData;
}

export default function FaqSection({ venture }: FaqSectionProps) {
  const faqs = Array.isArray(venture.faqs) && venture.faqs.length > 0
    ? venture.faqs
    : [
        { question: 'Is the layout statutory approved and legally certified?', answer: 'Yes, the layout is certified and approved by competent town planning authorities with 100% title scrutiny and clear legal ownership.' },
        { question: 'Are plot buyers eligible for immediate spot registration?', answer: 'Yes, plots possess individual title clearance allowing immediate spot registration upon statutory documentation.' },
        { question: 'Which financial institutions offer pre-approved home/plot loans?', answer: 'Pre-approved loan facilities are active with premier banks including State Bank of India (SBI), HDFC Bank, ICICI Bank, and leading nationalized lenders.' },
        { question: 'What road dimensions and utility infrastructures are implemented?', answer: 'The layout features 40 & 50 feet wide asphalt blacktop avenues, concealed underground drainage, transformer electrification, and 24/7 guarded security.' },
      ];

  return (
    <section id="faqs" className="py-20 lg:py-28 bg-[#fafaf9] border-b border-zinc-200/90 text-zinc-900 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Standardized heading without chip badge or subtitle */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Radix Accordion */}
        <Accordion type="single" collapsible defaultValue="item-0" className="w-full space-y-3">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="bg-white border border-zinc-200/90 rounded-2xl px-5 sm:px-6 hover:border-emerald-500/40 shadow-xs transition-colors"
            >
              <AccordionTrigger className="text-left text-sm sm:text-base font-bold text-zinc-900 py-4 hover:no-underline hover:text-emerald-700">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-zinc-600 text-sm leading-relaxed pb-4 pt-1 font-normal">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
