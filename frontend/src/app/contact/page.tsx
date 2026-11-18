import { Mail, MapPin, Building2, Phone, Globe } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact & Legal Notice
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          For technical inquiries, source partnerships, or data protection officer inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Platform Owner</h2>
          <div className="text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-800">Nighwan Technology Pvt. Ltd.</p>
            <p>Target Operation: Germany & European Union</p>
            <p>Cloud Region: AWS Frankfurt (`eu-central-1`)</p>
            <p>Technical Inquiries: contact@nighwan.com</p>
          </div>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Data Protection Officer</h2>
          <div className="text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-800">EU GDPR / DSGVO Compliance Desk</p>
            <p>Email: privacy@nighwan.com</p>
            <p>Response Time: Within 72 hours under statutory regulations</p>
            <p>Rights: Access, Rectification, Portability, Erasure</p>
          </div>
        </div>
      </div>
    </div>
  );
}
