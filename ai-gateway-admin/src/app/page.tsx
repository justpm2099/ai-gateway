import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-8">🤖</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Gateway 管理中心</h1>
        <p className="text-xl text-gray-600 mb-8">AI资源聚合层管理平台</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          进入管理界面
        </Link>
      </div>
    </div>
  );
}