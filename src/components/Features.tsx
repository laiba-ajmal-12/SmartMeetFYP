import { BarChart3, FileText, Zap, Shield, Users, Clock } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Real-time Engagement Tracking',
    description: 'Monitor participant attention and interaction levels throughout your meetings with advanced analytics.',
    gradient: 'from-royal-blue/20 to-deep-wine/20'
  },
  {
    icon: FileText,
    title: 'Automated Reports',
    description: 'Get comprehensive meeting summaries, attendance records, and engagement insights delivered automatically.',
    gradient: 'from-deep-wine/20 to-royal-blue/20'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Join meetings instantly with our optimized platform. No downloads, no delays, just seamless connections.',
    gradient: 'from-royal-blue/20 to-purple-500/20'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and security protocols keep your meetings private and your data protected.',
    gradient: 'from-deep-wine/20 to-red-500/20'
  },
  {
    icon: Users,
    title: 'Smart Collaboration',
    description: 'Advanced features like breakout rooms, screen sharing, and interactive whiteboards enhance teamwork.',
    gradient: 'from-purple-500/20 to-royal-blue/20'
  },
  {
    icon: Clock,
    title: 'Meeting Intelligence',
    description: 'AI-powered insights help you optimize meeting duration, frequency, and effectiveness over time.',
    gradient: 'from-royal-blue/20 to-green-500/20'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-alice-white to-white">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-royal-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-deep-wine/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-rich-black mb-6">
            Everything you need for
            <span className="text-gradient"> smarter meetings</span>
          </h2>
          <p className="text-xl text-onyx-gray/80 max-w-3xl mx-auto leading-relaxed">
            Transform how your team collaborates with advanced analytics, 
            automated insights, and seamless video conferencing.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 card-shadow hover:card-shadow-hover transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-royal-blue" />
                </div>
                <h3 className="text-xl font-bold text-rich-black mb-4 group-hover:text-royal-blue transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-onyx-gray/80 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-3xl p-12 card-shadow max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-rich-black mb-4">
              Ready to revolutionize your meetings?
            </h3>
            <p className="text-lg text-onyx-gray/80 mb-8">
              Join thousands of teams already using SmartMeet to make their meetings more productive.
            </p>
            <button className="bg-gradient-royal-wine text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}