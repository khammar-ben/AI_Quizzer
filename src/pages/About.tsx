import React from 'react';
import { Zap, Target, Users, Award } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Zap,
      title: "AI-Powered Generation",
      description: "Our advanced AI analyzes your documents and creates relevant, challenging questions automatically."
    },
    {
      icon: Target,
      title: "Accurate & Relevant",
      description: "Questions are tailored to your content, ensuring they test real understanding and knowledge retention."
    },
    {
      icon: Users,
      title: "For Everyone",
      description: "Perfect for students, teachers, professionals, and anyone looking to enhance their learning experience."
    },
    {
      icon: Award,
      title: "Proven Results",
      description: "Thousands of users have improved their learning outcomes using our quiz generation platform."
    }
  ];

  const team = [
    {
      name: "Sarah Chen",
      role: "Founder & CEO",
      bio: "Former education technology leader with 10+ years of experience in AI and learning platforms."
    },
    {
      name: "Michael Rodriguez",
      role: "CTO",
      bio: "AI researcher and full-stack developer passionate about making education more accessible."
    },
    {
      name: "Emily Davis",
      role: "Head of Product",
      bio: "UX expert and former teacher dedicated to creating intuitive learning experiences."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">About Quizzer</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We're on a mission to revolutionize how people learn and test their knowledge. 
            Our AI-powered platform transforms any document into an engaging, interactive quiz experience.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-lg text-gray-300 mb-6">
                Education should be engaging, accessible, and effective. That's why we created Quizzer – 
                to bridge the gap between passive reading and active learning.
              </p>
              <p className="text-lg text-gray-300 mb-6">
                By leveraging cutting-edge AI technology, we automatically generate thoughtful questions 
                from any document, helping learners test their understanding and retain information more effectively.
              </p>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">10,000+</div>
                  <div className="text-gray-400">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">50,000+</div>
                  <div className="text-gray-400">Quizzes Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">98%</div>
                  <div className="text-gray-400">Satisfaction Rate</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Why Quizzer?</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Save hours of manual quiz creation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Improve knowledge retention through active testing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Support multiple file formats (PDF, TXT)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Track progress and performance over time</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">What Makes Us Different</h2>
            <p className="text-xl text-gray-400">Cutting-edge technology meets intuitive design</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-400">Passionate educators and technologists working together</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gray-700 rounded-xl p-8 text-center">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-blue-400 mb-4">{member.role}</p>
                <p className="text-gray-300">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of learners who are already using Quizzer to enhance their studies and improve retention.
          </p>
          <a
            href="/create"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
          >
            <span>Get Started Today</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
