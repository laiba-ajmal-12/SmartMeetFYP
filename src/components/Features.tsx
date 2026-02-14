'use client';

import { BarChart3, FileText, Zap, Shield, Users, Clock, UserPlus, Building2, UsersRound, Calendar, Eye, FileBarChart } from 'lucide-react';
import { useState, useEffect } from 'react';

const features = [
  {
    icon: BarChart3,
    title: 'High Accuracy Engagement Tracking',
    description: 'Track participant engagement and attention levels with high accuracy.',
  },
  {
    icon: FileText,
    title: 'Smart Reports',
    description: 'Automated summaries with attendance, participation metrics, and engagement scores.',
  },
  {
    icon: Zap,
    title: 'Instant Connection',
    description: 'Browser-based meetings with zero downloads. Join in one click.',
  },
  {
    icon: Shield,
    title: 'Enterprise Grade Security',
    description: 'End-to-end encryption with compliance-ready data protection.',
  },
  {
    icon: Users,
    title: 'Advanced Collaboration',
    description: 'In-meeting chat, Screen sharing enhancing seamless communication among participants.',
  },
  {
    icon: Clock,
    title: 'AI Insights',
    description: 'Optimize meeting effectiveness with ML-powered recommendations.',
  }
];

const workflowSteps = [
  { step: 1, title: "Signup or Login", icon: UserPlus, description: "Create your account or sign in securely" },
  { step: 2, title: "Create Organization", icon: Building2, description: "Set up your workspace and brand" },
  { step: 3, title: "Enroll Members", icon: UsersRound, description: "Invite your team members to join" },
  { step: 4, title: "Schedule Meetings", icon: Calendar, description: "Plan and organize video conferences" },
  { step: 5, title: "Track & Monitor", icon: Eye, description: "Real-time engagement analytics" },
  { step: 6, title: "Get Reports", icon: FileBarChart, description: "Comprehensive attentiveness insights" }
];

export default function Features() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % workflowSteps.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="howwork" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-gray-50 to-white">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* How It Works Carousel */}
        <div className="mb-32">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 text-center">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">Follow these simple steps to get started</p>
          
          <div className="relative max-w-6xl mx-auto">
            {/* Progress Bar */}
            <div className="absolute top-24 left-0 right-0 h-1 bg-gray-200 hidden lg:block">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-500"
                style={{ width: `${((currentStep + 1) / workflowSteps.length) * 100}%` }}
              ></div>
            </div>

            {/* Steps Container */}
            <div className="relative overflow-hidden">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentStep * 100}%)` }}
              >
                {workflowSteps.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className="w-full flex-shrink-0 px-4"
                    >
                      <div className="max-w-2xl mx-auto text-center">
                        {/* Icon */}
                        <div className="relative inline-block mb-8">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl blur-2xl opacity-30"></div>
                          <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-12">
                            <Icon className="w-24 h-24 text-blue-600 mx-auto" strokeWidth={1.5} />
                          </div>
                        </div>

                        {/* Step Number */}
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full text-white font-bold text-lg mb-6">
                          {item.step}
                        </div>

                        {/* Content */}
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">
                          {item.title}
                        </h3>
                        <p className="text-xl text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-3 mt-12">
              {workflowSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentStep 
                      ? 'w-12 h-3 bg-gradient-to-r from-blue-600 to-blue-800' 
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                ></button>
              ))}
            </div>

            <button
              onClick={() => setCurrentStep((prev) => (prev - 1 + workflowSteps.length) % workflowSteps.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-110"
              aria-label="Previous step"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentStep((prev) => (prev + 1) % workflowSteps.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-110"
              aria-label="Next step"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20" id="features">
  <div className="text-center mb-16">
    <h3 className="text-4xl font-bold text-gray-900 mb-4">
      Everything You Need for <span className="text-gradient 0 bg-clip-text text-transparent">Better Meetings</span>
    </h3>
    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
      Comprehensive post-meeting analytics and actionable insights delivered after every session
    </p>
  </div>
  
  <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
    {features.map((feature, index) => {
      const Icon = feature.icon;
      
      return (
        <div
          key={index}
          className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-lg"
        >
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-xl bg-royal-blue flex items-center justify-center shadow-lg">
                <Icon className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        </div>
      );
    })}
  </div>
</div>

        {/* Contact CTA */}
        <div className="text-center" id="contact">
          <div className="relative bg-royal-blue rounded-3xl p-12 lg:p-16 shadow-2xl max-w-4xl mx-auto overflow-hidden group">
          
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <h3 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                Let us Transform Your Meetings Together
              </h3>
              <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                Have questions? Want a demo? Our team is ready to help you get started.
              </p>
              
              {/* Contact Form */}
              <div className="max-w-xl mx-auto bg-gradient backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div className="grid gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-6 py-4 rounded-xl bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-6 py-4 rounded-xl bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                  />
                  <textarea
                    placeholder="Tell us about your requirements..."
                    rows={4}
                    className="w-full px-6 py-4 rounded-xl bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 resize-none"
                  ></textarea>
                <button className="w-full bg-black text-white px-8 py-5 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/50 relative overflow-hidden group/btn">
  <span className="relative z-10">Send Message</span>
  <div className="absolute inset-0 bg-gradient-to-r from-blue-700/20 to-blue-900/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}