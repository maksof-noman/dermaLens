import { Smartphone } from 'lucide-react';

export default function MobileOnlyWarning() {
  return (
    <div className="min-h-screen w-full bg-neutral-100 flex items-center justify-center p-6">
      <div className="max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Smartphone className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Mobile Device Required
        </h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          For the best skin analysis experience and accurate face detection, please access Dermalens from your mobile device.
        </p>

        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong className="text-orange-600">Tip:</strong> Open this page on your smartphone for AI-powered skin analysis
          </p>
        </div>

        <div className="text-xs text-gray-500">
          Scan the QR code with your phone or visit this URL on your mobile browser
        </div>
      </div>
    </div>
  );
}
