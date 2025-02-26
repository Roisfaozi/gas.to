export function BioPageStats({
  totalPages,
  totalViews,
}: {
  totalPages: number
  totalViews: number
}) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Bio Pages</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{totalPages}</p>
        </div>
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{totalViews}</p>
        </div>
      </div>
    </div>
  )
}