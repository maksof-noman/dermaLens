import { Heart, Target, Users, Award, Lightbulb, Shield } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              About DermaScan
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Revolutionizing skincare with AI-powered analysis and personalized recommendations
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                At DermaScan, we believe everyone deserves access to professional-grade skincare insights.
                Our mission is to democratize dermatological expertise through cutting-edge AI technology,
                making personalized skincare accessible to all.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We combine advanced computer vision, machine learning, and dermatological knowledge to
                provide accurate skin analysis and tailored product recommendations that help people achieve
                their healthiest, most radiant skin.
              </p>
              <div className="flex items-center gap-4 pt-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full border-4 border-white bg-gradient-to-br from-emerald-400 to-teal-400"
                    ></div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Trusted by 100,000+ users</p>
                  <p className="text-xs text-gray-600">Across 120+ countries worldwide</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-3xl transform -rotate-3"></div>
              <img
                src="https://images.pexels.com/photos/3762877/pexels-photo-3762877.jpeg"
                alt="Our mission"
                className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accuracy First</h3>
              <p className="text-gray-700 leading-relaxed">
                We prioritize precision in our AI analysis, continuously improving our models to deliver
                the most accurate skin assessments possible.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Privacy & Security</h3>
              <p className="text-gray-700 leading-relaxed">
                Your data is encrypted and protected. We never share your images or personal information
                with third parties.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-700 leading-relaxed">
                We're constantly exploring new AI technologies and dermatological research to enhance
                our platform's capabilities.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">User-Centric</h3>
              <p className="text-gray-700 leading-relaxed">
                Every feature we build is designed with you in mind, making skincare simple, accessible,
                and effective.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Standards</h3>
              <p className="text-gray-700 leading-relaxed">
                We only recommend products that meet strict dermatological standards and have proven
                effectiveness.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community</h3>
              <p className="text-gray-700 leading-relaxed">
                We're building a supportive community where everyone can share their skincare journey
                and learn from each other.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-3xl transform rotate-3"></div>
              <img
                src="https://images.pexels.com/photos/3738382/pexels-photo-3738382.jpeg"
                alt="Our technology"
                className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Our Technology
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                DermaScan leverages the latest advancements in artificial intelligence and computer vision.
                Our platform is powered by OpenAI's GPT-4o Vision model, which has been specifically fine-tuned
                for dermatological analysis.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                The AI examines 15 distinct skin metrics simultaneously, analyzing factors like texture,
                pigmentation, hydration levels, and signs of aging. This comprehensive approach provides
                insights comparable to professional dermatological consultations.
              </p>
              <ul className="space-y-4">
                {[
                  'Medical-grade accuracy (95% validation rate)',
                  'Real-time analysis in under 15 seconds',
                  'Continuous learning from dermatologist feedback',
                  'HIPAA-compliant data protection'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A passionate team of technologists, dermatologists, and skincare experts
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 sm:p-12 border border-emerald-100">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-emerald-600 mb-2">50+</div>
                <p className="text-gray-700 font-medium">Team Members</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-emerald-600 mb-2">15+</div>
                <p className="text-gray-700 font-medium">Dermatologists</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-emerald-600 mb-2">20+</div>
                <p className="text-gray-700 font-medium">AI Engineers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-xl mb-8 text-emerald-50">
            Experience the future of skincare with DermaScan's AI-powered analysis
          </p>
          <a
            href="/"
            className="inline-block bg-white text-emerald-600 px-10 py-5 rounded-full text-lg font-semibold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
          >
            Try DermaScan Free
          </a>
        </div>
      </section>
    </div>
  );
}
