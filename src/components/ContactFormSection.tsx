import React, { useState } from 'react';
import { VentureData } from '../types';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Phone, MapPin, Send, CheckCircle2, Navigation, ExternalLink } from 'lucide-react';
import { API_ENDPOINTS } from '../siteConfig';

interface ContactFormSectionProps {
  venture: VentureData;
}

export default function ContactFormSection({ venture }: ContactFormSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    plotType: 'Villa Plot',
    visitDate: '',
    message: 'Requesting Site Visit',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const directionsUrl =
    venture.contact?.directionsUrl ||
    'https://maps.app.goo.gl/ccX7VBApuJTJGqKHA';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch(API_ENDPOINTS.submitInquiry, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venture_id: venture.ventureId || 232,
          venture_slug: (venture as any).slug || '',
          venture_name: venture.title,
          name: formData.name,
          phone: formData.phone,
          mobile: formData.phone,
          email: formData.email,
          plot_number: formData.plotType,
          booking_date: formData.visitDate,
          message: `Plot Type: ${formData.plotType} | Visit Date: ${formData.visitDate} | Note: ${formData.message}`,
          source: 'shadcn_theme_2_day_microsite',
        }),
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-white border-b border-zinc-200/90 text-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Experience Center Information (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Badge variant="outline" className="text-xs font-mono uppercase tracking-wider border-emerald-600/30 text-emerald-700 bg-emerald-50">
              Site Visit
            </Badge>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight">
              Plan Your Site Visit
            </h2>

            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed font-normal">
              Visit the venture in person to explore available plots, walk through the layout, and discuss your plans with our friendly team.
            </p>

            <div className="space-y-4 pt-2">
              {/* Conditional Phone Line */}
              {Boolean(venture.contact?.phone && venture.contact.phone.trim()) && (
                <div className="bg-[#fafaf9] p-3.5 rounded-xl flex items-center gap-3.5 border border-zinc-200">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block font-semibold">
                      Call Us Directly
                    </span>
                    <a
                      href={`tel:${venture.contact.phone}`}
                      className="text-sm font-bold text-zinc-900 hover:text-emerald-700 transition-colors font-mono"
                    >
                      {venture.contact.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Venture Location Map Card */}
              <div className="bg-[#fafaf9] border border-zinc-200 p-4 sm:p-5 rounded-xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 leading-tight">
                        Venture Location Map
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        Interactive GPS & Access Route
                      </p>
                    </div>
                  </div>

                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 hover:border-emerald-600 hover:text-emerald-700 text-zinc-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all shadow-xs"
                    title="Open in Google Maps"
                  >
                    <span>Open Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Responsive Map Embed Container */}
                <div className="w-full h-56 sm:h-64 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 relative shadow-inner">
                  <iframe
                    title="Venture Location Google Map"
                    src={
                      venture.contact?.googleMapsEmbedUrl ||
                      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31050.15024419996!2d80.005085!3d13.585526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4d81232870197d%3A0xb35a0cfb247f082e!2sTada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1710000000000'
                    }
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full grayscale-[0.05] contrast-[1.02] hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Card (7 cols) */}
          <div className="lg:col-span-7">
            <Card className="bg-white border-zinc-200/90 p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
              {submitted ? (
                <div className="py-12 flex flex-col items-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900">
                    Site Visit Request Received!
                  </h3>
                  <p className="text-zinc-600 text-sm max-w-md font-normal">
                    Thank you! Our team will contact you shortly to confirm your visit time and help you explore available plots.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', phone: '', email: '', plotType: 'Villa Plot', visitDate: '', message: 'Requesting Site Visit' });
                    }}
                    className="mt-4 border-zinc-300 text-zinc-800"
                  >
                    Submit Another Request
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
                      Book a Free Site Visit
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 font-normal">
                      Share your details and our team will get in touch to coordinate your visit.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-zinc-700 font-semibold">Your Full Name *</label>
                      <Input
                        required
                        placeholder="e.g. Rajesh Kumar"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-zinc-50 border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-emerald-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-zinc-700 font-semibold">Contact Number *</label>
                      <Input
                        required
                        type="tel"
                        placeholder="+91 98480 00000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-zinc-50 border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-zinc-700 font-semibold">Email Address (Optional)</label>
                      <Input
                        type="email"
                        placeholder="rajesh@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-zinc-50 border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-emerald-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-zinc-700 font-semibold">Preferred Visit Date</label>
                      <Input
                        type="date"
                        value={formData.visitDate}
                        onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                        className="bg-zinc-50 border-zinc-300 text-zinc-900 focus-visible:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-700 font-semibold">Specific Requirements / Message</label>
                    <Textarea
                      placeholder="Mention your preferred plot size (e.g. 1500 sqft, corner unit, east-facing)..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-zinc-50 border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-emerald-600"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 font-bold text-sm gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending Request...' : 'Book Free Site Visit'}</span>
                  </Button>

                  <p className="text-[11px] text-zinc-500 text-center font-mono">
                    Statutory Privacy: Your details are encrypted and kept strictly confidential.
                  </p>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
