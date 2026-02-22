import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ComputerDesktopIcon,
  CodeBracketIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const SoftwareHouseLanding = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: CodeBracketIcon,
      title: 'Project Management',
      description: 'Agile/Scrum workflows, sprint planning, user stories, and backlog management',
      color: 'from-purple-500 to-purple-700'
    },
    {
      icon: ClockIcon,
      title: 'Time Tracking',
      description: 'Billable hours tracking, client-specific time logs, and resource costing',
      color: 'from-blue-500 to-blue-700'
    },
    {
      icon: UserGroupIcon,
      title: 'Team Management',
      description: 'HR management, payroll, attendance, performance reviews, and recruitment',
      color: 'from-green-500 to-green-700'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Code Quality',
      description: 'Code reviews, static analysis, testing workflows, and quality metrics',
      color: 'from-red-500 to-red-700'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Reports',
      description: 'Project metrics, team performance, client billing, and business insights',
      color: 'from-yellow-500 to-yellow-700'
    },
    {
      icon: ComputerDesktopIcon,
      title: 'Client Portal',
      description: 'Self-service portal for clients to track projects, view invoices, and communicate',
      color: 'from-indigo-500 to-indigo-700'
    }
  ];

  const modules = [
    { name: 'Project Management', icon: '📋' },
    { name: 'Sprint Planning', icon: '🎯' },
    { name: 'Time Tracking', icon: '⏱️' },
    { name: 'Team Collaboration', icon: '👥' },
    { name: 'Code Quality Tools', icon: '🔍' },
    { name: 'Client Management', icon: '🤝' },
    { name: 'HR & Payroll', icon: '💼' },
    { name: 'Invoicing & Billing', icon: '💰' },
    { name: 'Resource Allocation', icon: '📊' },
    { name: 'Performance Reviews', icon: '⭐' },
    { name: 'Documentation', icon: '📚' },
    { name: 'Analytics Dashboard', icon: '📈' }
  ];

  const stats = [
    { value: '500+', label: 'Software Houses' },
    { value: '50k+', label: 'Active Projects' },
    { value: '30%', label: 'Time Saved' },
    { value: '99.9%', label: 'Uptime' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrollY > 50 
            ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-purple-100' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
              <span className="text-3xl">🐺</span>
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                TWS
              </span>
              <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded">
                SOFTWARE HOUSE
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Features
              </a>
              <a href="#modules" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Modules
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Pricing
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/software-house-login"
                className="px-4 py-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/software-house-signup"
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-full text-sm font-semibold text-purple-700 mb-8 shadow-sm">
            <SparklesIcon className="h-4 w-4" />
            Trusted by 500+ Software Houses Worldwide
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Scale Your Software Business
            </span>
            <br />
            <span className="text-gray-900">From Startup to Enterprise</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            The all-in-one ERP platform built specifically for software development companies.
            Manage projects, track time, scale teams, and grow your business—all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/software-house-signup"
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-xl shadow-purple-500/30 flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/software-house-login"
              className="px-8 py-4 bg-white text-purple-600 border-2 border-purple-200 rounded-full font-bold text-lg hover:border-purple-300 hover:shadow-lg transition-all"
            >
              Login
            </Link>
            <button className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 rounded-full font-semibold text-lg hover:bg-white hover:shadow-lg transition-all flex items-center gap-2">
              <PlayIcon className="h-5 w-5" />
              Watch Demo
            </button>
          </div>

          <p className="text-sm text-gray-500">
            No credit card required • 14-day free trial • Cancel anytime
          </p>

          {/* Hero Dashboard Preview */}
          <div className="mt-16 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="ml-4 text-white text-sm font-medium">Software House ERP Dashboard</div>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-gray-50 to-purple-50/30">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                      <div className="h-8 bg-gray-200 rounded mb-3 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <div className="h-64 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <CodeBracketIcon className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">Interactive Dashboard Preview</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm border-y border-purple-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Everything You Need to Run Your Software House
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From project planning to client billing, manage your entire software development business in one unified platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Complete Software House Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              12 core modules designed specifically for software development companies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl border border-purple-100 transition-all transform hover:scale-105 flex items-center gap-4"
              >
                <span className="text-3xl">{module.icon}</span>
                <span className="font-semibold text-gray-900">{module.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Why Software Houses Choose TWS
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <RocketLaunchIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Built for Developers</h3>
              <p className="text-gray-600">
                Designed by developers, for developers. Every feature is tailored to software development workflows.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheckIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise-Grade Security</h3>
              <p className="text-gray-600">
                Bank-level encryption, regular security audits, and compliance with industry standards.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChartBarIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Scale Without Limits</h3>
              <p className="text-gray-600">
                Start small and grow. Our platform scales with you from startup to enterprise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Ready to Transform Your Software Business?
          </h2>
          <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
            Join 500+ software houses already using TWS to streamline operations, improve productivity, and scale faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/software-house-signup"
              className="px-10 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-purple-50 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              to="/software-house-login"
              className="px-10 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all"
            >
              Login to Your Account
            </Link>
          </div>
          <p className="text-purple-200 text-sm mt-6">
            No credit card required • 14-day free trial • Setup in minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🐺</span>
                <span className="text-white font-bold text-xl">TWS</span>
              </div>
              <p className="text-sm">
                The all-in-one ERP platform for software development companies.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#modules" className="hover:text-white transition-colors">Modules</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">About</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Get Started</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/software-house-signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/software-house-login" className="hover:text-white transition-colors">Login</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 TWS (The Wolf Stack). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SoftwareHouseLanding;
