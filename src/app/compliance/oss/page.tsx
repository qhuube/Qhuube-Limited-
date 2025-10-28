/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { ArrowLeft, CheckCircle, Globe, Clock, Users, TrendingUp } from "lucide-react"
import Navbar from "@/components/layouts/Navbar"
import Footer from "@/components/layouts/Footer"

export default function OSSPage() {
  const features = [
    "Single EU wide OSS VAT registration for B2C sales",
    "Automated preparation and quarterly submission of OSS VAT returns",
    "Real time compliance monitoring with regulatory alerts",
    "Multi currency and cross border transaction support",
    "Audit ready documentation and penalty prevention tools",
  ]

  const benefits = [
    {
      icon: Globe,
      title: "EU Wide Simplification",
      description:
        "The OSS scheme centralizes VAT compliance, allowing businesses to register once and sell seamlessly across all 27 EU member states.",
    },
    {
      icon: Clock,
      title: "Time Saving Automation",
      description:
        "Automated filings, deadline reminders, and built in error prevention ensure stress free OSS VAT management every quarter.",
    },
    {
      icon: Users,
      title: "Specialist Expertise",
      description:
        "Access ongoing support from VAT professionals who understand the nuances of OSS rules and local compliance challenges.",
    },
    {
      icon: TrendingUp,
      title: "Reduced Risk Exposure",
      description:
        "Stay ahead of regulatory changes, reduce audit risks, and avoid costly penalties through proactive compliance monitoring.",
    },
  ]

  const stats = [
    { number: "27", label: "EU Countries Covered" },
    { number: "99.9%", label: "Accuracy Rate" },
    { number: "24/7", label: "Expert Assistance" },
    { number: "10,000+", label: "Businesses Supported" },
  ]

  const detailedSections = [
    {
      title: "Streamlined OSS Registration",
      content:
        "With Qhuube, registering for the EU One Stop Shop is no longer a burden. We manage the full application process, from preparing documentation to liaising with tax authorities. Businesses no longer need multiple VAT registrations across Europe, saving valuable time and reducing administrative costs.",
    },
    {
      title: "Quarterly OSS VAT Filing",
      content:
        "Our platform automates OSS VAT return preparation and submission. It handles multiple currencies, diverse product categories, and cross border sales volumes with precision. Deadlines are tracked automatically, ensuring businesses never miss a filing period.",
    },
    {
      title: "Continuous Compliance Monitoring",
      content:
        "EU tax regulations evolve constantly. Qhuube provides real time monitoring and alerts whenever VAT rates, thresholds, or reporting rules change. This ensures businesses remain compliant without the need to manually track updates.",
    },
    {
      title: "Audit Ready Documentation",
      content:
        "Every OSS transaction, calculation, and return is logged and stored for audit purposes. Businesses can instantly generate reports, access historical filings, and demonstrate compliance during inspections or reviews.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-10 relative z-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/compliance" className="text-sky-600 hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <span className="text-gray-400">/</span>
          <Link href="/compliance" className="text-gray-600 hover:underline">
            Compliance
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-700 font-medium">OSS VAT</span>
        </div>

        {/* Hero Section */}
        <div className="pt-16 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Simplify EU VAT Compliance with OSS</h1>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                The One Stop Shop (OSS) scheme allows businesses to manage VAT obligations for all EU B2C sales with a
                single registration and quarterly filing. Qhuube ensures your OSS compliance is automated, accurate, and
                audit ready helping you expand confidently across Europe.
              </p>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-sky-100">
                <h3 className="text-lg font-semibold text-sky-700 mb-4">Core Capabilities</h3>
                <ul className="space-y-3">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-800">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="relative">
              <img
                src="/images/learnImg4.jpg"
                alt="OSS Compliance Dashboard"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Centralized OSS Monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OSS At a Glance */}
        <div className="py-16 border-y border-gray-200 bg-white/50 rounded-2xl mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-sky-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Qhuube OSS */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Qhuube for OSS?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Businesses across Europe trust Qhuube for its reliable OSS solutions, combining automation with expert
              guidance.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="py-20 space-y-16">
          {detailedSections.map((section, idx) => (
            <div key={idx} className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
              <p className="text-lg text-gray-700 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="py-16">
          <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Stay Compliant with Confidence</h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Qhuube empowers businesses to focus on growth while we handle the complexity of EU OSS VAT compliance. One
              platform, one registration, one return complete peace of mind.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
