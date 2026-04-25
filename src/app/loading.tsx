export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center pt-32 px-4">
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-16 bg-gray-200 rounded-full w-64 mx-auto"></div>
        <div className="h-8 bg-gray-200 rounded w-96 mx-auto"></div>
        <div className="w-full max-w-2xl mx-auto h-64 bg-gray-200 rounded-2xl"></div>
      </div>
    </div>
  );
}
