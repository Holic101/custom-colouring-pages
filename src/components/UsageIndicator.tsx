export default function UsageIndicator() {
  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600">
        Usage
        <span className="float-right">2/10</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <div 
          className="h-full bg-gray-600 rounded-full" 
          style={{ width: '20%' }}
        />
      </div>
    </div>
  )
} 