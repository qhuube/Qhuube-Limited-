/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { ArrowLeft, CheckCircle, Globe, Clock, Users, TrendingUp } from "lucide-react"
import Navbar from "@/components/layouts/Navbar"
import Footer from "@/components/layouts/Footer"

export default function VATPage() {
  const features = [
    "Automated VAT and tax calculation for all EU countries",
    "Real time rate updates and regulatory compliance",
    "Bulk and API based calculation support",
    "Multi currency and product classification handling",
    "Exception management and audit ready records",
  ]

  const benefits = [
    {
      icon: Globe,
      title: "Pan European Coverage",
      description: "Accurate tax calculation for every EU jurisdiction always up to date.",
    },
    {
      icon: Clock,
      title: "Instant Results",
      description: "Process thousands of transactions in seconds with our optimized engine.",
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "Access to tax specialists for complex scenarios and compliance questions.",
    },
    {
      icon: TrendingUp,
      title: "Risk Reduction",
      description: "Minimize errors and penalties with automated checks and exception handling.",
    },
  ]

  const stats = [
    { number: "27", label: "EU Countries Supported" },
    { number: "99.99%", label: "Calculation Accuracy" },
    { number: "1M+", label: "Transactions Processed" },
    { number: "24/7", label: "Support Availability" },
  ]

  const stories = [
    {
      company: "E Shop Global",
      result: "Reduced compliance workload by 60% using automated VAT reporting.",
    },
    {
      company: "TechSupply EU",
      result: "Processed over 500k transactions seamlessly with zero errors flagged.",
    },
    {
      company: "GreenMarket",
      result: "Expanded to 10+ EU countries without additional tax team hires.",
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
          <span className="text-gray-700 font-medium">VAT Compliance</span>
        </div>

        {/* Hero & Features */}
        <div className="pt-12 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Automated EU Tax Calculation</h1>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Instantly calculate VAT and other taxes for every EU country. Our platform ensures accuracy, compliance,
                and speed for businesses of all sizes.
              </p>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-sky-100">
                <h3 className="text-lg font-semibold text-sky-700 mb-4">Key Features</h3>
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
                src="/images/learnImg1.jpg"
                alt="Tax Calculation Dashboard"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Live Rate Updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
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

        {/* Benefits Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Calculation Engine?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trusted by leading businesses for speed, accuracy, and compliance across Europe.
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

        {/* Replaced Section - Customer Success Stories */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Customer Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {stories.map((story, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="font-semibold text-sky-700 mb-2">{story.company}</h3>
                <p className="text-gray-600">{story.result}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16">
          <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Automate Your Tax Calculation?</h2>
            <p className="text-xl mb-8 opacity-90">Get started or speak to our tax technology experts today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/upload"
                className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Start Calculating
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
