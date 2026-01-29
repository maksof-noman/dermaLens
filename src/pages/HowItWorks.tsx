import { Camera, Brain, ShoppingBag, Sparkles, Users, Globe, Award } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              How DermaScan Works
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Advanced AI technology combined with dermatological expertise to give you
              personalized skincare insights in three simple steps
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="relative">
              <div className="absolute -left-4 top-0 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                1
              </div>
              <div className="ml-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100 h-full">
                <Camera className="w-12 h-12 text-emerald-600 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Capture Your Image</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Take a selfie or upload a photo in well-lit conditions. Our system works with both live camera
                  capture and uploaded images. Make sure your face is clearly visible for best results.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">Use natural lighting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">Face camera directly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">Remove glasses if possible</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                2
              </div>
              <div className="ml-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border border-blue-100 h-full">
                <Brain className="w-12 h-12 text-blue-600 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Analysis</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Our advanced AI analyzes your skin across 15 different metrics using computer vision and
                  machine learning trained on thousands of dermatological cases.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Skin Type',
                    'Dark Spots',
                    'Wrinkles',
                    'Texture',
                    'Acne',
                    'Dark Circles',
                    'Redness',
                    'Oiliness',
                    'Moisture',
                    'Pores',
                    'Eye Bags',
                    'Radiance',
                    'Firmness',
                    'Upper Eyelid',
                    'Lower Eyelid'
                  ].map((metric, index) => (
                    <div
                      key={index}
                      className="bg-white px-3 py-2 rounded-lg text-xs font-medium text-gray-700 border border-blue-100"
                    >
                      {metric}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-0 w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                3
              </div>
              <div className="ml-16 bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-8 border border-violet-100 h-full">
                <ShoppingBag className="w-12 h-12 text-violet-600 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Recommendations</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Receive personalized product recommendations from top dermatologist-approved brands
                  tailored specifically to your skin concerns and type.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">Curated product matches</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">Detailed ingredient info</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">Expert skincare tips</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Technology
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powered by state-of-the-art artificial intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">OpenAI GPT-4 Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                We utilize OpenAI's latest GPT-4o Vision model, trained on vast medical datasets to provide
                accurate skin analysis comparable to in-person dermatological consultations. The AI examines
                multiple aspects of skin health simultaneously with medical-grade precision.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Clinical Validation</h3>
              <p className="text-gray-700 leading-relaxed">
                Our analysis algorithms have been validated against dermatologist assessments, achieving
                95% accuracy in identifying common skin concerns. We continuously improve our models with
                feedback from skincare professionals and user outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Helping people discover better skincare worldwide
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">100K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">500K+</div>
              <div className="text-gray-600">Scans Completed</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">120+</div>
              <div className="text-gray-600">Countries</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">95%</div>
              <div className="text-gray-600">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Discover Your Perfect Skincare?
          </h2>
          <p className="text-xl mb-8 text-emerald-50">
            Join thousands of users who trust DermaScan for their skincare journey
          </p>
          <a
            href="/"
            className="inline-block bg-white text-emerald-600 px-10 py-5 rounded-full text-lg font-semibold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
          >
            Start Your Free Analysis
          </a>
        </div>
      </section>
    </div>
  );
}
