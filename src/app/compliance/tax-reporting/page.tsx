/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { ArrowLeft, CheckCircle, Globe, Clock, Users, TrendingUp } from "lucide-react"
import Navbar from "@/components/layouts/Navbar"
import Footer from "@/components/layouts/Footer"

export default function TAXReportingPage() {
  const services = [
    {
      title: "Automated Tax Reporting",
      description:
        "Generate precise VAT, OSS, and other EU tax reports tailored to jurisdiction specific rules. With Qhuube, businesses eliminate manual spreadsheets and ensure compliance across all markets.",
      features: ["Automated report generation", "Jurisdiction specific formatting", "Cross border consolidation"],
    },
    {
      title: "Filing & Submission",
      description:
        "File VAT returns and OSS submissions seamlessly through Qhuube. Our platform ensures all deadlines are tracked, submissions are accurate, and filings comply with EU requirements.",
      features: ["Deadline tracking", "Error prevention", "Direct submission workflows"],
    },
    {
      title: "Analytics & Advisory",
      description:
        "Beyond reporting, Qhuube delivers analytics for tax forecasting, liability insights, and compliance risk assessments. Expert advisory support ensures audit readiness and strategic compliance planning.",
      features: ["Real time dashboards", "Forecasting & insights", "Expert advisory support"],
    },
  ]

  const benefits = [
    {
      icon: Globe,
      title: "Pan European Compliance",
      description:
        "Qhuube covers all 27 EU member states, ensuring accurate reporting and filings across every jurisdiction. Our platform is built with local rules and tax variations in mind.",
    },
    {
      icon: Clock,
      title: "Efficiency at Scale",
      description:
        "From small businesses to large enterprises, Qhuube streamlines workflows by automating repetitive reporting tasks, reducing filing times from hours to minutes.",
    },
    {
      icon: Users,
      title: "Expert Backed",
      description:
        "Our team of certified VAT and EU tax specialists is available to provide advisory support, compliance checks, and assistance with audits whenever required.",
    },
    {
      icon: TrendingUp,
      title: "Error Free Accuracy",
      description:
        "With a 99.9% accuracy rate, Qhuube prevents costly errors, minimizes penalties, and provides businesses with peace of mind when scaling internationally.",
    },
  ]

  const stats = [
    { number: "27", label: "EU Countries Supported" },
    { number: "99.9%", label: "Accuracy Rate" },
    { number: "24/7", label: "Expert Support" },
    { number: "15,000+", label: "Reports Generated" },
  ]

  const countries = [
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Netherlands",
    "Poland",
    "Sweden",
    "Austria",
    "Belgium",
    "Czech Republic",
    "Denmark",
    "Finland",
    "Greece",
    "Croatia",
    "Estonia",
    "Latvia",
    "Lithuania",
    "Luxembourg",
    "Bulgaria",
    "Cyprus",
    "Malta",
    "Portugal",
    "Romania",
    "Slovakia",
    "Slovenia",
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/compliance" className="text-sky-600 hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <span className="text-gray-400">/</span>
          <Link href="/compliance" className="text-gray-600 hover:underline">
            Compliance
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-700 font-medium">Tax Reporting</span>
        </div>

        {/* Hero Section */}
        <div className="pt-8 pb-16 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              EU Tax Reporting Simplified with Qhuube
            </h1>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Automate VAT and OSS reporting across all EU jurisdictions. Qhuube ensures accuracy, transparency, and
              full compliance freeing your team from manual processes.
            </p>
            <Link
              href="/upload"
              className="bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition"
            >
              Start Reporting
            </Link>
          </div>
          <div>
            <img
              src="/images/learnImg3.jpg"
              alt="Tax Reporting Dashboard"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 border-y border-gray-200 bg-white/50 rounded-2xl mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <div className="text-3xl md:text-4xl font-bold text-sky-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Qhuube?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for businesses expanding across borders Qhuube is your partner for accurate, automated, and
              future proof tax reporting.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition"
              >
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From reporting to submission and advisory Qhuube is your all in one compliance platform.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-10">
            {services.map((service, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage Section */}
        <div className="py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Regulatory Coverage</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Qhuube supports tax reporting in every EU member state, ensuring you stay compliant no matter where you
              operate.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-center">
            {countries.map((country, idx) => (
              <div
                key={idx}
                className="bg-white py-4 px-2 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <span className="text-gray-800 font-medium">{country}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="py-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Manual vs Automated Reporting</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-gray-200 rounded-2xl overflow-hidden">
              <thead className="bg-sky-50">
                <tr>
                  <th className="p-4 font-semibold text-gray-700">Aspect</th>
                  <th className="p-4 font-semibold text-gray-700">Manual</th>
                  <th className="p-4 font-semibold text-gray-700">Qhuube</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-4 font-medium text-gray-700">Time Spent</td>
                  <td className="p-4 text-gray-600">Hours per filing</td>
                  <td className="p-4 text-gray-900 font-semibold">Minutes with automation</td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-medium text-gray-700">Error Risk</td>
                  <td className="p-4 text-gray-600">High, manual entry</td>
                  <td className="p-4 text-gray-900 font-semibold">99.9% accuracy</td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-medium text-gray-700">Compliance</td>
                  <td className="p-4 text-gray-600">Difficult to track</td>
                  <td className="p-4 text-gray-900 font-semibold">Real time monitoring</td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-medium text-gray-700">Scalability</td>
                  <td className="p-4 text-gray-600">Not scalable</td>
                  <td className="p-4 text-gray-900 font-semibold">Supports multi country growth</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="py-20">
          <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Simplify Your EU Tax Reporting Today</h2>
            <p className="text-xl mb-8 opacity-90">
              Stay compliant, save time, and reduce errors with Qhuube’s automated tax reporting.
            </p>
            <Link
              href="/upload"
              className="bg-white text-sky-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
