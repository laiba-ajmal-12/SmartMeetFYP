'use client';

import { useState } from 'react';
import { 
  Video, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  Copy, 
  ExternalLink,
  Check,
  Settings,
  FileText,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CreateMeeting() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    enableEngagement: true,
    enableRecording: false,
    requirePassword: false,
    password: ''
  });
  
  const [meetingCreated, setMeetingCreated] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateMeetingLink = () => {
    // Generate dummy meeting data
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    const link = `https://smartmeet.com/join/${id}`;
    
    setMeetingId(id);
    setMeetingLink(link);
    setMeetingCreated(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateMeetingLink();
  };

  if (meetingCreated) {
    return (
      <div className="min-h-screen bg-alice-white flex items-center justify-center px-4">
        {/* Background Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-royal-blue/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-deep-wine/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="w-full max-w-2xl relative">
          <div className="bg-white rounded-3xl shadow-2xl p-8 card-shadow-hover text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-gradient-royal-wine rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-rich-black mb-4">
              Meeting Created Successfully! 🎉
            </h1>
            <p className="text-lg text-onyx-gray/80 mb-8">
              Your meeting "{formData.title}" is ready. Share the link below with your participants.
            </p>

            {/* Meeting Details */}
            <div className="bg-alice-white rounded-2xl p-6 mb-8">
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-semibold text-rich-black mb-2">Meeting Details</h3>
                  <div className="space-y-2 text-sm text-onyx-gray">
                    <div className="flex items-center">
                      <Video className="w-4 h-4 mr-2 text-royal-blue" />
                      <span>Meeting ID: {meetingId}</span>
                    </div>
                    {formData.date && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-royal-blue" />
                        <span>{new Date(formData.date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {formData.time && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-royal-blue" />
                        <span>{formData.time}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-rich-black mb-2">Features Enabled</h3>
                  <div className="space-y-2 text-sm text-onyx-gray">
                    {formData.enableEngagement && (
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-deep-wine" />
                        <span>Engagement Tracking</span>
                      </div>
                    )}
                    {formData.enableRecording && (
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-deep-wine" />
                        <span>Recording Enabled</span>
                      </div>
                    )}
                    {formData.requirePassword && (
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 mr-2 text-deep-wine" />
                        <span>Password Protected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Link */}
            <div className="bg-gradient-to-r from-royal-blue/5 to-deep-wine/5 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-rich-black mb-4">Meeting Link</h3>
              <div className="flex items-center space-x-3 bg-white rounded-xl p-4 border-2 border-royal-blue/20">
                <input
                  type="text"
                  value={meetingLink}
                  readOnly
                  className="flex-1 bg-transparent text-onyx-gray font-mono text-sm outline-none"
                />
                <Button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    copied 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-royal-blue hover:bg-deep-wine text-white'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-gradient-to-r from-royal-blue to-deep-wine hover:from-deep-wine hover:to-royal-blue text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                onClick={() => window.location.href = '/meeting'}
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Start Meeting Now
              </Button>
              <Button
                variant="outline"
                className="border-2 border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-200"
                onClick={() => window.location.href = '/dashboard'}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-alice-white">
      {/* Background Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-royal-blue/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-deep-wine/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-alice-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-royal-wine rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-rich-black">
                Smart<span className="text-gradient">Meet</span>
              </span>
            </div>

            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/dashboard'}
              className="text-onyx-gray hover:text-royal-blue"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-12 relative">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-3xl shadow-2xl p-8 card-shadow-hover">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-rich-black mb-4">
                Create New Meeting
              </h1>
              <p className="text-lg text-onyx-gray/80">
                Set your meeting details and share the invite link instantly.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Meeting Title */}
              <div>
                <label className="block text-sm font-semibold text-rich-black mb-2">
                  Meeting Title *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Weekly Team Standup"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 h-12 rounded-xl border-2 border-gray-200 focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition-all duration-200"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-rich-black mb-2">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Brief description of the meeting agenda..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition-all duration-200 resize-none"
                />
              </div>

              {/* Date and Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-rich-black mb-2">
                    Date (Optional)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-onyx-gray/40" />
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="pl-12 py-3 h-12 rounded-xl border-2 border-gray-200 focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition-all duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-rich-black mb-2">
                    Time (Optional)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-onyx-gray/40" />
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="pl-12 py-3 h-12 rounded-xl border-2 border-gray-200 focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-rich-black mb-2">
                  Expected Duration (minutes)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-4 py-3 h-12 rounded-xl border-2 border-gray-200 focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition-all duration-200 bg-white"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              {/* Meeting Options */}
              <div className="bg-alice-white rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-rich-black mb-4">Meeting Options</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enableEngagement}
                      onChange={(e) => handleInputChange('enableEngagement', e.target.checked)}
                      className="w-5 h-5 text-royal-blue border-2 border-gray-300 rounded focus:ring-royal-blue focus:ring-2"
                    />
                    <div>
                      <span className="font-medium text-rich-black">Enable Engagement Tracking</span>
                      <p className="text-sm text-onyx-gray/60">Track participant attention and generate insights</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enableRecording}
                      onChange={(e) => handleInputChange('enableRecording', e.target.checked)}
                      className="w-5 h-5 text-royal-blue border-2 border-gray-300 rounded focus:ring-royal-blue focus:ring-2"
                    />
                    <div>
                      <span className="font-medium text-rich-black">Enable Recording</span>
                      <p className="text-sm text-onyx-gray/60">Automatically record the meeting for later review</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requirePassword}
                      onChange={(e) => handleInputChange('requirePassword', e.target.checked)}
                      className="w-5 h-5 text-royal-blue border-2 border-gray-300 rounded focus:ring-royal-blue focus:ring-2"
                    />
                    <div>
                      <span className="font-medium text-rich-black">Require Password</span>
                      <p className="text-sm text-onyx-gray/60">Add an extra layer of security</p>
                    </div>
                  </label>

                  {formData.requirePassword && (
                    <div className="ml-8 mt-3">
                      <Input
                        type="text"
                        placeholder="Enter meeting password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full px-4 py-2 h-10 rounded-lg border-2 border-gray-200 focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition-all duration-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-royal-blue to-deep-wine hover:from-deep-wine hover:to-royal-blue text-white py-4 h-14 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                disabled={!formData.title.trim()}
              >
                <Video className="w-5 h-5 mr-2" />
                Generate Meeting Link
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}