export default function EmptyPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl text-gray-300">🚧</span>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 max-w-[250px]">
        This section is currently under construction. Please check back later.
      </p>
    </div>
  );
}
